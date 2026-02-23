import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

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
  register: (body: {
    name: string;
    email: string;
    password: string;
    country?: string;
    income_bracket?: string;
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

  // ✅ LOGIN
  const login = useCallback(async (email: string, password: string) => {
    const { authApi } = await import("@/lib/api");
    const { user: u, token: t } = await authApi.login(email, password);

    // 🔥 Force store country even if backend doesn't return it properly
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

  // ✅ REGISTER (THIS IS THE IMPORTANT FIX)
  const register = useCallback(
    async (body: {
      name: string;
      email: string;
      password: string;
      country?: string;
      income_bracket?: string;
    }) => {
      const { authApi } = await import("@/lib/api");
      const { user: u, token: t } = await authApi.register(body);

      // 🔥 THIS FIX SOLVES EVERYTHING
      const finalUser: User = {
        id: u.id,
        name: u.name,
        email: u.email,
        country: body.country || "United States", // ← force use selected country
        income_bracket: body.income_bracket,
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