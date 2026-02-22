import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, FileText } from "lucide-react";
import { reportsApi } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";

const REPORT_TYPES = ["Income Statement", "Expense Report", "Cash Flow Statement", "Tax Summary", "Profit & Loss"];
const PERIODS = ["Current Month", "Last Month", "Last 3 Months", "Last 6 Months", "Year to Date", "Last Year"];
const FORMATS = ["PDF", "CSV", "Excel"];

export default function Reports() {
  const [reportType, setReportType] = useState("Income Statement");
  const [period, setPeriod] = useState("Current Month");
  const [formatSel, setFormatSel] = useState("PDF");
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => reportsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (body: { period: string; report_type: string; format?: string }) => reportsApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report generated");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to generate report"),
  });

  const handleReset = () => {
    setReportType("Income Statement");
    setPeriod("Current Month");
    setFormatSel("PDF");
  };

  const handleGenerate = () => {
    createMutation.mutate({ period, report_type: reportType, format: formatSel });
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Financial Reports</h1>
            <p className="text-sm text-muted-foreground mt-1">Generate and download your financial reports</p>
          </div>

          <div className="rounded-xl border bg-card p-6 mb-6">
            <h2 className="font-semibold text-foreground mb-4">Generate Report</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="space-y-1.5">
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Period</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PERIODS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Format</Label>
                <Select value={formatSel} onValueChange={setFormatSel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FORMATS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleReset}>Reset</Button>
              <Button onClick={handleGenerate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold text-foreground">Recent Reports</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  {["Report Name", "Generated", "Period", "Format", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : (
                  reports.map((r) => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{r.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {r.generated ? format(new Date(r.generated), "MMM d, yyyy") : ""}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{r.period}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">{r.format}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium">
                          <Download className="h-3.5 w-3.5" /> Download
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {!isLoading && reports.length === 0 && (
              <div className="py-12 text-center text-muted-foreground text-sm">No results.</div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
