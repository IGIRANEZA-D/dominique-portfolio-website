export type SocialLinks = {
  linkedin: string;
  github: string;
  twitter?: string;
};

export type PortfolioMeta = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  headline: string;
  subheadline: string;
  cv_url: string;
  social: SocialLinks;
};

export type SkillCategory = {
  label: string;
  items: { name: string; proficiency: number }[];
};

export type ExperienceItem = {
  id: number;
  title: string;
  company: string;
  period: string;
  description: string;
  highlights: string[];
};

export type Project = {
  id: number;
  title: string;
  category: string[];
  description: string;
  image: string;
  tech_stack: string[];
  live_demo?: string;
  github?: string;
  case_study?: string;
};

export type Persona = {
  id: number;
  title: string;
  description: string;
  image: string;
  details: string;
};

export type Certificate = {
  id: number;
  name: string;
  year: number;
  icon?: string;
};

export type InsightPoint = {
  label: string;
  value: number;
};
