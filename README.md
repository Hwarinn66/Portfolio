# Efriza Taufiqurrohman — Portfolio

Portofolio pribadi Efriza: mahasiswa Informatika yang membangun software, model machine learning, computer vision, dan perangkat IoT. Situs ini berisi tujuh proyek dari GitHub, CV, pengalaman, sertifikasi, dan kontak.

Built with **Next.js 16 (App Router, static export), React 19 and plain CSS** (Tailwind CSS 4 provides only the reset). GSAP and Three.js are used by the optional trailer and load only when it is opened. No server, database, API key or environment variable is required.

## Design

Technical editorial: the page reads like a well-set spec sheet for someone who turns ideas into working systems. Typography, spacing and alignment carry it; nothing moves unless the visitor asks it to.

- **Palette**: cool drafting-paper ground (`#eef1f3`), graphite ink (`#1f252c`) and one accent, the green of annotation boxes and solder mask (`#13704a`). Contrast on the ground: ink 13.6:1, secondary text 7.1:1, tertiary text 4.9:1, accent 5.4:1.
- **Type**: Instrument Sans for everything (a narrower width for headings), JetBrains Mono only for things that are code: the terminal, commands and repository paths. Fourteen- to ninety-two-pixel scale in `app/globals.css`.
- **Layout**: a twelve-column grid. Section headings sit in a left margin and content runs on the right, like a datasheet; projects use the full width. Hairline rules separate sections and rows; there are no cards, gradients, glass or shadows (the dialog keeps one shadow for elevation).
- **The one decorated surface**: each project has a line diagram of its system on a faint drafting grid. Diagrams are drawn in SVG from the repository READMEs, labelled as diagrams (not screenshots), and still by default.
- **Hero**: byline (name, study, status), the headline *Dari ide menjadi sistem.* set in a stepped indent, one sentence on what Efriza builds, and two actions: see the projects, download the CV. On a phone all of it fits in the first screen.
- **Projects**: three case studies (InnerSelf Cognitive, Smart Trash, Face Recognition Attendance) with context, approach, the main limitation and a large diagram, then an index of the other four. Every project opens a full case study: context, system flow, approach, technical decisions with their reasons, limitations, technology and source code. Which projects are featured is the `featured` flag in `lib/projects.ts`.

## Interactions (desktop and mobile)

| Feature | Desktop | Phone / tablet |
| --- | --- | --- |
| Navigation | Sticky header with the current section underlined | Header with a Menu button; the list closes after a choice or with Esc |
| Case study | Dialog with a fixed top bar; ←/→ switch projects, Esc closes and returns focus | Bottom sheet: drag the handle down to close, swipe left/right to switch projects |
| Diagram playback | "Putar alur" in a case study animates the flow; it pauses off screen | Same; hidden when the device asks for reduced motion |
| Technology list | Project names open their case study | Same |
| Mini terminal | Type commands, ↑/↓ history, Tab completion, Esc leaves the input | Example commands under the input run on tap |
| Contact | Send email, copy the address (with a confirmation), links, CV and portfolio PDFs with their file size | Same |

Terminal commands: `bantuan`, `proyek`, `buka <nomor|nama>`, `filter <ml|cv|iot|web|semua>` (lists matching projects), `skill`, `tentang`, `pendidikan`, `pengalaman`, `sertifikat`, `kontak`, `cv`, `salin-email`, `github`, `trailer`, `tanggal`, `echo`, `bersihkan`, plus one hidden `sudo` command.

## Trailer

The **Putar trailer proyek** button in the projects section (or the terminal command `trailer`) opens a 40-second reel of every public project on [github.com/Hwarinn66](https://github.com/Hwarinn66). It is optional and never plays on its own.

- **Structure**: an AI-assistant style opening (sparkle and the name set in Bodoni Moda italic, a particle aperture with "Lihat lebih dalam.", a prompt that types "tampilkan semua proyekku"), then the build into the projects: the prompt turns into an "analysing" pill, the 11 repositories are pulled in, a results panel opens and folds into light that rushes into the first project at 13.9 s. Ten project scenes follow, then a recap grid and the name card (Bodoni Moda italic over an extended, wide-tracked surname).
- **Each project has its own world**: background, palette and typeface are chosen per project (Archivo extended for Dense Object Counter, Fraunces italic for InnerSelf, Big Shoulders for Voice Dataset, Saira Stencil for Smart Trash, Chakra Petch for Face Recognition, Unbounded for Hand Gesture, Barlow Condensed for Stock Recording, Instrument Serif for Payroll, monospace blueprint for the laptop BST and Press Start 2P for Math Game).
- **3D (Three.js)** for the machine-learning projects, modelled in code: for Dense Object Counter a webcam on an overhead arm lowers over the tray, focuses, takes its snapshot with a flash and sweeps a scan line across 50 objects, revealing the density map and boxing each object as the line passes; the InnerSelf orb with the eight cognitive functions; an ESP32 dev board with a micro servo that sorts left and right; a point-cloud face that is scanned, blinks and then flies into a 21-landmark hand that signs four gestures.
- **Small story moments** instead of logos: a leaf and a bottle fall into the sorter and are flicked left and right, coins stack on the payslip, a magnifier hops down the BST search path and laptops drop under the results, pixel coins burst from the right answer, sparkles scatter at the end.
- **Cinematic layer**: fade in from black, letterbox bars that hold the HUD and timecode, a slow push-in on every scene, light leaks and lens flares on the big cuts, a subtle handheld drift, film grain and a vignette.
- **Transitions**: dive and iris, orb squashed into a waveform, rising bars, CRT switch-off, morph from face to hand, swipe, pixel staircase, blueprint sheet, pixel mosaic, and tiles collapsing into the sparkle.
- **Sound design, no music**: every effect is synthesised by `scripts/trailer-sound/make_sfx.py` (numpy/scipy, no samples) and placed on the same cue grid, with a quiet ambience bed per project. The opening has a light streak, sparkle chimes, typing and a riser into the first project; Dense Object Counter has the webcam motor, focus clicks, LED countdown, shutter and a laser scan with a blip as each box pops; InnerSelf a harp glissando and bells; Voice Dataset a REC beep and a sung "aah" chord; Smart Trash servo whirrs, a bottle clunk and a CRT switch-off; Face Recognition scanner beeps and an access chime; Hand Gesture bubbly pops and swishes; Stock Recording a barcode beep and an APPROVED stamp; Payroll a slip printer, coins and a ka-ching; the laptop BST plucked notes and chimes; Math Game chiptune. Timings come from `trailer-data.ts` through `scripts/trailer-sound/export-cues.ts`.
- **Sync**: one paused GSAP timeline on a fixed pacing unit (event *n* at *n* × 0.8149 s). The player sets the timeline and the 3D world to the audio clock each frame, so picture and sound stay locked and scrubbing works.
- **Controls**: play/pause, previous/next project, a scrubbable track with a mark per project, mute, close. Keyboard: Space/K, ←/→ (3 s), M, Esc. On phones: tap to pause, swipe left/right to change project. If the browser blocks audio it runs silently with a button to turn the sound on.
- **Cost**: the trailer code (including Three.js and GSAP), its fonts and the sound track load only when the button is hovered, focused or pressed. Shaders compile before playback starts. Film grain is skipped on touch screens.

## Accessibility and performance

- No entrance sequence, scroll-driven animation, parallax, particle field or looping animation on the page; content is readable at every scroll position. The page is prerendered to static HTML, so it reads without JavaScript (the case studies, terminal and phone menu need it).
- Motion only answers an action (opening a sheet, a confirmation, playing a diagram) and is removed under `prefers-reduced-motion`.
- Native `<dialog>` for focus trapping and Escape; focus returns to the button that opened it. Visible focus ring everywhere; text contrast at WCAG AA or better; touch targets of at least 44 px for controls.
- Landmarks, one `h1`, headings in order, a skip link, `aria-current` on the navigation, a polite live region for the terminal and the toast.
- Fonts are self-hosted (two families). File sizes of the PDFs are read at build time.

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
| `lib/projects.ts` | Projects and their case studies (`context`, `flow`, `decisions`, `limits`, optional `role`), `featured`, categories, technology groups |
| `lib/profile.ts` | Name, contact links, education, experience and certificates |
| `components/portfolio.tsx` | Page sections, navigation and dialogs |
| `components/project-detail.tsx` | Case study shown in the dialog / bottom sheet |
| `components/project-visual.tsx` | SVG diagram for each project |
| `components/mini-terminal.tsx` | Terminal commands |
| `components/sheet-dialog.tsx` | Dialog / bottom sheet |
| `components/trailer/` | Trailer stage (markup), `trailer.css`, timeline (all 2D motion on the cue grid), story moments, player and data |
| `components/trailer/three/` | Trailer 3D: one WebGL world and a rig per 3D shot (webcam scan, orb, ESP32, face → hand, particle aperture) |
| `lib/trailer-audio.ts`, `public/audio/trailer.mp3` | Trailer sound-effects track, started inside the click so browsers allow sound |
| `scripts/trailer-sound/` | Sound design: cue export from the trailer data and the synthesiser that renders `trailer.mp3` |
| `app/globals.css` | Design tokens, layout, diagrams, terminal, dialog, responsive rules |
| `public/assets/`, `public/documents/` | Photos, certificates, technology logos, CV and portfolio PDFs |
| `REPOSITORY-NOTES.md` | Project evidence, limitations and asset provenance |

## Hosting

### GitHub Pages (free for this public repository)

In repository **Settings → Pages → Build and deployment**, select **GitHub Actions**. The included workflow builds and deploys every push to `main`, with `NEXT_PUBLIC_BASE_PATH=/Portfolio`.

### Vercel

Import this repository in Vercel, keep the detected Next.js preset, and deploy. Leave `NEXT_PUBLIC_BASE_PATH` unset for a root-domain deployment.

## References

- [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports)
- [GSAP](https://gsap.com/docs/v3/) (trailer only)
- [Project and asset notes](REPOSITORY-NOTES.md)

The CV, portfolio, portrait and certificates remain the owner's materials. Third-party assets retain their respective licenses.
