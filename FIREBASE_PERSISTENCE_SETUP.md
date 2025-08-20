# Firebase Persistence Setup Guide

## Overview
Your multi-AI chat app now uses Firebase Firestore for persistent storage of API keys and chat history. This provides:

- ✅ **Cross-device synchronization**: Access your data from any device
- ✅ **Real-time updates**: Changes sync instantly across sessions  
- ✅ **Secure storage**: Data is protected by Firebase security rules
- ✅ **Offline support**: Falls back to localStorage when offline
- ✅ **Automatic migration**: Existing localStorage data migrates to Firebase

## Setup Instructions

### 1. Firebase Project Setup
Make sure your Firebase project has Firestore enabled:

```bash
# Deploy Firestore rules (run from project root)
firebase deploy --only firestore:rules

# Or if you haven't initialized Firebase CLI yet:
firebase init firestore
firebase deploy --only firestore:rules
```

### 2. Environment Variables
Ensure your `.env.local` file contains all required Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Firestore Database Structure
The app creates the following document structure:

```
users/{userId}/
  └── settings/
      ├── apiKeys        # Stores OpenAI, Gemini, Anthropic, Zhipu keys
      └── chatData       # Stores chat history and active chat ID
```

## Features

### 🔑 API Key Management
- **Secure Storage**: API keys stored in user's private Firestore document
- **Cross-device Sync**: Keys available on all logged-in devices
- **Migration**: Existing localStorage keys automatically migrate to Firebase
- **Fallback**: Works offline with localStorage backup

### 💬 Chat History
- **Persistent Conversations**: All chats saved to Firestore
- **Real-time Sync**: New messages appear instantly across devices
- **Migration**: Existing chat history migrates automatically
- **Backup**: localStorage provides offline access

### 🔒 Security
- **User Isolation**: Each user can only access their own data
- **Authentication Required**: Must be logged in to access Firestore
- **Secure Rules**: Firestore security rules prevent unauthorized access

## How It Works

### Authentication Flow
1. User logs in with Google OAuth
2. Firebase Auth provides user ID
3. Contexts load data from `users/{userId}/settings/`

### Data Persistence
1. **On Login**: Load API keys and chat history from Firestore
2. **On Changes**: Automatically save to Firestore + localStorage backup
3. **On Offline**: Fall back to localStorage
4. **On Migration**: Move localStorage data to Firestore, then clean up

### Loading States
- Smart loading indicators while fetching data
- Prevents navigation until data is ready
- Graceful fallbacks for network issues

## Troubleshooting

### No Data Loading
- Check Firebase project ID in environment variables
- Verify Firestore is enabled in Firebase Console
- Check browser console for authentication errors

### Permission Denied
- Ensure user is properly authenticated
- Verify Firestore security rules are deployed
- Check that rules allow access to `users/{userId}/settings/**`

### Migration Issues
- Clear browser localStorage: `localStorage.clear()`
- Re-login to trigger fresh data load
- Check browser console for migration errors

## Development Commands

```bash
# Start development server
npm run dev

# Deploy Firestore rules
firebase deploy --only firestore:rules

# View Firestore data
# Go to Firebase Console > Firestore Database
```

## Benefits Over localStorage

| Feature | localStorage | Firebase Firestore |
|---------|--------------|-------------------|
| Cross-device sync | ❌ | ✅ |
| Real-time updates | ❌ | ✅ |
| Secure storage | ❌ | ✅ |
| Backup/restore | ❌ | ✅ |
| Offline access | ✅ | ✅ (with fallback) |
| Data persistence | Browser only | Cloud + Browser |

Your app now provides a seamless, secure, and synchronized experience across all devices! 🚀
