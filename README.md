# 📸 Enterprise Instagram Social Media Platform

A production-ready, full-stack **Instagram Clone** built with **React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Supabase, and WebRTC**, automated for **GitHub Pages** deployment via **GitHub Actions**.

---

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Router, Tailwind CSS, Framer Motion, Lucide React, React Hot Toast.
- **Backend & Database**: Supabase (PostgreSQL 22+ Tables, Row Level Security, Realtime Subscriptions, Media Storage).
- **Voice & Video Calls**: WebRTC P2P Streams + Supabase Realtime Signaling.
- **CI/CD & Hosting**: GitHub Pages + GitHub Actions (`.github/workflows/deploy.yml`).

---

## 🌟 Key Features

1. **🔐 Authentication & Security**:
   - Email & Password Login / Register.
   - OAuth SSO support (Google & GitHub).
   - Session persistence, Password Reset, Remember Me.

2. **📸 Photo Studio & Filter Engine**:
   - Web Camera API live capture & file uploads.
   - Real-time Instagram CSS filters (Clarendon, Juno, Lark, Sepia, Vintage).
   - Caption & Location tagging.

3. **📱 Feed & Stories**:
   - Double-tap heart like animation.
   - Nested comments & replies.
   - Interactive Stories tray with gradient story rings.

4. **🎬 Reels Video Player**:
   - Full-height vertical video scrolling feed with sound controls and live like counts.

5. **💬 Real-Time Messaging & Group Chats**:
   - Direct messages with instant AI echo simulation.
   - Image & video attachments.

6. **📞 WebRTC Voice & Video Calls**:
   - Incoming call notification dialogs.
   - RTCPeerConnection P2P media streams.
   - Mute mic, Camera flip/toggle, Screen sharing, Call timer, and End Call actions.

7. **👤 Enhanced Profile & Settings**:
   - Cover photo & avatar customization.
   - Highlights stories tray (*Travel ✈️*, *Coding 💻*, *Vibes ✨*).
   - Posts grid with ❤️ Likes and 💬 Comments count on hover.
   - Settings & **Log Out** modal.

8. **🛡️ Admin Moderation Dashboard**:
   - User statistics, active user metrics, user ban/delete, and report tickets.

---

## 🛠️ Local Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. Build production bundle:
   ```bash
   npm run build
   ```

---

## 🗄️ Supabase Database Setup

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) → Select project `rcjksdklfisxtignxevj`.
2. Go to **SQL Editor**.
3. Open `supabase_full_schema.sql`, paste the SQL code into the editor, and click **RUN**.
4. All 22 database tables, triggers, and storage buckets will be created automatically!

---

## 🚀 GitHub Pages Automated Deployment

Commit and push your changes to GitHub:

```bash
git add .
git commit -m "Deploy enterprise React TypeScript Instagram app"
git branch -M main
git remote add origin https://github.com/monparasahil440-jpg/Google-Sahil-Insta.git
git push -u origin main --force
```

GitHub Actions will automatically build the React Vite bundle and publish your live app at:
👉 **`https://monparasahil440-jpg.github.io/Google-Sahil-Insta/`**
