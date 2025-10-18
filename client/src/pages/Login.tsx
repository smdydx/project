
import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Lock, User, Eye, EyeOff, LogIn, Shield } from 'lucide-react';

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate inputs
      if (!formData.username.trim()) {
        setErrors({ username: "Username is required" });
        setIsLoading(false);
        return;
      }

      if (!formData.password) {
        setErrors({ password: "Password is required" });
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setErrors({ password: "Password must be at least 6 characters" });
        setIsLoading(false);
        return;
      }

      // Call API with timeout
      const API_URL = import.meta.env.VITE_API_URL || '';
      console.log('🔑 Attempting login to:', `${API_URL}/api/v1/auth/login`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        
        // Store token and user data
        login(data.access_token, { username: data.username });

        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.username}!`,
        });

        // Redirect to dashboard
        setTimeout(() => setLocation("/"), 100);
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
        toast({
          title: "Login Failed",
          description: errorData.detail || "Invalid username or password",
          variant: "destructive",
        });
        setFormData(prev => ({ ...prev, password: "" }));
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      let errorMessage = "Connection error. Please try again.";
      if (error.name === 'AbortError') {
        errorMessage = "Login timeout. The server took too long to respond.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setFormData(prev => ({ ...prev, password: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              LCRpay Admin
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to your account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.username ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors`}
                  data-testid="input-username"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-500" data-testid="error-username">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-10 py-3 border ${
                    errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors`}
                  data-testid="input-password"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500" data-testid="error-password">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
              data-testid="button-login"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Test Credentials Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg border border-blue-200 dark:border-gray-600">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2 text-center">
              Admin Credentials:
            </p>
            <div className="space-y-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                Username: <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">AdminLCR</span>
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                Password: <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">LCRADMIN1216SMDYDX</span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />
              <p>Protected by LCRpay Security</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
