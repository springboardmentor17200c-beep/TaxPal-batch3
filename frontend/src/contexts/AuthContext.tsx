import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  country?: string;
  income_bracket?: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (body: { name: string; email: string; password: string; country?: string; income_bracket?: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "taxpal_token";
const USER_KEY = "taxpal_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  const login = useCallback(async (email: string, password: string) => {
    const { authApi } = await import("@/lib/api");
    const { user: u, token: t } = await authApi.login(email, password);
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify({ id: u.id, name: u.name, email: u.email, country: u.country, income_bracket: u.income_bracket }));
    setToken(t);
    setUser({ id: u.id, name: u.name, email: u.email, country: u.country, income_bracket: u.income_bracket });
  }, []);

  const register = useCallback(
    async (body: { name: string; email: string; password: string; country?: string; income_bracket?: string }) => {
      const { authApi } = await import("@/lib/api");
      const { user: u, token: t } = await authApi.register(body);
      localStorage.setItem(TOKEN_KEY, t);
      localStorage.setItem(USER_KEY, JSON.stringify({ id: u.id, name: u.name, email: u.email, country: u.country, income_bracket: u.income_bracket }));
      setToken(t);
      setUser({ id: u.id, name: u.name, email: u.email, country: u.country, income_bracket: u.income_bracket });
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!token) setUser(null);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
