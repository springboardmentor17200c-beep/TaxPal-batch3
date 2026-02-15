# Implementation Plan - Milestone 1

## Goal Description
Implement the Dashboard and Transaction Logging features for TaxPal Milestone 1 using React (Vite).
This involves creating a dashboard layout, summary cards, and forms for adding income and expenses.
Data will be managed via local state (React Context or simple state lifting) since backend integration is partial/mocked for now.

## User Review Required
> [!NOTE]
> Assuming backend is not fully ready for transaction persistence. Will implement with local state/mock data first.
> Authentication flow exists (Login/Signup), need to ensure redirection to Dashboard upon login.

## Proposed Changes

### FrontEnd

#### [NEW] Components
- `src/components/DashboardLayout.jsx`: Main layout wrapper with Sidebar and Header.
- `src/components/TransactionForm.jsx`: Reusable form for Income/Expense.
- `src/components/RecentTransactions.jsx`: List component for recent entries.
- `src/components/SummaryCard.jsx`: Widget for displaying total Income/Expense/Balance.

#### [NEW] Pages
- `src/pages/Dashboard.jsx`: Main dashboard view.
- `src/pages/Income.jsx`: Page for logging income.
- `src/pages/Expenses.jsx`: Page for logging expenses.

#### [MODIFY] App.jsx
- Add routes for `/dashboard`, `/income`, `/expenses`.
- Wrap authenticated routes with `DashboardLayout`.

#### [MODIFY] Login.jsx
- Redirect to `/dashboard` on successful login (mock or real).

## Verification Plan

### Manual Verification
1.  **Login Flow**:
    -   Start app (`npm run dev`).
    -   Go to `/login` or `/`.
    -   Enter credentials (mock/real).
    -   Verify redirection to `/dashboard`.
2.  **Dashboard**:
    -   Verify layout (Sidebar, Header).
    -   Check summary cards (should show 0 or mock data initially).
3.  **Transaction Logging**:
    -   Navigate to Income page.
    -   Add an income entry.
    -   Verify it appears in Recent Transactions and updates Summary Cards.
    -   Navigate to Expense page.
    -   Add an expense entry.
    -   Verify updates.
