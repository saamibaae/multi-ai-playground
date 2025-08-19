# Multi-AI Playground

A Next.js App Router app for a multi-model AI chat playground (OpenAI, Gemini, DeepSeek, GLM) with Firebase Auth (Google), optional Firestore sync, Tailwind + shadcn/ui, Framer Motion transitions, and Firebase Hosting deployment.

## Features

- 🔐 Firebase Authentication (Google). Client-gated routes + server redirects
- 🔑 API Setup with local storage + optional encrypted Firestore sync
- 💬 Multi-model chat with per-model threads, image support, and sessions
- 🎨 Tailwind + shadcn/ui + next-themes (Material You-inspired)
- 🎞️ Framer Motion transitions respecting prefers-reduced-motion
- 🚀 Firebase Hosting SSR deployment + GitHub Actions CI

## Prerequisites

- Node.js 18+ and npm
- Firebase project (see setup instructions below)

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd multi-ai-playground
npm install
```

### 2. Firebase Setup

This project requires Firebase Authentication (Google), Firestore (optional sync), and Hosting.

1. Create a project in [Firebase Console](https://console.firebase.google.com/)
2. Authentication → Sign-in method → Enable Google provider
3. Project Settings → General → Add a web app → copy config
4. Authorized domains → Add your domain and `localhost`
5. Firestore → Enable (production mode)
6. Hosting → Will be configured by Firebase Frameworks auto-detection

4. Set Environment Variables (do not commit secrets):
   - Create `.env.local` in the project root
   - Add your Firebase configuration:
Optionally add default models (used for initial session setup):

```env
NEXT_PUBLIC_DEFAULT_OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_DEFAULT_GEMINI_MODEL=gemini-1.5-flash
```

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 3. Validate Configuration

Before starting the development server, validate your Firebase setup:

```bash
npm run validate-firebase
```

This will check if all required environment variables are properly configured.

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                       # App Router routes
│   ├── login/                 # Login page
│   ├── home/                  # Authenticated landing
│   ├── api-setup/             # API keys management
│   ├── chat/                  # Playground
│   ├── template.tsx           # Page transitions
│   └── layout.tsx             # Providers + theming + navbar
├── components/                # UI and primitives
├── contexts/                  # Auth, API keys, Chat
├── integrations/              # Provider registry
├── lib/                       # Firebase, crypto, sessions, utils
└── styles/                    # Tailwind globals
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript checks
- `npm run validate-firebase` - Validate Firebase configuration

## Extending with a new model

1. Implement a handler in `src/integrations/providers.ts` that matches the `ProviderHandler` async generator interface (it can yield tokens or return a final message).
2. Register it in the `registry` under your provider id. If images are unsupported, hide image UI affordances in `/chat` for that provider.
3. Add a section to the API Setup page with validation rules and a “how to get your key” link.
4. Optionally add sync to Firestore (encrypted) using `src/lib/crypto.ts` and `src/lib/key-sync.ts`.

## Troubleshooting

### Firebase Authentication Issues

If you encounter Firebase authentication errors:

1. **Check Configuration**: Run `npm run validate-firebase`
2. **Verify API Key**: Ensure your Firebase API key is correct and not restricted
3. **Enable Authentication**: Make sure Email/Password auth is enabled in Firebase Console
4. **Restart Server**: Restart the development server after changing environment variables

### Common Errors

- **"Firebase: Error (auth/invalid-api-key)"**: Check your API key and Firebase project setup
- **Environment variables not loading**: Restart the development server
- **Authentication not working**: Verify Firebase Authentication is enabled

## Debug Tools

- **Debug Page**: Visit `/debug` to check Firebase configuration status
- **Validation Script**: Use `npm run validate-firebase` to verify setup

## Documentation

- [Firebase Setup Guide](FIREBASE_SETUP.md) - Detailed Firebase configuration instructions
- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [Firebase Documentation](https://firebase.google.com/docs) - Firebase features and API

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Firebase Documentation](https://firebase.google.com/docs) - learn about Firebase features
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Firebase Hosting Deployment (SSR)

Firebase supports Next.js App Router via the Frameworks integration.

Prerequisites:
- Install Firebase CLI: `npm i -g firebase-tools`
- Login: `firebase login`
- Select project: `firebase use <your-project-id>`

Deploy:
```
npm run build
firebase deploy --only hosting
```

CI/CD:
- Add `FIREBASE_TOKEN` (from `firebase login:ci`) as a GitHub secret
- See `.github/workflows/ci.yml` for build + deploy on main

Ensure you set your production environment variables in Firebase (if using Cloud Functions runtime config or `.env.production`). For Firestore rules, use the secure rules in this README or in `FIREBASE_SETUP.md`.
