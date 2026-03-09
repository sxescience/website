# Forschung mit Folgen Website

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
  - `src/lib/content/site-settings.json`
  - `src/lib/content/news.json`
  - `src/lib/content/mission-items.json`
  - `src/lib/content/team-members.json`
  - `src/lib/content/legal-content.json`

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
