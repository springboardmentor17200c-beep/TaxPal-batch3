import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { authApi } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  country?: string;
  income_bracket?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  filing_status?: string;
  professional_role?: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (body: {
    name: string;
    email: string;
    password: string;
    country?: string;
    income_bracket?: string;
    phone?: string;
    address?: string;
    tax_id?: string;
    filing_status?: string;
    professional_role?: string;
  }) => Promise<void>;
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

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  const login = useCallback(async (email: string, password: string) => {
    const { user: u, token: t } = await authApi.login(email.trim().toLowerCase(), password);

    const finalUser: User = {
      id: u.id,
      name: u.name,
      email: u.email,
      country: u.country || "United States",
      income_bracket: u.income_bracket,
    };

    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(finalUser));

    setToken(t);
    setUser(finalUser);
  }, []);

  const register = useCallback(
    async (body: {
      name: string;
      email: string;
      password: string;
      country?: string;
      income_bracket?: string;
      phone?: string;
      address?: string;
      tax_id?: string;
      filing_status?: string;
      professional_role?: string;
    }) => {
      let u: { id: string; name: string; email: string; country?: string; income_bracket?: string };
      let t: string;

      const result = await authApi.register(body);

      if ("requiresPasswordReset" in result && result.requiresPasswordReset) {
        await authApi.resetPassword(body.email, body.password);
        const loginResult = await authApi.login(body.email, body.password);
        u = loginResult.user;
        t = loginResult.token;
      } else {
        u = result.user;
        t = result.token;
      }

      const finalUser: User = {
        id: u.id,
        name: u.name,
        email: u.email,
        country: body.country || u.country || "United States",
        income_bracket: body.income_bracket || u.income_bracket,
        phone: body.phone,
        address: body.address,
        tax_id: body.tax_id,
        filing_status: body.filing_status,
        professional_role: body.professional_role,
      };

      localStorage.setItem(TOKEN_KEY, t);
      localStorage.setItem(USER_KEY, JSON.stringify(finalUser));

      setToken(t);
      setUser(finalUser);
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
  if (!ctx)
    throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}