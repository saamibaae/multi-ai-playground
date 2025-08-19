# Firebase Setup Guide

This guide will help you set up Firebase authentication for the multi-ai-playground project.

## Prerequisites

1. A Google account
2. Node.js and npm installed
3. A Firebase project (or create one)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Enter a project name (e.g., "multi-ai-playground")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project console, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication:
   - Click on "Email/Password"
   - Toggle the "Enable" switch
   - Click "Save"

## Step 3: Get Your Firebase Configuration

1. In your Firebase project console, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to the "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "multi-ai-playground-web")
6. Copy the configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Step 4: Set Up Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add the following environment variables using the values from your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## Step 5: Verify Configuration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/debug` to check if Firebase is properly configured

3. If everything is set up correctly, you should see:
   - "Firebase initialized successfully"
   - All environment variables showing as set

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"

This error typically occurs when:

1. **API Key is incorrect**: Double-check your API key in the `.env.local` file
2. **API Key restrictions**: Your API key might be restricted to specific domains
3. **Project not set up**: Ensure your Firebase project is properly configured

### To fix API key restrictions:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to "APIs & Services" > "Credentials"
4. Find your API key and click on it
5. Under "Application restrictions", make sure it's set to "None" or includes your domain
6. Under "API restrictions", ensure "Firebase Authentication API" is included

### Environment Variables Not Loading

1. **Restart your development server** after making changes to `.env.local`
2. **Check file location**: Ensure `.env.local` is in the project root
3. **Check file format**: Make sure there are no spaces around the `=` sign
4. **Check variable names**: Ensure all variable names start with `NEXT_PUBLIC_`

### Firebase Project Issues

1. **Enable Authentication**: Make sure Email/Password authentication is enabled
2. **Check project ID**: Verify the project ID matches your Firebase project
3. **Check auth domain**: Ensure the auth domain is correct

## Security Best Practices

1. **API Key Restrictions**: Consider restricting your API key to specific domains in production
2. **Environment Variables**: Never commit `.env.local` to version control
3. **Firebase Rules**: Set up proper security rules for your Firebase services
4. **HTTPS**: Use HTTPS in production to ensure secure communication

## Testing Authentication

1. Visit `http://localhost:3000/auth`
2. Try creating a new account with email and password
3. Try logging in with existing credentials
4. Check the Firebase Console > Authentication > Users to see registered users

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
