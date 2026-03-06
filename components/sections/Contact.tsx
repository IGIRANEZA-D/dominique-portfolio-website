"use client";

import { useState } from 'react';
import { Mail, Phone, Linkedin } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { PORTFOLIO } from '@/data/portfolio';
import { Button } from '@/components/ui/Button';

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'error' | 'sent'>('idle');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setStatus('error');
      return;
    }
    // Placeholder: integrate with API / email provider
    setStatus('sent');
  };

  return (
    <Section id="contact" title="Contact" subtitle="Reach out for collaborations, freelance, or speaking.">
      <div className="grid md:grid-cols-[1fr_1.1fr] gap-8 items-start">
        <div className="space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Direct lines</h3>
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
            <Mail className="h-5 w-5 text-blue-500" />
            <a href={`mailto:${PORTFOLIO.email}`} className="hover:underline">{PORTFOLIO.email}</a>
          </div>
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
            <Phone className="h-5 w-5 text-blue-500" />
            <a href="tel:+250788000000" className="hover:underline">{PORTFOLIO.phone}</a>
          </div>
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
            <Linkedin className="h-5 w-5 text-blue-500" />
            <a href={PORTFOLIO.social.linkedin} target="_blank" rel="noreferrer" className="hover:underline">
              LinkedIn Profile
            </a>
          </div>
        </div>

        <form
          className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm space-y-4"
          onSubmit={handleSubmit}
          aria-label="Contact form"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
              <input
                id="name"
                name="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-invalid={status === 'error' && !form.name}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-invalid={status === 'error' && !form.email}
              />
            </div>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-invalid={status === 'error' && !form.message}
            />
          </div>
          {status === 'error' && <p className="text-sm text-red-500">Please fill in all fields.</p>}
          {status === 'sent' && <p className="text-sm text-green-600">Message ready. Hook this form to your email/CRM.</p>}
          <Button variant="primary" size="md" type="submit">Send message</Button>
        </form>
      </div>
    </Section>
  );
}
