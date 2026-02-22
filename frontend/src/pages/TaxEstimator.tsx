import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, CalendarDays } from "lucide-react";

const COUNTRIES = ["United States", "Canada", "United Kingdom", "Australia", "Germany"];
const US_STATES = ["California", "New York", "Texas", "Florida", "Illinois", "Washington", "Other"];
const FILING_STATUS = ["Single", "Married Filing Jointly", "Married Filing Separately", "Head of Household"];
const QUARTERS = ["Q1 (Jan-Mar 2025)", "Q2 (Apr-Jun 2025)", "Q3 (Jul-Sep 2025)", "Q4 (Oct-Dec 2025)"];

const TAX_CALENDAR = [
  {
    month: "June 2025",
    events: [
      { title: "Reminder: Q2 Estimated Tax Payment", date: "Jun 1, 2025", desc: "Reminder for upcoming q2 estimated tax payment due on Jun 15, 2025", type: "reminder" },
      { title: "Q2 Estimated Tax Payment", date: "Jun 15, 2025", desc: "Second quarter estimated tax payment due", type: "payment" },
    ],
  },
  {
    month: "September 2025",
    events: [
      { title: "Reminder: Q3 Estimated Tax Payment", date: "Sep 1, 2025", desc: "Reminder for upcoming q3 estimated tax payment due on Sep 15, 2025", type: "reminder" },
      { title: "Q3 Estimated Tax Payment", date: "Sep 15, 2025", desc: "Third quarter estimated tax payment due", type: "payment" },
    ],
  },
  {
    month: "December 2025",
    events: [
      { title: "Reminder: Q4 Estimated Tax Payment", date: "Dec 1, 2025", desc: "Reminder for upcoming q4 estimated tax payment due on Jan 15, 2026", type: "reminder" },
      { title: "Q4 Estimated Tax Payment", date: "Jan 15, 2026", desc: "Fourth quarter estimated tax payment due", type: "payment" },
    ],
  },
];

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

export default function TaxEstimator() {
  const [activeTab, setActiveTab] = useState<"calculator" | "calendar">("calculator");
  const [form, setForm] = useState({
    country: "United States",
    state: "California",
    filingStatus: "Single",
    quarter: "Q2 (Apr-Jun 2025)",
    grossIncome: "",
    businessExpenses: "",
    retirementContributions: "",
    healthInsurance: "",
    homeOffice: "",
  });
  const [summary, setSummary] = useState<TaxSummary | null>(null);

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const calculate = () => {
    const gross = parseFloat(form.grossIncome) || 0;
    const deductions =
      (parseFloat(form.businessExpenses) || 0) +
      (parseFloat(form.retirementContributions) || 0) +
      (parseFloat(form.healthInsurance) || 0) +
      (parseFloat(form.homeOffice) || 0);
    const taxable = Math.max(0, gross - deductions);
    const annualTaxable = taxable * 4;
    let federalRate = 0.22;
    if (annualTaxable < 11000) federalRate = 0.10;
    else if (annualTaxable < 44725) federalRate = 0.12;
    else if (annualTaxable < 95375) federalRate = 0.22;
    else if (annualTaxable < 200000) federalRate = 0.24;
    else federalRate = 0.32;
    const federalTax = (taxable * federalRate);
    const stateTax = taxable * 0.093;
    const selfEmployment = gross * 0.1413;
    const total = federalTax + stateTax + selfEmployment;
    setSummary({
      grossIncome: gross,
      totalDeductions: deductions,
      taxableIncome: taxable,
      federalTax,
      stateTax,
      selfEmploymentTax: selfEmployment,
      totalTax: total,
      effectiveRate: gross > 0 ? (total / gross) * 100 : 0,
    });
  };

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const badgeClass: Record<string, string> = {
    reminder: "bg-primary/10 text-primary",
    payment: "bg-warning/10 text-warning",
  };

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
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === t.id
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
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 rounded-xl border bg-card p-6 space-y-5">
                <h2 className="font-semibold text-foreground">Quarterly Tax Calculator</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Country/Region</Label>
                    <Select value={form.country} onValueChange={(v) => set("country", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>State/Province</Label>
                    <Select value={form.state} onValueChange={(v) => set("state", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
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
                      <SelectContent>{QUARTERS.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Income</p>
                  <div className="space-y-1.5">
                    <Label>Gross Income for Quarter</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input type="number" placeholder="0.00" className="pl-7" value={form.grossIncome} onChange={(e) => set("grossIncome", e.target.value)} />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Deductions</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Business Expenses", key: "businessExpenses" },
                      { label: "Retirement Contributions", key: "retirementContributions" },
                      { label: "Health Insurance Premiums", key: "healthInsurance" },
                      { label: "Home Office Deduction", key: "homeOffice" },
                    ].map((f) => (
                      <div key={f.key} className="space-y-1.5">
                        <Label>{f.label}</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                          <Input type="number" placeholder="0.00" className="pl-7" value={(form as any)[f.key]} onChange={(e) => set(f.key, e.target.value)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={calculate}>Calculate Estimated Tax</Button>
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
                      { label: "Federal Tax", value: fmt(summary.federalTax) },
                      { label: "State Tax (CA)", value: fmt(summary.stateTax) },
                      { label: "Self-Employment Tax", value: fmt(summary.selfEmploymentTax) },
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
              {TAX_CALENDAR.map((group) => (
                <div key={group.month}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">{group.month}</h3>
                  <div className="space-y-3">
                    {group.events.map((ev) => (
                      <div key={ev.title} className="rounded-xl border bg-card p-4 flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-sm text-foreground">{ev.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{ev.date}</p>
                          <p className="text-sm text-muted-foreground mt-1">{ev.desc}</p>
                        </div>
                        <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${badgeClass[ev.type]}`}>
                          {ev.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}

const badgeClass: Record<string, string> = {
  reminder: "bg-primary/10 text-primary",
  payment: "bg-warning/10 text-warning",
};
