# Zaid Asaireh — Portfolio

A responsive personal portfolio for a full-stack developer focused on ASP.NET Core, React, TypeScript, and SQL Server.

## Features

- Selected projects: TijarahJo and CarePoint, with feature summaries and expandable engineering notes.
- Links to the implementation and tests in each project repository.
- Responsive navigation, keyboard focus states, and reduced-motion support.
- Technical skills, education, training, and contact links.
- Local fonts and artwork; no third-party runtime dependencies.

## Run locally

With Node.js installed, run:

```sh
npm run dev
```

Open http://localhost:4173. No dependency installation is required.

To use another port:

```sh
npm run dev -- --port 3000
```

## Deploy to Vercel

Import this repository into Vercel. The included `vercel.json` selects these settings:

| Setting | Value |
| --- | --- |
| Root directory | Repository root |
| Framework preset | Other |
| Build command | Empty; static files are already ready |
| Install command | Empty; no dependencies |
| Output directory | `dist` |
| Environment variables | None required |

The site is static HTML, CSS, and JavaScript. Vercel serves `dist`; the local development server is not used in production.

See [Vercel's build configuration documentation](https://vercel.com/docs/builds/configure-a-build) for the static deployment settings.

## Edit the site

| File | Purpose |
| --- | --- |
| `dist/index.html` | Content, sections, and project case studies |
| `dist/styles.css` | Layout, colors, typography, and responsive styles |
| `dist/script.js` | Navigation, email copying, and reveal effects |
| `dist/assets/` | Artwork, fonts, and font license |
| `dev-server.mjs` | Local static preview server |
| `vercel.json` | Deployment settings |

Keep project claims aligned with the linked code. The case studies describe the repositories; they do not claim that every referenced test was run during portfolio preparation.

## Asset attribution

Nimbus font licensing information is included in `dist/assets/font-license.txt`.
