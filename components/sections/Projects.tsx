"use client";

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, Sparkles } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PROJECTS } from '@/data/portfolio';

const FILTERS = ['All', 'AI', 'Dashboards', 'ML', 'Research'];

export function Projects() {
  const [filter, setFilter] = useState<string>('All');

  const filtered = useMemo(() => (filter === 'All' ? PROJECTS : PROJECTS.filter((p) => p.category.includes(filter))), [filter]);

  return (
    <Section id="projects" title="Featured projects" subtitle="Real dashboards and AI solutions built to drive business impact.">
      <div className="flex flex-wrap gap-2 mb-8 pb-2">
        {FILTERS.map((item) => (
          <motion.button
            key={item}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(item)}
            className={`px-4 py-2.5 rounded-full border text-sm font-semibold transition-all ${
              filter === item
                ? 'bg-amber-500 text-slate-900 border-amber-400 shadow-lg shadow-amber-400/30'
                : 'border-slate-600 text-slate-200 hover:border-amber-400 hover:bg-slate-800'
            }`}
          >
            {item}
          </motion.button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <AnimatePresence>
          {filtered.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-0 overflow-hidden flex flex-col h-full hover:shadow-2xl transition-shadow duration-300">
                  {/* Image Container with Overlay */}
                  <div className="relative h-64 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <motion.img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.5 }}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* Category Badges */}
                    <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                      {project.category.map((cat) => (
                        <motion.div
                          key={cat}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <Badge variant="primary" size="sm" className="backdrop-blur-sm bg-blue-600/90">
                            {cat}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>

                    {/* Floating Icon */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-4 right-4 text-blue-300"
                    >
                      <Sparkles className="h-6 w-6" />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{project.title}</h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 leading-relaxed">{project.description}</p>
                    </div>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2">
                      {project.tech_stack.map((tech) => (
                        <motion.div
                          key={tech}
                          whileHover={{ scale: 1.1 }}
                        >
                          <Badge variant="secondary" size="sm" className="backdrop-blur-sm">
                            {tech}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="mt-auto flex gap-3 pt-4 flex-wrap">
                      {project.live_demo && (
                        <motion.a
                          href={project.live_demo}
                          target="_blank"
                          rel="noreferrer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" /> Live Demo
                        </motion.a>
                      )}
                      {project.github && (
                        <motion.a
                          href={project.github}
                          target="_blank"
                          rel="noreferrer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          <Github className="h-4 w-4" /> Code
                        </motion.a>
                      )}
                      {project.case_study && (
                        <motion.a
                          href={project.case_study}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          Case Study →
                        </motion.a>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Section>
  );
}
