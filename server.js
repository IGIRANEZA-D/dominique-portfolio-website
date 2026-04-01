const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const ROOT_DIR = process.cwd();
const ENV_PATH = path.join(ROOT_DIR, '.env');

loadEnvFile(ENV_PATH);

const CONFIG = {
  port: Number(process.env.PORT || 8080),
  host: process.env.HOST || '0.0.0.0',
  geminiOnly: String(process.env.GEMINI_ONLY || '').trim() === '1',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-flash-latest',
  geminiFallbackModels: (process.env.GEMINI_FALLBACK_MODELS || 'gemini-flash-lite-latest,gemini-2.5-flash-lite,gemini-3-flash-preview')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean),
  hfToken: process.env.HF_API_TOKEN || '',
  hfModel: process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3',
  hfMaxTokens: Number(process.env.HF_MAX_NEW_TOKENS || 360),
  hfTemperature: Number(process.env.HF_TEMPERATURE || 0.4),
  hfTimeoutMs: Number(process.env.HF_TIMEOUT_MS || 18000),
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
};

const knowledge = buildKnowledgeBase();
const responseCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX_ITEMS = 200;
const CACHE_SCHEMA_VERSION = 'v2';
const providerState = {
  anthropicCooldownUntil: 0,
  geminiCooldownUntil: 0,
  hfCooldownUntil: 0,
};
const AI_UNAVAILABLE_MESSAGE = 'Dominik AI Assistant is temporarily unavailable. Please try again in a few moments.';
const HF_PERMISSION_COOLDOWN_MS = 10 * 60 * 1000;
const HF_TEMP_COOLDOWN_MS = 60 * 1000;
const GENERAL_REF_MAX_CHARS = 1400;
const ANTHROPIC_REQUEST_TIMEOUT_MS = Math.max(1800, Math.min(CONFIG.hfTimeoutMs, Number(process.env.ANTHROPIC_REQUEST_TIMEOUT_MS || 4500)));
const GEMINI_REQUEST_TIMEOUT_MS = Math.max(1800, Math.min(CONFIG.hfTimeoutMs, Number(process.env.GEMINI_REQUEST_TIMEOUT_MS || 4200)));
const HF_REQUEST_TIMEOUT_MS = Math.max(1800, Math.min(CONFIG.hfTimeoutMs, Number(process.env.HF_REQUEST_TIMEOUT_MS || 3200)));
const MAX_GEMINI_MODELS = Math.max(1, Math.min(2, Number(process.env.GEMINI_MAX_MODELS || 1)));

function toErrorMessage(error) {
  return error && error.message ? String(error.message) : String(error);
}

function compactErrorMessage(message, maxLen = 220) {
  const oneLine = String(message || '').replace(/\s+/g, ' ').trim();
  return oneLine.length > maxLen ? `${oneLine.slice(0, maxLen)}...` : oneLine;
}

function logProviderFailure(provider, error, extra = '') {
  const compact = compactErrorMessage(toErrorMessage(error), 380);
  const suffix = extra ? ` (${extra})` : '';
  console.warn(`[AI][${provider}] failed${suffix}: ${compact}`);
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, 'utf8');
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex <= 0) return;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  });
}

function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (_) {
    return '';
  }
}

function parseJson(filePath, fallback) {
  const raw = safeRead(filePath);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

function chunkText(text, maxLength = 780, overlap = 140) {
  const clean = String(text || '')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
  if (!clean) return [];
  const chunks = [];
  let cursor = 0;
  while (cursor < clean.length) {
    const end = Math.min(clean.length, cursor + maxLength);
    chunks.push(clean.slice(cursor, end));
    if (end >= clean.length) break;
    cursor = Math.max(0, end - overlap);
  }
  return chunks;
}

function profileToText(profile) {
  if (!profile || typeof profile !== 'object') return '';
  const lines = [];
  lines.push(`Name: ${profile.fullName || ''}`);
  lines.push(`Headline: ${profile.headline || ''}`);
  lines.push(`Summary: ${profile.summary || ''}`);

  if (profile.contact) {
    lines.push(
      `Contact: email ${profile.contact.email || 'N/A'}, phone ${profile.contact.phone || 'N/A'}, location ${profile.contact.location || 'N/A'}`
    );
    lines.push(`LinkedIn: ${profile.contact.linkedin || 'N/A'}`);
  }

  if (Array.isArray(profile.skills) && profile.skills.length) {
    lines.push(`Skills: ${profile.skills.join(', ')}`);
  }

  if (Array.isArray(profile.experience) && profile.experience.length) {
    profile.experience.forEach((item, idx) => {
      lines.push(
        `Experience ${idx + 1}: ${item.role || ''} at ${item.company || ''} (${item.period || ''}) in ${item.location || ''}.`
      );
      if (Array.isArray(item.highlights) && item.highlights.length) {
        lines.push(`Highlights: ${item.highlights.join('; ')}`);
      }
    });
  }

  if (Array.isArray(profile.projects) && profile.projects.length) {
    profile.projects.forEach((project, idx) => {
      lines.push(
        `Project ${idx + 1}: ${project.name || ''}. Stack: ${(project.stack || []).join(', ')}. ${project.summary || ''}`
      );
    });
  }

  if (Array.isArray(profile.certifications) && profile.certifications.length) {
    lines.push(`Certifications: ${profile.certifications.join(', ')}`);
  }

  return lines.join('\n');
}

function linkedinPostsToText(posts) {
  if (!Array.isArray(posts) || !posts.length) return '';
  return posts
    .map((post, idx) => {
      const parts = [
        `LinkedIn Post ${idx + 1}: ${post.date || 'Unknown date'}`,
        post.topic ? `Topic: ${post.topic}` : '',
        post.summary ? `Summary: ${post.summary}` : '',
        Array.isArray(post.tags) && post.tags.length ? `Tags: ${post.tags.join(', ')}` : '',
        post.url ? `URL: ${post.url}` : '',
      ].filter(Boolean);
      return parts.join('. ');
    })
    .join('\n');
}

function buildKnowledgeBase() {
  const profilePath = path.join(ROOT_DIR, 'data', 'assistant-profile.json');
  const linkedinPath = path.join(ROOT_DIR, 'data', 'linkedin-posts.json');
  const cvTextPath = path.join(ROOT_DIR, 'data', 'cv.txt');

  const profile = parseJson(profilePath, {});
  const posts = parseJson(linkedinPath, []);
  const cvText = safeRead(cvTextPath);

  const sources = [
    { id: 'profile', text: profileToText(profile) },
    { id: 'linkedin', text: linkedinPostsToText(posts) },
    { id: 'cv', text: cvText },
  ].filter((item) => item.text && item.text.trim().length > 0);

  const chunks = [];
  sources.forEach((source) => {
    chunkText(source.text).forEach((part, idx) => {
      chunks.push({
        id: `${source.id}-${idx + 1}`,
        source: source.id,
        text: part,
        terms: tokenize(part),
      });
    });
  });

  return {
    profile,
    posts,
    chunks,
    sourceStats: {
      profileLoaded: Boolean(sources.find((s) => s.id === 'profile')),
      linkedinPosts: Array.isArray(posts) ? posts.length : 0,
      cvLoaded: Boolean(cvText && cvText.trim()),
      chunks: chunks.length,
    },
  };
}

function tokenize(text) {
  const stopwords = new Set([
    'the',
    'and',
    'for',
    'with',
    'from',
    'that',
    'this',
    'what',
    'when',
    'where',
    'which',
    'who',
    'why',
    'how',
    'you',
    'your',
    'are',
    'have',
    'has',
    'had',
    'can',
    'will',
    'would',
    'should',
    'could',
    'about',
    'tell',
    'me',
    'please',
    'is',
    'it',
    'dominique',
    'dominik',
    'igiraneza',
  ]);
  const base = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stopwords.has(token));

  const expanded = [];
  base.forEach((token) => {
    expanded.push(token);
    if (token.endsWith('s') && token.length > 4) {
      expanded.push(token.slice(0, -1));
    }
  });
  return expanded;
}

function selectRelevantChunks(question, maxChunks = 4) {
  if (!knowledge.chunks.length) return [];
  const qTokens = tokenize(question);
  if (!qTokens.length) return knowledge.chunks.slice(0, Math.min(maxChunks, knowledge.chunks.length));

  const scored = knowledge.chunks.map((chunk) => {
    let score = 0;
    const set = new Set(chunk.terms);
    qTokens.forEach((token) => {
      if (set.has(token)) score += 1;
    });
    const sourceBoost = chunk.source === 'profile' ? 0.6 : chunk.source === 'cv' ? 0.3 : 0;
    return { chunk, score: score + sourceBoost, lexicalScore: score };
  });

  scored.sort((a, b) => b.score - a.score);
  const ranked = scored.filter((entry) => entry.lexicalScore > 0).slice(0, maxChunks);
  const nonLinkedIn = ranked.filter((entry) => entry.chunk.source !== 'linkedin');
  if (nonLinkedIn.length >= 2) {
    return nonLinkedIn.map((entry) => entry.chunk);
  }
  const selected = ranked.map((entry) => entry.chunk);
  if (selected.length >= 2) return selected;
  return knowledge.chunks.slice(0, Math.min(maxChunks, knowledge.chunks.length));
}

function buildPrompt({ question, history, contextChunks, mode }) {
  const context = contextChunks.map((chunk, i) => `[${i + 1}|${chunk.source}] ${chunk.text}`).join('\n\n');
  const chatHistory = Array.isArray(history)
    ? history
        .slice(-6)
        .map((item) => `${item.role === 'assistant' ? 'Assistant' : 'User'}: ${String(item.content || '')}`)
        .join('\n')
    : '';

  const modeGuidance =
    mode === 'portfolio'
      ? 'This is a portfolio-related question. Use the context as primary evidence.'
      : 'This is a general question. Answer with broad, correct knowledge. Use portfolio context only if directly relevant.';

  return [
    'You are Dominik AI Assistant for IGIRANEZA Dominique.',
    'Respond clearly, professionally, and truthfully.',
    modeGuidance,
    'For profile questions (skills, projects, CV, contact, experience, LinkedIn activity), prioritize provided context.',
    'For general questions not about the profile, provide concise and helpful general guidance.',
    'Do not fabricate personal facts that are not in the context.',
    'If information is missing (for example a LinkedIn post not in data), say what is missing and ask the user to sync/update data.',
    'Style rules: start with a short markdown bold heading, then 2-5 concise bullet points when helpful.',
    'Use 1-2 relevant emojis maximum per reply. Keep language clean and human.',
    'Keep the answer under 230 words by default, and provide more detail when the user asks for details.',
    '',
    'CONTEXT:',
    context || 'No local context loaded.',
    '',
    'RECENT CHAT:',
    chatHistory || 'No prior messages.',
    '',
    `USER QUESTION: ${question}`,
    'ASSISTANT:',
  ].join('\n');
}

function getRecentHistoryText(history, limit = 6) {
  if (!Array.isArray(history) || !history.length) return '';
  return history
    .slice(-limit)
    .map((item) => String(item && item.content ? item.content : ''))
    .join(' ')
    .toLowerCase();
}

function historyMentionsDominique(history) {
  const text = getRecentHistoryText(history);
  if (!text) return false;
  return /\b(dominique|dominik|igiraneza|rama consult|portfolio|projects?|experience|skills?)\b/.test(text);
}

function extractHistorySubject(history, limit = 6) {
  if (!Array.isArray(history) || !history.length) return '';
  const recent = history.slice(-limit).reverse();
  const patterns = [
    /\b(?:who is|who was|tell me about|tell me something about|about|describe|explain)\s+([A-Z][A-Za-z.-]*(?:\s+[A-Z][A-Za-z.-]*){0,3})\b/i,
    /\b([A-Z][A-Za-z.-]*(?:\s+[A-Z][A-Za-z.-]*){0,3})\s+(?:is|was|are|were)\b/,
  ];

  for (const item of recent) {
    const text = String(item && item.content ? item.content : '').trim();
    if (!text) continue;
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const candidate = match[1].trim();
        if (!/^(What|Where|Why|How|When|Tell|Explain|Describe)$/i.test(candidate)) {
          return candidate;
        }
      }
    }
    const genericNames = text.match(/\b[A-Z][A-Za-z.-]*(?:\s+[A-Z][A-Za-z.-]*){1,3}\b/g) || [];
    const candidate = genericNames.find((name) => !/^(What|Where|Why|How|When|Tell|Explain|Describe|South Africa|East Africa)$/i.test(name));
    if (candidate) return candidate.trim();
  }
  return '';
}

function resolveQuestionSubject(question, history = []) {
  const raw = String(question || '').trim();
  if (!raw) return '';
  if (/\b(dominique|dominik|igiraneza)\b/i.test(raw)) return 'IGIRANEZA Dominique';
  return extractHistorySubject(history);
}

function rewritePronounQuestion(question, history = []) {
  const raw = String(question || '').trim();
  if (!raw) return '';
  if (!/\b(he|his|him|she|her|they|their|them)\b/i.test(raw)) return raw;
  const subject = resolveQuestionSubject(raw, history);
  if (!subject) return raw;
  return raw
    .replace(/\bwhere is he\b/i, `where is ${subject}`)
    .replace(/\bwhere is she\b/i, `where is ${subject}`)
    .replace(/\bwhere are they\b/i, `where is ${subject}`)
    .replace(/\bwhat is his\b/i, `what is ${subject}'s`)
    .replace(/\bwhat are his\b/i, `what are ${subject}'s`)
    .replace(/\bwhat is her\b/i, `what is ${subject}'s`)
    .replace(/\bwhat are her\b/i, `what are ${subject}'s`)
    .replace(/\bwhat is their\b/i, `what is ${subject}'s`)
    .replace(/\bwhy should we hire him\b/i, `why should we hire ${subject}`)
    .replace(/\bwhy should we hire her\b/i, `why should we hire ${subject}`)
    .replace(/\bhe\b/gi, subject)
    .replace(/\bhim\b/gi, subject)
    .replace(/\bhis\b/gi, `${subject}'s`)
    .replace(/\bshe\b/gi, subject)
    .replace(/\bher\b/gi, `${subject}'s`)
    .replace(/\btheir\b/gi, `${subject}'s`)
    .replace(/\bthem\b/gi, subject);
}

function isAmbiguousPronounQuestion(question, history = []) {
  const msg = String(question || '').toLowerCase();
  if (!/\b(he|his|him|she|her|they|their|them)\b/.test(msg)) return false;
  if (resolveQuestionSubject(question, history)) return false;
  if (/\b(dominique|dominik|igiraneza)\b/.test(msg)) return false;
  return true;
}

function getRecentUserMessages(history, limit = 4) {
  if (!Array.isArray(history) || !history.length) return [];
  return history
    .filter((item) => item && item.role === 'user' && item.content)
    .slice(-limit)
    .map((item) => String(item.content).trim())
    .filter(Boolean);
}

function buildPracticalContext(question, history = []) {
  const current = String(question || '').trim();
  const recentUsers = getRecentUserMessages(history, 3);
  return [...recentUsers, current].join(' ').toLowerCase();
}

function classifyPracticalNeed(text) {
  const msg = String(text || '').toLowerCase();
  if (!msg) return '';
  const asksHelp = /\b(help|solve|fix|handle|deal with|what should i do|advise|advice|guide|support)\b/.test(msg);
  const conflict = /\b(conflict|disagreement|argue|argument|fight|misunderstanding|problem between|issue between|quarrel|dispute)\b/.test(msg);
  const money = /\b(money|payment|debt|loan|owed|owe|salary|rent|repay|repayment|cash|finance|financial)\b/.test(msg);
  const decision = /\b(choose|decision|which one|which option|pick|select|between two options)\b/.test(msg);
  const stress = /\b(stress|anxiety|overwhelmed|sad|depressed|angry|upset|afraid)\b/.test(msg);
  const relationship = /\b(friend|family|partner|wife|husband|girlfriend|boyfriend|sibling|parent|relative)\b/.test(msg);
  const work = /\b(work|job|boss|manager|team|colleague|coworker|office|employee|staff)\b/.test(msg);

  if (conflict && money) return 'money-conflict';
  if (conflict && work) return 'work-conflict';
  if (conflict && relationship) return 'relationship-conflict';
  if (conflict) return 'general-conflict';
  if (decision) return 'decision';
  if (stress) return 'stress-support';
  if (asksHelp) return 'general-help';
  return '';
}

function buildPracticalGuidance(question, history = []) {
  const context = buildPracticalContext(question, history);
  const need = classifyPracticalNeed(context);
  if (!need) return '';

  if (need === 'money-conflict') {
    return [
      'Yes. Treat it as a money dispute first, not a personal fight.',
      '1. Ask each person separately what amount they believe is involved and why.',
      '2. Check facts: messages, receipts, transfers, dates, and any witnesses.',
      '3. Bring them together and focus only on points both agree on first.',
      '4. Write the exact disagreement clearly: amount, reason, and what each person wants.',
      '5. If money is owed, agree a repayment plan with dates and put it in writing.',
      '6. If they still cannot agree, use a neutral mediator or trusted third party.',
    ].join('\n');
  }

  if (need === 'work-conflict') {
    return [
      'Yes. For a work conflict, keep it factual and professional.',
      '1. Separate the people from the issue and identify the exact disagreement.',
      '2. Let each person explain their side without interruption.',
      '3. Focus on impact, responsibilities, deadlines, and evidence, not blame.',
      '4. Agree on one practical next step and document it.',
      '5. If the issue continues, involve a manager or neutral mediator early.',
    ].join('\n');
  }

  if (need === 'relationship-conflict' || need === 'general-conflict') {
    return [
      'Yes. Start by lowering emotion and clarifying the real issue.',
      '1. Let each person explain what happened and what they want now.',
      '2. Identify what is fact, what is assumption, and what is emotion.',
      '3. Restate the shared goal, then discuss the one point causing the conflict.',
      '4. Agree on one fair action each person will take next.',
      '5. If the conversation becomes hostile, pause and continue later with a neutral person present.',
    ].join('\n');
  }

  if (need === 'decision') {
    return [
      'Yes. A simple decision framework works well here.',
      '1. List your options clearly.',
      '2. Write the main benefits, risks, cost, and timing of each option.',
      '3. Decide which factor matters most right now.',
      '4. Choose the option that best fits that priority, not the perfect option.',
    ].join('\n');
  }

  if (need === 'stress-support') {
    return [
      'Yes. Start by reducing pressure before solving the whole problem.',
      '1. Pause and name the exact issue causing the stress.',
      '2. Separate what you can control now from what you cannot.',
      '3. Pick one small next action for today.',
      '4. If the situation is heavy or persistent, speak to a trusted person or professional support.',
    ].join('\n');
  }

  if (need === 'general-help') {
    return [
      'Yes. I can help.',
      'Tell me these three things:',
      '1. What exactly happened',
      '2. What outcome you want',
      '3. What is blocking you right now',
      'Then I will give a direct step-by-step answer.',
    ].join('\n');
  }

  return '';
}

function getGeminiModelCandidates() {
  const seen = new Set();
  const stableDefaults = [
    'gemini-3-flash-preview',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash-lite',
  ];
  const ordered = [CONFIG.geminiModel, ...CONFIG.geminiFallbackModels, ...stableDefaults];
  return ordered.filter((model) => {
    if (!model || seen.has(model)) return false;
    seen.add(model);
    return true;
  }).slice(0, MAX_GEMINI_MODELS);
}

async function queryAnthropic(prompt, maxTokens = CONFIG.hfMaxTokens, modelName = CONFIG.anthropicModel) {
  const endpoint = 'https://api.anthropic.com/v1/messages';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ANTHROPIC_REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CONFIG.anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: modelName,
        max_tokens: maxTokens,
        temperature: CONFIG.hfTemperature,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } finally {
    clearTimeout(timeout);
  }

  const body = await response.text();
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch (_) {
    parsed = body;
  }

  if (!response.ok) {
    const msg =
      typeof parsed === 'object' && parsed && parsed.error && parsed.error.message
        ? String(parsed.error.message)
        : `Anthropic request failed with status ${response.status}.`;
    throw new Error(msg);
  }

  const blocks = Array.isArray(parsed && parsed.content) ? parsed.content : [];
  const text = blocks
    .map((block) => (block && block.type === 'text' && typeof block.text === 'string' ? block.text : ''))
    .join(' ')
    .trim();

  if (!text) {
    throw new Error('Anthropic returned empty text.');
  }
  return cleanModelReply(text);
}

async function queryGemini(prompt, maxTokens = CONFIG.hfMaxTokens, modelName = CONFIG.geminiModel) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    modelName
  )}:generateContent?key=${encodeURIComponent(CONFIG.geminiApiKey)}`;
  let lastError = null;
  for (let attempt = 0; attempt < 1; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GEMINI_REQUEST_TIMEOUT_MS);
    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: CONFIG.hfTemperature,
            maxOutputTokens: maxTokens,
          },
        }),
      });
    } finally {
      clearTimeout(timeout);
    }

    const body = await response.text();
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch (_) {
      parsed = body;
    }

    if (!response.ok) {
      const msg =
        typeof parsed === 'object' && parsed && parsed.error && parsed.error.message
          ? String(parsed.error.message)
          : `Gemini request failed with status ${response.status}.`;
      lastError = new Error(msg);
      if (attempt === 0 && [500, 503].includes(response.status)) {
        await new Promise((resolve) => setTimeout(resolve, 420));
        continue;
      }
      throw lastError;
    }

    const candidates = Array.isArray(parsed && parsed.candidates) ? parsed.candidates : [];
    const first = candidates[0];
    const parts = first && first.content && Array.isArray(first.content.parts) ? first.content.parts : [];
    const text = parts
      .map((part) => (part && typeof part.text === 'string' ? part.text : ''))
      .join(' ')
      .trim();

    if (!text) {
      lastError = new Error('Gemini returned empty text.');
      continue;
    }
    return cleanModelReply(text);
  }
  throw lastError || new Error(`Gemini request failed for model ${modelName}.`);
}

async function queryGeminiWithFallback(prompt, maxTokens = CONFIG.hfMaxTokens, question = '') {
  const errors = [];
  const models = getGeminiModelCandidates();
  for (const modelName of models) {
    try {
      const reply = await queryGemini(prompt, maxTokens, modelName);
      if (looksTruncatedReply(reply, question)) {
        errors.push(`${modelName}: incomplete response`);
        continue;
      }
      return { reply, modelName, errors };
    } catch (error) {
      const message = error && error.message ? error.message : String(error);
      errors.push(`${modelName}: ${compactErrorMessage(message, 200)}`);
      if (isQuotaOrRateError(message)) {
        break;
      }
      continue;
    }
  }
  throw new Error(errors.join(' | ') || 'Gemini provider failed on all candidate models.');
}

async function queryHuggingFace(prompt, maxTokens = CONFIG.hfMaxTokens) {
  const endpoints = [
    `https://router.huggingface.co/hf-inference/models/${encodeURIComponent(CONFIG.hfModel)}`,
    `https://api-inference.huggingface.co/models/${encodeURIComponent(CONFIG.hfModel)}`,
  ];
  const errors = [];
  const requestTimeoutMs = HF_REQUEST_TIMEOUT_MS;

  for (const endpoint of endpoints) {
    for (let attempt = 0; attempt < 1; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
      let response;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${CONFIG.hfToken}`,
          },
          signal: controller.signal,
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: maxTokens,
              temperature: CONFIG.hfTemperature,
              return_full_text: false,
            },
          }),
        });
      } finally {
        clearTimeout(timeout);
      }

      const body = await response.text();
      let parsed;
      try {
        parsed = JSON.parse(body);
      } catch (_) {
        parsed = body;
      }

      if (!response.ok) {
        const errorText =
          typeof parsed === 'object' && parsed && parsed.error
            ? String(parsed.error)
            : `Hugging Face request failed with status ${response.status}.`;

        const waitingForModel =
          response.status === 503 &&
          typeof parsed === 'object' &&
          parsed &&
          typeof parsed.estimated_time === 'number' &&
          parsed.estimated_time > 0;

        if (waitingForModel && attempt === 0) {
          const waitMs = Math.min(6000, Math.max(700, Math.ceil(parsed.estimated_time * 1000)));
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          continue;
        }

        errors.push(`${endpoint.includes('router') ? 'router' : 'legacy'}: ${errorText}`);
        break;
      }

      if (Array.isArray(parsed) && parsed[0] && typeof parsed[0].generated_text === 'string') {
        return cleanModelReply(parsed[0].generated_text);
      }

      if (parsed && typeof parsed.generated_text === 'string') {
        return cleanModelReply(parsed.generated_text);
      }

      errors.push(`${endpoint.includes('router') ? 'router' : 'legacy'}: Unexpected response format.`);
      break;
    }
  }

  throw new Error(errors.join(' | ') || 'Hugging Face request failed.');
}

function cleanModelReply(text) {
  let output = String(text || '').trim();
  output = output.replace(/^assistant\s*:\s*/i, '');
  output = output.replace(/^answer\s*:\s*/i, '');
  output = output.replace(/\s+/g, ' ').trim();
  return output;
}

function looksTruncatedReply(reply, question) {
  const text = String(reply || '').trim();
  if (!text) return true;
  const shortQuestion = String(question || '').trim().split(/\s+/).length <= 2;
  const words = text.split(/\s+/).filter(Boolean);
  const noTerminalPunct = !/[.!?`)]$/.test(text);
  const probablyCut = (text.length < 80 && noTerminalPunct) || (noTerminalPunct && words.length >= 5);
  const dangling = /(?:here'?s?|below|function|example|code|is|are|the|a|an|to|of|and|or|with|for)\s*$/i.test(text);
  const boldMarkers = (text.match(/\*\*/g) || []).length;
  const unbalancedMarkdown = boldMarkers % 2 !== 0;
  if (shortQuestion) return false;
  return probablyCut || dangling || unbalancedMarkdown;
}

function parseRetrySeconds(errorMessage) {
  const text = String(errorMessage || '');
  const secMatch = text.match(/retry in\s+([0-9]+(?:\.[0-9]+)?)s/i);
  if (secMatch) return Math.ceil(Number(secMatch[1]));
  const delayMatch = text.match(/"retryDelay"\s*:\s*"([0-9]+)s"/i);
  if (delayMatch) return Number(delayMatch[1]);
  return 0;
}

function isQuotaOrRateError(errorMessage) {
  const text = String(errorMessage || '').toLowerCase();
  return (
    text.includes('quota') ||
    text.includes('resource_exhausted') ||
    text.includes('rate limit') ||
    text.includes('retry in') ||
    text.includes('429')
  );
}

function isBillingError(errorMessage) {
  const text = String(errorMessage || '').toLowerCase();
  return text.includes('credit balance is too low') || text.includes('billing') || text.includes('purchase credits');
}

function isHfPermissionError(errorMessage) {
  const text = String(errorMessage || '').toLowerCase();
  return text.includes('insufficient permissions') || text.includes('authentication method does not have sufficient permissions');
}

function resolveMaxTokensForQuestion(question) {
  const msg = String(question || '').toLowerCase();
  const longFormSignals = [
    'code',
    'function',
    'algorithm',
    'example',
    'step by step',
    'in detail',
    'tutorial',
    'write a',
    'python',
    'javascript',
    'sql query',
  ];
  const wantsLong = longFormSignals.some((signal) => msg.includes(signal));
  return wantsLong ? Math.max(CONFIG.hfMaxTokens, 560) : CONFIG.hfMaxTokens;
}

function isCreativeOrOpenEndedPrompt(question) {
  const msg = String(question || '').toLowerCase().trim();
  if (!msg) return false;
  return (
    /^(write|draft|compose|create|generate|brainstorm|suggest|give me|make)\b/.test(msg) ||
    /\b(poem|story|limerick|speech|email|letter|caption|tagline|headline|bio|script|joke|plan|proposal|cover letter)\b/.test(msg)
  );
}

function isAdviceOrReasoningPrompt(question) {
  const msg = String(question || '').toLowerCase().trim();
  if (!msg) return false;
  return (
    /\b(help me|can you help|what should i do|how do i|how can i|advise|advice|guide me|solve this|solve that)\b/.test(msg) ||
    /\b(compare|difference between|pros and cons|advantages and disadvantages|why should|should i|best way)\b/.test(msg)
  );
}

function shouldPreferCloudGeneral(question, history = []) {
  const msg = String(question || '').trim();
  if (!msg) return false;
  if (isAmbiguousPronounQuestion(msg, history)) return false;
  if (tryNativeUtilityAnswer(msg)) return false;
  if (buildPracticalGuidance(msg, history)) return false;
  if (tryRuleBasedGeneralAnswer(msg)) return false;
  if (isCreativeOrOpenEndedPrompt(msg) || isAdviceOrReasoningPrompt(msg)) return true;

  const lower = msg.toLowerCase();
  const wordCount = lower.split(/\s+/).filter(Boolean).length;
  const explanatoryPrompt = /^(what|why|how|who|when|where|explain|describe|define|tell me about)\b/.test(lower);
  if (explanatoryPrompt && wordCount >= 4) return true;
  return wordCount >= 8;
}

function scoreChunkAgainstQuestion(question, chunk) {
  const qTokens = tokenize(question);
  if (!qTokens.length || !chunk || !Array.isArray(chunk.terms)) return 0;
  const chunkTerms = new Set(chunk.terms);
  let score = 0;
  qTokens.forEach((token) => {
    if (chunkTerms.has(token)) score += 1;
  });
  return score;
}

function extractSentences(text) {
  return String(text || '')
    .split(/(?<=[.!?;])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function extractContextAnswer(question, contextChunks) {
  if (!Array.isArray(contextChunks) || !contextChunks.length) return '';
  const questionTerms = tokenize(question);
  const scored = contextChunks
    .map((chunk) => {
      const lexical = scoreChunkAgainstQuestion(question, chunk);
      const sourceBoost = chunk.source === 'profile' ? 0.6 : chunk.source === 'cv' ? 0.3 : 0;
      return { chunk, score: lexical + sourceBoost };
    })
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, 3).map((entry) => entry.chunk);
  const sentences = [];
  top.forEach((chunk) => {
    const ranked = extractSentences(chunk.text)
      .map((sentence) => {
        const sentenceTerms = new Set(tokenize(sentence));
        let overlap = 0;
        questionTerms.forEach((term) => {
          if (sentenceTerms.has(term)) overlap += 1;
        });
        return { sentence, overlap };
      })
      .sort((a, b) => b.overlap - a.overlap);
    ranked.forEach((item) => {
      if (item.overlap > 0 && sentences.length < 2 && !sentences.includes(item.sentence)) {
        sentences.push(item.sentence);
      }
    });
  });
  const answer = sentences.join(' ').trim();
  if (!answer) return '';
  return answer.length > 360 ? `${answer.slice(0, 357)}...` : answer;
}

function extractProfileAnswerFromData(question, history = []) {
  const msg = String(question || '').toLowerCase();
  const profile = knowledge && knowledge.profile ? knowledge.profile : {};
  const pronounRefersToDominique = /\b(he|his|him)\b/.test(msg) && historyMentionsDominique(history);
  const explicitDominique = /\b(dominique|dominik|igiraneza)\b/.test(msg);
  const refersToDominique = explicitDominique || pronounRefersToDominique;

  if (
    refersToDominique &&
    (/\bwho is\b/.test(msg) || /\babout\b/.test(msg) || /\bintroduce\b/.test(msg))
  ) {
    const name = profile.fullName || 'IGIRANEZA Dominique';
    const headline = profile.headline || 'Business Analyst and AI professional';
    const summary = profile.summary || '';
    const location = profile.contact && profile.contact.location ? ` He is based in ${profile.contact.location}.` : '';
    return `${name} is a ${headline}. ${summary}${location}`.trim();
  }

  if (
    (/\b(skill|skills|stack|tools?)\b/.test(msg) || (pronounRefersToDominique && /\bwhat can he do\b/.test(msg))) &&
    Array.isArray(profile.skills) &&
    profile.skills.length
  ) {
    const top = profile.skills.slice(0, 10).join(', ');
    const headline = profile.headline ? `${profile.headline}. ` : '';
    return `${headline}Core skills include ${top}. Main focus: analytics, dashboards, automation, and decision-ready storytelling.`;
  }

  if (
    (/\b(project|projects|portfolio|best project|top project)\b/.test(msg) ||
      (pronounRefersToDominique && /\bproject\b/.test(msg))) &&
    Array.isArray(profile.projects) &&
    profile.projects.length
  ) {
    const topProject = profile.projects[0];
    if (/\b(best|top|biggest|flagship)\b/.test(msg) && topProject && topProject.name) {
      const others = profile.projects
        .slice(1, 3)
        .map((p) => p && p.name)
        .filter(Boolean)
        .join(', ');
      return `${profile.fullName || 'Dominique'}'s flagship project is ${topProject.name}${topProject.summary ? ` - ${topProject.summary}` : ''}${others ? ` Other standout projects include ${others}.` : '.'}`;
    }
    const topProjects = profile.projects
      .slice(0, 4)
      .map((p) => (p && p.name ? `${p.name}${p.summary ? ` - ${p.summary}` : ''}` : ''))
      .filter(Boolean);
    if (topProjects.length) {
      return `Highlighted projects: ${topProjects.join(' | ')}.`;
    }
  }

  if ((/\b(contact|email|phone|reach|linkedin)\b/.test(msg) || (pronounRefersToDominique && /\breach\b/.test(msg))) && profile.contact) {
    const bits = [];
    if (profile.contact.email) bits.push(`email ${profile.contact.email}`);
    if (profile.contact.phone) bits.push(`phone ${profile.contact.phone}`);
    if (profile.contact.linkedin) bits.push(`LinkedIn ${profile.contact.linkedin}`);
    if (bits.length) return `You can reach Dominique via ${bits.join(', ')}.`;
  }

  if (
    refersToDominique &&
    /\b(where|based|location|located)\b/.test(msg) &&
    profile.contact &&
    profile.contact.location
  ) {
    return `${profile.fullName || 'Dominique'} is based in ${profile.contact.location}.`;
  }

  if (
    (/\b(experience|work|role|job|worked)\b/.test(msg) || (pronounRefersToDominique && /\bexperience\b/.test(msg))) &&
    Array.isArray(profile.experience) &&
    profile.experience.length
  ) {
    const roles = profile.experience.slice(0, 3).map((x) => {
      const base = `${x.role || 'Role'} at ${x.company || 'organization'} (${x.period || 'period'})`;
      const highlight =
        Array.isArray(x.highlights) && x.highlights.length ? ` - ${x.highlights[0]}` : '';
      return `${base}${highlight}`;
    });
    return `Recent experience: ${roles.join(' | ')}.`;
  }

  if ((/\b(hire|why should we hire)\b/.test(msg) || (pronounRefersToDominique && /\bhire him\b/.test(msg))) && profile) {
    const strengths = Array.isArray(profile.skills) ? profile.skills.slice(0, 5).join(', ') : 'analytics and data products';
    return `${profile.fullName || 'Dominique'} is a strong hire because he combines business analysis with hands-on technical delivery. He builds dashboards, analytics products, and decision-ready insights, and he has experience in research, digital transformation support, and executive reporting. Key strengths include ${strengths}.`;
  }

  if (/\b(certification|certifications|certificate)\b/.test(msg) && Array.isArray(profile.certifications) && profile.certifications.length) {
    return `Certifications: ${profile.certifications.join(', ')}.`;
  }

  return '';
}

function isLikelyPortfolioQuery(question, contextChunks, history = []) {
  const msg = String(question || '').toLowerCase();
  const strongProfileTerms = [
    'dominique',
    'dominik',
    'igiraneza',
    'portfolio',
    'cv',
    'resume',
    'linkedin',
    'rama consult',
    'smart export analytics',
    'store sales intelligence',
    'top skills',
    'best projects',
    'show your best projects',
    'what skills do you have',
    'how can i contact you',
  ];
  if (strongProfileTerms.some((term) => msg.includes(term))) return true;

  const portfolioPronounIntent =
    /\b(his|her|him|he)\b/.test(msg) &&
    /\b(skill|skills|project|projects|experience|contact|cv|resume|portfolio|background|hire|based|location|located|where)\b/.test(msg);
  const historyAnchorsToDominique = historyMentionsDominique(history);
  if (portfolioPronounIntent && historyAnchorsToDominique) return true;

  const personalIntent = /\b(your|you)\b/.test(msg) && /\b(skill|skills|project|projects|experience|contact|cv|resume|portfolio|background|hire|based|location|located|where)\b/.test(msg);
  if (personalIntent) return true;

  const shortPortfolioPrompt = /\b(skill|skills|project|projects|experience|contact|portfolio|cv|resume)\b/.test(msg) && msg.split(/\s+/).length <= 4;
  if (shortPortfolioPrompt) return true;

  const qTokens = tokenize(question);
  if (!qTokens.length) return false;
  const maxScore = contextChunks.reduce((best, chunk) => Math.max(best, scoreChunkAgainstQuestion(question, chunk)), 0);
  return maxScore >= 3;
}

function isDynamicQuery(question) {
  const msg = String(question || '').toLowerCase();
  return (
    msg.includes('time') ||
    msg.includes('date') ||
    msg.includes('day today') ||
    msg.includes('today') ||
    msg.includes('right now') ||
    msg.includes('now') ||
    msg.includes('latest') ||
    msg.includes('current') ||
    msg.includes('trending')
  );
}

function tryNativeUtilityAnswer(question) {
  const msg = String(question || '').toLowerCase();
  if (msg.includes('time')) return `Current server time is ${new Date().toLocaleTimeString()}.`;
  if (msg.includes('date') || msg.includes('today')) return `Today is ${new Date().toLocaleDateString()}.`;
  return '';
}

async function queryDuckDuckGo(question) {
  const rawQuestion = String(question || '').trim();
  if (!rawQuestion) return '';

  const simplified = rawQuestion
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(
      (token) =>
        token &&
        token.length > 2 &&
        !['what', 'which', 'when', 'where', 'who', 'why', 'how', 'does', 'is', 'are', 'the', 'for'].includes(token)
    )
    .slice(0, 8)
    .join(' ');

  const attempts = [rawQuestion, simplified].filter(Boolean);

  for (const attempt of attempts) {
    const q = encodeURIComponent(attempt);
    const url = `https://api.duckduckgo.com/?q=${q}&format=json&no_html=1&skip_disambig=1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1400);
    let response;
    try {
      response = await fetch(url, { method: 'GET', signal: controller.signal });
    } catch (_) {
      clearTimeout(timeout);
      continue;
    } finally {
      clearTimeout(timeout);
    }
    if (!response.ok) continue;
    const data = await response.json();
    const abstract = String(data.AbstractText || '').trim();
    if (abstract) return abstract;
    if (Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics) {
        if (topic && typeof topic.Text === 'string' && topic.Text.trim()) {
          return topic.Text.trim();
        }
        if (topic && Array.isArray(topic.Topics)) {
          const nested = topic.Topics.find((t) => t && typeof t.Text === 'string' && t.Text.trim());
          if (nested && nested.Text) return String(nested.Text).trim();
        }
      }
    }
  }
  return '';
}

async function queryWikipediaSummaryByTopic(topic) {
  const candidate = normalizeGeneralTopic(topic).slice(0, 120);
  if (!candidate) return '';
  const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(candidate)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1700);
  try {
    const response = await fetch(endpoint, { method: 'GET', signal: controller.signal });
    if (!response.ok) return '';
    const payload = await response.json();
    const extract = String(payload && payload.extract ? payload.extract : '').trim();
    if (!extract) return '';
    return extract.length > GENERAL_REF_MAX_CHARS ? `${extract.slice(0, GENERAL_REF_MAX_CHARS - 3)}...` : extract;
  } catch (_) {
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

async function queryWikipediaSummary(question) {
  return queryWikipediaSummaryByTopic(extractGeneralTopic(question));
}

function normalizeQuestionText(question) {
  return String(question || '')
    .replace(/[,;]\s*(answer|explain|reply)\s+(very\s+)?(quick|quickly|short|briefly)\b/gi, '')
    .replace(/\b(answer|explain|reply)\s+(very\s+)?(quick|quickly|short|briefly)\b/gi, '')
    .replace(/\b(right now|latest|current|trending|now)\b/gi, '')
    .replace(/\bplease\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripTrendPhrases(text) {
  return String(text || '')
    .replace(/\b(top|best|popular|trending|latest|current|right now|now|today)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}


function normalizeGeneralTopic(topic) {
  let candidate = String(topic || '')
    .replace(/[?!.]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!candidate) return '';

  const lower = candidate.toLowerCase();
  if (lower.includes('lwarning')) return 'Machine learning';
  if (lower.includes('machin learn') || lower.includes('machine learn')) return 'Machine learning';
  if (lower === 'ai' || lower === 'a.i') return 'Artificial intelligence';
  if (lower === 'z test' || lower === 'z-test' || lower === 'ztest') return 'Z-test';
  if (lower === 'space x') return 'SpaceX';
  if (lower === 'usa' || lower === 'us' || lower === 'u.s.a') return 'United States';
  if (lower === 'uk' || lower === 'u.k') return 'United Kingdom';
  return candidate;
}

function extractGeneralTopic(question) {
  const raw = normalizeQuestionText(question);
  if (!raw) return '';
  const lower = raw.toLowerCase().replace(/[?!.]+$/g, '').trim();

  const cleaned = stripTrendPhrases(lower);
  if (/\b(rwandan|kenyan|ugandan|tanzanian|nigerian|ghanaian|south african|ethiopian)\b/.test(cleaned)) {
    const category = cleaned.match(/\b(music|songs?|artists?|musicians|movies?|films?|sports?|teams?)\b/);
    if (category) {
      const adjective = cleaned.match(/\b(rwandan|kenyan|ugandan|tanzanian|nigerian|ghanaian|south african|ethiopian)\b/);
      if (adjective && adjective[1]) {
        const base = category[1].startsWith('song') ? 'music' : category[1].startsWith('movie') || category[1].startsWith('film') ? 'film' : category[1];
        return normalizeGeneralTopic(`${adjective[1]} ${base}`);
      }
    }
  }

  const ownerMatch = lower.match(/\b(?:owner|founder|ceo|capital|currency|president|population)\s+of\s+(.+)$/i);
  if (ownerMatch && ownerMatch[1]) {
    return normalizeGeneralTopic(ownerMatch[1]);
  }

  const aboutMatch = lower.match(/\b(?:tell me something about|tell me about|explain|describe)\s+(.+)$/i);
  if (aboutMatch && aboutMatch[1]) {
    return normalizeGeneralTopic(aboutMatch[1]);
  }

  const whatIsMatch = lower.match(/\b(?:what is|what are|who is|define)\s+(.+)$/i);
  if (whatIsMatch && whatIsMatch[1]) {
    return normalizeGeneralTopic(whatIsMatch[1]);
  }

  return normalizeGeneralTopic(stripTrendPhrases(raw));
}

function extractKeywords(text) {
  const stop = new Set([
    'the','and','for','with','from','that','this','what','when','where','which','who','why','how','you','your','are','have','has','had','can','will','would','should','could','about','tell','me','please','is','it','of','to','in','on','at','by','an','a'
  ]);
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w));
}

function isReferenceRelevant(question, answer) {
  const qKeywords = extractKeywords(question);
  const aKeywords = extractKeywords(answer);
  if (!qKeywords.length || !aKeywords.length) return false;
  const aSet = new Set(aKeywords);
  const overlap = qKeywords.filter((w) => aSet.has(w));
  const overlapRatio = overlap.length / Math.max(1, qKeywords.length);
  if (overlap.length === 0 || overlapRatio < 0.08) return false;

  const categoryGroups = [
    ['music','song','songs','artist','artists','musician','musicians'],
    ['movie','movies','film','films','cinema','actor','actors'],
    ['sport','sports','team','teams','league','match','matches'],
    ['tech','technology','software','ai','artificial','intelligence'],
  ];
  for (const group of categoryGroups) {
    const qHas = group.some((w) => qKeywords.includes(w));
    const aHas = group.some((w) => aKeywords.includes(w));
    if (qHas && !aHas) return false;
  }

  const mismatchFlags = ['genocide','war','killed','massacre','rape'];
  const qIsMusic = qKeywords.includes('music') || qKeywords.includes('song') || qKeywords.includes('songs');
  const aHasMismatch = mismatchFlags.some((w) => aKeywords.includes(w));
  if (qIsMusic && aHasMismatch) return false;

  return true;
}

function extractComparisonTopics(question) {
  const raw = normalizeQuestionText(question);
  if (!raw) return null;
  const lower = raw.toLowerCase().replace(/[?!.]+$/g, '').trim();

  const differentFrom = lower.match(/\bwhat is\s+(.+?)\s+and\s+how is it different from\s+(.+)$/i);
  if (differentFrom && differentFrom[1] && differentFrom[2]) {
    return [normalizeGeneralTopic(differentFrom[1]), normalizeGeneralTopic(differentFrom[2])];
  }

  const direct = lower.match(/\b(?:difference between|compare)\s+(.+?)\s+(?:and|vs|versus)\s+(.+)$/i);
  if (direct && direct[1] && direct[2]) {
    return [normalizeGeneralTopic(direct[1]), normalizeGeneralTopic(direct[2])];
  }

  const natural = lower.match(/\bwhat is\s+(.+?)\s+(?:and|vs|versus)\s+(.+)$/i);
  if (natural && natural[1] && natural[2] && /\b(difference|different|compare)\b/.test(lower)) {
    return [normalizeGeneralTopic(natural[1]), normalizeGeneralTopic(natural[2])];
  }

  return null;
}

async function queryWikipediaSearchSummaryByTopic(topic) {
  topic = normalizeGeneralTopic(topic);
  if (!topic) return '';

  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
    topic
  )}&utf8=1&format=json&srlimit=1`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2600);
  try {
    const searchRes = await fetch(searchUrl, { method: 'GET', signal: controller.signal });
    if (!searchRes.ok) return '';
    const searchPayload = await searchRes.json();
    const results =
      searchPayload &&
      searchPayload.query &&
      Array.isArray(searchPayload.query.search)
        ? searchPayload.query.search
        : [];
    const title = results[0] && results[0].title ? String(results[0].title) : '';
    const snippet = results[0] && results[0].snippet ? stripHtmlTags(String(results[0].snippet)) : '';
    if (!title) return '';

    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const summaryRes = await fetch(summaryUrl, { method: 'GET' });
    if (!summaryRes.ok) return snippet || '';
    const summaryPayload = await summaryRes.json();
    const extract = String(summaryPayload && summaryPayload.extract ? summaryPayload.extract : '').trim();
    if (!extract) return snippet || '';
    return extract.length > GENERAL_REF_MAX_CHARS ? `${extract.slice(0, GENERAL_REF_MAX_CHARS - 3)}...` : extract;
  } catch (_) {
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

async function queryWikipediaSearchSummary(question) {
  return queryWikipediaSearchSummaryByTopic(extractGeneralTopic(question));
}

async function queryReferenceForTopic(topic) {
  const direct = await queryWikipediaSummaryByTopic(topic);
  if (direct) return direct;
  return queryWikipediaSearchSummaryByTopic(topic);
}

async function queryAnyGeneralReference(question) {
  const topic = extractGeneralTopic(question);
  if (topic) {
    const reference = await queryReferenceForTopic(topic);
    if (reference) return reference;
  }
  return queryDuckDuckGo(question);
}

function extractLeadSentence(text, maxLen = 260) {
  const sentences = extractSentences(text);
  const first = sentences[0] || String(text || '').trim();
  if (!first) return '';
  return first.length > maxLen ? `${first.slice(0, maxLen - 3)}...` : first;
}

async function answerComparisonFromReferences(question) {
  const topics = extractComparisonTopics(question);
  if (!topics || topics.length !== 2) return '';
  const [left, right] = topics;
  if (!left || !right) return '';
  const leftRef = await queryReferenceForTopic(left);
  const rightRef = await queryReferenceForTopic(right);
  if (!leftRef || !rightRef) return '';
  const leftLead = extractLeadSentence(leftRef);
  const rightLead = extractLeadSentence(rightRef);
  if (!leftLead || !rightLead) return '';
  return `${left}: ${leftLead} ${right}: ${rightLead} In short, ${left} describes one concept, while ${right} describes a different one.`;
}

async function answerSubjectAttributeQuestion(question, history = []) {
  const raw = String(question || '').trim();
  if (!raw) return '';
  const subject = resolveQuestionSubject(raw, history);
  if (!subject) return '';
  const lower = raw.toLowerCase();
  const summary = await queryReferenceForTopic(subject);
  if (!summary) return '';
  const lead = extractLeadSentence(summary, 320);
  if (!lead) return '';

  if (/\b(who is|who was)\b/.test(lower)) {
    return lead;
  }

  if (/\b(where|from|based|location|located)\b/.test(lower)) {
    return lead;
  }

  if (/\b(field|profession|job|work|career|famous for|known for|do)\b/.test(lower)) {
    return lead;
  }

  return '';
}

function stripHtmlTags(html) {
  return String(html || '')
    .replace(/<pre><code>/gi, '```')
    .replace(/<\/code><\/pre>/gi, '```')
    .replace(/<code>/gi, '`')
    .replace(/<\/code>/gi, '`')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function queryStackOverflow(question) {
  const raw = String(question || '').trim();
  if (!raw) return '';
  const simplified = tokenize(raw)
    .filter((token) => !['give', 'short', 'function', 'code', 'please', 'write'].includes(token))
    .slice(0, 7)
    .join(' ');
  const attempts = [raw, simplified].filter(Boolean);

  for (const attempt of attempts) {
    const q = encodeURIComponent(attempt);
    const url = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&site=stackoverflow&pagesize=3&filter=withbody&q=${q}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    let response;
    try {
      response = await fetch(url, { method: 'GET', signal: controller.signal });
    } catch (_) {
      clearTimeout(timeout);
      continue;
    } finally {
      clearTimeout(timeout);
    }
    if (!response.ok) continue;
    const data = await response.json();
    if (!data || !Array.isArray(data.items) || !data.items.length) continue;
    const top = data.items.find((item) => item && typeof item.body === 'string' && item.body.includes('<code>')) || data.items[0];
    const title = stripHtmlTags(top.title || '');
    const body = String(top.body || '');
    const cleaned = stripHtmlTags(body).slice(0, 700);
    const link = top.link ? String(top.link) : '';
    if (!cleaned) continue;
    return `**Related coding reference**\n- ${title}\n- ${cleaned}${link ? `\n- Source: ${link}` : ''}`;
  }
  return '';
}

function tryRuleBasedGeneralAnswer(question) {
  const msg = String(question || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (!msg) return '';

  if (/\b(10|ten)\b/.test(msg) && /\b(importance|benefit|benefits|use|uses)\b/.test(msg) && /\bwater\b/.test(msg)) {
    return [
      'Ten key importance of water:',
      '1. Keeps the body hydrated and supports temperature regulation.',
      '2. Carries nutrients and oxygen through blood circulation.',
      '3. Supports digestion and helps absorb nutrients.',
      '4. Helps kidneys remove waste and toxins from the body.',
      '5. Lubricates joints and protects sensitive tissues.',
      '6. Supports food production through agriculture and irrigation.',
      '7. Enables sanitation and hygiene to prevent disease.',
      '8. Supports industry and manufacturing processes.',
      '9. Generates electricity through hydropower in many regions.',
      '10. Sustains ecosystems, biodiversity, and climate stability.',
    ].join('\n');
  }

  if (/\b(owner|founder|ceo)\b/.test(msg) && /\bspace\s*x|spacex\b/.test(msg)) {
    return "SpaceX was founded by Elon Musk, and he serves as CEO. He is widely recognized as the company's primary owner.";
  }

  const mathMatch = msg.match(/^\s*(-?\d+(?:\.\d+)?)\s*([\+\-\*x\/])\s*(-?\d+(?:\.\d+)?)\s*\??$/);
  if (mathMatch) {
    const a = Number(mathMatch[1]);
    const op = mathMatch[2];
    const b = Number(mathMatch[3]);
    if (op === '+') return `${a + b}`;
    if (op === '-') return `${a - b}`;
    if (op === '*' || op === 'x') return `${a * b}`;
    if (op === '/') return b === 0 ? 'Division by zero is undefined.' : `${a / b}`;
  }

  return '';
}

function tryConversationalReply(question) {
  const msg = String(question || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (!msg) return '';

  if (/^(hi|hey|hello|yo|good morning|good afternoon|good evening)\b/.test(msg)) {
    return 'Hi. Ask me anything about Dominique or any general topic.';
  }

  if (/\bhow are you\b/.test(msg) || /\bhow r you\b/.test(msg)) {
    return 'I am well and ready to help. Ask me a portfolio question or any general question.';
  }

  if (/\bthank you\b|\bthanks\b|\bappreciate it\b/.test(msg)) {
    return 'You are welcome. Send the next question when you are ready.';
  }

  if (/^(ok|okay|fine|alright|cool|nice)\b/.test(msg) && msg.split(/\s+/).length <= 4) {
    return 'Understood. Send the next question when you are ready.';
  }

  if (/\bwho are you\b|\bwhat are you\b/.test(msg)) {
    return 'I am Dominik AI Assistant. I can answer portfolio questions about Dominique and many general questions too.';
  }

  return '';
}

function buildFastBestEffortReply(question) {
  const cleaned = String(question || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  if (isCreativeOrOpenEndedPrompt(cleaned)) {
    return 'I can help with that. Tell me the tone, length, or audience you want, and I will draft it directly.';
  }
  if (isAdviceOrReasoningPrompt(cleaned)) {
    return 'I can help with that. Share the exact situation or goal, and I will give a direct step-by-step answer.';
  }
  const topic = extractGeneralTopic(cleaned);
  if (!topic) return '';

  if (/^(what is|what are|define|meaning of|explain)\b/i.test(cleaned)) {
    return `${topic} is a topic I can explain. Ask about its meaning, uses, examples, or differences, and I will answer directly.`;
  }

  if (/^(how|why)\b/i.test(cleaned)) {
    return `I can answer that. Add the exact topic or context you want, and I will give a direct explanation.`;
  }

  return `Ask about ${topic} in a bit more detail, and I will answer clearly and directly.`;
}

async function tryFastLocalGeneralAnswer(question, history = []) {
  const message = String(question || '').trim();
  if (!message) return '';
  const resolvedMessage = rewritePronounQuestion(message, history);
  const lower = resolvedMessage.toLowerCase();
  const conversationalReply = tryConversationalReply(message);
  if (conversationalReply) return conversationalReply;
  const nativeAnswer = tryNativeUtilityAnswer(resolvedMessage);
  if (nativeAnswer) return nativeAnswer;
  if (isDynamicQuery(resolvedMessage)) {
    return 'That needs live, up-to-date data. If you want, I can answer a non-real-time version (for example: popular Rwandan music genres or classic artists), or you can enable a live data source.';
  }

  const practicalGuidance = buildPracticalGuidance(message, history);
  if (practicalGuidance) return practicalGuidance;

  const subjectAttributeAnswer = await answerSubjectAttributeQuestion(message, history);
  if (subjectAttributeAnswer) return subjectAttributeAnswer;

  const comparisonAnswer = await answerComparisonFromReferences(resolvedMessage);
  if (comparisonAnswer) return comparisonAnswer;

  const ruleBased = tryRuleBasedGeneralAnswer(resolvedMessage);
  if (ruleBased) return ruleBased;

  const isCodeRequest = /\b(code|function|script|python|javascript|sql|java|c\+\+|algorithm)\b/i.test(lower);
  if (isCodeRequest) {
    try {
      const stack = await queryStackOverflow(resolvedMessage);
      if (stack) return stack;
    } catch (_) {
      // Ignore and continue.
    }
  }

  const looksFactual = /(\?|what|why|how|when|where|define|explain|describe|about|meaning|difference|vs|example|capital|convert|calculate|who|which)/i.test(
    resolvedMessage
  );
  if (looksFactual) {
    if (isAmbiguousPronounQuestion(message, history)) {
      return 'Please mention the person or subject you mean, so I can answer accurately.';
    }
    if (isDynamicQuery(resolvedMessage)) {
      return 'That is a live or trending question. I can answer if you want a general, non-real-time summary, or I can use a live data source if enabled.';
    }
    try {
      const externalAnswer = await queryAnyGeneralReference(resolvedMessage);
      if (externalAnswer && isReferenceRelevant(resolvedMessage, externalAnswer)) return externalAnswer;
    } catch (_) {
      // Ignore and continue.
    }
  }

  return '';
}

async function smartFallbackReply(question, contextChunks, providerErrors, history = []) {
  const message = String(question || '').trim();
  const resolvedMessage = rewritePronounQuestion(message, history);
  const wordCount = message.split(/\s+/).filter(Boolean).length;
  const conversationalReply = tryConversationalReply(message);
  if (conversationalReply) return conversationalReply;
  const nativeAnswer = tryNativeUtilityAnswer(resolvedMessage);
  if (nativeAnswer) return nativeAnswer;
  if (isDynamicQuery(resolvedMessage)) {
    return 'That is a live or trending question. I can answer a general, non-real-time version or use a live data source if enabled.';
  }

  if (isLikelyPortfolioQuery(message, contextChunks, history)) {
    const directAnswer = extractProfileAnswerFromData(message, history);
    if (directAnswer) return directAnswer;
    const profileAnswer = extractContextAnswer(message, contextChunks);
    if (profileAnswer) return profileAnswer;
  }

  if (wordCount <= 2 && !message.includes('?')) {
    return 'Hi. Ask me anything about Dominique or any general topic.';
  }

  const lower = resolvedMessage.toLowerCase();

  const looksFactual = /(\?|what|why|how|when|where|define|explain|describe|about|meaning|difference|vs|example|capital|convert|calculate|who|which)/i.test(
    resolvedMessage
  );
  if (looksFactual && isAmbiguousPronounQuestion(message, history)) {
    return 'Please mention the person or subject you mean, so I can answer accurately.';
  }

  const isCodeRequest = /\b(code|function|script|python|javascript|sql|java|c\+\+|algorithm)\b/i.test(lower);
  if (isCodeRequest) {
    try {
      const stack = await queryStackOverflow(resolvedMessage);
      if (stack) return stack;
    } catch (_) {
      // Continue to other fallback behavior.
    }
  }

  const conversationalShape = wordCount <= 5 && /\byou\b/i.test(resolvedMessage) && !resolvedMessage.includes('?');
  if (conversationalShape) {
    return 'I can help with portfolio questions and general questions. Ask a specific question and I will answer clearly.';
  }

  if (looksFactual && !conversationalShape) {
    try {
      const externalAnswer = await queryAnyGeneralReference(resolvedMessage);
      if (externalAnswer) return externalAnswer;
    } catch (_) {
      // Ignore external source failures and continue.
    }
    const ruleBased = tryRuleBasedGeneralAnswer(message);
    if (ruleBased) return ruleBased;
  }

  if (providerErrors && providerErrors.length && !isLikelyPortfolioQuery(message, contextChunks, history)) {
    const ruleBased = tryRuleBasedGeneralAnswer(resolvedMessage);
    if (ruleBased) return ruleBased;
    const bestEffort = buildFastBestEffortReply(resolvedMessage);
    if (bestEffort) return bestEffort;
    return 'Ask a more specific question and I will answer it directly.';
  }
  return buildFastBestEffortReply(resolvedMessage) || 'Ask a specific question and I will answer directly.';
}

async function queryBestProvider(question, history, contextChunks) {
  const mode = isLikelyPortfolioQuery(question, contextChunks, history) ? 'portfolio' : 'general';
  const prompt = buildPrompt({ question, history, contextChunks, mode });
  const maxTokens = resolveMaxTokensForQuestion(question);
  const errors = [];
  const preferCloudGeneral = mode === 'general' && shouldPreferCloudGeneral(question, history);
  const directLocal = mode === 'portfolio' ? extractProfileAnswerFromData(question, history) : '';
  if (directLocal) {
    return { reply: directLocal, provider: 'fallback-local', model: '', errors };
  }
  const conversationalReply = mode === 'general' ? tryConversationalReply(question) : '';
  if (conversationalReply) {
    return { reply: conversationalReply, provider: 'fallback-local', model: '', errors };
  }
  const quickGeneral = mode === 'general' ? tryRuleBasedGeneralAnswer(question) : '';
  if (quickGeneral) {
    return { reply: quickGeneral, provider: 'fallback-local', model: '', errors };
  }

  if (mode === 'general' && !preferCloudGeneral) {
    const fastLocalGeneral = await tryFastLocalGeneralAnswer(question, history);
    if (fastLocalGeneral) {
      return { reply: fastLocalGeneral, provider: 'fallback-local', model: '', errors };
    }
  }

  const now = Date.now();
  const anthropicBlocked = providerState.anthropicCooldownUntil > now;
  const geminiBlocked = providerState.geminiCooldownUntil > now;
  const hfBlocked = providerState.hfCooldownUntil > now;

  if (!CONFIG.geminiOnly && CONFIG.anthropicApiKey && !anthropicBlocked) {
    try {
      const reply = await queryAnthropic(prompt, maxTokens, CONFIG.anthropicModel);
      if (reply && !looksTruncatedReply(reply, question)) {
        return { reply, provider: 'anthropic', model: CONFIG.anthropicModel, errors };
      }
      throw new Error('Anthropic returned incomplete response.');
    } catch (error) {
      const message = toErrorMessage(error);
      logProviderFailure('Anthropic', error);
      errors.push(`Anthropic: ${compactErrorMessage(message, 220)}`);
      if (isBillingError(message)) {
        providerState.anthropicCooldownUntil = Date.now() + 30 * 60 * 1000;
      } else if (isQuotaOrRateError(message)) {
        providerState.anthropicCooldownUntil = Date.now() + 45 * 1000;
      } else {
        providerState.anthropicCooldownUntil = Date.now() + 20 * 1000;
      }
    }
  } else if (!CONFIG.geminiOnly && anthropicBlocked) {
    const sec = Math.max(1, Math.ceil((providerState.anthropicCooldownUntil - now) / 1000));
    const reason = `cooling down for ${sec}s due to recent failures`;
    logProviderFailure('Anthropic', new Error(reason));
    errors.push(`Anthropic: ${reason}`);
  } else if (!CONFIG.geminiOnly) {
    const reason = 'not configured';
    logProviderFailure('Anthropic', new Error(reason));
    errors.push(`Anthropic: ${reason}`);
  }

  if (CONFIG.geminiApiKey && !geminiBlocked) {
    try {
      const gem = await queryGeminiWithFallback(prompt, maxTokens, question);
      const reply = gem.reply;
      if (reply) return { reply, provider: 'gemini', model: gem.modelName, errors };
      throw new Error('Gemini returned empty response.');
    } catch (error) {
      const message = toErrorMessage(error);
      logProviderFailure('Gemini', error);
      errors.push(`Gemini: ${compactErrorMessage(message, 220)}`);
      const retrySeconds = parseRetrySeconds(message);
      if (retrySeconds > 0) {
        providerState.geminiCooldownUntil = Date.now() + Math.max(retrySeconds, 180) * 1000;
      } else if (isQuotaOrRateError(message)) {
        providerState.geminiCooldownUntil = Date.now() + 45 * 1000;
      }
    }
  } else if (geminiBlocked) {
    const sec = Math.max(1, Math.ceil((providerState.geminiCooldownUntil - now) / 1000));
    const reason = `cooling down for ${sec}s due to quota/rate limits`;
    logProviderFailure('Gemini', new Error(reason));
    errors.push(`Gemini: ${reason}`);
  } else {
    const reason = 'not configured';
    logProviderFailure('Gemini', new Error(reason));
    errors.push(`Gemini: ${reason}`);
  }

  if (!CONFIG.geminiOnly && CONFIG.hfToken && !hfBlocked) {
    try {
      const reply = await queryHuggingFace(prompt, maxTokens);
      if (looksTruncatedReply(reply, question)) {
        throw new Error('incomplete response');
      }
      if (reply) return { reply, provider: 'huggingface', model: CONFIG.hfModel, errors };
      throw new Error('empty response');
    } catch (error) {
      const message = toErrorMessage(error);
      logProviderFailure('HuggingFace', error);
      errors.push(`HuggingFace: ${compactErrorMessage(message, 220)}`);
      if (isHfPermissionError(message)) {
        providerState.hfCooldownUntil = Date.now() + HF_PERMISSION_COOLDOWN_MS;
      } else {
        providerState.hfCooldownUntil = Date.now() + HF_TEMP_COOLDOWN_MS;
      }
    }
  } else if (!CONFIG.geminiOnly && hfBlocked) {
    const sec = Math.max(1, Math.ceil((providerState.hfCooldownUntil - now) / 1000));
    const reason = `cooling down for ${sec}s due to recent failures`;
    logProviderFailure('HuggingFace', new Error(reason));
    errors.push(`HuggingFace: ${reason}`);
  } else if (!CONFIG.geminiOnly) {
    const reason = 'not configured';
    logProviderFailure('HuggingFace', new Error(reason));
    errors.push(`HuggingFace: ${reason}`);
  }

  if (mode === 'general' && preferCloudGeneral) {
    const fastLocalGeneral = await tryFastLocalGeneralAnswer(question, history);
    if (fastLocalGeneral) {
      return { reply: fastLocalGeneral, provider: 'fallback-local', model: '', errors };
    }
  }

  const localReply = await smartFallbackReply(question, contextChunks, errors, history);
  if (localReply) {
    return { reply: localReply, provider: 'fallback-local', model: '', errors };
  }

  const fatal = new Error('Ask a more specific question and I will answer directly.');
  fatal.statusCode = 503;
  fatal.providerErrors = errors;
  throw fatal;
}

function getCacheKey(message, history = []) {
  const historyKey = Array.isArray(history)
    ? history
        .slice(-2)
        .map((item) => `${item && item.role ? item.role : 'x'}:${String(item && item.content ? item.content : '').trim().toLowerCase()}`)
        .join('|')
    : '';
  return `${CACHE_SCHEMA_VERSION}|${CONFIG.anthropicModel}|${CONFIG.geminiModel}|${CONFIG.hfModel}|${String(message || '').trim().toLowerCase()}|${historyKey}`;
}

function readCache(cacheKey) {
  if (!cacheKey || !responseCache.has(cacheKey)) return null;
  const item = responseCache.get(cacheKey);
  if (!item || Date.now() - item.createdAt > CACHE_TTL_MS) {
    responseCache.delete(cacheKey);
    return null;
  }
  return item.reply;
}

function writeCache(cacheKey, reply) {
  if (!cacheKey || !reply) return;
  responseCache.set(cacheKey, { reply, createdAt: Date.now() });
  if (responseCache.size <= CACHE_MAX_ITEMS) return;
  const firstKey = responseCache.keys().next().value;
  if (firstKey) responseCache.delete(firstKey);
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(text),
  });
  res.end(text);
}

function resolveStaticPath(requestPath) {
  const normalized = decodeURIComponent(requestPath.split('?')[0]);
  const target = normalized === '/' ? '/index.html' : normalized;
  const unsafePath = path.join(ROOT_DIR, target);
  const safePath = path.normalize(unsafePath);
  if (!safePath.startsWith(path.normalize(ROOT_DIR))) return null;
  return safePath;
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let buffer = '';
    req.on('data', (chunk) => {
      buffer += chunk;
      if (buffer.length > 1_000_000) {
        reject(new Error('Payload too large.'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!buffer.trim()) return resolve({});
      try {
        resolve(JSON.parse(buffer));
      } catch (_) {
        reject(new Error('Invalid JSON payload.'));
      }
    });
    req.on('error', reject);
  });
}

async function handleApi(req, res, pathname) {
  if (pathname === '/api/health' && req.method === 'GET') {
    return sendJson(res, 200, {
      ok: true,
      service: 'Dominik AI Assistant',
      models: {
        anthropic: CONFIG.anthropicModel,
        gemini: CONFIG.geminiModel,
        huggingface: CONFIG.hfModel,
      },
      providers: {
        anthropicConfigured: Boolean(CONFIG.anthropicApiKey),
        geminiConfigured: Boolean(CONFIG.geminiApiKey),
        hfConfigured: Boolean(CONFIG.hfToken),
        anthropicCooldownSeconds: Math.max(0, Math.ceil((providerState.anthropicCooldownUntil - Date.now()) / 1000)),
        geminiCooldownSeconds: Math.max(0, Math.ceil((providerState.geminiCooldownUntil - Date.now()) / 1000)),
        hfCooldownSeconds: Math.max(0, Math.ceil((providerState.hfCooldownUntil - Date.now()) / 1000)),
        geminiCandidates: getGeminiModelCandidates(),
      },
      sourceStats: knowledge.sourceStats,
    });
  }

  if (pathname === '/api/chat' && req.method === 'POST') {
    let message = '';
    let history = [];
    try {
      const body = await parseJsonBody(req);
      message = String(body.message || '').trim();
      history = Array.isArray(body.history) ? body.history : [];

      if (!message) return sendJson(res, 400, { error: 'message is required.' });
      const dynamic = isDynamicQuery(message);
      const cacheKey = getCacheKey(message, history);
      const cached = dynamic ? null : readCache(cacheKey);
      if (cached) return sendJson(res, 200, { reply: cached, cached: true });

      const contextChunks = selectRelevantChunks(message);
      const result = await queryBestProvider(message, history, contextChunks);
      const reply = String(result.reply || '').trim();
      if (!reply) return sendJson(res, 500, { error: 'Assistant returned empty response.' });
      if (!dynamic) writeCache(cacheKey, reply);

      return sendJson(res, 200, {
        reply,
        provider: result.provider,
        model: result.model || '',
      });
    } catch (error) {
      const statusCode = Number(error && error.statusCode) || 500;
      const providerErrors = Array.isArray(error && error.providerErrors) ? error.providerErrors : [];
      if (providerErrors.length) {
        console.warn('[AI][chat] provider failures:', providerErrors);
      } else {
        console.warn('[AI][chat] request failed:', toErrorMessage(error));
      }

      const fallbackReply = message ? await smartFallbackReply(message, selectRelevantChunks(message), providerErrors, history) : '';
      const safeMessage = fallbackReply || (statusCode === 503 ? 'Ask a more specific question and I will answer directly.' : 'Failed to generate response.');
      return sendJson(res, 200, { reply: safeMessage, provider: 'fallback-local', model: '' });
    }
  }

  return false;
}

function createServer() {
  return http.createServer(async (req, res) => {
    const method = req.method || 'GET';
    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    if (pathname.startsWith('/api/')) {
      const handled = await handleApi(req, res, pathname);
      if (handled !== false) return;
      return sendJson(res, 404, { error: 'API endpoint not found.' });
    }

    if (!['GET', 'HEAD'].includes(method)) {
      return sendText(res, 405, 'Method not allowed');
    }

    const filePath = resolveStaticPath(pathname);
    if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      return sendText(res, 404, 'Not found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const data = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': data.length,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
    });
    if (method === 'HEAD') return res.end();
    res.end(data);
  });
}

if (require.main === module) {
  const server = createServer();
  server.listen(CONFIG.port, CONFIG.host, () => {
    console.log(`Dominik AI Assistant server running at http://localhost:${CONFIG.port}`);
    console.log(`Anthropic model: ${CONFIG.anthropicModel}`);
    console.log(`Gemini model: ${CONFIG.geminiModel}`);
    console.log(`Hugging Face model: ${CONFIG.hfModel}`);
    console.log(`Anthropic key configured: ${CONFIG.anthropicApiKey ? 'yes' : 'no'}`);
    console.log(`Gemini key configured: ${CONFIG.geminiApiKey ? 'yes' : 'no'}`);
    console.log(`HF token configured: ${CONFIG.hfToken ? 'yes' : 'no'}`);
    console.log(
      `Knowledge loaded: chunks=${knowledge.sourceStats.chunks}, linkedin_posts=${knowledge.sourceStats.linkedinPosts}, cv_loaded=${knowledge.sourceStats.cvLoaded}`
    );
  });
}

module.exports = {
  createServer,
  buildKnowledgeBase,
  selectRelevantChunks,
};
