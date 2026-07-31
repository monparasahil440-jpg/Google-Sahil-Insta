# 📸 Instagram Web Platform (`D:\Antigravity Social Media`)

A full-featured, ultra-fast Instagram Web Clone designed for **GitHub Pages** static deployment and integrated directly with **Supabase** (Auth, Database, and Media Storage).

---

## 🌟 Live Features Included
* **📱 Feed & Stories**: Responsive layout matching Instagram desktop and mobile web, interactive stories tray with progress animations, post like/double-tap heart animation, and real-time comment threads.
* **📸 Photo Studio & Filter Engine**: Live camera capture via Web Camera API, local photo upload, and real-time Instagram image filters (Clarendon, Juno, Lark, Sepia, Vintage).
* **🎬 Reels Short Video Feed**: Vertical full-bleed video player with sound controls and live like counts.
* **💬 Direct Messaging System**: Interactive DM chat interface with contacts and instant messaging.
* **🔍 Search & Explore**: Grid discovery view and user profiles.
* **⚡ Supabase Integration**: Pre-configured with database fallback and storage upload methods using project URL `https://rcjksdklfisxtignxevj.supabase.co`.
* **🌙 Dark & Light Theme**: Toggle themes on the fly.

---

## 🛠️ Step 1: Run & Test Locally

You can open `index.html` directly in your browser or run a simple local web server:

```bash
# Using Python
python -m http.server 8000

# Or using Node.js / npx
npx serve .
```

Open `http://localhost:8000` in your web browser.

---

## 🗄️ Step 2: Set up Supabase Database Tables (1-Click)

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select project **`rcjksdklfisxtignxevj`**.
3. Go to **SQL Editor** on the left menu.
4. Open the included `supabase_schema.sql` file from this project, copy the SQL code, paste it into the SQL Editor, and click **RUN**.
5. All database tables (`profiles`, `posts`, `likes`, `comments`, `stories`, `reels`, `messages`) and storage buckets (`posts`, `avatars`, `stories`) will be created automatically!

---

## 🚀 Step 3: Push to GitHub Repository & Host on GitHub Pages

Run these commands in PowerShell or Command Prompt inside `D:\Antigravity Social Media`:

```bash
git init
git add .
git commit -m "Initial commit of Antigravity Social Media web app"
git branch -M main
git remote add origin https://github.com/monparasahil440-jpg/Google-Sahil-Insta.git
git push -u origin main --force
```

### Enable GitHub Pages:
1. Open your repository on GitHub: `https://github.com/monparasahil440-jpg/Google-Sahil-Insta`
2. Go to **Settings** → **Pages** (on the left sidebar).
3. Under **Build and deployment** → **Source**, select **Deploy from a branch**.
4. Under **Branch**, select `main` branch and `/ (root)` folder, then click **Save**.
5. In 1–2 minutes, your website will be live globally at:
   👉 **`https://monparasahil440-jpg.github.io/Google-Sahil-Insta/`**!

---

## 📄 License & Credits
Built for **Antigravity Social Media**.
