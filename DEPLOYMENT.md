# Quick Deployment Guide to Netlify

## 🚀 Fastest Method (5 minutes)

### Option 1: Netlify CLI (Recommended)

```bash
# 1. Install dependencies
npm install

# 2. Install Netlify CLI globally
npm install -g netlify-cli

# 3. Login to Netlify
netlify login

# 4. Deploy
netlify deploy --prod
```

When prompted:
- Build command: `npm run build`
- Publish directory: `dist`

### Option 2: GitHub + Netlify UI (10 minutes)

```bash
# 1. Initialize git
git init
git add .
git commit -m "Initial commit"

# 2. Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/interior-estimator.git
git push -u origin main
```

Then:
1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub and select your repo
4. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click "Deploy site"

### Option 3: Manual Upload (2 minutes - for testing)

```bash
# 1. Build the project
npm install
npm run build

# 2. Drag and drop 'dist' folder to Netlify
```

Go to [Netlify Drop](https://app.netlify.com/drop) and drag the `dist` folder.

## 📋 Pre-Deployment Checklist

- [ ] Node.js 18+ installed
- [ ] Netlify account created
- [ ] Anthropic API key ready ([Get one](https://console.anthropic.com/))
- [ ] All dependencies installed (`npm install`)
- [ ] Build successful locally (`npm run build`)

## 🔧 After Deployment

1. Open your deployed site URL
2. Click "Settings" in the app
3. Enter your Anthropic API key
4. Upload a test drawing
5. Click "Analyze Drawing"

## ⚠️ Common Issues

**Issue**: Build fails
**Solution**: Check Node version: `node -v` (should be 18+)

**Issue**: API key not working
**Solution**: Ensure key starts with `sk-ant-` and is active

**Issue**: 404 errors on refresh
**Solution**: netlify.toml should have redirect rules (already included)

## 💡 Tips

- Use environment variables for shared API keys (not recommended for production)
- Enable automatic deploys from Git for continuous deployment
- Set up custom domain in Netlify settings
- Monitor usage in Anthropic Console

## 📞 Need Help?

- Netlify docs: https://docs.netlify.com
- Anthropic docs: https://docs.anthropic.com
- Vite docs: https://vitejs.dev

---

Your site will be live at: `https://YOUR-SITE-NAME.netlify.app`
