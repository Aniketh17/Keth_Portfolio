import type { SkillGroup, TimelineItem } from './types';

const base = import.meta.env.BASE_URL;

export const profile = {
  name: 'Aniketh',
  fullName: 'Aniketh Rao',
  email: 'aniketh123ani@gmail.com',
  location: 'Auckland, New Zealand',
  resumeUrl: `${base}Aniketh_NZ_Resume.pdf`,
  siteUrl: 'https://keth-portfolio.netlify.app/',
  links: [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/anikethk/' },
    { label: 'GitHub', url: 'https://github.com/Aniketh17' },
    { label: 'ITO Master (live site)', url: 'https://www.itomaster.com' },
  ],
};

export const skillGroups: SkillGroup[] = [
  {
    id: 'backend',
    title: 'Software engineering and backend',
    blurb: 'APIs, services and the databases behind them.',
    items: [
      { name: 'Java and Spring Boot', usedIn: 'Eruna workforce APIs, ITO Master, library management system' },
      { name: 'Python and FastAPI', usedIn: 'IMAC Advisor backend' },
      { name: 'PostgreSQL', usedIn: 'Schema tuning at Eruna, IMAC session storage' },
      { name: 'REST APIs and microservices', usedIn: 'Monolith-to-microservice refactor at Eruna' },
      { name: 'Role-based access control', usedIn: 'Library management system' },
    ],
  },
  {
    id: 'ai',
    title: 'Applied AI and machine learning',
    blurb: 'Retrieval, grounding and keeping people in the loop.',
    items: [
      { name: 'Retrieval-augmented generation', usedIn: 'IMAC Advisor' },
      { name: 'Bi-encoder and cross-encoder retrieval', usedIn: 'IMAC two-stage pipeline' },
      { name: 'Azure OpenAI', usedIn: 'IMAC answer synthesis' },
      { name: 'Confidence scoring and review paths', usedIn: 'IMAC Advisor, transaction coding' },
      { name: 'Evidence-based LLM design', usedIn: 'Fit Check' },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend and product',
    blurb: 'Interfaces people can actually use.',
    items: [
      { name: 'React and TypeScript', usedIn: 'This portfolio, ITO Master' },
      { name: 'Vite and Tailwind CSS', usedIn: 'This portfolio' },
      { name: 'Framer Motion', usedIn: 'Tiny Paws' },
      { name: 'Three.js and React Three Fiber', usedIn: 'This portfolio: Milo and the staircase' },
      { name: 'Responsive layouts', usedIn: 'Tiny Paws, this portfolio' },
    ],
  },
  {
    id: 'tools',
    title: 'Tools and delivery',
    blurb: 'Shipping it and keeping it running.',
    items: [
      { name: 'Git and GitHub', usedIn: 'All projects' },
      { name: 'GitHub Actions', usedIn: 'This portfolio deploy workflow' },
      { name: 'Netlify', usedIn: 'Portfolio and Tiny Paws hosting' },
      { name: 'SQL', usedIn: 'Schema design and query tuning' },
    ],
  },
];

export const timeline: TimelineItem[] = [
  {
    id: 'uoa',
    kind: 'education',
    title: 'Master of Artificial Intelligence',
    org: 'University of Auckland, New Zealand',
    period: 'Mar 2026 – present',
    points: [],
  },
  {
    id: 'code-muster',
    kind: 'achievement',
    title: 'Winner, WDCC × Figured "The Code Muster"',
    org: 'Hackathon',
    period: '2026',
    points: [
      'Team awarded Best Solution (first place).',
      'Individually awarded "Claude Whisperer" for the best use of AI to understand the problem and engineer the solution.',
    ],
  },
  {
    id: 'ito',
    kind: 'work',
    title: 'Freelance backend developer',
    org: 'Ito Master',
    period: 'Jun 2025 – Nov 2025',
    points: [
      'Built a commercial e-commerce application with Spring Boot, React and PostgreSQL: authentication, catalogue pipelines and payment integrations.',
      'Optimised the platform to keep transaction load times under two seconds across the store inventory.',
    ],
  },
  {
    id: 'eruna',
    kind: 'work',
    title: 'Junior software developer',
    org: 'Eruna Technologies, Bangalore',
    period: 'Sep 2024 – Feb 2025',
    points: [
      'Built Spring Boot REST APIs for a live workforce-management product, cutting manual processing time by 20%.',
      'Refactored monolithic services into microservices for independent deployment and scaling.',
      'Optimised PostgreSQL schemas and queries.',
    ],
  },
  {
    id: 'beyonders',
    kind: 'achievement',
    title: 'Winner, Beyonders Hackathon',
    org: 'Hackathon',
    period: '2024',
    points: ['Built a real-time collaborative platform in 24 hours; first of 65+ teams.'],
  },
  {
    id: 'cicada',
    kind: 'achievement',
    title: 'Runner-up, Cicada Hackathon',
    org: 'Hackathon',
    period: '2024',
    points: ['Led backend architecture for a four-person team; second of 20+ teams.'],
  },
  {
    id: 'atria',
    kind: 'education',
    title: 'B.E. Computer Science & Engineering',
    org: 'Atria Institute of Technology, Bangalore',
    period: '2021 – 2025',
    points: ['CGPA 8.17 / 10.0.'],
  },
];

export const experience = timeline.filter((t) => t.kind === 'work');
export const education = timeline.filter((t) => t.kind === 'education');
export const achievements = timeline.filter((t) => t.kind === 'achievement');
