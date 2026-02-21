import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ["hsl(211, 100%, 50%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(262, 52%, 47%)"];
const defaultData = [
  { name: "Rent/Mortgage", value: 32, color: COLORS[0] },
  { name: "Business Expenses", value: 28, color: COLORS[1] },
  { name: "Utilities", value: 15, color: COLORS[2] },
  { name: "Food", value: 12, color: COLORS[3] },
  { name: "Other", value: 13, color: COLORS[4] },
];

type Tx = { category: string; type: string; amount: number };

const ExpenseBreakdown = ({ transactions = [] }: { transactions?: Tx[] }) => {
  const data = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "expense");
    if (!expenses.length) return defaultData;
    const byCat: Record<string, number> = {};
    let total = 0;
    expenses.forEach((t) => {
      byCat[t.category] = (byCat[t.category] || 0) + Math.abs(t.amount);
      total += Math.abs(t.amount);
    });
    const entries = Object.entries(byCat).map(([name], i) => ({
      name,
      value: total ? Math.round((byCat[name] / total) * 100) : 0,
      color: COLORS[i % COLORS.length],
    }));
    return entries.length ? entries : defaultData;
  }, [transactions]);
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="mb-4 font-semibold text-card-foreground">Expense Breakdown</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value}%`, undefined]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-3 space-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-medium text-card-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseBreakdown;
