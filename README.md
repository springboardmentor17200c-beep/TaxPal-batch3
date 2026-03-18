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
3. Use Dashboard, Transactions, Budgets, Tax Estimator, and Reports.

---

## Project Milestones

### Milestone 1: Project Setup and Planning
- Initialized the MERN stack project structure with separate backend and frontend directories.
- Set up backend with Express.js, MongoDB connection, and basic authentication middleware.
- Configured frontend with React, TypeScript, Vite for build tooling, and Tailwind CSS for styling.
- Established MongoDB models for core entities: User, Transaction, Budget, TaxEstimate, Report, SuggestedCategory, and Alert.
- Implemented basic routing structure and environment configuration for both backend and frontend.
- Set up package.json files with necessary dependencies for development and production.

### Milestone 2: Backend API Development
- Developed comprehensive RESTful APIs for all application features including user authentication, transaction management, budget tracking, tax estimation, report generation, and alert notifications.
- Implemented a robust tax calculation engine supporting multiple countries (India, United States, and generic fallbacks) with accurate tax slab calculations, deductions, and quarterly tax estimates.
- Added JWT-based authentication and authorization middleware to secure API endpoints.
- Created a seeding script to populate the database with demo user data, sample transactions, budgets, tax estimates, and alerts for testing purposes.
- Implemented data validation, error handling, and proper HTTP status codes across all API routes.
- Added support for PDF report generation using PDFKit library.

### Milestone 3: Frontend Development and Integration
- Built a responsive and modern user interface using React with TypeScript for type safety.
- Implemented a comprehensive dashboard displaying key financial metrics, income/expense charts, expense breakdown, and recent transactions.
- Created dedicated pages for managing transactions (recording income/expenses), budgets (setting and tracking monthly budgets), tax estimator (calculating quarterly tax obligations), and reports (generating financial reports in PDF/CSV/Excel formats).
- Developed reusable UI components using shadcn/ui library including forms, tables, charts, dialogs, and navigation elements.
- Integrated frontend with backend APIs using React Query for efficient data fetching, caching, and state management.
- Implemented user authentication flow with login, signup, and protected routes.
- Added real-time currency formatting based on user's country selection and responsive design for mobile and desktop devices.
- Styled the application with Tailwind CSS for consistent design and dark/light mode support.

### Milestone 4: Testing, Deployment, and Documentation
- Conducted comprehensive testing including unit tests for backend APIs, integration tests for frontend-backend communication, and end-to-end user flow testing.
- Implemented error handling and validation to ensure data integrity and user-friendly error messages.
- Optimized application performance through code reviews, database query optimization, and frontend bundle size reduction.
- Prepared deployment configurations for production environments, including environment variable management and build scripts.
- Created detailed documentation including this README with setup instructions, API references, and project milestones.
- Added verification scripts to ensure backend and database connectivity before deployment.
- Finalized user experience with polished UI/UX, accessibility improvements, and cross-browser compatibility testing.

