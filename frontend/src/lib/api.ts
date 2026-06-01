import axios from "axios";

const DEFAULT_API_BASE = "https://taxpal-batch3.onrender.com/api";

/** Normalize env URL: reject placeholders, ensure /api suffix. */
function normalizeApiBase(raw?: string): string {
  const value = raw?.trim();
  if (
    !value ||
    /your-api\.onrender\.com|your-backend\.onrender\.com/i.test(value)
  ) {
    return DEFAULT_API_BASE;
  }
  let base = value.replace(/\/+$/, "");
  if (!base.endsWith("/api")) {
    base = `${base}/api`;
  }
  return base;
}

export const API_BASE = normalizeApiBase(
  import.meta.env.VITE_API_URL || DEFAULT_API_BASE
);

export class ApiRequestError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
  }
}

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    config.baseURL = API_BASE;
    const token = localStorage.getItem("taxpal_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.config.responseType === "blob") {
      return response;
    }
    if (response.data && response.data.success !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("taxpal_token");
      localStorage.removeItem("taxpal_user");
      const publicPaths = ["/", "/signup", "/forgot-password"];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = "/";
      }
    }

    let message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred";

    if (typeof message === "string" && message.includes('"') && message.includes(" is ")) {
      message = message
        .split(", ")
        .map((part) => part.replace(/^"[^"]+"\s+/, "").replace(/^"|"$/g, ""))
        .join(". ");
    }

    return Promise.reject(new ApiRequestError(message, error.response?.status));
  }
);

export async function api<T>(
  path: string,
  options: { method?: string; body?: string; headers?: Record<string, string>; token?: string | null } = {}
): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const headers = options.headers || {};

  const config: {
    method: string;
    url: string;
    headers: Record<string, string>;
    data?: unknown;
  } = {
    method,
    url: path,
    headers,
  };

  if (options.body) {
    config.data = JSON.parse(options.body);
  }

  if (options.token !== undefined) {
    if (options.token) {
      config.headers.Authorization = `Bearer ${options.token}`;
    } else {
      delete config.headers.Authorization;
    }
  }

  const response = await axiosInstance(config);
  return response as unknown as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    api<{ user: { id: string; name: string; email: string; country?: string; income_bracket?: string; phone?: string; address?: string; tax_id?: string; filing_status?: string; professional_role?: string }; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      token: null,
    }),
  register: (body: { name: string; email: string; password: string; country?: string; income_bracket?: string; phone?: string; address?: string; tax_id?: string; filing_status?: string; professional_role?: string }) =>
    api<
      | {
          user: { id: string; name: string; email: string; country?: string; income_bracket?: string };
          token: string;
        }
      | { requiresPasswordReset: true; email: string }
    >("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
      token: null,
    }),
  resetPassword: (email: string, password: string) =>
    api<void>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      token: null,
    }),
};

export interface TaxEstimateResult {
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  federalTax: number;
  stateTax: number;
  selfEmploymentTax: number;
  estimated_tax: number;
  effectiveRate: number;
}

export const taxEstimatesApi = {
  list: () => api<unknown[]>("/tax-estimates"),
  calendar: () =>
    api<Array<{ _id: string; type: string; message: string; alert_date: string; is_read?: boolean }>>(
      "/tax-estimates/calendar"
    ),
  create: (body: Record<string, unknown>) =>
    api<TaxEstimateResult>("/tax-estimates", { method: "POST", body: JSON.stringify(body) }),
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

export const reportsApi = {
  list: () =>
    api<Array<{ id: string; name: string; generated: string; period: string; format: string }>>("/reports"),
  create: (body: { period: string; report_type: string; format?: string }) =>
    api<{ id: string }>("/reports", { method: "POST", body: JSON.stringify(body) }),
  download: async (id: string, filename = "TaxPal-Report.pdf") => {
    const token = localStorage.getItem("taxpal_token");
    const response = await axiosInstance.get(`/reports/download/${id}`, {
      responseType: "blob",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const blob = response.data as Blob;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  },
};

export const suggestedCategoriesApi = {
  list: (type?: "income" | "expense") =>
    api<Array<{ _id: string; name: string; type: string; color?: string }>>(`/suggested-categories${type ? `?type=${type}` : ""}`),
};

export const alertsApi = {
  list: () => api<Array<{ _id: string; type: string; message: string; alert_date: string; is_read: boolean }>>("/alerts"),
};
