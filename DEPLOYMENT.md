# 🚀 Firebase Deployment Guide

Complete step-by-step guide to deploy your Multi-AI Chat Platform to Firebase Hosting.

## Prerequisites

- Node.js 18+ installed
- Firebase project created
- Git repository set up
- All environment variables configured

## 🔧 Pre-Deployment Setup

### 1. Install Firebase CLI

```bash
# Install globally
npm install -g firebase-tools

# Verify installation
firebase --version
```

### 2. Login to Firebase

```bash
firebase login
```

This will open your browser for Google authentication.

### 3. Build the Project

```bash
# Install dependencies (if not done already)
npm install

# Create production build
npm run build
```

The build output will be in the `dist/` directory.

## 🔥 Firebase Initialization

### 1. Initialize Firebase

```bash
firebase init
```

### 2. Configuration Steps

When prompted, select the following options:

1. **Which Firebase features do you want to set up?**
   - ☑️ Firestore: Configure security rules and indexes files
   - ☑️ Hosting: Configure files for Firebase Hosting and (optionally) set up GitHub Action deploys

2. **Please select an option:**
   - Choose "Use an existing project"
   - Select your Firebase project from the list

3. **Firestore Setup:**
   - **What file should be used for Firestore Rules?** → `firestore.rules` (already exists)
   - **What file should be used for Firestore indexes?** → `firestore.indexes.json` (already exists)

4. **Hosting Setup:**
   - **What do you want to use as your public directory?** → `dist`
   - **Configure as a single-page app (rewrite all urls to /index.html)?** → `Yes`
   - **Set up automatic builds and deploys with GitHub?** → `No` (for now)
   - **File dist/index.html already exists. Overwrite?** → `No`

## 🌐 Deployment Process

### 1. Deploy to Firebase

```bash
firebase deploy
```

This command will:
- Deploy Firestore rules
- Deploy your app to Firebase Hosting
- Provide you with hosting URLs

### 2. Deployment Output

You'll see output similar to:

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project-id/overview
Hosting URL: https://your-project-id.web.app
```

## 🔄 Continuous Deployment

### Quick Deploy Script

Add this to your `package.json` scripts:

```json
{
  "scripts": {
    "deploy": "npm run build && firebase deploy",
    "deploy:hosting": "npm run build && firebase deploy --only hosting",
    "deploy:firestore": "firebase deploy --only firestore"
  }
}
```

### Deploy Commands

```bash
# Full deployment (hosting + firestore)
npm run deploy

# Deploy only hosting
npm run deploy:hosting

# Deploy only Firestore rules
npm run deploy:firestore
```

## 🔒 Environment Variables Setup

### Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon)
4. In "General" tab, scroll to "Your apps"
5. Copy the Firebase config object

### Update Your .env.local

```env
# Firebase Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 🛡️ Security Configuration

### Firestore Rules

Your `firestore.rules` file should contain:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow access to user's settings and chat data
      match /settings/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Authentication Setup

1. In Firebase Console, go to Authentication
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" provider
5. Add your domain to authorized domains

## 🧪 Testing Deployment

### 1. Local Preview

```bash
# Preview the production build locally
npm run preview
```

### 2. Firebase Hosting Preview

```bash
# Create a preview channel
firebase hosting:channel:deploy preview

# Test the preview URL before going live
```

### 3. Production Testing

After deployment, test these features:

- ✅ Google OAuth login
- ✅ API key management
- ✅ Chat functionality with all AI providers
- ✅ Data persistence across sessions
- ✅ Responsive design on mobile
- ✅ Page refresh handling

## 🔧 Troubleshooting

### Common Issues

**Build Fails:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

**Firebase CLI Issues:**
```bash
# Update Firebase CLI
npm install -g firebase-tools@latest

# Re-login
firebase logout
firebase login
```

**Deployment Permissions:**
- Ensure you're logged into the correct Google account
- Check project permissions in Firebase Console
- Verify project ID matches your Firebase project

**Environment Variables Not Working:**
- Ensure all `VITE_` prefixed variables are set
- Check for typos in variable names
- Restart development server after changes

### Debug Commands

```bash
# Check Firebase project status
firebase projects:list

# View current project
firebase use

# Check hosting status
firebase hosting:sites:list

# View deployment history
firebase hosting:releases:list
```

## 📊 Performance Optimization

### Build Optimization

The project includes:

- ✅ Vite build optimization
- ✅ Code splitting
- ✅ Asset optimization
- ✅ Tree shaking
- ✅ Minification

### Firebase Hosting Features

- ✅ CDN distribution
- ✅ HTTPS by default
- ✅ Asset caching headers
- ✅ Gzip compression
- ✅ Clean URLs

## 🎯 Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test authentication flow
- [ ] Confirm API key storage works
- [ ] Test chat functionality
- [ ] Check mobile responsiveness
- [ ] Verify SSL certificate
- [ ] Test cross-device synchronization
- [ ] Monitor Firebase usage quotas

## 📈 Monitoring

### Firebase Console

Monitor your app at:
- **Hosting**: Traffic and performance metrics
- **Firestore**: Database usage and queries
- **Authentication**: User sign-ins and activity
- **Performance**: Core Web Vitals and user experience

### Custom Domain (Optional)

To use a custom domain:

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow DNS configuration steps
4. Wait for SSL certificate provisioning

---

🎉 **Congratulations!** Your Multi-AI Chat Platform is now live on Firebase!

**Live URL**: `https://your-project-id.web.app`

---

⚡ **Remember**: This entire deployment guide is for a codebase generated using AI agents inside Cursor!
