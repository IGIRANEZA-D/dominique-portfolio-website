import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import Layout from '@/components/Layout';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Igraneza Dominique | Data, AI & Automation Engineer',
  description:
    'Portfolio of Igraneza Dominique - Data Analyst, AI Automation Builder, and ML Practitioner specializing in dashboards, predictive models, and intelligent automation.',
  metadataBase: new URL('https://dominique.ai'),
  openGraph: {
    title: 'Igraneza Dominique | Data, AI & Automation Engineer',
    description:
      'Minimal, premium-grade portfolio for data analytics, AI automation, dashboards, and ML projects.',
    url: 'https://dominique.ai',
    siteName: 'Dominique Portfolio',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@dominique',
    title: 'Igraneza Dominique | Data, AI & Automation Engineer',
    description: 'Dashboards, AI automation, and ML delivery for modern teams.',
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable} bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100`}>
        <ThemeProvider>
          <Layout>{children}</Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}

