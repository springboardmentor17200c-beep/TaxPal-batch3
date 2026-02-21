import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import StatCard from "@/components/StatCard";
import IncomeExpenseChart from "@/components/IncomeExpenseChart";
import ExpenseBreakdown from "@/components/ExpenseBreakdown";
import TransactionsTable from "@/components/TransactionsTable";
import RecordTransactionDialog from "@/components/RecordTransactionDialog";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { transactionsApi } from "@/lib/api";

const Dashboard = () => {
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const { user } = useAuth();
  const { data: summary } = useQuery({
    queryKey: ["transactions-summary"],
    queryFn: () => transactionsApi.summary(),
  });
  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => transactionsApi.list(),
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <header className="flex items-center justify-between border-b bg-card px-6 py-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <h2 className="text-xl font-bold text-card-foreground">Financial Dashboard</h2>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.name?.split(" ")[0] ?? "User"}!</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIncomeOpen(true)} className="gap-1.5">
                <CirclePlus className="h-4 w-4 text-success" />
                Record Income
              </Button>
              <Button variant="outline" onClick={() => setExpenseOpen(true)} className="gap-1.5">
                <CirclePlus className="h-4 w-4 text-destructive" />
                Record Expense
              </Button>
            </div>
          </header>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Monthly Income" value={`$${(summary?.income ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`} subtitle="From transactions" type="up" />
              <StatCard title="Monthly Expenses" value={`$${(summary?.expense ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`} subtitle="From transactions" type="down" />
              <StatCard title="Estimated Tax Due" value="$0.00" subtitle="No upcoming taxes" type="warning" />
              <StatCard title="Net" value={`$${(summary?.net ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`} subtitle={summary && summary.net >= 0 ? "Positive cash flow" : "Negative cash flow"} type="target" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <IncomeExpenseChart transactions={transactions} />
              </div>
              <ExpenseBreakdown transactions={transactions} />
            </div>

            <TransactionsTable transactions={transactions} />
          </div>
        </main>
      </div>

      <RecordTransactionDialog open={incomeOpen} onOpenChange={setIncomeOpen} type="income" />
      <RecordTransactionDialog open={expenseOpen} onOpenChange={setExpenseOpen} type="expense" />
    </SidebarProvider>
  );
};

export default Dashboard;
