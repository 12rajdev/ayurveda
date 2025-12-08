# 🚀 Deployment Instructions

Your AyurVeda website is ready to deploy! Here are the easiest free options:

---

## ✅ OPTION 1: Render.com (RECOMMENDED - 100% FREE)

### Steps:

1. **Create GitHub Repository** (if you don't have one):
   - Go to https://github.com/new
   - Repository name: `ayurveda-website`
   - Make it Public
   - Click "Create repository"

2. **Push your code to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ayurveda-website.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy on Render**:
   - Go to https://render.com
   - Sign up/Login (use GitHub to sign in)
   - Click "New +" → "Web Service"
   - Click "Connect GitHub" and authorize
   - Select your `ayurveda-website` repository
   - Configure:
     * **Name:** ayurveda-website
     * **Environment:** Node
     * **Build Command:** `npm install`
     * **Start Command:** `npm start`
     * **Instance Type:** Free
   - Click "Create Web Service"
   - Wait 3-5 minutes for deployment
   - Your site will be live at: `https://ayurveda-website-XXXX.onrender.com`

**✨ Your live URL will look like:**
```
https://ayurveda-website.onrender.com
```

---

## ✅ OPTION 2: Railway.app (FAST & EASY)

### Steps:

1. Push to GitHub (same as above if not done)

2. **Deploy on Railway**:
   - Go to https://railway.app
   - Click "Start a New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects and deploys!
   - Get your URL: `https://XXXX.up.railway.app`

---

## ✅ OPTION 3: Cyclic.sh (SIMPLEST)

### Steps:

1. Push to GitHub (same as above if not done)

2. **Deploy on Cyclic**:
   - Go to https://cyclic.sh
   - Click "Sign up with GitHub"
   - Click "Link your own" → Select your repo
   - Auto-deploys in seconds!
   - Get your URL: `https://XXXX.cyclic.app`

---

## 📝 Quick GitHub Setup

If you don't have GitHub set up yet:

1. **Install Git** (already installed ✅)

2. **Create GitHub account**: https://github.com/signup

3. **Create Personal Access Token**:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select: `repo` (full control)
   - Copy the token (save it somewhere safe!)

4. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ayurveda-website.git
   git branch -M main
   git push -u origin main
   ```
   When prompted for password, use your Personal Access Token

---

## 🎯 FASTEST METHOD (No GitHub Needed)

### Using Render Direct Upload:

1. Go to https://render.com
2. Sign up with email
3. Click "New +" → "Web Service"
4. Choose "Upload a folder"
5. Upload your project folder
6. Configure and deploy!

---

## 📱 After Deployment

Your website will have URLs like:

- **Homepage:** `https://your-app.onrender.com/index.html`
- **Admin Login:** `https://your-app.onrender.com/admin-login.html`
- **My Orders:** `https://your-app.onrender.com/myorder.html`

### Admin Credentials:
- Username: `admin`
- Password: `admin123`

---

## ⚠️ Important Notes

1. **Free tier limitations:**
   - Render: App sleeps after 15 min of inactivity (wakes up in ~30 seconds)
   - Railway: $5/month credit (generous for small projects)
   - Cyclic: Always on, but with resource limits

2. **Recommended:** Use Render.com for best free tier experience

3. **Data Persistence:** Files (images, orders, users) will persist on these platforms

---

## 🔧 Need Help?

If you face any issues:
1. Check the deployment logs
2. Ensure all files are committed to Git
3. Verify Node.js version is compatible (14+)

---

**Ready to deploy? Choose Option 1 (Render) for the best experience!**

After deployment, share your live URL! 🎉
