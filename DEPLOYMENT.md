# Deployment Guide

Your Study Flashcards app is now ready to deployy! Here are several options for hosting your personal website, including automated CI/CD deployment:

## 🚀 CI/CD Automated Deployment (Recommended)

Set up automatic deployment so every time you push changes to GitHub, your site automatically rebuilds and deploys!

### GitHub Actions Workflows Included:
- **Netlify**: `.github/workflows/deploy.yml`
- **Vercel**: `.github/workflows/deploy-vercel.yml` 
- **GitHub Pages**: `.github/workflows/deploy-github-pages.yml`

Choose ONE workflow based on your preferred hosting platform.

## Option 1: Netlify (Recommended - Free & Easy)

### Steps:
1. **Build the app** (already done):
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com) and sign up/login
   - Drag and drop the `dist` folder directly onto the Netlify dashboard
   - Your site will be live instantly with a random URL like `https://amazing-app-123456.netlify.app`
   - You can customize the URL in site settings

### Benefits:
- ✅ Free hosting
- ✅ Automatic HTTPS
- ✅ Custom domain support
- ✅ Instant deployment
- ✅ No configuration needed

## Option 2: Vercel (Also Great & Free)

### Steps:
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Upload the `dist` folder or connect your GitHub repo
4. Deploy instantly

## Option 3: GitHub Pages (Free)

### Steps:
1. Create a new GitHub repository
2. Upload your project files
3. Copy the contents of the `dist` folder to the root or a `docs` folder
4. Enable GitHub Pages in repository settings
5. Your site will be available at `https://yourusername.github.io/repository-name`

## Option 4: Firebase Hosting (Free)

### Steps:
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Set public directory to `dist`
5. Deploy: `firebase deploy`

## Option 5: Surge.sh (Simple & Free)

### Steps:
1. Install Surge: `npm install -g surge`
2. Navigate to the `dist` folder: `cd dist`
3. Deploy: `surge`
4. Follow the prompts to set your domain

## What's Included in Your Build

Your `dist` folder contains:
- ✅ Optimized HTML, CSS, and JavaScript
- ✅ All LaTeX math rendering fonts
- ✅ Responsive design for mobile and desktop
- ✅ All your flashcard functionality
- ✅ Local storage for data persistence

## Important Notes

- **Data Storage**: Your flashcards are stored in the browser's localStorage, so they'll persist on the device where you use the app
- **AI Features**: If you want to use AI features, you'll need to add your OpenAI API key in the app
- **No Backend Required**: This is a static site that runs entirely in the browser
- **HTTPS**: Most hosting providers automatically provide HTTPS, which is recommended

## Custom Domain (Optional)

Most hosting providers allow you to use a custom domain:
1. Buy a domain from any registrar (GoDaddy, Namecheap, etc.)
2. Point the domain to your hosting provider
3. Configure it in your hosting provider's dashboard

## Recommended: Netlify Deployment

For the easiest deployment, I recommend Netlify:

1. Go to [netlify.com](https://netlify.com)
2. Sign up for a free account
3. Drag and drop your `dist` folder onto the dashboard
4. Your site is live!

Your flashcards app will be accessible from anywhere, and all your data will be saved locally in each browser you use it in.
