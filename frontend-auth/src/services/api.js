const API_BASE_URL = "http://localhost:5000/api";

// Helper function to make API calls
const apiCall = async (endpoint, method = "GET", data = null) => {
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Add token to headers if it exists
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message || "API Error");
    }

    return result;
  } catch (error) {
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  register: async (name, email, password) => {
    const result = await apiCall("/auth/register", "POST", {
      name,
      email,
      password,
    });
    if (result.user) {
      localStorage.setItem("authToken", result.user._id);
      localStorage.setItem("user", JSON.stringify(result.user));
    }
    return result;
  },

  login: async (email, password) => {
    const result = await apiCall("/auth/login", "POST", {
      email,
      password,
    });
    if (result.user) {
      localStorage.setItem("authToken", result.user._id);
      localStorage.setItem("user", JSON.stringify(result.user));
    }
    return result;
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  requestPasswordReset: async (email) => {
    return await apiCall("/auth/forgot-password", "POST", { email });
  },

  verifyResetCode: async (email, resetCode) => {
    return await apiCall("/auth/verify-reset-code", "POST", { email, resetCode });
  },

  resetPassword: async (email, resetCode, newPassword, confirmPassword) => {
    return await apiCall("/auth/reset-password", "POST", {
      email,
      resetCode,
      newPassword,
      confirmPassword
    });
  },
};

// Transaction API calls
export const transactionAPI = {
  addTransaction: async (transactionData) => {
    return await apiCall("/transactions", "POST", transactionData);
  },

  getTransactions: async () => {
    const result = await apiCall("/transactions", "GET");
    return {
      transactions: result.transactions || result.data || result,
      message: result.message
    };
  },
};
