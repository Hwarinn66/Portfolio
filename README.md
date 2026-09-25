# Efriza Taufiqurrohman — Portfolio

A professional, responsive portfolio built with **Next.js 16 (App Router), React 19, Tailwind CSS 4 and GSAP ScrollTrigger**. Content is based on the supplied CV/Portfolio and seven reviewed GitHub projects.

## Local development

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
```

## Build

```sh
npm run build
```

Next.js performs a static export to `out/`. Serve that directory through an HTTP server or a static hosting provider. For a subdirectory deployment, set `NEXT_PUBLIC_BASE_PATH` at build time. Serve the export over HTTP, not `file://`.

```sh
npm run typecheck
```

`next build` also validates TypeScript. No runtime server, database, API key, or environment variable is required for the portfolio. Project repository links open their original GitHub sources; project applications are not embedded or run by the portfolio.

## Editing

| Location | Purpose |
| --- | --- |
| `app/layout.tsx` | Page metadata, fonts, language and theme |
| `app/globals.css` | Tailwind configuration, design system and responsive layouts |
| `components/portfolio.tsx` | Page sections, diagrams, parallax, navigation and motion controls |
| `lib/projects.ts` | Four featured projects, three additional projects and technology data |
| `public/assets/` | Portrait, certificate thumbnails and original technology logos |
| `public/documents/` | Downloadable CV and portfolio PDFs |
| `REPOSITORY-NOTES.md` | Project evidence, limitations and asset provenance |

The design uses an ink, mint and amber hero; layered photography; animated project diagrams; colored project panels; a technology marquee; experience and certification sections; and direct contact links.

The opening is a full-screen, three-stage circuit-board scene inspired by the supplied scroll-animation reference. CSS sticky holds its viewport while GSAP scrubs foreground panels apart, zooms the central processor, and changes the warm atmosphere into a dark mint scene. Scrolling upward reverses the sequence. Persistent links skip the opening or jump directly to projects. This uses native document scrolling without wheel/touch interception or mandatory snapping.

GSAP also connects the introductory portrait and floating cards to scrolling; project panels rotate in perspective as they enter and leave; the About portrait and education note move independently. Mobile layouts use a shorter opening and lighter movement. Reduced motion, paused animations, disabled JavaScript, or a viewport at most 620px tall show a compact static opening instead of a long sticky sequence.

The site respects `prefers-reduced-motion`, provides a persistent per-tab animation pause control, pauses looping animations outside the viewport, and keeps content readable without JavaScript. Pausing reverts scroll-driven transforms to the static layout. The mobile menu supports Escape and closes after navigation. Project implementation details use native HTML disclosure controls.

## Hosting

### GitHub Pages (free for this public repository)

In repository **Settings → Pages → Build and deployment**, select **GitHub Actions**. The included workflow builds and deploys every push to `main`. If needed, run **Actions → Deploy portfolio to GitHub Pages → Run workflow** after enabling Pages. The workflow sets `NEXT_PUBLIC_BASE_PATH=/Portfolio` for images, fonts, scripts and PDF downloads.

### Vercel

Import this repository in Vercel, keep the detected Next.js preset, and deploy. Leave `NEXT_PUBLIC_BASE_PATH` unset for a root-domain deployment. No application secrets are required.


## References

- [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports)
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs)
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [DM Sans on Fontsource](https://fontsource.org/fonts/dm-sans)
- [Space Grotesk on Fontsource](https://fontsource.org/fonts/space-grotesk)
- [Project and asset notes](REPOSITORY-NOTES.md)

The CV, portfolio, portrait and certificates remain the owner's materials. Third-party assets retain their respective licenses. Repository data is a manually reviewed snapshot; update `lib/projects.ts` when project behavior changes.
