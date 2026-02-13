import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import "./styles/common.css";

import DashboardLayout from "./layouts/DashboardLayout";
import Income from "./pages/transactions/Income";
import Expenses from "./pages/transactions/Expenses";
import { TransactionProvider } from "./context/TransactionContext";
import { UserProvider } from "./context/UserContext";

function App() {
  return (
    <UserProvider>
      <TransactionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/income" element={<Income />} />
              <Route path="/expenses" element={<Expenses />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TransactionProvider>
    </UserProvider>
  );
}

export default App;
