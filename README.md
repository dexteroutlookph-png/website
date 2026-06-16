# website

This repository now includes a simple Node.js backend that stores every completed registration in `registrations.json`.

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open `http://localhost:3000` in your browser.

## Registration storage

- Completed registration data is saved to `registrations.json`.
- View stored profiles at `http://localhost:3000/registrations.html`.

## Deploy (Render example)

This repo can be deployed to Render for 24/7 hosting. Two options:

- Quick (from GitHub): Create a new Web Service on Render, connect your GitHub repo, set the build command to `npm install` and start command to `npm start`. Expose port `3000` and add a Persistent Disk if you want `registrations.json` to survive deploys.
- Docker (recommended for parity): Render also supports deploying via Docker. A `Dockerfile` is included — choose the Docker deploy option in Render.

Important: storing registrations in `registrations.json` relies on writable persistent storage. For production use, switch to a proper database (Postgres, Supabase, etc.) and update `server.js` accordingly.

Files added to help deploy:

- `Dockerfile` — container image for the app.
- `render.yaml` — an example Render service manifest (edit as needed).

If you want, I can prepare a pull request with a Postgres-backed version and deployment steps using Render + managed Postgres.
Alternatively, to deploy on Railway with a managed Postgres database I prepared changes that add Postgres support and a GitHub Actions workflow. Steps to finish deploy:

1. Push this repo to GitHub.
2. In GitHub repository settings, add a secret `RAILWAY_TOKEN` with your Railway API token.
3. On Railway, create a new project and add the Postgres plugin (it will provide a `DATABASE_URL`).
4. Connect GitHub – choose this repo and enable deploys for `main`.
5. Optionally set the `RAILWAY_TOKEN` in GitHub Actions secrets and the `service` field in `.github/workflows/deploy.yml`.

Notes:
- The workflow uses the `railwayapp/railway-deploy` action; follow Railway docs to generate a token.
- After deploy, Railway will provide a free `*.up.railway.app` subdomain.
