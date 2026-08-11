# SubSync Deployment Guide (Publishing Online)

This guide explains how to deploy **SubSync** online so you can access your subscription manager from any device (phone, laptop, tablet) anywhere in the world.

---

## 🌟 Method 1: Render.com (Recommended Free Hosting)

[Render.com](https://render.com) offers free web service hosting for Node.js full-stack applications.

### Steps to Deploy on Render:
1. **Push your code to GitHub**:
   - Create a repository on [GitHub](https://github.com).
   - Push your `subsync` folder to GitHub:
     ```bash
     git init
     git add .
     git commit -m "Initial SubSync release"
     git remote add origin https://github.com/YOUR_USERNAME/subsync.git
     git push -u origin main
     ```

2. **Deploy on Render**:
   - Sign up at [Render.com](https://render.com).
   - Click **New +** -> **Web Service**.
   - Connect your GitHub repository `subsync`.
   - Set the following settings:
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm run server`
   - Click **Create Web Service**.

3. **Done!** Render will build your app and give you a free HTTPS URL like:
   `https://subsync.onrender.com`

---

## 🚀 Method 2: Railway.app (1-Click Deployment)

[Railway.app](https://railway.app) provides $5/month of free usage and deploys full-stack Node.js apps automatically.

1. Create an account on Railway.
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your `subsync` repository.
4. Railway will automatically detect Node.js, run `npm install`, `npm run build`, and `npm run server`.
5. Click **Generate Domain** to get your public URL (e.g., `https://subsync-production.up.railway.app`).

---

## 🐳 Method 3: Docker Container Deployment

SubSync comes pre-configured with a `Dockerfile`.

### Build & Run Container locally or on any VPS (DigitalOcean, AWS, Linode):
```bash
# 1. Build Docker image
docker build -t subsync-app .

# 2. Run container on port 5000
docker run -d -p 5000:5000 --name subsync subsync-app
```
Then visit `http://YOUR_SERVER_IP:5000`.
