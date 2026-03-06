"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { PERSONAS } from '@/data/portfolio';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';

export function Personas() {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <Section
      id="personas"
      title="Digital Roles"
      subtitle="Five complementary personas—AI builder, dashboard analyst, LinkedIn voices, ML/Stats, and content creator."
    >
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
        {PERSONAS.map((persona, idx) => {
          const isOpen = openId === persona.id;
          return (
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <motion.button
                onClick={() => setOpenId(isOpen ? null : persona.id)}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.2 }}
                className="w-full text-left group"
              >
                <Card className="p-0 overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-300">
                  {/* Image Section */}
                  <div className="relative h-32 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                    <motion.img
                      src={persona.image}
                      alt={persona.title}
                      loading="lazy"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Badge */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-2 right-2 bg-blue-600/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-semibold"
                    >
                      Role {persona.id}
                    </motion.div>
                  </div>

                  {/* Content Section */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {persona.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {persona.description}
                      </p>
                    </div>

                    {/* Expandable Details */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700"
                        >
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {persona.details}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Toggle Button */}
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 flex justify-center"
                    >
                      <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    </motion.div>
                  </div>
                </Card>
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

