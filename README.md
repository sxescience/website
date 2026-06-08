# SxE Website

SvelteKit website with a built-in Git-based CMS (`Sveltia`) under `/admin`.

## Local development

```sh
npm install
npm run dev
```

## CMS (`/admin`)

- Admin UI: `static/admin/index.html`
- CMS config: `static/admin/config.yml`
- Editable content files:
  - `src/lib/content/landing-content.json`
  - `src/lib/content/podcast-settings.json`
  - `src/lib/content/legal-content.json`
- Runtime CMS validation and mapping live in `src/lib/cms`.
- The Landing Page CMS form follows the same section order as the website.
- Podcast episodes are loaded from the central RSS feed configured in the CMS.

## Vercel deployment

1. Connect this GitHub repo to Vercel.
2. Deploy normally.
3. Open `/admin` on the deployed domain.
4. Log in via GitHub in the CMS and edit content.
5. CMS changes create commits -> Vercel redeploys -> website updates for all visitors.

Detailed setup notes: `docs/sveltia-cms-setup.md`

## Type checks

```sh
npm run check
```
