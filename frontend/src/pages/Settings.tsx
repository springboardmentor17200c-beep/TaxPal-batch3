import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Tag, Bell, Shield, Pencil, X, Plus } from "lucide-react";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "categories", label: "Categories", icon: Tag },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

const DOT_COLORS = [
  "#ef4444", "#3b82f6", "#8b5cf6", "#22c55e",
  "#f59e0b", "#ec4899", "#6366f1", "#14b8a6",
];

interface Category {
  id: number;
  name: string;
  color: string;
}

const initialExpense: Category[] = [
  { id: 1, name: "Business Expenses", color: "#ef4444" },
  { id: 2, name: "Office Rent", color: "#3b82f6" },
  { id: 3, name: "Software Subscriptions", color: "#8b5cf6" },
  { id: 4, name: "Professional Development", color: "#22c55e" },
  { id: 5, name: "Marketing", color: "#f59e0b" },
  { id: 6, name: "Travel", color: "#ec4899" },
  { id: 7, name: "Meals & Entertainment", color: "#6366f1" },
  { id: 8, name: "Utilities", color: "#ef4444" },
];

const initialIncome: Category[] = [
  { id: 1, name: "Salary", color: "#22c55e" },
  { id: 2, name: "Freelance", color: "#3b82f6" },
  { id: 3, name: "Investments", color: "#8b5cf6" },
  { id: 4, name: "Rental Income", color: "#f59e0b" },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [catTab, setCatTab] = useState<"expense" | "income">("expense");
  const [expenseCategories, setExpenseCategories] = useState<Category[]>(initialExpense);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>(initialIncome);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(DOT_COLORS[0]);
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    budgetWarnings: true,
    taxReminders: true,
    weeklyDigest: false,
    monthlyReport: true,
  });

  const cats = catTab === "expense" ? expenseCategories : incomeCategories;
  const setCats = catTab === "expense" ? setExpenseCategories : setIncomeCategories;

  const addCategory = () => {
    if (!newCatName.trim()) return;
    setCats((prev) => [...prev, { id: Date.now(), name: newCatName.trim(), color: newCatColor }]);
    setNewCatName("");
  };

  const removeCategory = (id: number) => {
    setCats((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your account settings and preferences</p>
          </div>

          <div className="flex gap-6">
            {/* Left Nav */}
            <nav className="w-52 shrink-0">
              <div className="rounded-xl border bg-card overflow-hidden">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b last:border-0 ${
                      activeTab === tab.id
                        ? "bg-primary/5 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </nav>

            {/* Content */}
            <div className="flex-1 rounded-xl border bg-card p-6">

              {/* Profile */}
              {activeTab === "profile" && (
                <div className="space-y-5">
                  <h2 className="font-semibold text-foreground">Profile Information</h2>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">AM</div>
                    <div>
                      <p className="font-medium text-foreground">Alex Morgan</p>
                      <p className="text-sm text-muted-foreground">alex@example.com</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Full Name", defaultValue: "Alex Morgan" },
                      { label: "Email Address", defaultValue: "alex@example.com" },
                      { label: "Phone Number", defaultValue: "+1 (555) 000-0000" },
                      { label: "Country", defaultValue: "United States" },
                    ].map((f) => (
                      <div key={f.label} className="space-y-1.5">
                        <Label>{f.label}</Label>
                        <Input defaultValue={f.defaultValue} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button>Save Changes</Button>
                  </div>
                </div>
              )}

              {/* Categories */}
              {activeTab === "categories" && (
                <div>
                  <h2 className="font-semibold text-foreground mb-4">Category Management</h2>
                  <div className="flex gap-1 border-b mb-5">
                    {[
                      { id: "expense", label: "Expense Categories" },
                      { id: "income", label: "Income Categories" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setCatTab(t.id as any)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                          catTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 mb-4">
                    {cats.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                          <span className="text-sm text-foreground">{cat.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                          <button className="text-muted-foreground hover:text-destructive" onClick={() => removeCategory(cat.id)}><X className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add new category */}
                  <div className="border-t pt-4">
                    <div className="flex gap-3 items-end">
                      <div className="space-y-1.5 flex-1">
                        <Label>New Category Name</Label>
                        <Input
                          placeholder="Category name..."
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addCategory()}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Color</Label>
                        <div className="flex gap-1.5">
                          {DOT_COLORS.map((c) => (
                            <button
                              key={c}
                              onClick={() => setNewCatColor(c)}
                              className={`h-6 w-6 rounded-full border-2 transition-all ${newCatColor === c ? "border-foreground scale-110" : "border-transparent"}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                      <Button onClick={addCategory} className="gap-1.5 shrink-0">
                        <Plus className="h-4 w-4" /> Add New Category
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === "notifications" && (
                <div className="space-y-5">
                  <h2 className="font-semibold text-foreground">Notification Preferences</h2>
                  <div className="space-y-4">
                    {[
                      { key: "emailAlerts", label: "Email Alerts", desc: "Receive alerts for important account activities" },
                      { key: "budgetWarnings", label: "Budget Warnings", desc: "Get notified when approaching budget limits" },
                      { key: "taxReminders", label: "Tax Payment Reminders", desc: "Reminders before quarterly tax payment deadlines" },
                      { key: "weeklyDigest", label: "Weekly Digest", desc: "Weekly summary of your financial activity" },
                      { key: "monthlyReport", label: "Monthly Report", desc: "Auto-generate and email monthly reports" },
                    ].map((n) => (
                      <div key={n.key} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">{n.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                        </div>
                        <Switch
                          checked={(notifications as any)[n.key]}
                          onCheckedChange={(v) => setNotifications((prev) => ({ ...prev, [n.key]: v }))}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button>Save Preferences</Button>
                  </div>
                </div>
              )}

              {/* Security */}
              {activeTab === "security" && (
                <div className="space-y-5">
                  <h2 className="font-semibold text-foreground">Security Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-3">Change Password</h3>
                      <div className="space-y-3">
                        {["Current Password", "New Password", "Confirm New Password"].map((label) => (
                          <div key={label} className="space-y-1.5">
                            <Label>{label}</Label>
                            <Input type="password" placeholder="••••••••" />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button>Update Password</Button>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Add an extra layer of security to your account</p>
                        </div>
                        <Button variant="outline" size="sm">Enable 2FA</Button>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-foreground mb-2">Active Sessions</p>
                      <div className="rounded-lg border p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-foreground">Current Session</p>
                          <p className="text-xs text-muted-foreground">Browser · Last active now</p>
                        </div>
                        <span className="text-xs text-success font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
