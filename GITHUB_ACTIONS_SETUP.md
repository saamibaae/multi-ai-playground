# 🚀 GitHub Actions Setup Guide

This guide will help you configure GitHub Actions for automated deployment of your Multi-AI Chat Platform.

## 📋 Current Workflow Files

Your repository includes these GitHub Actions workflows:
- `deploy.yml` - Main deployment workflow (recommended)
- `firebase-hosting.yml` - Auto-generated Firebase workflow
- `ci.yml` - Basic CI workflow

## ⚠️ About the Warnings

The warnings you're seeing are **normal and expected**. They indicate that the workflows reference secrets that need to be configured in your GitHub repository settings. This is not an error - it's just GitHub's way of telling you these secrets need to be set up.

## 🔧 Required GitHub Secrets

To enable automated deployment, you need to add these secrets to your GitHub repository:

### Firebase Configuration Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets one by one:

```
Secret Name: VITE_FIREBASE_API_KEY
Secret Value: your_firebase_api_key_from_firebase_console

Secret Name: VITE_FIREBASE_AUTH_DOMAIN  
Secret Value: your-project-id.firebaseapp.com

Secret Name: VITE_FIREBASE_PROJECT_ID
Secret Value: your-firebase-project-id

Secret Name: VITE_FIREBASE_STORAGE_BUCKET
Secret Value: your-project-id.appspot.com

Secret Name: VITE_FIREBASE_MESSAGING_SENDER_ID
Secret Value: your_messaging_sender_id

Secret Name: VITE_FIREBASE_APP_ID
Secret Value: your_firebase_app_id

Secret Name: VITE_FIREBASE_MEASUREMENT_ID
Secret Value: your_measurement_id

Secret Name: FIREBASE_PROJECT_ID
Secret Value: your-firebase-project-id

Secret Name: FIREBASE_SERVICE_ACCOUNT
Secret Value: your_firebase_service_account_json
```

## 🔑 Getting Firebase Service Account

The `FIREBASE_SERVICE_ACCOUNT` is the most important secret. Here's how to get it:

### Step 1: Create Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon)
4. Go to "Service accounts" tab
5. Click "Generate new private key"
6. Download the JSON file

### Step 2: Add to GitHub Secrets

1. Open the downloaded JSON file
2. Copy the **entire JSON content**
3. In GitHub: Settings → Secrets → New repository secret
4. Name: `FIREBASE_SERVICE_ACCOUNT`
5. Value: Paste the entire JSON content

## 🎯 Workflow Configuration

### Recommended: Use deploy.yml

The `deploy.yml` workflow is the most comprehensive and recommended. It includes:

- ✅ Automated testing
- ✅ Linting
- ✅ Build optimization
- ✅ Preview deployments for PRs
- ✅ Production deployment for main branch

### Optional: Clean Up Extra Workflows

You can remove redundant workflow files:

```bash
# Keep only the main deployment workflow
rm .github/workflows/ci.yml
rm .github/workflows/firebase-hosting.yml
```

Or keep them all if you want different deployment strategies.

## 🚀 How It Works

### On Pull Requests:
1. Runs tests and linting
2. Creates preview deployment
3. Comments on PR with preview URL

### On Main Branch Push:
1. Runs tests and linting
2. Builds the application
3. Deploys to production Firebase Hosting

## 🔍 Troubleshooting Workflow Issues

### Common Issues:

**1. "Context access might be invalid" warnings**
- ✅ **Normal**: These are just warnings, not errors
- ✅ **Solution**: Add the secrets to your repository settings
- ✅ **Status**: Workflows will work once secrets are added

**2. Build fails with "Secret not found"**
- ❌ **Issue**: Secret not properly configured
- ✅ **Solution**: Double-check secret names and values
- ✅ **Tip**: Secret names are case-sensitive

**3. Firebase deployment fails**
- ❌ **Issue**: Service account permissions
- ✅ **Solution**: Ensure service account has "Firebase Hosting Admin" role
- ✅ **Check**: Verify project ID matches exactly

## 📊 Monitoring Deployments

### GitHub Actions Tab
- View workflow runs and logs
- See deployment status and errors
- Monitor build times and success rates

### Firebase Console
- View deployment history
- Monitor hosting analytics
- Check security rules deployment

## 🎛️ Workflow Customization

You can customize the workflows by editing the YAML files:

### Environment Variables
Add custom environment variables in the `env` section:

```yaml
env:
  VITE_APP_VERSION: ${{ github.sha }}
  VITE_BUILD_TIME: ${{ github.event.head_commit.timestamp }}
```

### Custom Build Commands
Modify build steps as needed:

```yaml
- name: Build project
  run: |
    npm run build
    npm run optimize
```

### Deployment Conditions
Control when deployments happen:

```yaml
# Only deploy on specific branches
if: github.ref == 'refs/heads/main'

# Only deploy with specific commit messages
if: contains(github.event.head_commit.message, '[deploy]')
```

## 🔐 Security Best Practices

### Secret Management
- ✅ Never commit secrets to code
- ✅ Use GitHub Secrets for sensitive data
- ✅ Rotate secrets regularly
- ✅ Use least-privilege service accounts

### Workflow Security
- ✅ Pin action versions (e.g., `@v4` not `@main`)
- ✅ Review third-party actions before use
- ✅ Limit workflow permissions
- ✅ Use environments for production deployments

## 📈 Advanced Features

### Deployment Environments
Set up staging and production environments:

```yaml
environment:
  name: production
  url: https://your-app.web.app
```

### Matrix Builds
Test across multiple Node.js versions:

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
```

### Caching
Speed up builds with caching:

```yaml
- name: Cache dependencies
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

## ✅ Setup Checklist

- [ ] Add all required secrets to GitHub repository
- [ ] Verify Firebase service account has proper permissions
- [ ] Test workflow by creating a pull request
- [ ] Confirm preview deployment works
- [ ] Test production deployment by merging to main
- [ ] Monitor deployment in Firebase Console

## 🎉 Next Steps

Once secrets are configured:

1. **Create a Pull Request** to test preview deployments
2. **Merge to Main** to trigger production deployment
3. **Monitor Workflows** in the Actions tab
4. **Check Firebase Console** for deployment status

---

## 💡 Pro Tips

- **Start Simple**: Begin with just the main deployment workflow
- **Test Locally**: Always test `npm run build` locally first
- **Monitor Logs**: Check workflow logs for detailed error information
- **Use Environments**: Set up GitHub environments for better control
- **Document Changes**: Update this guide when you modify workflows

---

**🤖 Remember**: These workflows were generated by AI agents in Cursor and are ready for production use once secrets are configured!

The warnings you're seeing are completely normal and will disappear once you add the required secrets to your GitHub repository settings.
