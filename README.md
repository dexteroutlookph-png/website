# website

This repository contains a static front-end and Vercel serverless API routes for registration, login, and password reset.

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server locally:
   ```bash
   npm start
   ```
3. Open `http://localhost:3000` in your browser.

## Registration storage

- In local development, registration data can be saved to `registrations.json`.
- In production on Vercel, use a real Postgres database by setting `DATABASE_URL`.
- Vercel serverless functions do not guarantee writable filesystem persistence, so file storage is only suitable for local testing.

## Vercel deployment

This repo is configured for Vercel.

1. Push your code to GitHub.
2. Go to `https://vercel.com` and create a new project.
3. Select your GitHub repository.
4. Set the project root to `/`.
5. Choose the framework preset: `Other` or `Node.js`.
6. Build command: `npm install`
7. Output directory: leave blank
8. Add environment variables:
   - Key: `DATABASE_URL`
   - Value: your Postgres connection string, e.g. `postgres://username:password@hostname:5432/database_name`
9. Deploy the project.

### Vercel test URLs

- `https://<your-deployment>.vercel.app/index.html`
- `https://<your-deployment>.vercel.app/register.html`
- `https://<your-deployment>.vercel.app/register-step2.html`
- `https://<your-deployment>.vercel.app/reset-password.html`
- `https://<your-deployment>.vercel.app/registrations.html`
- `https://<your-deployment>.vercel.app/api/registrations`

### Vercel API routes

- `/api/registrations` - read stored registrations
- `/api/register` - create a new registration
- `/api/reset-password` - update an existing password

## Notes

- `server.js` is used only for local development.
- Production on Vercel uses the `/api` directory and `vercel.json`.
- If you do not configure `DATABASE_URL`, the repo may still deploy, but registration writing will not be persistent.

## Optional: Vercel CLI deploy

```bash
npm install -g vercel
vercel login
vercel
```

When prompted:
- Project root: `.`
- Framework preset: `Other` or `Node.js`
- Build command: `npm install`
- Output directory: leave blank

Then deploy to production with:

```bash
vercel --prod
```
