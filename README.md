# Multi-AI Playground

A Next.js application for chatting with multiple AI models including GPT, Claude, Gemini, and more!

## Features

- 🔐 Firebase Authentication (Email/Password)
- 💬 Multi-AI Chat Interface
- 🎨 Modern UI with Tailwind CSS
- ⚡ Fast development with Next.js 15 and Turbopack

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

This project requires Firebase Authentication. Follow these steps:

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select an existing one

2. **Enable Authentication**:
   - In Firebase Console, go to Authentication > Sign-in method
   - Enable Email/Password authentication

3. **Get Configuration**:
   - Go to Project Settings > General
   - Add a web app and copy the configuration

4. **Set Environment Variables**:
   - Create a `.env.local` file in the project root
   - Add your Firebase configuration:

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
├── app/                 # Next.js App Router
│   ├── auth/           # Authentication pages
│   ├── chat/           # Chat interface
│   └── debug/          # Firebase debug page
├── lib/
│   └── firebase.ts     # Firebase configuration
└── scripts/
    └── validate-firebase.js  # Configuration validation
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run validate-firebase` - Validate Firebase configuration

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

## Firebase Hosting Deployment

You can also deploy to Firebase Hosting with Cloud Functions for SSR.

Prerequisites:
- Install Firebase CLI: `npm i -g firebase-tools`
- Login: `firebase login`
- Create project in Firebase Console and note the project ID

Setup (one-time):
1. Initialize:
   ```bash
   firebase login
   firebase use <your-project-id>
   ```
2. Configure Firestore rules (Console → Firestore → Rules) with per-user rules from this README.
3. Set env vars in `.env.production` (same keys as `.env.local`).

Build & deploy:
```bash
npm run build
firebase deploy --only hosting
```

Optional: CI/CD
- Add `FIREBASE_TOKEN` (from `firebase login:ci`) as a GitHub secret
- Create `.github/workflows/ci.yml` (already included). Add a deploy job if wanted:
```yaml
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci && npm run build
      - run: npx firebase-tools deploy --only hosting --token ${{ secrets.FIREBASE_TOKEN }}
```

Ensure you set your production environment variables in Firebase (if using Cloud Functions runtime config or `.env.production`). For Firestore rules, use the secure rules in this README or in `FIREBASE_SETUP.md`.
