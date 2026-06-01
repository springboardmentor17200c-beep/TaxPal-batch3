# Frontend API Configuration Report

Generated after full API endpoint audit and fix.

## Problem

Production requests were sent to `https://your-api.onrender.com/api/...` (404).  
Correct backend base: `https://taxpal-batch3.onrender.com/api`

## Files modified

| File | Change |
|------|--------|
| `frontend/src/lib/api.ts` | Centralized `API_BASE` from `VITE_API_URL` + fallback; all APIs via axios |
| `frontend/.env` | `VITE_API_URL=https://taxpal-batch3.onrender.com/api` |
| `frontend/.env.development` | `VITE_API_URL=http://localhost:4000/api` for `npm run dev` |
| `frontend/.env.production` | Production API URL for `npm run build` |
| `frontend/.env.example` | Documented local + production URLs |
| `frontend/vite.config.js` | Simplified (standard Vite env loading) |
| `frontend/src/vite-env.d.ts` | Typed `VITE_API_URL` |
| `DEPLOYMENT.md` | Removed placeholder API hostname in docs |

## URLs replaced / removed

| Before | After |
|--------|--------|
| `https://your-api.onrender.com/api` | `https://taxpal-batch3.onrender.com/api` |
| `https://your-backend.onrender.com/api` | (blocked by `normalizeApiBase`) |
| Missing `/api` suffix | Auto-appended in `normalizeApiBase()` |

## API endpoints (all use `API_BASE` + path)

| Feature | Method | Path |
|---------|--------|------|
| Signup | POST | `/auth/register` |
| Login | POST | `/auth/login` |
| Reset password | POST | `/auth/reset-password` |
| Dashboard transactions | GET | `/transactions`, `/transactions/summary` |
| Tax estimator | GET/POST | `/tax-estimates`, `/tax-estimates/calendar` |
| Budgets | GET/POST/DELETE | `/budgets`, `/budgets/:id` |
| Reports | GET/POST | `/reports`, `/reports/download/:id` |
| Settings categories | GET/POST/DELETE | `/suggested-categories`, `/suggested-categories/:id` |
| Alerts | GET | `/alerts` |

Resolved URLs example: `https://taxpal-batch3.onrender.com/api/auth/register`

## Remaining hardcoded URLs (intentional)

| Location | URL | Purpose |
|----------|-----|---------|
| `frontend/src/lib/api.ts` | `https://taxpal-batch3.onrender.com/api` | Production fallback when env missing/invalid |
| `frontend/.env.development` | `http://localhost:4000/api` | Local development only |
| `render.yaml` | `https://taxpal-batch3.onrender.com/api` | Render blueprint default |
| `frontend/src/lib/api.ts` | Regex guard for `your-api` | Rejects placeholder env values (not a request target) |

**No occurrences of `https://your-api.onrender.com` remain as request targets.**

## Render deployment

**Frontend** environment variable:

```text
VITE_API_URL=https://taxpal-batch3.onrender.com/api
```

Then: **Manual Deploy → Clear build cache & deploy**

**Backend** `CLIENT_URL`:

```text
https://taxpal-batch3-1.onrender.com
```

## Build verification

Run:

```bash
cd frontend
npm run build
```

Build must complete without errors. Grep `dist/` for `your-api` should return no matches.
