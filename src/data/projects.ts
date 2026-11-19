import type { Project } from './types';

/**
 * Single source of truth for project content. Every field except the identity
 * fields is optional: the case-study page renders only what exists, so a gap
 * stays a gap instead of becoming filler. To add a project, append an object
 * here; nothing in the 3D scene needs to change.
 */
export const projects: Project[] = [
  {
    id: 'gru',
    slug: 'gru-job-search-assistant',
    title: 'GRU: Private AI Job-Search Assistant',
    shortTitle: 'GRU',
    eyebrow: 'AI / LLM · FULL-STACK · BACKEND',
    category: 'AI / LLM',
    headline: 'A job search that keeps itself up to date.',
    summary:
      'GRU is a personal job-search assistant I designed, built and deployed. It connects to Gmail with read-only OAuth, reads only job-related mail, and keeps my applications up to date: rejections, offers, interview invites (with meeting links and calendar events), assessments, and vacancies from job-alert emails. It runs on a phone as an installable web app and costs $0 to operate.',
    hook: "A private assistant that reads my job emails, tracks every application's status automatically, finds good-match roles, and talks to me with a natural voice.",
    role: 'Designed, built and deployed by me, Nov 2026 to present.',
    decisions: [
      {
        title: 'The model must quote its proof',
        body: 'Deterministic phrase rules run first, then an LLM gives a second opinion that must quote the sentence that proves its answer. The quote is verified against the email, so hallucinated or prompt-injected answers are discarded. Every automatic change shows up with a 24-hour undo.',
      },
      {
        title: 'The assistant suggests; I confirm',
        body: 'The chat answers only from a read-only snapshot of my data, treats email text as untrusted, and can only suggest steps. Every change needs my confirmation tap. Voice in and out uses Whisper and neural text-to-speech, with an on-device fallback.',
      },
      {
        title: 'Privacy by design',
        body: 'Email bodies are processed in memory and never stored. Free text is AES-256-GCM encrypted, search uses an HMAC blind index, logs are allow-listed, and a wipe/lock kill switch exists.',
      },
      {
        title: 'Engineering under tight limits',
        body: 'Built to the Cloudflare free tier: 10 ms of CPU per run, a per-run call budget and a daily AI quota. It includes a shared AI budget ledger, crash-loop-proof batch processing and rate-limit back-off.',
      },
    ],
    features: [
      'Reads only job-related Gmail messages, with read-only OAuth 2.0',
      "Keeps each application's status current: applied, assessment, interview, offer, rejected",
      'Interview invites with meeting links and calendar events',
      'Vacancies pulled from job-alert emails',
      'Resume matching: scores each vacancy out of 100 with evidence and gaps, and builds an "Apply today" list',
      'Voice assistant and LLM chat, with a confirmation tap for every change',
      'Installable on a phone as a PWA, running at $0',
    ],
    outcomes: ['300+ automated unit, integration and end-to-end tests, including regression tests for real bugs found in production.'],
    learned: [
      "Decoding Gmail's padded base64 message bodies.",
      'Making LLM output safe to act on.',
      'Keeping everything inside free-tier limits.',
    ],
    limitations: [
      'GRU is private and login-gated, so there is no live demo. The screenshots are from the running app on a phone, with names redacted.',
      'A match score is a decision aid. I always apply myself.',
    ],
    technologies: [
      'TypeScript',
      'React',
      'Cloudflare Workers',
      'D1 (SQLite)',
      'Workers AI (Gemma, Whisper, Aura TTS)',
      'Gmail API (OAuth 2.0)',
      'Hono',
      'Vite',
      'PWA',
      'Vitest',
      'Playwright',
    ],
    image: {
      src: 'gru/poster.webp',
      alt: 'Three phone screens from GRU: the Today brief, the scored Apply today list, and the Talk to GRU chat. Names are redacted.',
      width: 1280,
      height: 800,
    },
    status: 'Private · deployed',
    accent: '#2F7D6B',
  },
  {
    id: 'imac-advisor',
    slug: 'imac-immunisation-advisor',
    title: 'IMAC Immunisation Advisor',
    shortTitle: 'RAG advisor',
    eyebrow: 'APPLIED AI · RETRIEVAL-AUGMENTED GENERATION',
    category: 'Applied AI',
    headline: 'Useful answers need more than a convincing response.',
    summary:
      'A retrieval-augmented advisor that answers immunisation questions for New Zealand healthcare professionals from official IMAC guidance, with citations, a confidence indicator, and a refusal when the sources do not cover the question.',
    hook: 'Retrieval, reranking and a "no clear answer" path, so the model stays tied to its sources.',
    problem:
      'Clinicians who need an immunisation answer have to search dense handbooks. A general chatbot is fast but will happily answer from memory, which is the wrong failure mode in a clinical setting.',
    whyItMatters:
      'In health information, an answer without a traceable source is a liability. The design goal was an assistant that shows where an answer came from and says so when it cannot find one.',
    role: 'Independent developer, May to June 2026, for the COMPSCI 714 hackathon.',
    contribution: [
      'Built the RAG agent over the NZ Immunisation Handbook, the national vaccination website and other official NZ health resources.',
      'Implemented the two-stage Bi-Encoder and Cross-Encoder retrieval pipeline with confidence scoring.',
      'Implemented PII redaction so personal details are masked before a query reaches the pipeline.',
    ],
    approach: [
      'Guideline documents are parsed and chunked into logical sections.',
      'Each chunk is embedded with all-MiniLM-L6-v2 and stored in a NumPy-backed vector store.',
      'A query is redacted, classified, then matched by cosine similarity to the top 15 candidates.',
      'A cross-encoder (ms-marco-MiniLM-L-6-v2) scores query and chunk together and keeps the top 3.',
      'Azure OpenAI (gpt-5-mini) writes the answer under a clinically guarded prompt, with citations.',
    ],
    decisions: [
      {
        title: 'Two stages instead of one',
        body: 'The bi-encoder is fast but approximate; the cross-encoder is precise but slow. Using the fast model to narrow the field to 15 means the slow one only scores 15 pairs instead of the whole corpus.',
      },
      {
        title: 'Refuse rather than guess',
        body: 'If reranking confidence falls below a threshold, the system returns "the provided sources do not contain sufficient information" instead of generating something plausible.',
      },
      {
        title: 'Redact before retrieval',
        body: 'Queries pass through a regex-based PII engine tuned for the NZ context (NHI numbers, phone numbers, emails, dates of birth, names, addresses) before anything else runs. Age and gender are kept because they matter clinically.',
      },
      {
        title: 'Sessions in PostgreSQL',
        body: 'FastAPI with SQLAlchemy stores chat sessions, so past conversations can be reloaded and deleted, with the deletion cascading to their messages.',
      },
    ],
    features: [
      'Source citations with excerpts from the guidelines',
      'Confidence indicator derived from reranker scores',
      'Query classification by vaccine type, clinical scenario and caller type',
      'Streaming responses over server-sent events, plus background-generated follow-up questions',
      'Persistent chat history with session reload and deletion',
    ],
    diagrams: [
      {
        title: 'From question to cited answer',
        basis: 'documented',
        caption: 'The query path in the IMAC Advisor, as documented in the project README.',
        steps: [
          { label: 'Redact', detail: 'PII masked: NHI, phone, email, DOB, names, addresses.' },
          { label: 'Classify', detail: 'Vaccine type, clinical scenario and caller type.' },
          { label: 'Recall', detail: 'Bi-encoder cosine similarity returns the top 15 chunks.' },
          { label: 'Rerank', detail: 'Cross-encoder scores query and chunk jointly; top 3 kept.' },
          { label: 'Gate', detail: 'Below the confidence threshold the system declines to answer.' },
          { label: 'Answer', detail: 'gpt-5-mini writes a cited answer from the retrieved text only.' },
        ],
      },
    ],
    limitations: [
      'Advisory use only. Answers should always be checked against the official IMAC guidelines.',
      'The confidence indicator reflects how well the retrieved sources matched the question. It does not prove the answer is correct.',
      'Grounding reduces unsupported answers; it does not eliminate them.',
      'No evaluation benchmark is published here.',
    ],
    technologies: [
      'Python',
      'FastAPI',
      'PostgreSQL',
      'SQLAlchemy',
      'NumPy',
      'all-MiniLM-L6-v2',
      'ms-marco cross-encoder',
      'Azure OpenAI',
      'React',
      'Vite',
    ],
    image: {
      src: 'assets/imac_main.webp',
      alt: 'The IMAC Immunisation Advisor: a query, a clinical summary with a confidence badge, and source grounding cards',
      width: 1318,
      height: 805,
    },
    links: [{ label: 'Project documentation', url: 'https://nishhh-03.github.io/COMPSCI-714_Hackathon/' }],
    status: 'Hackathon project',
    accent: '#7568FF',
  },
  {
    id: 'transaction-coding',
    slug: 'transaction-coding',
    title: 'Transaction Coding Assistant',
    shortTitle: 'Transaction coding',
    eyebrow: 'AI-ASSISTED AUTOMATION · HUMAN REVIEW',
    category: 'Applied AI',
    headline: 'Make routine transaction coding easier to review.',
    summary:
      'An AI-assisted transaction-coding system that uses historical transaction patterns to suggest categories for new transactions, with a review path for uncertain cases.',
    hook: 'Suggestions with a confidence signal, and a human decision for anything the system is unsure about.',
    problem:
      'Coding bank transactions into categories is repetitive, and most transactions look like ones that were coded before. The work is in the exceptions.',
    whyItMatters:
      'Automation that hides its uncertainty creates errors that are hard to spot. The useful version speeds up the obvious cases and puts the unclear ones in front of a person.',
    role: 'Built at the WDCC × Figured "The Code Muster" hackathon, 2026.',
    approach: [
      'Learn from historical transaction patterns to propose a category for each new transaction.',
      'Show how confident the suggestion is.',
      'Route uncertain predictions to a review step where a person confirms or corrects them.',
      'Treat transactions that do not fit an existing category as something to review, not force into one.',
    ],
    decisions: [
      {
        title: 'Suggest, then review',
        body: 'The system proposes and a person decides. Confidence decides how much attention a suggestion gets; it is not treated as a guarantee of correctness.',
      },
      {
        title: 'No forced fit',
        body: 'A transaction that matches no known pattern is flagged for review rather than assigned to the nearest category.',
      },
    ],
    diagrams: [
      {
        title: 'The review workflow',
        basis: 'conceptual',
        caption: 'How suggestions and human review fit together.',
        steps: [
          { label: 'Transaction arrives', detail: 'A new bank transaction needs a category.' },
          { label: 'Pattern match', detail: 'Compared with historically coded transactions.' },
          { label: 'Suggest', detail: 'A category is proposed with a confidence indicator.' },
          { label: 'Review', detail: 'Uncertain or unfamiliar cases wait for a person to confirm or correct.' },
        ],
      },
    ],
    achievements: [
      'The team won first place ("Best Solution") at WDCC × Figured "The Code Muster", 2026.',
      'Individually awarded the "Claude Whisperer" award for the best use of AI to understand the problem and engineer the solution.',
    ],
    technologies: [],
    status: 'Hackathon prototype',
    accent: '#D9F477',
  },
  {
    id: 'fit-check',
    slug: 'fit-check',
    title: 'Fit Check — Evidence-Based Application Review',
    shortTitle: 'Fit Check',
    eyebrow: 'ZEIL HACKATHON · APPLIED AI',
    category: 'Applied AI',
    headline: 'Make the next application a more informed decision.',
    summary:
      "A job-application review feature that connects job requirements to evidence in a person's profile, surfaces transferable experience, and asks about gaps instead of guessing.",
    hook: 'Requirement, evidence, explanation. Uncertain claims become questions, never assertions.',
    problem:
      'Reading a job listing, people ask "should I apply?" They overlook relevant experience because an old role used different words, or assume they lack a skill without noticing adjacent experience.',
    whyItMatters:
      'A match percentage hides the reasoning. Showing the evidence behind each requirement lets the applicant decide, and keeps the application honest.',
    role: 'Built independently at a ZEIL hackathon: an individual entry, with no team.',
    approach: [
      'Analyse the job listing and split compound requirements into individual claims.',
      "Retrieve relevant evidence from the applicant's profile for each claim.",
      'Classify each requirement as direct, related, needs confirmation, or not found, and explain why.',
      'Let the applicant use, edit or leave out each claim.',
      'Ask a specific question where evidence needs confirmation.',
      'Compose an application summary using only claims the applicant selected or confirmed.',
    ],
    decisions: [
      {
        title: 'Evidence over scores',
        body: 'There is no match percentage. Each requirement is shown next to the evidence found and an explanation of how they relate.',
      },
      {
        title: 'Retrieved is not confirmed',
        body: 'Facts retrieved from a profile are kept separate from facts the user explicitly confirmed. Only the second kind can be asserted in the summary.',
      },
      {
        title: "Ask, don't guess",
        body: 'Where evidence only hints at a capability, the feature asks a specific clarification question instead of filling the gap.',
      },
      {
        title: 'Unsupported claims stay out',
        body: 'The summary is composed only from selected or confirmed claims. Missing evidence is never turned into claimed experience, and adjacent experience is never described as proof of a different skill.',
      },
    ],
    diagrams: [
      {
        title: 'Requirement to application summary',
        basis: 'conceptual',
        steps: [
          { label: 'Analyse', detail: 'Read the job listing.' },
          { label: 'Split', detail: 'Break compound requirements into single claims.' },
          { label: 'Retrieve', detail: 'Find profile evidence for each claim.' },
          { label: 'Classify', detail: 'Direct, related, needs confirmation, or not found.' },
          { label: 'Explain', detail: 'Show how the evidence relates to the requirement.' },
          { label: 'Decide', detail: 'Applicant uses, edits or leaves out each claim; answers questions.' },
          { label: 'Compose', detail: 'Summary uses only selected or confirmed claims.' },
        ],
      },
    ],
    definitions: {
      title: 'The four review states',
      rows: [
        { term: 'Direct', meaning: "The available evidence states the requirement's core claim." },
        {
          term: 'Related',
          meaning: 'The evidence shows an adjacent activity that supports, but does not establish, the specific requirement.',
        },
        {
          term: 'Needs confirmation',
          meaning: 'The profile hints at the capability or covers only part of the requirement.',
        },
        { term: 'Not found', meaning: 'There is no relevant evidence in the available profile.' },
      ],
    },
    example: {
      title: 'A review, step by step',
      disclaimer:
        'Interface recreated from the project description, on a fictional profile and employer. It is not a screenshot of the product.',
      rows: [
        {
          requirement: 'Built and maintained REST APIs',
          state: 'Direct',
          evidence: '"Designed and shipped REST endpoints for the booking service" (Northwind Logistics, 2023)',
          explanation: 'The profile states the same activity the requirement asks for.',
        },
        {
          requirement: 'Experience with event-driven systems',
          state: 'Related',
          evidence: '"Wrote nightly jobs that consumed order updates from a queue"',
          explanation: 'Working with queues is adjacent to event-driven design but does not establish it.',
        },
        {
          requirement: 'Worked with PostgreSQL in production',
          state: 'Needs confirmation',
          evidence: '"Wrote SQL for the reporting dashboards"',
          explanation: 'This shows SQL work, but not which database engine was used or whether it was in production.',
          question: 'Which database engine did those dashboards run on?',
        },
        {
          requirement: 'Experience deploying to AWS',
          state: 'Not found',
          evidence: 'None in the profile',
          explanation: 'Left out of the summary unless the applicant confirms relevant experience.',
        },
      ],
    },
    principles: [
      'Never invent evidence.',
      'Never turn missing evidence into claimed experience.',
      "Never present a model's interpretation as verification that a claim is true.",
      'Never suggest a guaranteed outcome.',
    ],
    technologies: [],
    status: 'Hackathon prototype',
    accent: '#FF9678',
  },
  {
    id: 'tiny-paws',
    slug: 'tiny-paws',
    title: 'Tiny Paws',
    shortTitle: 'Tiny Paws',
    eyebrow: 'FRONT-END PRODUCT · PET CARE',
    category: 'Product engineering',
    headline: 'A pet-care hub that keeps shopping, services and health records in one place.',
    summary:
      "A responsive pet care and wellness web app combining a store with checkout, service booking, and a medical vault for each companion's health documents.",
    hook: 'Store, services and a document vault for pet health, built as a polished React front end.',
    problem:
      'Pet owners juggle product shopping, vet and grooming services, and scattered vaccination paperwork across different places.',
    role: 'Designed and built the front end.',
    features: [
      'Home page with a vaccine countdown for registered companions',
      'Store with product detail pages and a sliding cart overlay with free-shipping progress',
      'Two-step checkout with form validation and a simulated payment flow',
      'Services page for consultations, grooming, training and boarding',
      'Companion profiles and a medical vault with drag-and-drop uploads linked to a specific pet',
      'Tables that reflow into stacked cards on mobile',
    ],
    approach: [
      'React with React Router, built with Vite.',
      'Cart, pets and documents live in a shared context and persist to localStorage.',
      'Product and service data is mock data in the repository; there is no backend.',
      'Framer Motion handles page transitions and the cart drawer.',
      'Hand-written CSS with design tokens, mobile-first from 320px to 1440px.',
    ],
    decisions: [
      {
        title: 'Front end first',
        body: 'The goal was to get the flows right (cart, checkout, vault) before committing to a backend, so data is mock data and payment is simulated.',
      },
      {
        title: 'One context for shared state',
        body: 'Cart, companions and uploaded documents share one provider, which keeps the cart overlay, checkout and profile consistent.',
      },
    ],
    limitations: [
      'This is a front-end prototype: products are mock data, payment is simulated and accounts are not backed by a server.',
    ],
    technologies: ['React', 'Vite', 'React Router', 'Framer Motion', 'CSS', 'localStorage'],
    image: { src: 'tinypaws/store.webp', alt: 'The Tiny Paws store page', width: 1280, height: 800 },
    repoUrl: 'https://github.com/Aniketh17/Tiny_paws',
    demoUrl: 'https://tiny-paaws.netlify.app/',
    status: 'Front-end prototype',
    accent: '#7BB5AB',
  },
];

export const getProjectBySlug = (slug: string): Project | undefined => projects.find((p) => p.slug === slug);
export const getProjectById = (id: string): Project | undefined => projects.find((p) => p.id === id);
