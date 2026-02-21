# TaxPal – Personal Finance & Tax Estimator

MERN stack: **M**ongoDB · **E**xpress · **R**eact · **N**ode.

---

## Instructions: Start Backend and Frontend

### Prerequisites

- **Node.js** (v18+) installed
- **MongoDB** running locally (database: `tax1`, URI: `mongodb://localhost:27017/tax1`)

---

### Step 1: Start the Backend

Open a terminal and run:

```bash
cd backend
npm install
npm run seed
npm run dev
```

- **First time only:** run `npm install` and `npm run seed` (seed creates demo user and sample data).
- **Every time:** run `npm run dev` to start the API.

You should see: **TaxPal API running at http://localhost:4000**

Leave this terminal open.

---

### Step 2: Start the Frontend

Open a **second** terminal and run:

```bash
cd frontend
npm install
npm run dev
```

- **First time only:** run `npm install`.
- **Every time:** run `npm run dev` to start the React app.

You should see a local URL, e.g. **http://localhost:5173**

---

### Step 3: Use the app

1. In your browser, go to **http://localhost:5173** (or the URL Vite shows).
2. Use Dashboard, Transactions, Budgets, Tax Estimator, and Reports.