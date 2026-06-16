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

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app locally:
   ```bash
   npm start
   ```
3. Open `http://localhost:3000` in your browser.

## Environment variables

Optionally set the following environment variables if you want the app to use Supabase instead of local JSON storage:

- `SUPABASE_URL`
- `SUPABASE_KEY`

## Notes

- `server.js` is used only for local development.
- Data is stored in Supabase PostgreSQL database when environment variables are set.
- Fallback to `registrations.json` if Supabase is not configured.
