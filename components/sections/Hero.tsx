"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Sparkles, ShieldCheck, Bot, Download, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PORTFOLIO, PERSONAS } from '@/data/portfolio';

export function Hero() {
  const featuredPersonas = PERSONAS.slice(0, 3);

  return (
    <section id="home" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-white to-cyan-50/50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900" aria-hidden />
      <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" aria-hidden />
      <div className="absolute -left-10 bottom-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" aria-hidden />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-300/30 px-3 py-1 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span className="text-sm text-slate-100">Data Â· AI Â· Automation Engineer</span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] text-amber-100"
          >
            Building Intelligence with Data, Automation &amp; AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-base sm:text-lg text-slate-200 max-w-2xl"
          >
            {PORTFOLIO.subheadline}
          </motion.p>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
            <a href="#projects" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" icon={<ArrowRight className="h-4 w-4" />} className="w-full sm:w-auto">
                View Projects
              </Button>
            </a>
            <a href={PORTFOLIO.cv_url} download className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" icon={<Download className="h-4 w-4" />} className="w-full sm:w-auto">
                Download CV
              </Button>
            </a>
            <a href="#contact" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" icon={<Mail className="h-4 w-4" />} className="w-full sm:w-auto">
                Contact Me
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {[{ label: 'Dashboards shipped', value: '30+' }, { label: 'Prod ML models', value: '12' }, { label: 'Automations', value: '18' }, { label: 'Workshops', value: '40+' }].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
                <p className="text-2xl font-bold text-amber-200">{item.value}</p>
                <p className="text-sm text-slate-300">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-3xl bg-white/50 dark:bg-slate-900/50 blur-2xl" aria-hidden />
          <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-6 sm:pb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-blue-500">Profile</p>
                <p className="text-xl font-semibold">{PORTFOLIO.name}</p>
                <p className="text-sm text-slate-500">{PORTFOLIO.title}</p>
              </div>
              <Badge variant="primary">Available</Badge>
            </div>

            <div className="px-4 sm:px-6">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
                <Image
                  src="/images/hero.png"
                  alt="Portrait of Igraneza Dominique"
                  width={640}
                  height={760}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Dominique AI Assistant</p>
                    <p className="text-xs text-slate-500">Answers skills, projects, experience, CV, navigation.</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  "Ask me for dashboards, automation flows, or a recruiter-friendly summary."
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {featuredPersonas.map((persona) => (
                  <div key={persona.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-900/80">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-200">{persona.title}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{persona.description}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span>Enterprise-ready security, analytics rigor, and accessible UI.</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
