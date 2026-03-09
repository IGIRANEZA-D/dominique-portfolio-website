"use client";

import { motion } from 'framer-motion';
import { Section } from '@/components/ui/Section';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SKILL_CATEGORIES } from '@/data/portfolio';

export function Skills() {
  return (
    <Section
      id="skills"
      title="Capability map"
      subtitle="Analytics, ML, BI, and automation with production discipline."
      className="bg-slate-50/70 dark:bg-slate-900/40"
    >
      <div className="grid md:grid-cols-3 gap-6">
        {SKILL_CATEGORIES.map((category) => (
          <motion.div
            key={category.label}
            className="p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{category.label}</h3>
              <span className="text-[11px] uppercase tracking-[0.2em] text-blue-500">Depth</span>
            </div>
            <div className="space-y-4">
              {category.items.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{skill.name}</span>
                    <span className="text-slate-500">{skill.proficiency}%</span>
                  </div>
                  <ProgressBar value={skill.proficiency} showLabel={false} animated />
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
