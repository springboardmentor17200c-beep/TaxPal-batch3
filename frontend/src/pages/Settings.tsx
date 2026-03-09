import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Tag, Bell, Shield, Pencil, X, Plus } from "lucide-react";
import { api } from "@/lib/api";

/* ---------------- TABS ---------------- */

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "categories", label: "Categories", icon: Tag },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

/* -------- COLOR PALETTE (from image spectrum) -------- */

const DOT_COLORS = [
  "#ad2bf4",
  "#d7cf31",
  "#2acb32",
  "#dad3d5",
  "#1e42c9",
  "#2dcfd5",
  "#4f5a0c",
  "#460454",
  "#044f49",
  "#ba360c",
  "#d8348e",
];

/* ---------------- TYPES ---------------- */

interface Category {
  id: number;
  name: string;
  color: string;
}

/* ---------------- INITIAL DATA ---------------- */

const initialExpense: Category[] = [
  { id: 1, name: "Business Expenses", color: "#ad2bf4" },
  { id: 2, name: "Office Rent", color: "#1e42c9" },
  { id: 3, name: "Software Subscriptions", color: "#2dcfd5" },
  { id: 4, name: "Professional Development", color: "#2acb32" },
];

const initialIncome: Category[] = [
  { id: 1, name: "Salary", color: "#2acb32" },
  { id: 2, name: "Freelance", color: "#1e42c9" },
  { id: 3, name: "Investments", color: "#ad2bf4" },
];

/* ================= COMPONENT ================= */

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [catTab, setCatTab] =
    useState<"expense" | "income">("expense");

  const [expenseCategories, setExpenseCategories] =
    useState<Category[]>(initialExpense);

  const [incomeCategories, setIncomeCategories] =
    useState<Category[]>(initialIncome);

  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] =
    useState(DOT_COLORS[0]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    budgetWarnings: true,
    taxReminders: true,
    weeklyDigest: false,
    monthlyReport: true,
  });

  const cats =
    catTab === "expense"
      ? expenseCategories
      : incomeCategories;

  const setCats =
    catTab === "expense"
      ? setExpenseCategories
      : setIncomeCategories;

  /* ---------------- CATEGORY ACTIONS ---------------- */

  const addCategory = async () => {
    if (!newCatName.trim()) {
      setCategoryError("Please enter a category name");
      return;
    }

    setIsAddingCategory(true);
    setCategoryError("");

    try {
      const newCategory = await api<any>("/suggested-categories", {
        method: "POST",
        body: JSON.stringify({
          name: newCatName.trim(),
          type: catTab,
          description: "",
        }),
      });

      setCats((prev) => [
        ...prev,
        {
          id: newCategory._id as unknown as number,
          name: newCategory.name,
          color: newCatColor,
        },
      ]);

      setNewCatName("");
      setCategoryError("");
    } catch (error: any) {
      const errorMsg = error?.message || "Failed to add category";
      setCategoryError(errorMsg);
      console.error("Error adding category:", error);
    } finally {
      setIsAddingCategory(false);
    }
  };

  const removeCategory = (id: number) => {
    setCats((prev) => prev.filter((c) => c.id !== id));
  };

  /* ================= UI ================= */

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-8">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>

          <div className="flex gap-6">

            {/* LEFT NAV */}
            <nav className="w-52 shrink-0">
              <div className="rounded-xl border bg-card overflow-hidden">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm border-b
                    ${
                      activeTab === tab.id
                        ? "bg-primary/5 text-primary"
                        : "text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </nav>

            {/* RIGHT PANEL */}
            <div className="flex-1 rounded-xl border bg-card p-6">

              {/* ================= CATEGORY TAB ================= */}
              {activeTab === "categories" && (
                <div>
                  <h2 className="font-semibold mb-4">
                    Category Management
                  </h2>

                  {/* SWITCH TAB */}
                  <div className="flex gap-2 border-b mb-5">
                    {["expense", "income"].map((t) => (
                      <button
                        key={t}
                        onClick={() =>
                          setCatTab(t as any)
                        }
                        className={`px-4 py-2 border-b-2 ${
                          catTab === t
                            ? "border-primary text-primary"
                            : "border-transparent"
                        }`}
                      >
                        {t.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* CATEGORY LIST */}
                  <div className="space-y-2 mb-6">
                    {cats.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor:
                                cat.color,
                            }}
                          />
                          {cat.name}
                        </div>

                        <button
                          onClick={() =>
                            removeCategory(cat.id)
                          }
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* ADD CATEGORY */}
                  <div className="border-t pt-4">
                    {categoryError && (
                      <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">
                        {categoryError}
                      </div>
                    )}
                    <div className="flex gap-3 items-end">

                      <div className="flex-1">
                        <Label>Name</Label>
                        <Input
                          placeholder="Category name"
                          value={newCatName}
                          onChange={(e) =>
                            setNewCatName(
                              e.target.value
                            )
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            !isAddingCategory &&
                            addCategory()
                          }
                          disabled={isAddingCategory}
                        />
                      </div>

                      {/* PALETTE COLORS */}
                      <div>
                        <Label>Palette</Label>
                        <div className="flex gap-1 mb-2">
                          {DOT_COLORS.map((c) => (
                            <button
                              key={c}
                              onClick={() =>
                                setNewCatColor(c)
                              }
                              className={`h-6 w-6 rounded-full border-2 ${
                                newCatColor === c
                                  ? "border-black scale-110"
                                  : "border-transparent"
                              }`}
                              style={{
                                backgroundColor: c,
                              }}
                              disabled={isAddingCategory}
                            />
                          ))}
                        </div>

                        {/* REAL COLOR PICKER */}
                        <Input
                          type="color"
                          value={newCatColor}
                          onChange={(e) =>
                            setNewCatColor(
                              e.target.value
                            )
                          }
                          disabled={isAddingCategory}
                        />
                      </div>

                      <Button
                        onClick={addCategory}
                        disabled={isAddingCategory}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        {isAddingCategory ? "Adding..." : "Add"}
                      </Button>
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