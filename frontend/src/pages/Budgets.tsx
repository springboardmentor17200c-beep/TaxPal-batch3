import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { budgetsApi } from "@/lib/api";
import { toast } from "sonner";

const CATEGORIES = [
  "Rent/Mortgage",
  "Business Expenses",
  "Utilities",
  "Food & Groceries",
  "Transportation",
  "Health & Insurance",
  "Entertainment",
  "Marketing",
  "Software Subscriptions",
  "Other",
];

function getStatus(budget: number, spent: number) {
  const pct = budget ? spent / budget : 0;
  if (pct > 1) return { label: "Over Budget", cls: "text-destructive bg-destructive/10" };
  if (pct >= 0.85) return { label: "At Risk", cls: "text-warning bg-warning/10" };
  return { label: "On Track", cls: "text-success bg-success/10" };
}

export default function Budgets() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category: "",
    amount: "",
    month: new Date().toISOString().slice(0, 7),
    description: "",
  });
  const queryClient = useQueryClient();

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => budgetsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (body: { category: string; budget_amount: number; month: string; description?: string }) =>
      budgetsApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setForm({ category: "", amount: "", month: new Date().toISOString().slice(0, 7), description: "" });
      setShowForm(false);
      toast.success("Budget created");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to create budget"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => budgetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to delete"),
  });

  const totalBudget = budgets.reduce((s, b) => s + b.budget, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  const handleCreate = () => {
    if (!form.category || !form.amount) return;
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) return;
    createMutation.mutate({
      category: form.category,
      budget_amount: amt,
      month: form.month,
      description: form.description || undefined,
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Budgets</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your monthly spending limits</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Create New Budget
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Budget", value: `$${totalBudget.toLocaleString()}`, cls: "text-foreground" },
              { label: "Total Spent", value: `$${totalSpent.toLocaleString()}`, cls: "text-destructive" },
              { label: "Remaining", value: `$${totalRemaining.toLocaleString()}`, cls: totalRemaining >= 0 ? "text-success" : "text-destructive" },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border bg-card p-5">
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className={`text-2xl font-bold mt-1 ${c.cls}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {showForm && (
            <div className="rounded-xl border bg-card p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Create New Budget</h2>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Budget Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="pl-7"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Month</Label>
                  <Input
                    type="month"
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    placeholder="Add any additional details..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Budget"}
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  {["Category", "Budget", "Spent", "Remaining", "Progress", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : (
                  budgets.map((b) => {
                    const remaining = b.budget - b.spent;
                    const pct = b.budget ? Math.min((b.spent / b.budget) * 100, 100) : 0;
                    const status = getStatus(b.budget, b.spent);
                    return (
                      <tr key={b._id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{b.category}</td>
                        <td className="px-4 py-3 text-muted-foreground">${b.budget.toLocaleString()}</td>
                        <td className="px-4 py-3 text-muted-foreground">${b.spent.toLocaleString()}</td>
                        <td className={`px-4 py-3 font-medium ${remaining < 0 ? "text-destructive" : "text-success"}`}>
                          {remaining < 0 ? "-" : ""}${Math.abs(remaining).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 w-36">
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-destructive" : pct >= 85 ? "bg-warning" : "bg-success"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground mt-0.5 block">{pct.toFixed(0)}%</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.cls}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                            <button className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(b._id)} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            {!isLoading && budgets.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">No budgets created yet.</div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
