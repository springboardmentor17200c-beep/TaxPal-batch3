# TaxPal — Render Deployment Guide

This guide walks through deploying TaxPal on [Render](https://render.com): a **Node.js Web Service** for the API and a **Static Site** for the React frontend.

## Prerequisites

- MongoDB Atlas cluster (free tier is fine)
- Render account
- Git repository pushed to GitHub/GitLab

## 1. MongoDB Atlas

1. Create a cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user with read/write access.
3. Under **Network Access**, allow `0.0.0.0/0` (or Render’s IP ranges if you restrict access).
4. Copy the connection string, e.g.  
   `mongodb+srv://USER:PASSWORD@cluster.mongodb.net/taxpal?retryWrites=true&w=majority`

## 2. Deploy the backend (Web Service)

| Setting | Value |
|--------|--------|
| **Root Directory** | `BackEnd` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/health` |

### Environment variables

| Variable | Example / notes |
|----------|-----------------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` (Render sets `PORT` automatically; keep in sync) |
| `MONGODB_URI` | Your Atlas connection string |
| `JWT_SECRET` | At least **32** random characters (use a password generator) |
| `CLIENT_URL` | Your frontend URL, e.g. `https://taxpal-frontend.onrender.com` |

For multiple origins (preview + production), use comma-separated values:

```text
https://taxpal-frontend.onrender.com,https://taxpal.onrender.com
```

After deploy, verify:

```bash
curl https://YOUR-API.onrender.com/health
# {"status":"OK"}
```

## 3. Deploy the frontend (Static Site)

| Setting | Value |
|--------|--------|
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### Environment variables

| Variable | Example |
|----------|---------|
| `VITE_API_URL` | `https://YOUR-API.onrender.com/api` |

**Important:** `VITE_API_URL` must include `/api` and use `https`. Rebuild the static site after changing env vars.

### SPA routing

`render.yaml` includes a rewrite rule so React Router paths work on refresh. If you deploy manually, add a **Rewrite** rule: `/*` → `/index.html`.

## 4. Blueprint deploy (optional)

Connect the repo in Render and use **New → Blueprint**. The root `render.yaml` defines both services. Set secret env vars in the dashboard after the first sync.

## 5. Post-deploy checklist

- [ ] `GET /health` returns `{"status":"OK"}`
- [ ] Register and login from the live frontend URL
- [ ] CORS: `CLIENT_URL` matches the exact frontend origin (no trailing slash)
- [ ] Tax Estimator calculates and calendar loads alerts
- [ ] Report PDF download works
- [ ] MongoDB Atlas shows active connections

## 6. Local production smoke test

```bash
# Backend
cd BackEnd
cp .env.example .env   # fill values
npm install
npm start

# Frontend (new terminal)
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:4000/api
npm install
npm run build
npm run preview
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors | Set `CLIENT_URL` to the exact browser origin |
| 401 on all routes | Check `VITE_API_URL` ends with `/api` |
| Config validation error on boot | `JWT_SECRET` ≥ 32 chars in production |
| MongoDB connection failed | Atlas IP allowlist and correct `MONGODB_URI` |
| Blank page on refresh | Add SPA rewrite to `/index.html` |

## Security reminders

- Never commit `.env` files or `credentials.json`
- Rotate `JWT_SECRET` if exposed
- Use strong MongoDB passwords and least-privilege DB users
