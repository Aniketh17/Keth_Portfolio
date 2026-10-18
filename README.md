# Aniketh Rao: portfolio ("The Quiet Workshop")

React + TypeScript + Vite + Tailwind. A calm editorial portfolio on a fine static grid, where each project is shown through its real evidence (screenshots, documented flows) and can be inspected, then opened as a full case study.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build
```

| To change | Edit |
| --- | --- |
| Colours, grid, spacing, motion timings | `:root` tokens in `src/index.css` (Blueberry and Pop Soda are provisional values; no brand file defines them) |
| Project content, links, flows | `src/data/projects.ts` |
| Skills, experience, education, contact | `src/data/profile.ts` |
| Artifact views (exploded flow, evidence table) | `src/components/Artifact.tsx` |

Notes: routes are hash-based (`#/projects/<slug>`), so any static host works. Flows marked "conceptual" come from the project brief rather than code and are labelled as such on the page. Fonts: Instrument Sans and JetBrains Mono (Google Fonts); Söhne is not licensed here.
