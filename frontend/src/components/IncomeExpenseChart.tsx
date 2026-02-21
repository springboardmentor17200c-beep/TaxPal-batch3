import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subMonths } from "date-fns";

const defaultData = [
  { month: "Jan", Income: 7800, Expenses: 2800 },
  { month: "Feb", Income: 6500, Expenses: 3200 },
  { month: "Mar", Income: 8200, Expenses: 2500 },
  { month: "Apr", Income: 7000, Expenses: 3100 },
  { month: "May", Income: 8500, Expenses: 3000 },
  { month: "Jun", Income: 7200, Expenses: 2900 },
];

type Tx = { date: string; type: string; amount: number };

const IncomeExpenseChart = ({ transactions = [] }: { transactions?: Tx[] }) => {
  const [period, setPeriod] = useState<"Year" | "Quarter" | "Month">("Year");
  const data = useMemo(() => {
    if (!transactions.length) return defaultData;
    const keys: string[] = [];
    const byMonth: Record<string, { month: string; Income: number; Expenses: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const key = format(d, "yyyy-MM");
      keys.push(key);
      byMonth[key] = { month: format(d, "MMM"), Income: 0, Expenses: 0 };
    }
    transactions.forEach((t) => {
      const key = format(new Date(t.date), "yyyy-MM");
      if (!byMonth[key]) return;
      if (t.type === "income") byMonth[key].Income += t.amount;
      else byMonth[key].Expenses += Math.abs(t.amount);
    });
    return keys.map((k) => byMonth[k]).filter(Boolean);
  }, [transactions]);

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-card-foreground">Income vs Expenses</h3>
        <div className="flex gap-1 rounded-lg border p-0.5">
          {(["Year", "Quarter", "Month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                period === p
                  ? "bg-card-foreground text-card"
                  : "text-muted-foreground hover:text-card-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
          <YAxis axisLine={false} tickLine={false} className="text-xs" tickFormatter={(v) => `$${v / 1000}k`} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
          />
          <Legend />
          <Bar dataKey="Income" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Expenses" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeExpenseChart;
