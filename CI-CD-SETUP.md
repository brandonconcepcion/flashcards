# CI/CD Setup Guide

This guide will help you set up automatic deployment so that every time you push changes to GitHub, your Study Flashcards app automatically rebuilds and deploys to your chosen hosting platform.

## 🎯 Choose Your Platform

You have 3 GitHub Actions workflows ready to use. **Choose ONE** based on your preferred hosting platform:

### Option 1: Netlify (Recommended)
- **File**: `.github/workflows/deploy.yml`
- **Benefits**: Free, fast, easy setup, great for static sites
- **URL**: Custom subdomain like `your-app.netlify.app`

### Option 2: Vercel
- **File**: `.github/workflows/deploy-vercel.yml`
- **Benefits**: Excellent performance, great developer experience
- **URL**: Custom subdomain like `your-app.vercel.app`

### Option 3: GitHub Pages
- **File**: `.github/workflows/deploy-github-pages.yml`
- **Benefits**: Integrated with GitHub, completely free
- **URL**: `https://yourusername.github.io/repository-name`

## 🚀 Setup Instructions

### Step 1: Push to GitHub
1. Create a new repository on GitHub
2. Push your project to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

### Step 2: Choose and Configure Your Platform

#### For Netlify (Recommended):

1. **Enable the workflow**:
   - Keep `.github/workflows/deploy.yml`
   - Delete the other two workflow files (optional)

2. **Get Netlify tokens**:
   - Go to [netlify.com](https://netlify.com) and sign up
   - Go to User Settings → Applications → Personal Access Tokens
   - Generate a new token and copy it

3. **Create a site**:
   - In Netlify dashboard, click "Add new site" → "Deploy manually"
   - Drag and drop your `dist` folder to create the site
   - Note the Site ID from Site Settings → General

4. **Add GitHub secrets**:
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `NETLIFY_AUTH_TOKEN`: Your personal access token
     - `NETLIFY_SITE_ID`: Your site ID from Netlify

#### For Vercel:

1. **Enable the workflow**:
   - Keep `.github/workflows/deploy-vercel.yml`
   - Delete the other two workflow files (optional)

2. **Get Vercel tokens**:
   - Go to [vercel.com](https://vercel.com) and sign up
   - Go to Settings → Tokens → Create new token
   - Copy the token

3. **Create a project**:
   - Import your GitHub repo in Vercel dashboard
   - Note the Project ID and Org ID from project settings

4. **Add GitHub secrets**:
   - `VERCEL_TOKEN`: Your Vercel token
   - `PROJECT_ID`: Your project ID
   - `ORG_ID`: Your organization ID

#### For GitHub Pages:

1. **Enable the workflow**:
   - Keep `.github/workflows/deploy-github-pages.yml`
   - Delete the other two workflow files (optional)

2. **Enable GitHub Pages**:
   - Go to your repo → Settings → Pages
   - Source: "GitHub Actions"
   - No additional secrets needed!

### Step 3: Test the Deployment

1. Make a small change to your app (e.g., update the title in `index.html`)
2. Commit and push:
   ```bash
   git add .
   git commit -m "Test CI/CD deployment"
   git push
   ```
3. Go to your repo → Actions tab to watch the deployment
4. Your site should automatically update!

## 🔧 Workflow Features

All workflows include:
- ✅ **Automatic building** on every push to main/master
- ✅ **Node.js 18** with npm caching for faster builds
- ✅ **Error handling** - deployment stops if build fails
- ✅ **Build optimization** - only deploys if build succeeds

## 🛠️ Customization

### Change trigger branches:
Edit the workflow file to change which branches trigger deployment:
```yaml
on:
  push:
    branches: [ main, develop ]  # Add more branches
```

### Add environment variables:
If you need environment variables for your build:
```yaml
- name: Build
  run: npm run build
  env:
    VITE_API_URL: ${{ secrets.API_URL }}
```

### Add build steps:
Add additional steps before deployment:
```yaml
- name: Run tests
  run: npm test

- name: Run linting
  run: npm run lint
```

## 🎉 Benefits of CI/CD

Once set up, you get:
- **Automatic deployments** - Push code, site updates automatically
- **No manual building** - GitHub handles the build process
- **Version control** - Every deployment is tied to a commit
- **Rollback capability** - Easy to revert to previous versions
- **Consistent builds** - Same environment every time
- **Team collaboration** - Multiple people can contribute and deploy

## 🔍 Monitoring

- **GitHub Actions**: Check the Actions tab for build/deploy status
- **Hosting platform**: Check your hosting dashboard for deployment logs
- **Email notifications**: GitHub can email you about failed deployments

## 🚨 Troubleshooting

**Build fails?**
- Check the Actions tab for error details
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

**Deployment fails?**
- Check that all required secrets are set correctly
- Verify hosting platform tokens haven't expired
- Ensure the hosting platform project/site exists

**Site not updating?**
- Check if the workflow ran (Actions tab)
- Verify you pushed to the correct branch (main/master)
- Clear browser cache to see changes

Your CI/CD pipeline is now ready! Every push to GitHub will automatically build and deploy your Study Flashcards app. 🚀
