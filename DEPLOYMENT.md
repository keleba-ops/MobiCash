# GitHub Deployment Guide

This guide will help you deploy the MobiCash Agent application to GitHub and make it accessible online.

## 📋 Prerequisites

- GitHub account ([github.com](https://github.com))
- Git installed on your computer
- Node.js and npm installed

## 🚀 Step-by-Step GitHub Setup

### 1. Initialize Git Repository

Open your terminal in the project directory:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: MobiCash Agent Banking System by Verge Dynamics"
```

### 2. Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `mobicash-agent`
3. Description: `Mobile Money Agent Banking System by Verge Dynamics`
4. Make it **Public** or **Private** (your choice)
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"

### 3. Connect and Push to GitHub

```bash
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/mobicash-agent.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Why Vercel?**
- Free for personal projects
- Automatic deployments on every push
- Custom domain support
- Fast global CDN
- Zero configuration needed

**Steps:**
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" → "Continue with GitHub"
3. Authorize Vercel to access your repositories
4. Click "New Project"
5. Import your `mobicash-agent` repository
6. Framework Preset: **Vite** (auto-detected)
7. Click "Deploy"
8. Wait 2-3 minutes
9. Your site is live at: `https://mobicash-agent.vercel.app`

**Automatic Updates:**
Every time you push to GitHub, Vercel automatically redeploys!

### Option 2: Netlify

**Steps:**
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select `mobicash-agent`
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"
7. Your site is live at: `https://mobicash-agent.netlify.app`

**Alternative (Drag & Drop):**
```bash
# Build the project
npm run build

# Drag the 'dist' folder to Netlify's deploy area
```

### Option 3: GitHub Pages

**Steps:**

1. Install gh-pages:
```bash
npm install -D gh-pages
```

2. Update `package.json`:
```json
{
  "homepage": "https://YOUR_USERNAME.github.io/mobicash-agent",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Update `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/mobicash-agent/',
  // ... rest of config
})
```

4. Deploy:
```bash
npm run deploy
```

5. Your site is live at: `https://YOUR_USERNAME.github.io/mobicash-agent`

6. Enable GitHub Pages:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`
   - Save

### Option 4: Cloudflare Pages

**Steps:**
1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Sign up and connect GitHub
3. Create new project → Connect to `mobicash-agent`
4. Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Click "Save and Deploy"

## 🔧 Post-Deployment Configuration

### Custom Domain (Optional)

**Vercel:**
1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

**Netlify:**
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS

### Environment Variables (If Needed)

Create `.env.production` for production-specific variables:
```env
VITE_API_URL=https://api.example.com
```

## 📊 Monitoring Your Deployment

### Vercel Dashboard
- View analytics
- Monitor deployments
- Check build logs
- Manage domains

### Netlify Dashboard
- Site analytics
- Deploy history
- Form submissions
- Function logs

## 🔄 Making Updates

After initial deployment, updating is simple:

```bash
# Make your changes
# ...

# Add and commit
git add .
git commit -m "Add new feature"

# Push to GitHub
git push
```

**Vercel/Netlify will automatically redeploy!**

## 🐛 Troubleshooting

### Build Fails on GitHub/Vercel/Netlify

1. Check build logs for errors
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version compatibility
4. Test locally: `npm run build`

### Site Shows 404 After Deployment

1. Check that `dist` folder is being deployed
2. Verify build command is correct
3. Check for routing issues in React Router

### Changes Not Reflecting

1. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
2. Clear browser cache
3. Check deployment status on Vercel/Netlify
4. Verify git push was successful

## 📞 Support

If you encounter issues:
1. Check the deployment platform's documentation
2. Review build logs
3. Open an issue on GitHub
4. Contact Verge Dynamics support

## ✅ Checklist Before Going Live

- [ ] All features tested
- [ ] Demo credentials working
- [ ] Theme management functional
- [ ] Mobile responsive design verified
- [ ] Dark mode working
- [ ] No console errors
- [ ] README updated with live URL
- [ ] License file included
- [ ] .gitignore configured

## 🎉 Success!

Your MobiCash Agent application is now live and accessible to users worldwide!

**Share your deployment URL:**
- Update README.md with the live link
- Add deployment badge to README
- Share with stakeholders

---

**Built by Verge Dynamics**  
© 2024 All rights reserved
