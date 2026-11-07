# Missed call frontend

React, TypeScript, Vite and Mantine dashboard for the missed-call backend.

- Tenants see their numbers, contacts and events, and edit the SMS response per number.
- Sign-in is handled by Clerk. Access comes from the user's Clerk public metadata (`admin`, `tenant_id`); an account with neither sees a no-access page.
- Admins also get a tenant list, tenant detail pages (numbers, users, adding users by email), and can filter every list by tenant.

```
cp .env.example .env   # VITE_API_BASE_URL points at the backend, VITE_CLERK_PUBLISHABLE_KEY is the Clerk publishable key
npm install
npm run dev
npm run build
```

## Deploy

Merging to `main` deploys to Cloudflare through `.github/workflows/deploy-prod.yml`. Pull requests run lint and build.

Configure the `prod` GitHub environment with:

- Variables: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_WORKER_NAME`, `VITE_API_BASE_URL`, `VITE_CLERK_PUBLISHABLE_KEY`
- Secret: `CLOUDFLARE_API_TOKEN`

The site is served as a single page app from `dist` (see `wrangler.jsonc`). Add the deployed origin to the backend's `ALLOWED_ORIGINS`.
