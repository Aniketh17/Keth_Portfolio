export type RouteId = 'ai' | 'engineering' | 'build';

export interface ProjectLink {
  label: string;
  url: string;
}

export interface FlowStep {
  label: string;
  detail: string;
}

export interface Diagram {
  title: string;
  caption?: string;
  steps: FlowStep[];
}

/** A labelled comparison table, e.g. the Fit Check review states. */
export interface DefinitionRow {
  term: string;
  meaning: string;
}

export interface EvidenceExample {
  title: string;
  disclaimer: string;
  rows: { requirement: string; state: string; evidence: string; explanation: string }[];
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  /** Short title for cards, nav and Milo's labels. */
  shortTitle: string;
  eyebrow: string;
  category: string;
  headline: string;
  summary: string;
  /** The one-line "why look at this" shown on the preview card. */
  hook: string;
  problem?: string;
  whyItMatters?: string;
  role?: string;
  contribution?: string[];
  approach?: string[];
  decisions?: { title: string; body: string }[];
  features?: string[];
  tradeoffs?: string[];
  outcomes?: string[];
  achievements?: string[];
  limitations?: string[];
  diagrams?: Diagram[];
  definitions?: { title: string; rows: DefinitionRow[] };
  example?: EvidenceExample;
  principles?: string[];
  technologies: string[];
  /** Optional: a missing image never breaks the page; the card falls back to a typographic tile. */
  image?: { src: string; alt: string };
  repoUrl?: string;
  demoUrl?: string;
  links?: ProjectLink[];
  /** Short status chip such as "Hackathon prototype". */
  status?: string;
  /** Accent used for this project's own visual identity on its case study. */
  accent: string;
}

export interface RouteDefinition {
  id: RouteId;
  label: string;
  button: string;
  blurb: string;
  /** Project the route leads to first; must exist in the project list. */
  projectId: string;
  miloLine: string;
}

export interface TimelineItem {
  id: string;
  kind: 'work' | 'education' | 'achievement';
  title: string;
  org: string;
  period: string;
  points: string[];
}

export interface SkillGroup {
  id: string;
  title: string;
  blurb: string;
  items: { name: string; usedIn?: string }[];
}
