const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function getToken(): string | null {
  return localStorage.getItem("taxpal_token");
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token = getToken(), ...init } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText || "Request failed");
  return data as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    api<{ user: { id: string; name: string; email: string }; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      token: null,
    }),
  register: (body: { name: string; email: string; password: string; country?: string; income_bracket?: string }) =>
    api<{ user: { id: string; name: string; email: string }; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
      token: null,
    }),
};

export const transactionsApi = {
  list: (params?: { type?: string; category?: string; from?: string; to?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return api<Array<{ _id: string; date: string; description?: string; category: string; amount: number; type: string }>>(
      `/transactions${q ? `?${q}` : ""}`
    );
  },
  summary: (params?: { from?: string; to?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return api<{ income: number; expense: number; net: number }>(`/transactions/summary${q ? `?${q}` : ""}`);
  },
  create: (body: { type: string; category: string; amount: number; date: string; description?: string }) =>
    api<{ _id: string }>("/transactions", { method: "POST", body: JSON.stringify(body) }),
  delete: (id: string) => api(`/transactions/${id}`, { method: "DELETE" }),
};

export const budgetsApi = {
  list: (month?: string) =>
    api<Array<{ _id: string; category: string; budget: number; spent: number; month: string }>>(
      `/budgets${month ? `?month=${month}` : ""}`
    ),
  create: (body: { category: string; budget_amount?: number; limit?: number; month?: string; description?: string }) =>
    api<{ _id: string }>("/budgets", {
      method: "POST",
      body: JSON.stringify({ ...body, budget_amount: body.budget_amount ?? body.limit }),
    }),
  delete: (id: string) => api(`/budgets/${id}`, { method: "DELETE" }),
};

export const taxEstimatesApi = {
  list: () => api<unknown[]>("/tax-estimates"),
  create: (body: Record<string, unknown>) => api("/tax-estimates", { method: "POST", body: JSON.stringify(body) }),
};

export const reportsApi = {
  list: () =>
    api<Array<{ id: string; name: string; generated: string; period: string; format: string }>>("/reports"),
  create: (body: { period: string; report_type: string; format?: string }) =>
    api<{ id: string }>("/reports", { method: "POST", body: JSON.stringify(body) }),
};

export const suggestedCategoriesApi = {
  list: (type?: "income" | "expense") =>
    api<Array<{ name: string; type: string }>>(`/suggested-categories${type ? `?type=${type}` : ""}`),
};

export const alertsApi = {
  list: () => api<Array<{ _id: string; type: string; message: string; alert_date: string; is_read: boolean }>>("/alerts"),
};
