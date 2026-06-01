import { useState, useEffect, useCallback } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, getCurrencySymbol } from "@/utils/formatCurrency";
import { useAuth } from "@/contexts/AuthContext";
import { taxEstimatesApi } from "@/lib/api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, CalendarDays } from "lucide-react";

const COUNTRIES = ["United States", "Canada", "United Kingdom", "Australia", "Germany", "India"];
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah",
  "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "Other"
];
const INDIA_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Other"
];
const FILING_STATUS = ["Single", "Married Filing Jointly", "Married Filing Separately", "Head of Household"];
const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const QUARTER_LABELS = {
  "Q1": "Jan-Mar",
  "Q2": "Apr-Jun",
  "Q3": "Jul-Sep",
  "Q4": "Oct-Dec"
};
interface TaxSummary {
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  federalTax: number;
  stateTax: number;
  selfEmploymentTax: number;
  totalTax: number;
  effectiveRate: number;
}

interface TaxAlert {
  _id: string;
  type: string;
  message: string;
  alert_date: string;
}

export default function TaxEstimator() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [activeTab, setActiveTab] = useState<"calculator" | "calendar">("calculator");
  const [form, setForm] = useState({
    country: "United States",
    state: "California",
    filingStatus: "Single",
    quarter: "Q2",
    grossIncome: "",
    businessExpenses: "",
    retirementContributions: "",
    healthInsurance: "",
    homeOffice: "",
  });
  const [summary, setSummary] = useState<TaxSummary | null>(null);
  const [alerts, setAlerts] = useState<TaxAlert[]>([]);
  const [calculating, setCalculating] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await taxEstimatesApi.calendar();
      setAlerts(data);
    } catch {
      setAlerts([]);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const symbol = getCurrencySymbol(form.country);

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const calculate = async () => {
    setCalculating(true);
    try {
      const data = await taxEstimatesApi.create({
        country: form.country,
        state: form.state,
        filing_status: form.filingStatus,
        quarter: `${form.quarter} (${QUARTER_LABELS[form.quarter as keyof typeof QUARTER_LABELS]} ${currentYear})`,
        gross_income_for_quarter: Number(form.grossIncome) || 0,
        business_expenses: Number(form.businessExpenses) || 0,
        retirement_contribution: Number(form.retirementContributions) || 0,
        health_insurance_premiums: Number(form.healthInsurance) || 0,
        home_office_deduction: Number(form.homeOffice) || 0,
      });

      setSummary({
        grossIncome: data.grossIncome,
        totalDeductions: data.totalDeductions,
        taxableIncome: data.taxableIncome,
        federalTax: data.federalTax,
        stateTax: data.stateTax,
        selfEmploymentTax: data.selfEmploymentTax,
        totalTax: data.estimated_tax,
        effectiveRate: data.effectiveRate,
      });
      await fetchAlerts();
      toast.success("Tax estimate calculated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to calculate tax estimate");
    } finally {
      setCalculating(false);
    }
  };

  const currentCountryStates = form.country === "India" ? INDIA_STATES : US_STATES;

  const handleCountryChange = (v: string) => {
    set("country", v);
    set("state", v === "India" ? INDIA_STATES[0] : US_STATES[0]);
  };

  const fmt = (n: number) => formatCurrency(n, user?.country);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Tax Estimator</h1>
            <p className="text-sm text-muted-foreground mt-1">Calculate your estimated tax obligations</p>
          </div>

          <div className="flex gap-1 mb-6 border-b">
            {[
              { id: "calculator", label: "Calculator", icon: Calculator },
              { id: "calendar", label: "Tax Calendar", icon: CalendarDays },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as "calculator" | "calendar")}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === "calculator" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-xl border bg-card p-6 space-y-5">
                <h2 className="font-semibold text-foreground">Quarterly Tax Calculator</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Country/Region</Label>
                    <Select value={form.country} onValueChange={handleCountryChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>State/Province</Label>
                    <Select value={form.state} onValueChange={(v) => set("state", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{currentCountryStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Filing Status</Label>
                    <Select value={form.filingStatus} onValueChange={(v) => set("filingStatus", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{FILING_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Quarter</Label>
                    <Select value={form.quarter} onValueChange={(v) => set("quarter", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{QUARTERS.map((q) => <SelectItem key={q} value={q}>{q} ({QUARTER_LABELS[q as keyof typeof QUARTER_LABELS]} {currentYear})</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Income</p>
                  <div className="space-y-1.5">
                    <Label>Gross Income for Quarter</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        {symbol}
                      </span>
                      <Input type="number" placeholder="0.00" className="pl-7" value={form.grossIncome} onChange={(e) => set("grossIncome", e.target.value)} />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Deductions</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Business Expenses", key: "businessExpenses" },
                      { label: "Retirement Contributions", key: "retirementContributions" },
                      { label: "Health Insurance Premiums", key: "healthInsurance" },
                      { label: "Home Office Deduction", key: "homeOffice" },
                    ].map((f) => (
                      <div key={f.key} className="space-y-1.5">
                        <Label>{f.label}</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            {symbol}
                          </span>
                          <Input type="number" placeholder="0.00" className="pl-7" value={(form as Record<string, string>)[f.key]} onChange={(e) => set(f.key, e.target.value)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={calculate} disabled={calculating}>
                    {calculating ? "Calculating..." : "Calculate Estimated Tax"}
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-semibold text-foreground mb-4">Tax Summary</h2>
                {!summary ? (
                  <div className="flex flex-col items-center justify-center h-52 text-center">
                    <Calculator className="h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">Enter your income and deduction details to calculate your estimated quarterly tax.</p>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm">
                    {[
                      { label: "Gross Income", value: fmt(summary.grossIncome), cls: "" },
                      { label: "Total Deductions", value: `-${fmt(summary.totalDeductions)}`, cls: "text-success" },
                      { label: "Taxable Income", value: fmt(summary.taxableIncome), cls: "font-medium" },
                    ].map((r) => (
                      <div key={r.label} className="flex justify-between">
                        <span className="text-muted-foreground">{r.label}</span>
                        <span className={r.cls}>{r.value}</span>
                      </div>
                    ))}
                    <div className="border-t my-2" />
                    {[
                      { label: form.country === "India" ? "Central Tax" : "Federal Tax", value: fmt(summary.federalTax) },
                      { label: `State Tax (${form.state})`, value: fmt(summary.stateTax) },
                      { label: form.country === "India" ? "Professional Tax" : "Self-Employment Tax", value: fmt(summary.selfEmploymentTax) },
                    ].map((r) => (
                      <div key={r.label} className="flex justify-between">
                        <span className="text-muted-foreground">{r.label}</span>
                        <span>{r.value}</span>
                      </div>
                    ))}
                    <div className="border-t my-2" />
                    <div className="flex justify-between font-semibold text-foreground">
                      <span>Total Estimated Tax</span>
                      <span className="text-destructive">{fmt(summary.totalTax)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Effective Tax Rate</span>
                      <span>{summary.effectiveRate.toFixed(1)}%</span>
                    </div>
                    <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                      Quarterly payment due: <strong>{fmt(summary.totalTax)}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === "calendar" && (
            <div className="space-y-8">
              <h2 className="font-semibold text-foreground">Tax Calendar</h2>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Tax Alerts</h3>
              <div className="space-y-3">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <div
                      key={alert._id}
                      className="rounded-xl border bg-card p-4 flex items-start justify-between gap-4"
                    >
                      <div>
                        <p className="font-semibold text-sm text-foreground">
                          {alert.message || "Tax Reminder"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {alert.alert_date ? new Date(alert.alert_date).toDateString() : ""}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Estimated tax payment reminder
                        </p>
                      </div>
                      <span className="shrink-0 text-xs px-2.5 py-1 rounded-full font-medium bg-primary/10 text-primary">
                        {alert.type || "reminder"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No tax alerts available.</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
