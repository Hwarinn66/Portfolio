# Efriza Taufiqurrohman — Portfolio

Portofolio pribadi Efriza: mahasiswa Informatika yang membangun software, model machine learning, computer vision, dan perangkat IoT. Situs ini berisi tujuh proyek dari GitHub, CV, pengalaman, sertifikasi, dan kontak.

Built with **Next.js 16 (App Router, static export), React 19, Tailwind CSS 4 and GSAP ScrollTrigger**. No server, database, API key or environment variable is required.

## Design

Light pastel glassmorphism on a "milk glass" field (`#f2f3fa`), with deep indigo ink and one iris accent.

- **Glass**: frosted panels (`backdrop-filter`) over a drifting pastel aurora and a particle canvas, so every panel has colour behind it to refract.
- **Hero**: a staggered display headline (Bricolage Grotesque) with a glass portrait card. A face-detection frame locks onto the portrait as a nod to the face-recognition project. Tap or click the card to re-run the scan.
- **Motion graphics**: every project card has an animated SVG diagram of how the project works (TF-IDF to eight functions, camera to ESP32 to servo, blink check to three clients, modules to payslip, a binary-tree search, a gesture opening a site, a timed math round). Diagrams only animate while on screen.
- **Opening (first visit, about 5 s)**: a glass search bar types "Efriza Taufiqurrohman", suggestions drop in, Enter is pressed, results fly in on a tilted plane, the top result is clicked and the camera dives through it into the hero. Each shot changes the camera angle (CSS 3D + GSAP). It plays once per browser tab, never with reduced motion, a paused-motion preference or a deep link (`#projects`), and can be skipped with **Lewati** or Esc. A script in `<head>` decides before first paint, so there is no flash; `components/opening.tsx` holds the storyboard. The search bar is drawn in the site's own glass style, not as any real search engine's interface.
- **Scroll choreography** (GSAP ScrollTrigger, scrubbed so it plays forwards and backwards with the scroll):
  - Hero is pinned on desktop and comes apart: the three headline lines slide in opposite directions, the photo card leans in, the chips scatter.
  - A tilted glass band of skills and logos slides in two directions; scrolling faster skews it.
  - Section headings rise word by word out of a mask, from blur into focus.
  - Project cards rise in 3D with a column-based lag, and each diagram drifts inside its frame.
  - The terminal opens like a laptop lid; toolkit tiles fly in from scattered positions and assemble the grid.
  - The about portrait opens from a small window; the journey timeline draws itself and lights each stop; certificates fan out; the contact panel grows into place.
  - Glass orbs drift and turn at their own depth in every section; the background aurora rotates through the page and shifts colour per section (desktop).
- **Parallax**: pointer depth on desktop, gyroscope depth on phones, three-depth particle field.
- **Typefaces**: Bricolage Grotesque (display), Instrument Sans (body), JetBrains Mono (terminal), all self-hosted through Fontsource.

## Interactions (desktop and mobile)

| Feature | Desktop | Phone / tablet |
| --- | --- | --- |
| Particle "sensor net" | Points near the cursor are pushed aside and linked; click sends a ripple | Same with the finger; a slow virtual sensor wanders when nothing is touching; tap sends a ripple |
| 3D tilt + light | Cards tilt toward the cursor with a moving edge light | Cards follow the gyroscope (iOS asks once via "Aktifkan efek gerak ponsel"); pressing a card tilts it under the finger |
| Project filter | Category filter with sliding indicator and animated reflow (View Transitions) | Horizontally scrollable filter |
| Project detail | Dialog with arrow-key navigation | Bottom sheet: drag the handle down to close, swipe left/right to switch projects |
| Toolkit | Click a technology to filter projects that use it | Same, with light haptic feedback where supported |
| Mini terminal | Type commands, ↑/↓ history, Tab completion | Quick-command chips type themselves, then run |
| Navigation | Floating glass pill with active-section indicator and scroll progress | Bottom glass dock with active section |

Terminal commands: `bantuan`, `tentang`, `proyek`, `buka <nomor|nama>`, `filter <ml|cv|iot|web|semua>`, `skill`, `pendidikan`, `pengalaman`, `kontak`, `cv`, `github`, `salin-email`, `gerak`, `tanggal`, `echo`, `bersihkan`, plus one hidden `sudo` command.

## Accessibility and performance

- Respects `prefers-reduced-motion` (static diagrams, no parallax or particles animation) and has a per-tab pause button in the header and footer.
- Native `<dialog>` for focus trapping and Escape; visible keyboard focus everywhere; text contrast at WCAG AA or better.
- Pointer/gyroscope depth is written directly to the few elements that use it, and only while they are near the viewport (no page-wide CSS variables), so it does not trigger page-wide style recalculation while scrolling.
- The background changes colour per section with a short CSS transition instead of repainting on every scroll frame.
- The particle canvas caps its device-pixel ratio and particle count on phones, pauses in background tabs and avoids per-frame allocations.
- Heading blur filters are removed as soon as each heading is in focus.
- Content is server-rendered into static HTML and readable without JavaScript.

## Local development

Requires Node.js 22 or newer.

```
npm ci
npm run dev
```

## Build

```
npm run build
npm run typecheck
```

Next.js performs a static export to `out/`. Serve that directory over HTTP (not `file://`). For a subdirectory deployment, set `NEXT_PUBLIC_BASE_PATH` at build time.

## Editing

| Location | Purpose |
| --- | --- |
| `lib/projects.ts` | Projects, categories, technology list and which technologies each project uses |
| `lib/profile.ts` | Name, contact links, experience and certificates |
| `components/portfolio.tsx` | Page sections, navigation, filters, scroll parallax |
| `components/project-visual.tsx` | Animated SVG diagrams for each project |
| `components/mini-terminal.tsx` | Terminal commands |
| `components/background-field.tsx` | Aurora and particle canvas |
| `components/use-ambient-motion.ts`, `components/use-tilt.ts` | Pointer, touch and gyroscope motion |
| `components/glass-dialog.tsx`, `components/project-detail.tsx` | Dialog / bottom sheet and project detail |
| `components/opening.tsx`, `app/layout.tsx` | First-visit opening and the head script that decides whether it plays |
| `app/globals.css` | Design tokens, glass, layouts, diagram animations, responsive rules |
| `public/assets/`, `public/documents/` | Photos, certificates, technology logos, CV and portfolio PDFs |
| `REPOSITORY-NOTES.md` | Project evidence, limitations and asset provenance |

## Hosting

### GitHub Pages (free for this public repository)

In repository **Settings → Pages → Build and deployment**, select **GitHub Actions**. The included workflow builds and deploys every push to `main`, with `NEXT_PUBLIC_BASE_PATH=/Portfolio`.

### Vercel

Import this repository in Vercel, keep the detected Next.js preset, and deploy. Leave `NEXT_PUBLIC_BASE_PATH` unset for a root-domain deployment.

## References

- [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports)
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
- [Project and asset notes](REPOSITORY-NOTES.md)

The CV, portfolio, portrait and certificates remain the owner's materials. Third-party assets retain their respective licenses.
