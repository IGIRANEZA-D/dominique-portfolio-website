import {
  Certificate,
  ExperienceItem,
  InsightPoint,
  Persona,
  PortfolioMeta,
  Project,
  SkillCategory,
} from '@/types/portfolio';

export const PORTFOLIO: PortfolioMeta = {
  name: 'Igraneza Dominique',
  title: 'Data Analyst • AI Automation Builder • ML Practitioner',
  email: 'dominique@example.com',
  phone: '+250 788 000 000',
  location: 'Kigali, Rwanda',
  bio: 'Applied Statistics graduate crafting intelligent systems that turn complex data into business strategy.',
  headline: 'Building Intelligence with Data, Automation & AI',
  subheadline:
    'Data Analyst, AI Automation Builder & ML Practitioner specializing in dashboards, predictive models, and digital intelligence.',
  cv_url: '/cv/dominique-cv.pdf',
  social: {
    linkedin: 'https://www.linkedin.com/in/dominique',
    github: 'https://github.com/dominique',
    twitter: 'https://twitter.com/dominique',
  },
};

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    label: 'Analytics & ML',
    items: [
      { name: 'Python', proficiency: 90 },
      { name: 'R', proficiency: 86 },
      { name: 'SQL', proficiency: 88 },
      { name: 'Statistics', proficiency: 92 },
      { name: 'Machine Learning', proficiency: 85 },
    ],
  },
  {
    label: 'Visualization & BI',
    items: [
      { name: 'Power BI', proficiency: 88 },
      { name: 'Tableau', proficiency: 84 },
      { name: 'R Shiny', proficiency: 80 },
      { name: 'Excel', proficiency: 90 },
    ],
  },
  {
    label: 'Automation & Systems',
    items: [
      { name: 'Data Pipelines', proficiency: 82 },
      { name: 'Dashboards', proficiency: 87 },
      { name: 'AI Automation', proficiency: 85 },
      { name: 'Process Optimization', proficiency: 80 },
    ],
  },
];

export const EXPERIENCE: ExperienceItem[] = [
  {
    id: 1,
    title: 'Business Analyst',
    company: 'Rama Consult',
    period: '2023 – Present',
    description:
      'Lead data-driven strategy initiatives, create executive dashboards, and automate reporting workflows.',
    highlights: [
      'Designed predictive models for sales forecasting',
      'Built 15+ interactive dashboards adopted by leadership',
      'Reduced monthly reporting time by 60% through automation',
    ],
  },
  {
    id: 2,
    title: 'Data Scientist & Facilitator',
    company: 'EduConnect Rwanda',
    period: '2022 – 2023',
    description: 'Built ML models for education outcomes and facilitated data literacy programs.',
    highlights: [
      'Created models that improved retention prediction accuracy by 25%',
      'Trained 100+ educators in applied analytics',
      'Rolled out data quality playbooks across teams',
    ],
  },
  {
    id: 3,
    title: 'Research Analyst',
    company: 'IPAR Rwanda',
    period: '2021 – 2022',
    description: 'Conducted statistical analysis for policy research and delivered data storytelling.',
    highlights: [
      'Authored 5 research papers on socio-economic policy',
      'Led advanced statistical testing and survey analytics',
      'Presented findings to government stakeholders',
    ],
  },
  {
    id: 4,
    title: 'Graphic Designer',
    company: 'TIC',
    period: '2020 – 2021',
    description: 'Crafted visual communications and data visualizations for client projects.',
    highlights: [
      'Created 50+ data-forward designs',
      'Improved brand consistency across campaigns',
      'Collaborated with cross-functional teams on digital assets',
    ],
  },
];

export const PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Sales Intelligence Dashboard',
    category: ['Dashboards', 'AI'],
    description:
      'Enterprise-grade analytics platform delivering real-time sales metrics, revenue forecasting, and deep performance insights. Features multi-segment analysis, regional benchmarking, and automated predictive alerts for anomalies.',
    image: '/images/projects/sales-dashboard-analysis.png',
    tech_stack: ['Power BI', 'SQL', 'Python', 'Machine Learning'],
    live_demo: 'https://example.com',
    github: 'https://github.com/dominique/sales-dashboard',
    case_study: '/case-studies/sales-dashboard',
  },
  {
    id: 2,
    title: 'Smart Export Analytics',
    category: ['Dashboards', 'AI'],
    description:
      'NISR export intelligence: ML forecasts, GIS visuals, and interactive dashboard surfacing performance risks and opportunities.',
    image: '/images/projects/smart-export.png',
    tech_stack: ['R Shiny', 'R', 'SQL', 'GIS'],
    live_demo: 'https://example.com',
    github: 'https://github.com/dominique/smart-export-analytics',
    case_study: '/case-studies/smart-export',
  },
  {
    id: 3,
    title: 'AI in Education',
    category: ['AI', 'Research', 'ML'],
    description:
      'Predictive student performance modeling, educational trend analysis, and interactive visualizations for stakeholders.',
    image: '/images/projects/r-programming.jpg',
    tech_stack: ['R', 'Python', 'Machine Learning', 'Tableau'],
    live_demo: 'https://example.com',
    github: 'https://github.com/dominique/ai-in-education',
    case_study: '/case-studies/ai-education',
  },
  {
    id: 4,
    title: 'Retail Analytics & KPI Dashboard',
    category: ['Dashboards', 'ML'],
    description:
      'Outlet-level performance tracking, inventory optimization, trend forecasting, and automated reporting for retail leadership.',
    image: '/images/projects/excel-dashboard-2.png',
    tech_stack: ['Excel Advanced', 'SQL', 'Power BI', 'R'],
    live_demo: 'https://example.com',
    github: 'https://github.com/dominique/retail-analytics',
    case_study: '/case-studies/retail-analytics',
  },
];

export const PERSONAS: Persona[] = [
  {
    id: 1,
    title: 'AI Automation Builder',
    description: 'Architect of autonomous AI systems using LangGraph, agents, and function calling.',
    image: '/images/personas/ai-automation-builder.png',
    details:
      'Creates production-grade AI agents that execute real business workflows—not just chat. Specializes in retrieval augmented generation, tool integration, and multi-agent orchestration.',
  },
  {
    id: 2,
    title: 'Sales Dashboard Analysis',
    description: 'Transforms raw sales data into executive-ready strategic intelligence.',
    image: '/images/personas/sales-dashboard-analysis.png',
    details:
      'Builds layered analytics that drive revenue decisions: forecasting, segment analysis, anomaly detection, and prescriptive insights. Real-time dashboards that enable action.',
  },
  {
    id: 3,
    title: 'LinkedIn AI',
    description: 'Shares applied AI/ML insights with a professional audience.',
    image: '/images/personas/linkedin-ai.png',
    details:
      'Publishes quick, digestible takes on production-ready AI, deployment pitfalls, and wins from real-world projects.',
  },
  {
    id: 4,
    title: 'ML & Statistics Influencer',
    description: 'Demystifies machine learning and statistical thinking for practitioners.',
    image: '/images/personas/ml-statistics-influencer.png',
    details:
      'Creates pragmatic content on probabilistic thinking, causal inference, statistical testing, and avoiding common ML pitfalls. Focus on actionable knowledge over theory.',
  },
  {
    id: 5,
    title: 'LinkedIn Content Creator',
    description: 'Produces tutorials and thought leadership on data, AI, and automation.',
    image: '/images/personas/linkedin-content-creator.jpg',
    details:
      'Develops comprehensive guides on dashboard design, automation frameworks, and building intelligent systems. Case studies from real-world implementations and lessons learned.',
  },
];

export const CERTIFICATES: Certificate[] = [
  { id: 1, name: 'Google Advanced Data Analytics Certificate', year: 2023, icon: '??' },
  { id: 2, name: 'IBM Machine Learning Professional', year: 2023, icon: '??' },
  { id: 3, name: 'Microsoft Power BI Data Analyst', year: 2022, icon: '??' },
  { id: 4, name: 'Tableau Desktop Specialist', year: 2022, icon: '??' },
  { id: 5, name: 'AWS Cloud Practitioner', year: 2023, icon: '??' },
  { id: 6, name: 'Applied Statistics Degree', year: 2020, icon: '??' },
];

export const INSIGHTS: InsightPoint[] = [
  { label: 'Q1', value: 78 },
  { label: 'Q2', value: 91 },
  { label: 'Q3', value: 96 },
  { label: 'Q4', value: 102 },
];

export const PIPELINE: InsightPoint[] = [
  { label: 'Prospects', value: 240 },
  { label: 'SQL', value: 180 },
  { label: 'Opportunities', value: 120 },
  { label: 'Won', value: 68 },
];
