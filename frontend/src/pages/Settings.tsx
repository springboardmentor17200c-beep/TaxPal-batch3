import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lock, Shield, Globe, Clock, LogOut, User, Tag, Bell, Pencil, X, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

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
   id: string; // ✅ change from number → string
  name: string;
  color: string;
}

/* ---------------- INITIAL DATA ---------------- */

// const initialExpense: Category[] = [
//   { id: 1, name: "Business Expenses", color: "#ad2bf4" },
//   { id: 2, name: "Office Rent", color: "#1e42c9" },
//   { id: 3, name: "Software Subscriptions", color: "#2dcfd5" },
//   { id: 4, name: "Professional Development", color: "#2acb32" },
// ];

// const initialIncome: Category[] = [
//   { id: 1, name: "Salary", color: "#2acb32" },
//   { id: 2, name: "Freelance", color: "#1e42c9" },
//   { id: 3, name: "Investments", color: "#ad2bf4" },
// ];

/* ================= COMPONENT ================= */

export default function Settings() {
  useEffect(() => {
  const fetchCategories = async () => {
    try {
      const data = await api<any[]>("/suggested-categories");

      console.log("DATA FROM BACKEND:", data);

      const expense = data.filter((c) => c.type === "expense");
      const income = data.filter((c) => c.type === "income");

      setExpenseCategories(
        expense.map((c) => ({
          id: c._id,
          name: c.name,
          color: c.color || "#ad2bf4",
        }))
      );

      setIncomeCategories(
        income.map((c) => ({
          id: c._id,
          name: c.name,
          color: c.color || "#2acb32",
        }))
      );
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  fetchCategories();
}, []);

  const [activeTab, setActiveTab] = useState("profile");
  const [catTab, setCatTab] =
    useState<"expense" | "income">("expense");

  const [expenseCategories, setExpenseCategories] =
    useState<Category[]>([]);

  const [incomeCategories, setIncomeCategories] =
    useState<Category[]>([]);

  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] =
    useState(DOT_COLORS[0]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  // Security tab states
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [sessions] = useState([
    {
      device: "Chrome on Mac",
      location: "New York, USA",
      lastActive: "2 minutes ago",
    },
    {
      device: "Safari on iPhone",
      location: "San Francisco, USA",
      lastActive: "1 hour ago",
    },
    {
      device: "Firefox on Windows",
      location: "London, UK",
      lastActive: "3 days ago",
    },
  ]);

  // Notifications tab states
  const notificationTypes = [
    "Tax Filing Deadlines",
    "Budget Overages", 
    "Large Transactions (> $500)",
    "Weekly Financial Summary",
  ];

  const [notificationSettings, setNotificationSettings] = useState({
    email: { enabled: true },
    push: { enabled: true },
  });

  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");

  // Profile tab states
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, New York, NY 10001",
    taxId: "XXX-XX-1234",
    filingStatus: "Single",
    professionalRole: "Freelancer",
    memberSince: "Jan 2024",
    verified: true,
  });

  const filingStatuses = ["Single", "Married Filing Jointly", "Married Filing Separately", "Head of Household"];
  const roles = ["Freelancer", "Small Business Owner", "Salaried Employee", "Investor"];

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
        // body: JSON.stringify({
        //   name: newCatName.trim(),
        //   type: catTab,
        //   description: "",
        // }),
        body: JSON.stringify({
          name: newCatName.trim(),
          type: catTab,
          description: "",
          color: newCatColor, // 🔥 IMPORTANT
        }),
      });

      setCats((prev) => [
        ...prev,
        {
          // id: newCategory._id as unknown as number,
          id: newCategory._id ,
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

  // const removeCategory = (id: number) => {
  //   setCats((prev) => prev.filter((c) => c.id !== id));
  // };
  const removeCategory = async (id: string) => {
  try {
    await api(`/suggested-categories/${id}`, {
      method: "DELETE",
    });

    // remove from UI after backend success
    setCats((prev) => prev.filter((c) => c.id !== id));
      } catch (err) {
        console.error("Delete failed:", err);
      }
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

              {/* ================= PROFILE TAB ================= */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  {/* Main Profile Card */}
                  <Card className="border-gray-200">
                    <CardHeader>
                      <CardTitle>My Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {/* Avatar and Stats */}
                      <div className="grid grid-cols-5 gap-8 p-8">
                        {/* Avatar Column */}
                        <div className="col-span-1 flex flex-col items-center space-y-4">
                          <div className="relative group">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-4xl font-semibold text-gray-500 overflow-hidden border-4 border-white shadow-lg">
                              JD
                            </div>
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-full transition-all flex items-center justify-center">
                              <Pencil className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div className="text-xs text-center text-muted-foreground space-y-1">
                            <p>Upload Photo</p>
                            <Button variant="ghost" size="sm" className="h-8 text-xs px-3">Edit</Button>
                            <Button variant="ghost" size="sm" className="h-8 text-xs px-3 text-destructive hover:text-destructive">Remove</Button>
                          </div>
                        </div>

                        {/* Stats and Edit Controls */}
                        <div className="col-span-4 flex flex-col justify-center">
                          <div className="flex gap-6 mb-6 text-sm text-muted-foreground">
                            <div>Member since {profile.memberSince}</div>
                            <Badge variant={profile.verified ? "default" : "secondary"}>
                              {profile.verified ? "Verified" : "Pending"}
                            </Badge>
                          </div>
                          <div className="flex gap-3">
                            <Button 
                              className={`px-6 ${isEditing ? "bg-gray-100 hover:bg-gray-200 text-gray-700" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                              onClick={() => setIsEditing(!isEditing)}
                            >
                              {isEditing ? "Cancel" : "Edit Profile"}
                            </Button>
                            {isEditing && (
                              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                                Save Changes
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Personal Information */}
                      <div className="p-8 border-t">
                        <h3 className="text-lg font-semibold mb-6">Personal Information</h3>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input 
                              value={profile.fullName}
                              onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                              disabled={!isEditing}
                              className={`ring-2 ring-transparent focus:ring-blue-500 focus:border-blue-500 transition-all ${!isEditing ? 'bg-gray-50' : ''}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input 
                              value={profile.email}
                              onChange={(e) => setProfile({...profile, email: e.target.value})}
                              disabled={!isEditing}
                              className={`ring-2 ring-transparent focus:ring-blue-500 focus:border-blue-500 transition-all ${!isEditing ? 'bg-gray-50' : ''}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input 
                              value={profile.phone}
                              onChange={(e) => setProfile({...profile, phone: e.target.value})}
                              disabled={!isEditing}
                              className={`ring-2 ring-transparent focus:ring-blue-500 focus:border-blue-500 transition-all ${!isEditing ? 'bg-gray-50' : ''}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Mailing Address</Label>
                            <Input 
                              value={profile.address}
                              onChange={(e) => setProfile({...profile, address: e.target.value})}
                              disabled={!isEditing}
                              className={`ring-2 ring-transparent focus:ring-blue-500 focus:border-blue-500 transition-all ${!isEditing ? 'bg-gray-50' : ''}`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Tax Identity */}
                      <div className="p-8 border-t bg-gray-50">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                          <Shield className="h-5 w-5 text-blue-600" />
                          Tax Identity
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Tax ID/SSN</Label>
                            <Input 
                              value={profile.taxId}
                              onChange={(e) => setProfile({...profile, taxId: e.target.value})}
                              disabled={!isEditing}
                              className={`ring-2 ring-transparent focus:ring-blue-500 focus:border-blue-500 transition-all ${!isEditing ? 'bg-gray-100' : ''}`}
                              type="password"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Filing Status</Label>
                            <select 
                              value={profile.filingStatus}
                              onChange={(e) => setProfile({...profile, filingStatus: e.target.value})}
                              disabled={!isEditing}
                              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${!isEditing ? 'bg-gray-50 text-gray-500' : ''}`}
                            >
                              {filingStatuses.map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2 col-span-2">
                            <Label>Professional Role</Label>
                            <Input 
                              value={profile.professionalRole}
                              onChange={(e) => setProfile({...profile, professionalRole: e.target.value})}
                              disabled={!isEditing}
                              className={`ring-2 ring-transparent focus:ring-blue-500 focus:border-blue-500 transition-all ${!isEditing ? 'bg-gray-50' : ''}`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Data Export */}
                      <div className="p-8 border-t">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">Download My Data</h3>
                            <p className="text-sm text-muted-foreground">Export all your TaxPal data for backup or transfer.</p>
                          </div>
                          <Button className="bg-blue-600 hover:bg-blue-700 px-8">
                            Download Data
                          </Button>
                        </div>
                      </div>

                      {/* Danger Zone */}
                      <div className="p-8 border-t border-destructive/20 bg-destructive/5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-destructive mb-1">Danger Zone</h3>
                            <p className="text-sm text-muted-foreground">Delete your TaxPal account and all associated data. This action cannot be undone.</p>
                          </div>
                          <Button variant="destructive" className="border-destructive bg-destructive/90 hover:bg-destructive">
                            Deactivate Account
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

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

              {/* ================= NOTIFICATIONS TAB ================= */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notification Preferences
                      </CardTitle>
                      <CardDescription>
                        Manage how you receive notifications from TaxPal.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Notification Matrix Table */}
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold mb-4">Notification Types</h3>
                          <div className="border rounded-lg">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Notification Type</TableHead>
                                  <TableHead className="text-center">Email</TableHead>
                                  <TableHead className="text-center">Push</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {notificationTypes.map((type, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">{type}</TableCell>
                                    <TableCell className="text-center">
                                      <Switch 
                                        checked={notificationSettings.email.enabled}
                                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, email: { enabled: checked } }))}
                                      />
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Switch 
                                        checked={notificationSettings.push.enabled}
                                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, push: { enabled: checked } }))}
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        {/* Quiet Hours */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Quiet Hours</h3>
                          <div className="border p-6 rounded-lg">
                            <div className="flex items-center gap-3 mb-4">
                              <Switch 
                                id="quiet-hours"
                                checked={quietHoursEnabled}
                                onCheckedChange={setQuietHoursEnabled}
                              />
                              <Label htmlFor="quiet-hours" className="font-medium text-lg">
                                Pause notifications during quiet hours
                              </Label>
                            </div>
                            {quietHoursEnabled && (
                              <div className="grid grid-cols-3 gap-4 items-end">
                                <div className="space-y-1">
                                  <Label htmlFor="quiet-start">Start</Label>
                                  <Input 
                                    id="quiet-start" 
                                    type="time" 
                                    value={quietStart}
                                    onChange={(e) => setQuietStart(e.target.value)}
                                  />
                                </div>
                                <div className="text-center text-muted-foreground font-medium">
                                  to
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="quiet-end">End</Label>
                                  <Input 
                                    id="quiet-end" 
                                    type="time" 
                                    value={quietEnd}
                                    onChange={(e) => setQuietEnd(e.target.value)}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ================= SECURITY TAB ================= */}
              {activeTab === "security" && (
                <div className="flex flex-col gap-6">
                  {/* Change Password Card */}
                  <Card className="border-gray-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Change Password
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" placeholder="Enter current password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" placeholder="Enter new password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" placeholder="Confirm new password" />
                      </div>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Update Password
                      </Button>
                    </CardContent>
                  </Card>

                  {/* 2FA Card */}
                  <Card className="border-gray-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Two-Factor Authentication
                      </CardTitle>
                      <CardDescription>
                        Secure your account with an app like Google Authenticator.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between pt-0">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="two-fa"
                          checked={twoFaEnabled}
                          onCheckedChange={setTwoFaEnabled}
                        />
                        <Label htmlFor="two-fa" className="font-medium">
                          Enable Two-Factor Authentication
                        </Label>
                      </div>
                      <Badge variant={twoFaEnabled ? "default" : "secondary"} className="capitalize">
                        {twoFaEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </CardContent>
                  </Card>

                  {/* Active Sessions Card */}
                  <Card className="border-gray-100">
                    <CardHeader>
                      <CardTitle>Active Sessions</CardTitle>
                      <CardDescription>
                        Manage your active sessions across devices.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[200px]">Device</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Last Active</TableHead>
                              <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sessions.map((session, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{session.device}</TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>{session.location}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>{session.lastActive}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" className="h-8">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
