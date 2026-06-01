import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("taxpal_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    // If the response is wrapped in success/data, unwrap it
    if (response.data && response.data.success !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred";

    // Create a normalized Error object to throw
    const normalizedError = new Error(
      `${message}. Ensure backend is running at ${API_BASE} and your configuration is correct.`
    );
    return Promise.reject(normalizedError);
  }
);

// Generic api helper to mimic the old api fetch-wrapper signature if needed
export async function api<T>(
  path: string,
  options: { method?: string; body?: string; headers?: Record<string, string>; token?: string | null } = {}
): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const headers = options.headers || {};

  const config: any = {
    method,
    url: path,
    headers,
  };

  if (options.body) {
    config.data = JSON.parse(options.body);
  }

  // Handle manual token overrides if any
  if (options.token !== undefined) {
    if (options.token) {
      config.headers.Authorization = `Bearer ${options.token}`;
    } else {
      delete config.headers.Authorization;
    }
  }

  try {
    const response = await axiosInstance(config);
    return response as unknown as T;
  } catch (error) {
    throw error;
  }
}

export const authApi = {
  login: (email: string, password: string) =>
    api<{ user: { id: string; name: string; email: string; country?: string; income_bracket?: string; phone?: string; address?: string; tax_id?: string; filing_status?: string; professional_role?: string }; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      token: null,
    }),
  register: (body: { name: string; email: string; password: string; country?: string; income_bracket?: string; phone?: string; address?: string; tax_id?: string; filing_status?: string; professional_role?: string }) =>
    api<{ user: { id: string; name: string; email: string; country?: string; income_bracket?: string; phone?: string; address?: string; tax_id?: string; filing_status?: string; professional_role?: string }; token: string }>("/auth/register", {
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
