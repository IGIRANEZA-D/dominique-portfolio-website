# Dominik AI Assistant Setup

## Frontend choice
This project should be served from `index.html`.

The supported deployment path is:
- static portfolio frontend: `index.html`
- AI backend + static file server: `server.js`

Do not deploy the Next.js app if you want the exact `index.html` look.

## 1) Configure environment
1. Copy `.env.example` to `.env` if needed.
2. Set `GEMINI_API_KEY` (recommended) and/or `HF_API_TOKEN`.
3. Keep `PORT=8080` unless your hosting provider sets `PORT` automatically.

Important for Hugging Face:
- Your token must include permission for `Inference Providers`.
- If that permission is missing, the assistant falls back to local portfolio knowledge.

Provider order at runtime:
1. Gemini
2. Hugging Face
3. Local fallback

## 2) Start the correct server
Run either:

```bash
npm run dev
```

or:

```bash
npm start
```

Open:
- `http://localhost:8080` for the exact portfolio you want
- `http://localhost:8080/api/health` for AI server health

## 3) How the assistant works
`index.html` sends assistant requests to:

```text
/api/chat
```

That endpoint is handled by `server.js`, so the frontend and AI stay on the same origin in deployment.

## 4) Keep assistant knowledge updated
The chatbot reads:
- `data/assistant-profile.json`
- `data/cv.txt`
- `data/linkedin-posts.json`

After editing these files, restart the server.

## 5) Deployment rule
If you want production to match `http://localhost:8080`, deploy the Node server defined by `server.js` and make sure the root path `/` serves `index.html`.
