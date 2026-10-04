# White-Collar English Care — Setup Guide

## What You Have

```
white-collar/
├── backend/          ← FastAPI (deploy to Render)
├── frontend/         ← Next.js (deploy to Vercel)
└── bulk-import-template.csv
```

---

## Step 1 — NeonDB (PostgreSQL)

1. Go to https://neon.tech → Sign up free
2. Create project → name it `white-collar`
3. Copy the **Connection string** (looks like):
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. For the backend, you need the **asyncpg** version — replace `postgresql://` with `postgresql+asyncpg://`

---

## Step 2 — Cloudflare R2 (Photo Storage)

1. Go to https://dash.cloudflare.com → R2 → Create bucket → name: `white-collar-photos`
2. Go to **R2 → Manage R2 API Tokens** → Create Token (Object Read & Write)
3. Save: Account ID, Access Key ID, Secret Access Key
4. In your bucket settings → Enable **Public Access** → copy the public URL

---

## Step 3 — Green-API (WhatsApp)

1. Go to https://green-api.com → Sign up → Create instance (free tier: 1500 msg/month)
2. Scan QR code with your WhatsApp phone → instance goes green
3. Copy: **Instance ID** and **API Token**

---

## Step 4 — Backend Setup (Local)

```bash
cd white-collar/backend

# Copy env file and fill it in
cp .env.example .env
# Edit .env with your NeonDB, R2, Green-API credentials

# Install dependencies
pip install -r requirements.txt

# Run locally
uvicorn main:uvicorn main:app --reload --port 8000
```

**First run creates:**
- All database tables automatically
- Default admin account: username `admin`, password `Admin@WhiteCollar2025`

**Change admin password immediately after first login.**

---

## Step 5 — Frontend Setup (Local)

```bash
cd white-collar/frontend

# Copy env and fill in
cp .env.example .env.local
# Set: NEXT_PUBLIC_API_URL=http://localhost:8000

# Install and run
npm install
npm run dev
```

Visit http://localhost:3000

---

## Step 6 — Deploy Backend to Render

1. Push `white-collar/backend/` to a GitHub repo
2. Go to https://render.com → New Web Service → Connect repo
3. Settings:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment:** Add all variables from `.env.example`
4. Deploy → copy your Render URL (e.g. `https://white-collar-api.onrender.com`)

**Keep-alive (stops Render free tier sleeping):**
- Go to https://cron-job.org → Create job
- URL: `https://your-api.onrender.com/`
- Schedule: every 14 minutes

**Monthly fee reminder cron:**
- Create another job at cron-job.org
- URL: `https://your-api.onrender.com/trigger/monthly-reminders` (POST)
- Schedule: 10th of every month, 9:00 AM

---

## Step 7 — Deploy Frontend to Vercel

1. Push `white-collar/frontend/` to GitHub
2. Go to https://vercel.com → New Project → Import repo
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-api.onrender.com`
4. Deploy → get your Vercel URL

**Update backend CORS:**
In your Render environment variables, set:
```
FRONTEND_URL=https://your-app.vercel.app
```

---

## Admin Login

- URL: `https://your-app.vercel.app/login` → Admin Login tab
- Username: `admin`
- Password: `Admin@WhiteCollar2025` (change this first thing)

---

## Adding Students (Bulk)

Use the provided `bulk-import-template.csv`:

```
name,school_college,class_level,batch,gender,whatsapp_number,email
Rafiul Islam,Notre Dame College,Class 12,Batch A 2025,male,01712345678,
```

- Go to Admin → Students → Bulk Import → upload CSV
- Each student's default password = their Student ID (e.g. `WC-2026-001`)
- Students login at `/login` using Student ID + password

---

## Student Login Credentials

After adding a student, you see their:
- **Student ID:** `WC-2026-001`
- **Default password:** `WC-2026-001` (same as ID)

Tell the student to log in and change their password.

---

## Adding Results

Admin → Results → Add Result
- Select student from dropdown
- Enter exam name, total marks, obtained marks, date
- Check "Send WhatsApp notification" → student gets message immediately

## Adding Invoices

Admin → Invoices → Create Invoice
- Select student, enter amount and description
- Set due date
- Check "Send WhatsApp" → student gets invoice on WhatsApp
- When paid → click the green ✓ button to mark paid

---

## Monthly Fee Reminders

**Automatic:** On the 10th of each month, cron-job.org calls your `/trigger/monthly-reminders` endpoint. All students with unpaid invoices get a WhatsApp reminder. Nothing to do.

**Manual trigger:** POST to `https://your-api.onrender.com/trigger/monthly-reminders` anytime.

---

## Cost Summary

| Service       | Cost          |
|---------------|---------------|
| NeonDB        | Free          |
| Render        | Free          |
| Vercel        | Free          |
| Cloudflare R2 | Free (10GB)   |
| Green-API     | Free (1500/mo)|
| cron-job.org  | Free          |
| **Total**     | **৳0/month**  |

---

## Troubleshooting

**Backend not starting:** Check DATABASE_URL format — must start with `postgresql+asyncpg://`

**WhatsApp not sending:** Check Green-API instance is active (phone connected). Go to green-api.com dashboard.

**Photos not uploading:** Check R2 credentials and that the bucket has Public Access enabled.

**Students can't log in:** Their default password is their Student ID exactly (e.g. `WC-2026-001`).

**CORS error in browser:** Make sure FRONTEND_URL in Render env matches your exact Vercel URL.
