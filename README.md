# Aniketh Rao: portfolio ("The Signal Room")

React + TypeScript + Vite + Tailwind, with a persistent real-time 3D world (three.js via React Three Fiber). The page is a journey down one route through five zones (arrival, projects, systems, timeline, contact); the camera travels between authored destinations as you scroll, projects sit on a spatial carousel, and each project can be taken apart in place. All readable content, links and controls are ordinary HTML over the canvas. Without WebGL the same content is served by the plain editorial layout.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build
```

| To change | Edit |
| --- | --- |
| Colours, grid, spacing, motion timings | `:root` tokens in `src/index.css` (Blueberry and Pop Soda are provisional values; no brand file defines them) |
| Project content, links, flows | `src/data/projects.ts` |
| Camera destinations, world layout, zone positions | `src/world/layout.ts` |
| Scroll to camera waypoints, project selection, inspection | `src/world/env.ts` |
| The scene (environment, carousel, inspection, zones) | `src/world/scene/` |
| Engineering decisions and where their evidence lives | `src/data/decisions.ts` |
| Skills, experience, education, contact | `src/data/profile.ts` |
| Inspectable regions, synthetic specimens, Tiny Paws journey | `src/data/artifacts.ts` |
| The inspectors (one per project) | `src/components/inspectors/` |
| Evidence lens (opens an inspector from any claim) | `src/components/Evidence.tsx` |

Notes: routes are hash-based (`#/projects/<slug>`), so any static host works. Flows marked "conceptual" come from the project brief rather than code and are labelled as such on the page. Fonts: Switzer (Fontshare, free for commercial use) and Geist Mono (Google Fonts); Söhne is not licensed here. The IMAC image is a cropped (sidebar removed) and 2x-upscaled version of the original screenshot, so it is softer than a true high-resolution capture. Tiny Paws images are real captures of the running prototype. Fit Check and Transaction Coding use labelled illustrations on synthetic data.

## How the world works

- `world/store.ts`: one store (active project, inspection mode and focus, selections). The scroll handler writes a plain `frame` object that the render loop reads, so scrolling never causes a React render.
- `world/env.ts` turns the page's real layout into waypoints. The camera moves a fraction of the way toward its target every frame, so a click, a fast scroll or a reversal just changes the target and the camera turns from where it is.
- The projects stage is a tall section with a pinned view; ordinary scrolling through it moves the carousel. Choosing a project scrolls to it, so scroll position is the single source of truth.
- Inspection takes the active project apart in 3D (the IMAC interface into four real layers; Fit Check and Transaction Coding as routed threads; Tiny Paws as its real screens). The HTML dock explains the selected part and shares the same `focus` as the scene.
- Reduced motion: the camera snaps, ambient motion stops, and rendering is on demand.
