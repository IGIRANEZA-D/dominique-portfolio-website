"use client";

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { PORTFOLIO } from '@/data/portfolio';
import { Container } from '@/components/ui/Section';

const highlights = [
  {
    title: 'Applied statistics core',
    detail: 'Causal inference, hypothesis testing, forecasting, experimental design.',
  },
  {
    title: 'Automation-first',
    detail: 'Data pipelines, AI agents, workflow orchestration, and alerting at scale.',
  },
  {
    title: 'Human-centered dashboards',
    detail: 'Story-first BI with narrative cues, progressive disclosure, and exec-ready KPIs.',
  },
];

export function About() {
  return (
    <section id="about" className="section-padding">
      <Container>
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
          <div className="space-y-4">
            <Badge variant="secondary">About Dominique</Badge>
            <h2 className="section-title">Strategy, statistics, and systems that stay shipped</h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              {PORTFOLIO.bio}
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              I partner with product, RevOps, and research teams to translate ambiguous questions into measurable outcomesâ€”
              from prototyping to production, with governance built in.
            </p>
          </div>

          <div className="grid gap-4">
            {highlights.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 shadow-sm"
              >
                <p className="text-sm uppercase tracking-[0.2em] text-blue-500">{item.title}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
