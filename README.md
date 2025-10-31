# DietMate — Local run instructions

This project has a frontend (static HTML/CSS/JS) and a Node/Express backend (`server.js`).

Why you saw `405 Method Not Allowed`:
- That error happens when the browser posts to your frontend static server (e.g. Live Server at `127.0.0.1:5500`) instead of the backend API.
- The static server doesn't implement `/api/signin`, so POST requests return 405.

Quick run steps (PowerShell)

1. Install dependencies (one time):

```powershell
npm install
```

2. Create a `.env` file in the project root with your Supabase credentials (required by `server.js`):

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3000
```

3. Start the backend server (this serves the site and API together):

```powershell
npm start
```

4. Open the app from the backend origin (so fetch('/api/...') targets the backend automatically):

- http://127.0.0.1:3000/

Alternatives

- If you prefer to keep using a static server (127.0.0.1:5500), change the frontend API calls to point to the backend origin (for example `http://127.0.0.1:3000/api/signin`).
- `signin.js` was updated to use an explicit `API_BASE` defaulting to `http://127.0.0.1:3000` — you can override this in the page by setting `window.__API_BASE__` before the script runs.

Example override in an HTML page (before loading signin.js):

```html
<script>window.__API_BASE__ = 'http://localhost:3000'</script>
<script src="signin.js"></script>
```

Debugging tips

- Check server logs after `npm start` — you should see `Server running on port 3000`.
- Use curl or Postman to exercise the API directly if the browser fetch fails.

If you want, I can:
- Add the `window.__API_BASE__` snippet to your `signin.html` and `signup.html` pages so they work with both setups.
- Add a small script to `script.js` to centralize API calls.

Which would you like me to do next?