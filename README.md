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

1. Push your code to GitHub.
2. Go to `https://vercel.com` and create a new project.
3. Select your GitHub repository.
4. Set the project root to `project/`.
5. Choose the framework preset: `Other` or `Node.js`.
6. Build command: `npm install`
7. Add environment variables:
   - `SUPABASE_URL`: your Supabase project URL
   - `SUPABASE_KEY`: your Supabase service role key
8. Deploy the project.

## Notes

- `server.js` is used only for local development.
- Data is stored in Supabase PostgreSQL database when environment variables are set.
- Fallback to `registrations.json` if Supabase is not configured.
