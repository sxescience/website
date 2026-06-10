# SxE Website

SvelteKit website for Scientists x Entrepreneurship.

## Local development

```sh
npm install
npm run dev
```

## CMS

- CMS guide: `docs/cms.md`
- Admin UI: `/admin`
- CMS: Sveltia CMS, Git-based and free.
- Editable content files:
  - `src/lib/content/landing-content.json`
  - `src/lib/content/podcast-settings.json`
  - `src/lib/content/legal-content.json`
- Runtime CMS validation and mapping live in `src/lib/cms`.
- Podcast episodes are loaded from the central RSS feed configured in the CMS.

## Vercel deployment

1. Connect this GitHub repo to Vercel.
2. Deploy normally.
3. Open `/admin` on the deployed domain.
4. Log in via GitHub/GitHub token in the CMS and edit content.
5. CMS changes create commits -> Vercel redeploys -> website updates for all visitors.

Detailed CMS notes: `docs/cms.md`

## Type checks

```sh
npm run check
```
