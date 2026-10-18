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
| Inspectable regions, synthetic specimens, Tiny Paws journey | `src/data/artifacts.ts` |
| The inspectors (one per project) | `src/components/inspectors/` |
| Evidence lens (opens an inspector from any claim) | `src/components/Evidence.tsx` |

Notes: routes are hash-based (`#/projects/<slug>`), so any static host works. Flows marked "conceptual" come from the project brief rather than code and are labelled as such on the page. Fonts: Switzer (Fontshare, free for commercial use) and Geist Mono (Google Fonts); Söhne is not licensed here. The IMAC image is a cropped (sidebar removed) and 2x-upscaled version of the original screenshot, so it is softer than a true high-resolution capture. Tiny Paws images are real captures of the running prototype. Fit Check and Transaction Coding use labelled illustrations on synthetic data.
