import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, TrendingUp, TrendingDown, PieChart, Settings, LogOut, FileText, DollarSign } from "lucide-react";
import "../styles/dashboard.css";
import { useUser } from "../context/UserContext";

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useUser(); // Assuming useUser provides user details

    // Updated menu items based on user request
    const menuItems = [
        { path: "/dashboard", name: "Dashboard", icon: <LayoutDashboard size={20} /> },
        { path: "/transactions", name: "Transactions", icon: <TrendingUp size={20} /> }, // Using TrendingUp as placeholder for Transactions
        { path: "/budgets", name: "Budgets", icon: <PieChart size={20} /> },
        { path: "/tax-estimation", name: "TAX Estimatione", icon: <DollarSign size={20} /> },
        { path: "/report", name: "Report", icon: <FileText size={20} /> },
    ];

    const handleLogout = () => {
        // TODO: Clear auth state
        navigate("/login");
    };

    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                {/* <div className="logo-icon">T</div>  Removing old logo icon if not in design, keeping simplistic */}
                <h2>TaxPal</h2>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile-sidebar">
                    <div className="avatar-circle">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "B"}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{user?.name || "BBBBBB"}</span>
                        <span className="user-email">{user?.email || "Abcd@gmail.com"}</span>
                    </div>
                </div>
                <div className="sidebar-actions">
                    <button className="settings-btn" onClick={() => navigate('/settings')}>
                        <Settings size={20} />
                        <span>Settings</span>
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>LogOut</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
