# Complete Production Hosting Guide

This portfolio platform is a **Full-Stack Node.js Application** built with:
- **Express.js** backend serving static assets & API endpoints
- **SQLite Database** (`database.sqlite`) for persistent portfolio data & leads
- **Server-Sent Events (SSE)** for real-time live synchronization between Admin C-Panel and Visitor UI

Because the platform uses **SQLite database storage** and **persistent SSE connections**, it requires a **Node.js Web Service host** (not a pure static host like GitHub Pages or serverless-only host).

---

## 🚀 Option 1: Render.com (Recommended - Easiest & Free/Low Cost)

Render is ideal because it natively supports long-running Express processes, SSE streams without timeouts, and persistent storage disks for SQLite.

### Step-by-Step Deployment on Render:

1. **Push your latest code to GitHub**:
   Ensure all changes are committed and pushed to your repository: `MohamedAsik-2004/Asikportfolio`.

2. **Sign Up / Log In to Render**:
   Go to [render.com](https://render.com) and log in with your GitHub account.

3. **Create a New Web Service**:
   - Click **New +** -> **Web Service**.
   - Connect your GitHub repository (`Asikportfolio`).

4. **Configure Service Settings**:
   - **Name**: `mohamed-asik-portfolio` (or your preferred name)
   - **Region**: Select closest to your audience (e.g., Singapore / Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: Leave blank
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Select **Free** (or Starter for 24/7 uptime without sleep)

5. **Set Environment Variables**:
   - `PORT`: `3000` (Render automatically assigns a port, `process.env.PORT` in `server.js` handles this seamlessly).

6. **Add Persistent Disk for SQLite (Optional/Recommended)**:
   - Go to **Disks** section in Render settings.
   - Click **Add Disk**.
   - **Name**: `sqlite-data`
   - **Mount Path**: `/opt/render/project/src`

7. **Deploy**:
   - Click **Create Web Service**.
   - Render will build and launch your application.
   - Once deployed, you will get a live URL (e.g., `https://mohamed-asik-portfolio.onrender.com`).
   - Your frontend will be at `/` and admin panel at `/admin`.

---

## ⚡ Option 2: Railway.app (Super Fast 1-Click Deployment)

Railway provides instant deployment for Node.js apps with seamless persistent volume support.

### Step-by-Step Deployment on Railway:

1. Visit [railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select `MohamedAsik-2004/Asikportfolio`.
4. Railway auto-detects `package.json` and runs `npm start`.
5. **Add a Volume (for SQLite DB persistence)**:
   - Click on your deployment node -> **Variables & Volumes**.
   - Add a Volume mounted to `/app/database.sqlite`.
6. **Generate Domain**:
   - Go to **Settings** -> **Networking** -> Click **Generate Domain**.
   - Your live site will be ready at `https://your-app.up.railway.app`.

---

## 🖥️ Option 3: VPS Deployment (DigitalOcean / AWS / Hetzner / Linode)

For maximum performance, custom domain control, and permanent zero-cost hosting after server rent ($4-$6/mo):

### Steps on a Linux VPS (Ubuntu 22.04 / 24.04 LTS):

1. **SSH into your server**:
   ```bash
   ssh root@YOUR_SERVER_IP
   ```

2. **Install Node.js & Git**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs git nginx pm2 -g
   ```

3. **Clone your repository & install dependencies**:
   ```bash
   cd /var/www
   git clone https://github.com/MohamedAsik-2004/Asikportfolio.git portfolio
   cd portfolio
   npm install --production
   ```

4. **Start app with PM2 (Process Manager)**:
   ```bash
   pm2 start server.js --name "portfolio"
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx with SSE & Reverse Proxy**:
   Create `/etc/nginx/sites-available/portfolio`:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;

           # SSE (Server-Sent Events) streaming headers
           proxy_set_header Connection '';
           proxy_buffering off;
           proxy_cache off;
           chunked_transfer_encoding off;
       }
   }
   ```
   Enable config and reload Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

6. **Enable Free SSL (HTTPS) with Certbot**:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

---

## ❌ Why Pure Static Hosts (GitHub Pages / Vercel Static) Don't Work Alone

| Feature | Static Host (GitHub Pages) | Serverless (Vercel API) | **Render / Railway / VPS (Recommended)** |
| :--- | :--- | :--- | :--- |
| **Static HTML/CSS/JS** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Node.js Express Server** | ❌ No | ⚠️ Partial (Serverless) | ✅ **Full Native Support** |
| **SQLite DB Write (`database.sqlite`)** | ❌ No | ❌ No (Disk is read-only/ephemeral) | ✅ **Supported** |
| **Real-Time SSE Sync (`/api/events`)** | ❌ No | ❌ No (Timeouts kill long SSE connections) | ✅ **Full Real-Time Support** |
| **Admin C-Panel Lead & Data Save** | ❌ No | ❌ No | ✅ **Full Support** |

---

## 🎯 Summary Recommendation

For your specific stack:
- **Best Free Option**: **Render.com** (Web Service connected directly to your GitHub repo).
- **Best 1-Click Option**: **Railway.app**.
- **Best Enterprise/Custom Domain Option**: **VPS (DigitalOcean / Hetzner)** with **Nginx + PM2 + SSL**.
