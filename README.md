# Zaid Asaireh — Portfolio

[View the live portfolio](https://zaid-portfolio-phi.vercel.app/)

A personal portfolio for a full-stack developer focused on ASP.NET Core, React, Next.js, JavaScript, TypeScript, and SQL Server. Built with semantic HTML, responsive CSS, and a small amount of JavaScript; no third-party runtime dependencies.

## What is included

- TijarahJo and CarePoint, with visible engineering highlights and expandable implementation notes.
- Direct links to implementation and test files, pinned to the revisions described by the case studies.
- Responsive AVIF artwork with WebP fallback, self-hosted fonts, and a social sharing card.
- Keyboard navigation, reduced-motion support, and usable mobile links when JavaScript is disabled or fails to load.

## Run locally

With Node.js 22 or newer installed:

```sh
npm run dev
```

Open <http://localhost:4173>. The static preview server does not need dependency installation. To use a different port, run `npm run dev -- --port 3000`.

## Check changes

Install development tools once:

```sh
npm ci
npx playwright install chromium
```

Then run:

```sh
npm run check
npm test
```

`check` verifies JavaScript syntax, formatting, local assets, fragment targets and sharing metadata. The browser tests cover section navigation, keyboard disclosures, clipboard success/failure, responsive widths from 320 to 1440 pixels, landscape layout, 200% text, reduced motion, and navigation without JavaScript.

GitHub Actions runs these checks on pull requests and changes to `main`. Browser screenshots and the HTML test report are retained as workflow artifacts for seven days. To additionally check the external GitHub references, run `npm run check:links`; this requires network access and can fail if GitHub limits requests.

## Edit the site

| File                          | Purpose                                                   |
| ----------------------------- | --------------------------------------------------------- |
| `dist/index.html`             | Content, metadata, and project case studies               |
| `dist/styles.css`             | Layout, typography, colors, and responsive styles         |
| `dist/script.js`              | Progressive navigation, email copying, and reveal effects |
| `dist/assets/`                | Optimized artwork, social card, fonts, and font license   |
| `design/connected-layers.png` | Original hero artwork used to regenerate image variants   |
| `scripts/optimize-images.mjs` | Rebuild image variants and the sharing card               |
| `scripts/check-site.mjs`      | Validate local links, assets, and metadata                |
| `tests/portfolio.spec.mjs`    | Browser regression checks                                 |
| `dev-server.mjs`              | Local static preview server                               |
| `vercel.json`                 | Static deployment configuration                           |

Run `npm run format` after editing. If the source artwork changes, run `npm run optimize:images` and review the generated assets before committing them.

Project descriptions should stay aligned with their linked code. A link to a test file shows that the test exists; it is not a claim that the application’s full test suite passed as part of portfolio maintenance. The About copy is based on the supplied CV and does not attribute a specific project to the training program.

## Deploy to Vercel

Import the repository into Vercel using the included configuration:

| Setting               | Value                              |
| --------------------- | ---------------------------------- |
| Root directory        | Repository root                    |
| Framework preset      | Other                              |
| Build command         | Empty; static assets are committed |
| Install command       | Empty; no production dependencies  |
| Output directory      | `dist`                             |
| Environment variables | None required                      |

Development dependencies are used for formatting, image encoding, and testing only. Vercel serves `dist`; it does not run the local preview server. The canonical URL and social metadata target <https://zaid-portfolio-phi.vercel.app/>.

## Asset attribution

Nimbus font licensing information is included in `dist/assets/font-license.txt`.
