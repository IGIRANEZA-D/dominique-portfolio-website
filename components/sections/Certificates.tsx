"use client";

import { Award } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { CERTIFICATES } from '@/data/portfolio';
import { motion } from 'framer-motion';

export function Certificates() {
  return (
    <Section id="certificates" title="Certificates" subtitle="Signals of rigor across analytics, cloud, and ML.">
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {CERTIFICATES.map((cert) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25 }}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-3"
          >
            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-300 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{cert.name}</p>
              <p className="text-xs text-slate-500">{cert.year}</p>
            </div>
            <span className="ml-auto text-lg" aria-hidden>
              {cert.icon || '•'}
            </span>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
