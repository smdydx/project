import { QueryClient } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://0.0.0.0:8000';

async function throwIfNotOk(response: Response) {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status}: ${body}`);
  }
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("lcrpay_auth_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const token = localStorage.getItem("lcrpay_auth_token");
        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(queryKey[0] as string, {
          headers,
        });
        await throwIfNotOk(response);
        return response.json();
      },
      staleTime: 1000 * 60 * 5,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  headers?: HeadersInit;
}

export async function apiRequest(
  url: string,
  options?: RequestInit
): Promise<any> {
  const token = localStorage.getItem('lcrpay_auth_token');

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('lcrpay_auth_token');
    localStorage.removeItem('lcrpay_refresh_token');
    localStorage.removeItem('lcrpay_username');
    window.location.href = '/login';
    throw new Error('Authentication failed');
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}