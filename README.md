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

Terminal commands: `bantuan`, `tentang`, `proyek`, `buka <nomor|nama>`, `filter <ml|cv|iot|web|semua>`, `skill`, `pendidikan`, `pengalaman`, `kontak`, `cv`, `github`, `salin-email`, `gerak`, `trailer`, `tanggal`, `echo`, `bersihkan`, plus one hidden `sudo` command.

## Trailer

The hero's **Lihat trailer** button (or the terminal command `trailer`) opens a 40-second reel of every public project on [github.com/Hwarinn66](https://github.com/Hwarinn66). It is optional and never plays on its own.

- **Structure**: an AI-assistant style opening (sparkle and the name set in Bodoni Moda italic, a particle aperture with "Lihat lebih dalam.", a prompt that types "tampilkan semua proyekku"), then the build into the projects: the prompt turns into an "analysing" pill, the 11 repositories are pulled in, a results panel opens and folds into light that rushes into the first project at 13.9 s. Ten project scenes follow, then a recap grid and the name card (Bodoni Moda italic over an extended, wide-tracked surname).
- **Each project has its own world**: background, palette and typeface are chosen per project (Archivo extended for Dense Object Counter, Fraunces italic for InnerSelf, Big Shoulders for Voice Dataset, Saira Stencil for Smart Trash, Chakra Petch for Face Recognition, Unbounded for Hand Gesture, Barlow Condensed for Stock Recording, Instrument Serif for Payroll, monospace blueprint for the laptop BST and Press Start 2P for Math Game).
- **3D (Three.js)** for the machine-learning projects, modelled in code: for Dense Object Counter a webcam on an overhead arm lowers over the tray, focuses, takes its snapshot with a flash and sweeps a scan line across 50 objects, revealing the density map and boxing each object as the line passes; the InnerSelf orb with the eight cognitive functions; an ESP32 dev board with a micro servo that sorts left and right; a point-cloud face that is scanned, blinks and then flies into a 21-landmark hand that signs four gestures.
- **Small story moments** instead of logos: a leaf and a bottle fall into the sorter and are flicked left and right, coins stack on the payslip, a magnifier hops down the BST search path and laptops drop under the results, pixel coins burst from the right answer, sparkles scatter at the end.
- **Cinematic layer**: fade in from black, letterbox bars that hold the HUD and timecode, a slow push-in on every scene, light leaks and lens flares on the big cuts, a subtle handheld drift, film grain and a vignette.
- **Transitions**: dive and iris, orb squashed into a waveform, rising bars, CRT switch-off, morph from face to hand, swipe, pixel staircase, blueprint sheet, pixel mosaic, and tiles collapsing into the sparkle.
- **Sound design, no music**: every effect is synthesised by `scripts/trailer-sound/make_sfx.py` (numpy/scipy, no samples) and placed on the same cue grid, with a quiet ambience bed per project. The opening has a light streak, sparkle chimes, typing and a riser into the first project; Dense Object Counter has the webcam motor, focus clicks, LED countdown, shutter and a laser scan with a blip as each box pops; InnerSelf a harp glissando and bells; Voice Dataset a REC beep and a sung "aah" chord; Smart Trash servo whirrs, a bottle clunk and a CRT switch-off; Face Recognition scanner beeps and an access chime; Hand Gesture bubbly pops and swishes; Stock Recording a barcode beep and an APPROVED stamp; Payroll a slip printer, coins and a ka-ching; the laptop BST plucked notes and chimes; Math Game chiptune. Timings come from `trailer-data.ts` through `scripts/trailer-sound/export-cues.ts`.
- **Sync**: one paused GSAP timeline on a fixed pacing unit (event *n* at *n* × 0.8149 s). The player sets the timeline and the 3D world to the audio clock each frame, so picture and sound stay locked and scrubbing works.
- **Controls**: play/pause, previous/next project, a scrubbable track with a mark per project, mute, close. Keyboard: Space/K, ←/→ (3 s), M, Esc. On phones: tap to pause, swipe left/right to change project. If the browser blocks audio it runs silently with a button to turn the sound on.
- **Cost**: the trailer code (including Three.js), its fonts and the sound track load only when the button is hovered, focused or pressed. Shaders compile before playback starts. The site's own animation loops pause while it is open; film grain is skipped on touch screens.

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
| `components/trailer/` | Trailer stage (markup), `trailer.css`, timeline (all 2D motion on the cue grid), story moments, player and data |
| `components/trailer/three/` | Trailer 3D: one WebGL world and a rig per 3D shot (webcam scan, orb, ESP32, face → hand, particle aperture) |
| `lib/trailer-audio.ts`, `public/audio/trailer.mp3` | Trailer sound-effects track, started inside the click so browsers allow sound |
| `scripts/trailer-sound/` | Sound design: cue export from the trailer data and the synthesiser that renders `trailer.mp3` |
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
