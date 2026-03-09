# Sveltia CMS Setup (`/admin`) for Vercel

This project uses Sveltia CMS as a Git-based CMS. No extra backend server is required.

## 1) Prerequisites

- Repository hosted on GitHub: `sxescience/website`
- Vercel connected to the same repository
- Editors need GitHub write access to the repository

## 2) Admin URL

After deployment, open:

- `/admin`

Sveltia CMS is served from `static/admin/index.html` with config in `static/admin/config.yml`.

## 3) Content files managed by CMS

- `src/lib/content/site-settings.json`
- `src/lib/content/news.json`
- `src/lib/content/mission-items.json`
- `src/lib/content/team-members.json`
- `src/lib/content/legal-content.json`

## 4) Auth notes

- Default backend is GitHub (`backend.name: github`).
- Without a separate OAuth gateway, editors can use the GitHub token-based sign-in flow in the CMS UI.
- If you later want one-click GitHub OAuth for non-technical editors, add an OAuth authenticator service.

## 5) Publish flow

- Changes in `/admin` create Git commits.
- Vercel deploys the new commit.
- Updated content goes live after deployment.
