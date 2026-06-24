# RobloxShop - Full E-Commerce Platform

A production-ready, fully customisable Roblox shop built with React + Vite + Supabase.

## Quick Start (5 minutes)

### 1. Supabase Setup
- Go to supabase.com → New Project
- SQL Editor → paste entire `supabase_schema.sql` → Run
- Settings → API → copy Project URL and anon key

### 2. Environment
cp .env.example .env
# Edit .env with your Supabase URL and anon key

### 3. Install & Run
npm install
npm run dev

### 4. Make Yourself Admin
Sign up at /auth, then in Supabase SQL Editor run:
UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');

Visit /admin — you're in.

## Deploy
npm run build
Push to GitHub → import to Vercel → add env vars → done.

See README.md for full documentation on email, payments, and customisation.
