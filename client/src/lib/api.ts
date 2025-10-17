
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Token management
const TOKEN_KEY = 'lcrpay_auth_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY)
};

export const apiClient = {
  async get(endpoint: string) {
    const token = authStorage.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers
    });
    
    if (response.status === 401) {
      authStorage.removeToken();
      window.location.href = '/';
      throw new Error('Unauthorized');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async post(endpoint: string, data: any) {
    const token = authStorage.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    
    if (response.status === 401) {
      authStorage.removeToken();
      window.location.href = '/';
      throw new Error('Unauthorized');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async put(endpoint: string, data: any) {
    const token = authStorage.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    
    if (response.status === 401) {
      authStorage.removeToken();
      window.location.href = '/';
      throw new Error('Unauthorized');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async delete(endpoint: string) {
    const token = authStorage.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });
    
    if (response.status === 401) {
      authStorage.removeToken();
      window.location.href = '/';
      throw new Error('Unauthorized');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};

export default apiClient;
