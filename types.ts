export type LayerKey = 'elevate' | 'execute' | 'evolve';

export interface Question {
  id: string;
  text: string;
  reverse?: boolean;
}

export interface Domain {
  key: string;
  layer: LayerKey;
  title: string;
  description: string;
  questions: Question[];
}

export interface Contact {
  fullName: string;
  role: string;
  company: string;
  email: string;
  mobile: string;
  country: string;
  industry: string;
  initiative: string;
  consent: boolean;
}

export interface SavedState {
  submissionId: string;
  contact: Contact;
  answers: Record<string, number>; // 1..5, or 0 for "not sure"
}

export interface DomainScore {
  key: string;
  title: string;
  layer: LayerKey;
  index: number | null; // 0..100
  answered: number;
  total: number;
}

export interface ItemScore {
  id: string;
  domain: string;
  text: string;
  raw: number;
  scored: number; // after reverse scoring, 1..5
}

export interface Results {
  overall: number;
  band: { name: string; summary: string };
  layers: Record<LayerKey, number | null>;
  domains: DomainScore[];
  weakest: DomainScore;
  strongest: DomainScore;
  pattern: { name: string; description: string };
  gaps: ItemScore[];
  strengths: ItemScore[];
}

// Optional narrative returned by Make when the Gemini step is enabled.
export interface AIInsights {
  headline?: string;
  what_it_means?: string;
  leadership_risk?: string;
  symptoms?: string[];
  priorities?: { title: string; why: string; first_step: string }[];
}
