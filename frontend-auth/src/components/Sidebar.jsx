import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, TrendingUp, TrendingDown, PieChart, Settings, LogOut } from "lucide-react";
import "../styles/dashboard.css";

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: "/dashboard", name: "Dashboard", icon: <LayoutDashboard size={20} /> },
        { path: "/income", name: "Income", icon: <TrendingUp size={20} /> },
        { path: "/expenses", name: "Expenses", icon: <TrendingDown size={20} /> },
    ];

    const handleLogout = () => {
        // TODO: Clear auth state
        navigate("/login");
    };

    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">T</div>
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
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
