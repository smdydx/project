
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

console.log('🔗 API_BASE_URL:', API_BASE_URL || 'EMPTY - Check client/.env file!');

// Token management
const TOKEN_KEY = 'lcrpay_auth_token';
const REFRESH_TOKEN_KEY = 'lcrpay_refresh_token';
const USERNAME_KEY = 'lcrpay_username';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  removeRefreshToken: () => localStorage.removeItem(REFRESH_TOKEN_KEY),
  
  getUsername: () => localStorage.getItem(USERNAME_KEY),
  setUsername: (username: string) => localStorage.setItem(USERNAME_KEY, username),
  
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),
  
  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
  }
};

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = authStorage.getRefreshToken();
  
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      authStorage.setToken(data.access_token);
      return data.access_token;
    }
    
    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};

const makeAuthenticatedRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, { ...options, headers });

  // Handle token expiration
  if (response.status === 401 && !isRefreshing) {
    isRefreshing = true;
    
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      isRefreshing = false;
      onTokenRefreshed(newToken);
      
      // Retry original request with new token
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, { ...options, headers });
    } else {
      isRefreshing = false;
      authStorage.clearAll();
      window.location.href = '/';
      throw new Error('Session expired. Please login again.');
    }
  }
  
  return response;
};

export const apiClient = {
  async get(endpoint: string) {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log('📡 GET:', fullUrl);
    
    const response = await makeAuthenticatedRequest(fullUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async post(endpoint: string, data: any) {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log('📡 POST:', fullUrl, data);
    
    const response = await makeAuthenticatedRequest(fullUrl, {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async put(endpoint: string, data: any) {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async delete(endpoint: string) {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};

export default apiClient;
