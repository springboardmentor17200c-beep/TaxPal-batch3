import { LayoutDashboard, ArrowLeftRight, Wallet, Calculator, FileText, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
  { title: "Budgets", url: "/budgets", icon: Wallet },
  { title: "Tax Estimator", url: "/tax-estimator", icon: Calculator },
  { title: "Reports", url: "/reports", icon: FileText },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <Sidebar className="w-60 border-r">
      <div className="p-5">
        <h1 className="text-xl font-bold text-sidebar-primary">TaxPal</h1>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-primary truncate">{user?.name ?? "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <NavLink
            to="/settings"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            activeClassName="text-foreground"
          >
            <Settings className="h-3 w-3" /> Settings
          </NavLink>
          <button type="button" onClick={handleLogout} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <LogOut className="h-3 w-3" /> Logout
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
