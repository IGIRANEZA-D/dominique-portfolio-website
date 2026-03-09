"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ChevronDown } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { EXPERIENCE } from '@/data/portfolio';

export function Experience() {
  const [expanded, setExpanded] = useState<number | null>(EXPERIENCE[0]?.id ?? null);

  return (
    <Section id="experience" title="Experience timeline" subtitle="Roles that combine analytics, facilitation, and automation delivery.">
      <div className="relative">
        <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-200 via-blue-300 to-cyan-300 dark:from-slate-700 dark:via-slate-700 dark:to-slate-700" aria-hidden />
        <div className="space-y-4">
          {EXPERIENCE.map((role, idx) => {
            const isOpen = expanded === role.id;
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.04 }}
                className="relative pl-12 md:pl-16"
              >
                <div className="absolute left-0 md:left-1.5 top-3 h-9 w-9 rounded-full bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                </div>
                <Card className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">{role.period}</p>
                      <h3 className="text-xl font-semibold">{role.title}</h3>
                      <p className="text-slate-600 dark:text-slate-300">{role.company}</p>
                    </div>
                    <button
                      className="rounded-full border border-slate-200 dark:border-slate-700 p-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                      aria-label="Toggle details"
                      onClick={() => setExpanded(isOpen ? null : role.id)}
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-3">{role.description}</p>
                  {isOpen && (
                    <ul className="mt-4 grid sm:grid-cols-3 gap-3 text-sm text-slate-700 dark:text-slate-200">
                      {role.highlights.map((item) => (
                        <li key={item} className="rounded-lg bg-slate-50 dark:bg-slate-800/70 px-3 py-2 border border-slate-200 dark:border-slate-800">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
