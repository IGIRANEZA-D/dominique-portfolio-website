# Dominik AI Assistant Setup

## 1) Configure environment
1. Copy `.env.example` to `.env`.
2. Set `GEMINI_API_KEY` (recommended) and/or `HF_API_TOKEN`.
3. (Optional) adjust model and generation settings.

Important for new Hugging Face router:
- Your token must include permission for **Inference Providers**.
- If this permission is missing, the app will automatically use fallback answers (portfolio context + general summaries).

Provider order at runtime:
1. Gemini (if configured)
2. Hugging Face (if configured)
3. Intelligent fallback

## 2) Start AI server
Run:

```bash
npm run serve:ai
```

Open:
- `http://localhost:8787` for the portfolio site
- `http://localhost:8787/api/health` for server health

## 3) Keep assistant knowledge updated
The chatbot reads local files:
- `data/assistant-profile.json`
- `data/cv.txt`
- `data/linkedin-posts.json`

After editing these files, restart the server.

## 4) LinkedIn content updates
Direct scraping from LinkedIn is unreliable and often blocked.  
Use a clean export/manual sync approach:
1. Copy your latest post summaries into `data/linkedin-posts.json`.
2. Include `date`, `topic`, `summary`, optional `tags`, and `url`.
3. Restart the server.

This gives stable, accurate answers while keeping your assistant professional and controlled.
