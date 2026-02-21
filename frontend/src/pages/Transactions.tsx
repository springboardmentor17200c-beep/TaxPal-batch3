import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, ArrowUpRight, ArrowDownLeft, Filter } from "lucide-react";
import RecordTransactionDialog from "@/components/RecordTransactionDialog";
import { transactionsApi } from "@/lib/api";
import { format } from "date-fns";

export default function Transactions() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: list = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => transactionsApi.list(),
  });

  const filtered = list.filter((t) => {
    const desc = (t.description || t.category || "").toLowerCase();
    const matchSearch = !search || desc.includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || t.type === typeFilter;
    const matchCat = categoryFilter === "all" || t.category === categoryFilter;
    return matchSearch && matchType && matchCat;
  });

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0);
  const categories = [...new Set(list.map((t) => t.category))];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
              <p className="text-sm text-muted-foreground mt-1">View and manage all your transactions</p>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Add Transaction
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Income", value: `$${totalIncome.toLocaleString()}`, cls: "text-success" },
              { label: "Total Expenses", value: `$${totalExpense.toLocaleString()}`, cls: "text-destructive" },
              { label: "Net", value: `$${(totalIncome - totalExpense).toLocaleString()}`, cls: totalIncome - totalExpense >= 0 ? "text-success" : "text-destructive" },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border bg-card p-5">
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className={`text-2xl font-bold mt-1 ${c.cls}`}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search transactions..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  {["Date", "Description", "Category", "Amount", "Type"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t._id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{format(new Date(t.date), "MMM d, yyyy")}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{t.description || t.category}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">{t.category}</span>
                      </td>
                      <td className={`px-4 py-3 font-semibold ${t.type === "income" ? "text-success" : "text-destructive"}`}>
                        {t.type === "income" ? "+" : ""}{t.amount < 0 ? `-$${Math.abs(t.amount).toLocaleString()}` : `$${t.amount.toLocaleString()}`}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-xs font-medium ${
                          t.type === "income" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                        }`}>
                          {t.type === "income" ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                          {t.type}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {!isLoading && filtered.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">No transactions found.</div>
            )}
          </div>
        </main>
      </div>
      <RecordTransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </SidebarProvider>
  );
}
