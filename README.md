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

## Deploy to Render (recommended for 24/7 hosting)

This repo includes Postgres support and a Dockerfile, ready to deploy on Render.

1. **On Render.com**: Create a new account or sign in.
2. **New Web Service**: 
   - Click "New" → "Web Service".
   - Connect GitHub and select this repo.
   - Set build command to `npm install` and start command to `npm start`.
   - Render will auto-detect `Dockerfile`; accept it or choose Node.js environment.
3. **Add Postgres**:
   - In Render dashboard, go to this service → "Environment".
   - Click "Add Database" → "New PostgreSQL".
   - Render will auto-populate `DATABASE_URL` in your environment.
4. **Deploy**: Save and Render will auto-deploy. You'll get a free `*.onrender.com` subdomain.
5. (Optional) Add a custom domain in Render dashboard → Domains and configure DNS at your registrar.

Notes:
- The app auto-migrates from file storage (`registrations.json`) to Postgres if `DATABASE_URL` is set.
- Render's free tier provides limited resources; upgrade for production use.
- After deploy, visit `https://your-app.onrender.com` to access your site.
