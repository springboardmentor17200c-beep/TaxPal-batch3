import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type Tx = { _id: string; date: string; description?: string; category: string; amount: number; type: string };

const TransactionsTable = ({ transactions = [] }: { transactions?: Tx[] }) => {
  const recent = transactions.slice(0, 5);
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-card-foreground">Recent Transactions</h3>
        <Link to="/transactions" className="text-sm font-medium text-primary hover:underline">View All</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Description</th>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Type</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No transactions yet.</td></tr>
            ) : (
              recent.map((t) => (
                <tr key={t._id} className="border-b last:border-0">
                  <td className="py-3 text-muted-foreground">{format(new Date(t.date), "MMM d, yyyy")}</td>
                  <td className="py-3 text-card-foreground">{t.description || t.category}</td>
                  <td className="py-3 text-muted-foreground">{t.category}</td>
                  <td className={`py-3 font-medium ${t.type === "income" ? "text-success" : "text-destructive"}`}>
                    {t.type === "income" ? "+" : "-"}${Math.abs(t.amount).toLocaleString()}
                  </td>
                  <td className="py-3">
                    <Badge variant={t.type === "income" ? "default" : "destructive"} className="text-xs">
                      {t.type}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTable;
