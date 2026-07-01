# Stock Watchlist

This project combines an Express/MongoDB backend with a React frontend for user watchlists, per-stock pages,
and market/news views.

## Highlights

- JWT-based authentication and watchlist management
- Per-stock pages with charts, news, and summary data
- Dashboard views for major indices and general market headlines

## Local setup

1. Start a local MongoDB instance or provide a hosted MongoDB connection string.
2. Set the backend environment variables:
   - `DATABASE_URI`
   - `ACCESS_TOKEN_SECRET`
   - `REFRESH_TOKEN_SECRET`
   - `ALPHA_API_KEY`
   - `PORT` (optional, defaults to `3500`)
3. Install backend dependencies with `cd backend && npm install`.
4. Install frontend dependencies with `cd frontend && npm install`.
5. Start the API with `cd backend && node server.js`.
6. Start the React app with `cd frontend && npm start`.

## Notes

- The frontend currently calls the deployed Render API at `https://findashboard-api.onrender.com`.
- For a fully local workflow, update those frontend URLs to your local API host or add a client-side API config.
- Company logos are fetched directly from Clearbit image URLs, so there is no extra backend key to configure for
  that part of the UI.
