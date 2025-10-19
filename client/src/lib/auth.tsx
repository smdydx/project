import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface User {
  username: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem("lcrpay_auth_token");
    const username = localStorage.getItem("lcrpay_username");

    if (token && username) {
      setUser({ username });
      // Skip verification for now - token will be verified on API calls
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("lcrpay_auth_token", token);
    localStorage.setItem("lcrpay_username", userData.username);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("lcrpay_auth_token");
    localStorage.removeItem("lcrpay_refresh_token");
    localStorage.removeItem("lcrpay_username");
    localStorage.removeItem("user");
    setUser(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
