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
import { transactionsApi, taxEstimatesApi } from "@/lib/api";

const Dashboard = () => {
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const { user } = useAuth();
  const { data: summary, isLoading: isSummaryLoading, isError: isSummaryError, error: summaryError, refetch: refetchSummary } = useQuery({
    queryKey: ["transactions-summary"],
    queryFn: () => transactionsApi.summary(),
  });
  const { data: transactions = [], isLoading: isTransactionsLoading, isError: isTransactionsError, error: transactionsError, refetch: refetchTransactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => transactionsApi.list(),
  });
  const { data: taxEstimates = [], isLoading: isEstimatesLoading, isError: isEstimatesError, error: estimatesError, refetch: refetchEstimates } = useQuery({
    queryKey: ["tax-estimates"],
    queryFn: () => taxEstimatesApi.list(),
  });

  const isLoading = isSummaryLoading || isTransactionsLoading || isEstimatesLoading;
  const isError = isSummaryError || isTransactionsError || isEstimatesError;
  const errorMessage = summaryError?.message || transactionsError?.message || estimatesError?.message || "Failed to load dashboard data.";

  const handleRetry = () => {
    refetchSummary();
    refetchTransactions();
    refetchEstimates();
  };

  const totalTaxDue = (taxEstimates as Array<{ estimated_tax: number }>).reduce(
    (sum, est) => sum + (est.estimated_tax || 0),
    0
  );

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

          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="text-muted-foreground text-sm">Loading your financial data...</p>
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 max-w-xl mx-auto my-12 text-center space-y-4 shadow-sm">
              <h3 className="text-lg font-semibold text-destructive">Unable to load data</h3>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <Button onClick={handleRetry} variant="outline" className="mx-auto border-destructive/30 hover:bg-destructive/10 hover:text-destructive">
                Retry Connection
              </Button>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* <StatCard title="Monthly Income" value={`$${(summary?.income ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`} subtitle="From transactions" type="up" /> */}
                <StatCard
                  title="Monthly Income"
                  value={Number(summary?.income) || 0}
                  subtitle="From transactions"
                  type="up"
                />

                <StatCard
                  title="Monthly Expenses"
                  value={Number(summary?.expense) || 0}
                  subtitle="From transactions"
                  type="down"
                />

                <StatCard
                  title="Estimated Tax Due"
                  value={totalTaxDue}
                  subtitle="From tax estimates"
                  type="warning"
                />

                <StatCard
                  title="Net"
                  value={Number(summary?.net) || 0}
                  subtitle={summary && summary.net >= 0 ? "Positive cash flow" : "Negative cash flow"}
                  type="target"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <IncomeExpenseChart transactions={transactions} />
                </div>
                <ExpenseBreakdown transactions={transactions} />
              </div>

              <TransactionsTable transactions={transactions} />
            </div>
          )}
        </main>
      </div>

      <RecordTransactionDialog open={incomeOpen} onOpenChange={setIncomeOpen} type="income" />
      <RecordTransactionDialog open={expenseOpen} onOpenChange={setExpenseOpen} type="expense" />
    </SidebarProvider>
  );
};

export default Dashboard;
