"use client";

import { Section } from '@/components/ui/Section';
import { INSIGHTS, PIPELINE } from '@/data/portfolio';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';

export function Insights() {
  return (
    <Section id="insights" title="Data stories" subtitle="Dashboard-grade visuals backed by Recharts." className="bg-slate-50 dark:bg-slate-900/60">
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">AI Automation Builder</p>
              <h3 className="text-lg font-semibold">Forecast accuracy</h3>
            </div>
            <Badge variant="primary" size="sm">AI AUTOMATION BUILDER</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={INSIGHTS} margin={{ top: 10, right: 10, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.3} />
                <XAxis dataKey="label" stroke="currentColor" opacity={0.5} tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" opacity={0.5} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}
                  labelStyle={{ color: '#e2e8f0' }}
                  itemStyle={{ color: '#cbd5e1' }}
                />
                <Line type="monotone" dataKey="value" stroke="#0284c7" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Sales Dashboard Analysis</p>
              <h3 className="text-lg font-semibold">Pipeline health</h3>
            </div>
            <Badge variant="secondary" size="sm">SALES DASHBOARD ANALYSIS</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PIPELINE} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.3} />
                <XAxis type="number" stroke="currentColor" opacity={0.5} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="label" stroke="currentColor" opacity={0.6} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}
                  labelStyle={{ color: '#e2e8f0' }}
                  itemStyle={{ color: '#cbd5e1' }}
                />
                <Bar dataKey="value" radius={[10, 10, 10, 10]} fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
