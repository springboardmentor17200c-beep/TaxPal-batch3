import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in on load
        const currentUser = authAPI.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const updateUser = (userData) => {
        setUser((prev) => ({ ...prev, ...userData }));
    };

    const logout = () => {
        authAPI.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <UserContext.Provider value={{ user, updateUser, isAuthenticated, setIsAuthenticated, logout, loading }}>
            {children}
        </UserContext.Provider>
    );
};
