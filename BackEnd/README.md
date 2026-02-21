# TaxPal Backend (MERN)

Express + MongoDB API for TaxPal.

## Setup

1. **MongoDB**  
   Have MongoDB running locally (e.g. `mongod`) or set `MONGODB_URI` in `.env`.

2. **Environment**  
   Copy `.env.example` to `.env` and set:
   - `MONGODB_URI` (default: `mongodb://localhost:27017/tax1`)
   - `JWT_SECRET` (required in production)
   - `PORT` (default: 4000)

3. **Install and run**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. **Seed database (optional)**  
   Creates demo user and sample data:
   ```bash
   npm run seed
   ```
   Demo login: **demo@taxpal.demo** / **password**

## API

- `POST /api/auth/register` – register (name, email, password, country?, income_bracket?)
- `POST /api/auth/login` – login (email, password)
- `GET /api/transactions` – list (auth)
- `POST /api/transactions` – create (auth)
- `GET /api/transactions/summary` – income/expense/net (auth)
- `GET/POST/PATCH/DELETE /api/budgets` – budgets (auth)
- `GET/POST /api/tax-estimates` – tax estimates (auth)
- `GET/POST /api/reports` – reports (auth)
- `GET /api/suggested-categories` – categories (no auth)
- `GET /api/alerts` – alerts (auth)

All authenticated routes expect header: `Authorization: Bearer <token>`.
