# Sveltia CMS Setup (`/admin`) for Vercel

This project uses Sveltia CMS as its only CMS. Content is stored as JSON in the Git repository and
published through Vercel deployments.

No extra backend server, database, or paid CMS plan is required.

## 1) Prerequisites

- Repository hosted on GitHub: `sxescience/website`
- Vercel connected to the same repository
- Editors need GitHub write access to the repository

## 2) Admin URL

Open:

- `/admin`

Sveltia CMS is served from `static/admin/index.html` with config in `static/admin/config.yml`.

## 3) Content files managed by CMS

- `src/lib/content/landing-content.json`
- `src/lib/content/podcast-settings.json`
- `src/lib/content/legal-content.json`

The SvelteKit app loads these files through `src/lib/cms/service.ts`. Content mapping and validation
are split into `src/lib/cms/mappers.ts` and `src/lib/cms/content-utils.ts`, so invalid CMS edits fail
with field-specific errors instead of being silently cast into the page.

Podcast episodes are not edited manually in the CMS. The central RSS feed URL in
`src/lib/content/podcast-settings.json` is used by both the Landing Page and `/podcast`.

The Landing Page singleton mirrors the public page structure in editing order:

1. Hero
2. Über SxE
3. Infografiken
4. FAQ
5. Podcast
6. Ressourcen
7. Kontakt
8. Footer
9. SEO & Social Sharing

Header, navigation, theme labels, and the hidden Team section are intentionally not shown in the CMS.
The app provides defaults for these technical values.

## 4) Auth notes

- Default backend is GitHub (`backend.name: github`).
- Without a separate OAuth gateway, editors can use the GitHub token-based sign-in flow in the CMS UI.
- If you later want one-click GitHub OAuth for non-technical editors, add an OAuth authenticator service.

## 5) Publish flow

- Changes in `/admin` create Git commits.
- Vercel deploys the new commit.
- Updated content goes live after deployment.
