# IGIRANEZA Dominique Portfolio

Professional portfolio site for IGIRANEZA Dominique, built as a static frontend served by a lightweight Node server with an AI assistant backend.

## Overview

This project is intentionally centered on:

- `index.html` for the frontend UI and design
- `server.js` for static file serving and AI endpoints

The look you see at:

- `http://localhost:8080/`

is the correct version to deploy.

## Architecture

### Frontend

- Main entry: `index.html`
- Styling: inline CSS inside `index.html`
- Interactions: inline JavaScript inside `index.html`
- AI assistant UI: embedded in `index.html`

### Backend

- Server: `server.js`
- Static file hosting: serves `index.html`, assets, images, PDFs, and local files
- API endpoints:
  - `GET /api/health`
  - `POST /api/chat`

### AI data sources

The assistant uses local project data from:

- `data/assistant-profile.json`
- `data/cv.txt`
- `data/linkedin-posts.json`

## Local Development

Install dependencies:

```bash
npm install
```

Start the portfolio server:

```bash
npm start
```

Open:

- `http://localhost:8080/`

Health check:

```bash
http://localhost:8080/api/health
```

## Environment Variables

Create a `.env` file based on `.env.example`.

Typical variables:

```env
PORT=8080
HOST=0.0.0.0

GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-flash-latest
GEMINI_FALLBACK_MODELS=gemini-flash-lite-latest,gemini-2.5-flash-lite,gemini-3-flash-preview

HF_API_TOKEN=your_token_here
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.3
HF_MAX_NEW_TOKENS=220
HF_TEMPERATURE=0.35
HF_TIMEOUT_MS=18000
```

Notes:

- `.env` and `.env.local` are ignored by git
- add the same environment variables in your hosting provider
- if cloud providers fail, the assistant falls back to local portfolio knowledge

## NPM Scripts

```bash
npm start
```

Runs the production server with `server.js`.

```bash
npm run dev
```

Runs the same server in the current local setup.

```bash
npm run serve:ai
```

Also runs `server.js`.

## Deployment

## Recommended deployment path

Deploy this project as a Node application that runs:

```bash
npm start
```

Do not deploy the Next.js app if your goal is to preserve the exact `index.html` design.

## Best hosting options

Best fit:

1. Render
2. Railway
3. VPS / traditional Node hosting

Possible but less natural:

1. Vercel

Reason:

- this project uses a custom Node server (`server.js`)
- Vercel is more optimized for Next.js and serverless patterns

## If deploying to Vercel

Use these settings:

- Framework Preset: `Other`
- Install Command: `npm install`
- Build Command: leave empty
- Start Command: `npm start`

Then add your environment variables in the Vercel dashboard.

Important:

- GitHub stores the code
- Vercel runs the app
- AI only works in deployment if the environment variables are set correctly there

## GitHub Push

Initialize and push:

```bash
git init
git add .
git commit -m "Initial portfolio deployment setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## AI Verification

Check server health:

```bash
Invoke-WebRequest http://localhost:8080/api/health | Select-Object -ExpandProperty Content
```

Test the chat endpoint:

```bash
$body = @{ message = 'How can I contact Dominique?'; history = @() } | ConvertTo-Json
Invoke-WebRequest http://localhost:8080/api/chat -Method POST -ContentType 'application/json' -Body $body | Select-Object -ExpandProperty Content
```

Expected:

- `/api/health` returns `ok: true`
- `/api/chat` returns a JSON reply

## Project Structure

```text
index.html                  Main portfolio frontend
server.js                   Static server + AI API
package.json                Scripts and dependencies
.env.example                Environment template
AI_SETUP.md                 AI setup notes
data/assistant-profile.json Assistant profile knowledge
data/cv.txt                 CV text used by assistant
data/linkedin-posts.json    LinkedIn knowledge used by assistant
www/                        Images, CV, and portfolio assets
```

## Important Rule

If you want the deployed site to look exactly like `localhost:8080`, always deploy the `index.html` + `server.js` path, not the Next.js app routes.
