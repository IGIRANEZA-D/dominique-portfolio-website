import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PORTFOLIO, PROJECTS, EXPERIENCE } from '@/data/portfolio';

type Chunk = { text: string; terms: string[] };

function tokenize(text: string) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function buildChunks(): Chunk[] {
  const parts: string[] = [];
  parts.push(`Name: ${PORTFOLIO.name}. Title: ${PORTFOLIO.title}. Bio: ${PORTFOLIO.bio}.`);
  parts.push(`Contact: ${PORTFOLIO.email}, ${PORTFOLIO.phone}, ${PORTFOLIO.location}.`);
  parts.push(`Headline: ${PORTFOLIO.headline}. Subheadline: ${PORTFOLIO.subheadline}.`);
  EXPERIENCE.forEach((item) => {
    parts.push(`${item.title} at ${item.company} (${item.period}). ${item.description}. Highlights: ${item.highlights.join('; ')}`);
  });
  PROJECTS.forEach((item) => {
    parts.push(`${item.title}. ${item.description}. Stack: ${item.tech_stack.join(', ')}.`);
  });

  return parts.map((text) => ({ text, terms: tokenize(text) }));
}

const CHUNKS = buildChunks();

function selectContext(question: string, limit = 4) {
  const qTerms = tokenize(question);
  const scored = CHUNKS.map((chunk) => {
    const set = new Set(chunk.terms);
    let score = 0;
    qTerms.forEach((term) => {
      if (set.has(term)) score += 1;
    });
    return { chunk, score };
  }).sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((item) => item.chunk.text);
}

function buildPrompt(question: string, history: Array<{ role: string; content: string }>) {
  const context = selectContext(question).join('\n');
  const shortHistory = history
    .slice(-6)
    .map((item) => `${item.role === 'assistant' ? 'Assistant' : 'User'}: ${String(item.content || '')}`)
    .join('\n');

  return [
    'You are Dominik AI Assistant.',
    'Answer naturally and professionally.',
    'Use the portfolio context for profile-related questions.',
    'For general questions, provide concise and correct answers.',
    'Do not fabricate profile details not present in context.',
    'Style: start with a short markdown bold heading, then brief bullet points when useful.',
    'Use 1-2 relevant emojis maximum in each answer.',
    '',
    `PORTFOLIO CONTEXT:\n${context}`,
    '',
    `RECENT CHAT:\n${shortHistory || 'None'}`,
    '',
    `QUESTION: ${question}`,
    'ANSWER:',
  ].join('\n');
}

function cleanReply(text: string) {
  return String(text || '')
    .replace(/^assistant\s*:\s*/i, '')
    .replace(/^answer\s*:\s*/i, '')
    .trim();
}

async function askGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY missing.');
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const maxOutputTokens = Number(process.env.HF_MAX_NEW_TOKENS || 220);
  const temperature = Number(process.env.HF_TEMPERATURE || 0.4);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens },
      }),
    }
  );

  const raw = await response.text();
  let parsed: unknown = raw;
  try {
    parsed = JSON.parse(raw);
  } catch (_) {
    parsed = raw;
  }
  if (!response.ok) {
    const message =
      typeof parsed === 'object' && parsed && 'error' in parsed
        ? String((parsed as { error?: { message?: string } }).error?.message || 'Gemini error')
        : `Gemini failed (${response.status}).`;
    throw new Error(message);
  }

  const parsedObj = parsed as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const candidates = Array.isArray(parsedObj.candidates) ? parsedObj.candidates : [];
  const text = candidates[0]?.content?.parts?.map((part) => part.text || '').join(' ').trim() || '';
  if (!text) throw new Error('Gemini returned empty output.');
  return cleanReply(text);
}

async function askHuggingFace(prompt: string) {
  const token = process.env.HF_API_TOKEN;
  if (!token) throw new Error('HF_API_TOKEN missing.');
  const model = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3';
  const maxNewTokens = Number(process.env.HF_MAX_NEW_TOKENS || 220);
  const temperature = Number(process.env.HF_TEMPERATURE || 0.4);

  const response = await fetch(`https://router.huggingface.co/hf-inference/models/${encodeURIComponent(model)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: maxNewTokens, temperature, return_full_text: false },
    }),
  });

  const raw = await response.text();
  let parsed: unknown = raw;
  try {
    parsed = JSON.parse(raw);
  } catch (_) {
    parsed = raw;
  }
  if (!response.ok) {
    const message =
      typeof parsed === 'object' && parsed && 'error' in parsed
        ? String((parsed as { error?: unknown }).error)
        : `Hugging Face failed (${response.status}).`;
    throw new Error(message);
  }
  const arr = Array.isArray(parsed) ? parsed : [];
  const text = arr[0] && typeof arr[0].generated_text === 'string' ? arr[0].generated_text : '';
  if (!text) throw new Error('Hugging Face returned empty output.');
  return cleanReply(text);
}

async function askOpenAI(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY missing.');
  const openai = new OpenAI({ apiKey });
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    max_tokens: 220,
  });
  return cleanReply(completion.choices?.[0]?.message?.content || '');
}

async function askDuckDuckGo(question: string) {
  const q = encodeURIComponent(String(question || '').trim());
  if (!q) return '';
  const response = await fetch(`https://api.duckduckgo.com/?q=${q}&format=json&no_html=1&skip_disambig=1`);
  if (!response.ok) return '';
  const data = (await response.json()) as { AbstractText?: string; RelatedTopics?: Array<{ Text?: string }> };
  const abstract = String(data.AbstractText || '').trim();
  if (abstract) return abstract;
  const related = Array.isArray(data.RelatedTopics) ? data.RelatedTopics : [];
  const first = related.find((item) => item?.Text && item.Text.trim());
  return first?.Text?.trim() || '';
}

function fallbackFromContext(question: string) {
  const context = selectContext(question, 2).join(' ');
  if (context) return context.slice(0, 420);
  return 'I can help with general questions and portfolio details. Please ask in one clear sentence.';
}

export async function POST(req: Request) {
  const body = (await req.json()) as { message?: string; history?: Array<{ role: string; content: string }> };
  const message = String(body?.message || '').trim();
  const history = Array.isArray(body?.history) ? body.history : [];
  if (!message) return NextResponse.json({ error: 'message is required.' }, { status: 400 });

  const prompt = buildPrompt(message, history);
  const errors: string[] = [];

  const providers = [askGemini, askHuggingFace, askOpenAI];
  for (const provider of providers) {
    try {
      const reply = await provider(prompt);
      if (reply) return NextResponse.json({ reply });
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  try {
    const ddg = await askDuckDuckGo(message);
    if (ddg) return NextResponse.json({ reply: ddg, provider: 'duckduckgo', fallback: true });
  } catch (_) {
    // Continue to local fallback.
  }

  return NextResponse.json({ reply: fallbackFromContext(message), provider: 'local-fallback', errors, fallback: true });
}
