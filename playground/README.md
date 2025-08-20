# Multi-AI Playground (Vite + React + TS)

A responsive, Firebase-enabled, multi-provider chat playground supporting OpenAI, Google Gemini, Anthropic Claude, and a Generic OpenAI-compatible provider. Built with React, Tailwind, and an adapter layer for easy provider additions.

## Quickstart

```bash
cd playground
npm install
npm run dev
```

## Scripts
- dev: local dev server
- build: production build
- preview: preview the build
- lint: run ESLint
- test: run unit tests (Jest + RTL)

## Firebase
- Uses the provided config in `src/firebase/firebaseConfig.js` (exact snippet).
- Google Auth via `signInWithPopup` in `AuthContext` and `GoogleLoginButton`.

## Security & API Keys
- API keys are stored in `localStorage` by default for local dev convenience.
- For production, do NOT store raw provider keys client-side. Use a server-side proxy, functions, and secrets manager.
- See `src/contexts/ApiKeysContext.tsx` for the storage shape.

## Providers & Adapter Layer
- Unified interface `ProviderAdapter` with `sendPrompt` returning `{ text, success, latencyMs, error }`.
- Adapters: OpenAI, Gemini, Anthropic, Generic (custom baseUrl).
- Add new providers by implementing the interface and registering in `adapters/index.ts`.

## UI
- Pages: Login, Setup, Chat. Routing via React Router.
- Three columns with per-column provider selector and toggle.
- Global input supports Ctrl/Cmd+Enter send.

## Testing & CI
- Minimal smoke tests for login button and chat column.
- GitHub Actions workflow runs lint, test, build.

## Deployment
- Vercel/Netlify: build command `npm run build`, output `dist`.
- Firebase Hosting: configure to deploy `dist` from `playground` folder.

## Manual QA Checklist
- Login with Google → redirect to Setup.
- Add API key for each provider.
- Navigate to Chat, toggle columns, send a prompt, see parallel responses.
- Error cases: invalid key, network error, timeouts.

## Notes
- Concurrency uses `Promise.allSettled` so failures don’t block other columns.
- Timeouts via `AbortController` (30s default).


