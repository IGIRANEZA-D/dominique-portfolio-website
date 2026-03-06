import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Insights } from '@/components/sections/Insights';
import { ChatbotWidget } from '@/components/sections/ChatbotWidget';

export default function HomePage() {
  return (
    <div className="bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 min-h-screen">
      <Hero />
      <About />
      <Insights />
      <ChatbotWidget />
    </div>
  );
}

