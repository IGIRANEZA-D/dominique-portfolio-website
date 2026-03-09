"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Minimize2, Loader2, Sparkles } from 'lucide-react';
import { PORTFOLIO } from '@/data/portfolio';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'What are your key projects?',
  'Tell me about AI automation',
  'How can I reach you?',
  'Show skills and experience',
];

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm Dominique's AI Assistant. Ask me about projects, skills, automation expertise, or how to connect. What would you like to know?",
    },
  ]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply ?? 'Thanks for reaching out!' }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-assistant" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* AI Assistant Button with Pulse Animation */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-amber-500 to-amber-300 text-slate-900 shadow-2xl flex items-center justify-center hover:shadow-amber-400/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 transition-shadow"
        aria-label="Open Dominik AI Assistant"
      >
        {/* Pulse Ring */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-blue-500 opacity-20"
        />

        {/* Icon */}
        {open ? (
          <Minimize2 className="h-6 w-6 relative z-10" />
        ) : (
          <Sparkles className="h-6 w-6 relative z-10" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="mt-3 sm:mt-4 w-[min(400px,calc(100vw-1rem))] h-[min(75vh,500px)] sm:h-[500px] rounded-2xl border border-white/10 bg-slate-900 text-slate-100 shadow-2xl shadow-black/40 flex flex-col overflow-hidden"
          >
            {/* Header - Professional Branding */}
            <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-white/10 bg-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Dominik AI Assistant</p>
                    <p className="text-xs text-amber-200">Data • AI • Automation Expert</p>
                  </div>
                </div>
                <span className="text-xs bg-amber-500/20 text-amber-200 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                  Active
                </span>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-3 px-3 sm:px-4 py-3 sm:py-4">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  aria-label={`${msg.role} message`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing your question...</span>
                </motion.div>
              )}
            </div>

            {/* Suggestions & Input Area */}
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 border-t border-white/10 bg-slate-900/70">
              <div className="flex gap-2 flex-wrap">
                {SUGGESTIONS.map((s) => (
                  <motion.button
                    key={s}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setInput(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors font-medium max-w-full"
                  >
                    {s}
                  </motion.button>
                ))}
              </div>

              {/* Input & Send */}
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                  aria-label="Chat message input"
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={send}
                  disabled={loading}
                  className="rounded-lg bg-blue-600 text-white px-3.5 py-2.5 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
