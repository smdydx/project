import { useState } from "react";
import { useLocation } from "wouter";
import { loginSchema, type LoginInput } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginInput>({
    MobileNumber: "",
    LoginPIN: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof LoginInput]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate form data
      const validation = loginSchema.safeParse(formData);
      if (!validation.success) {
        const fieldErrors: Partial<Record<keyof LoginInput, string>> = {};
        validation.error.issues.forEach((err: any) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof LoginInput] = err.message;
          }
        });
        setErrors(fieldErrors);
        setIsLoading(false);
        return;
      }

      // Login API call
      const response = await apiRequest<{ access_token: string; user: any }>(
        "/api/auth/login",
        {
          method: "POST",
          body: formData,
        }
      );

      // Store token and user data using auth context
      login(response.access_token, response.user);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.user.fullname}!`,
      });

      // Redirect to dashboard
      setLocation("/");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid mobile number or PIN",
        variant: "destructive",
      });
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
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
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
            {/* Mobile Number Input */}
            <div>
              <label
                htmlFor="MobileNumber"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Mobile Number
              </label>
              <input
                id="MobileNumber"
                name="MobileNumber"
                type="tel"
                value={formData.MobileNumber}
                onChange={handleChange}
                placeholder="Enter your mobile number"
                className={`w-full px-4 py-3 border ${
                  errors.MobileNumber ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors`}
                data-testid="input-mobile"
                disabled={isLoading}
              />
              {errors.MobileNumber && (
                <p className="mt-1 text-sm text-red-500" data-testid="error-mobile">
                  {errors.MobileNumber}
                </p>
              )}
            </div>

            {/* PIN Input */}
            <div>
              <label
                htmlFor="LoginPIN"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Login PIN
              </label>
              <input
                id="LoginPIN"
                name="LoginPIN"
                type="password"
                value={formData.LoginPIN}
                onChange={handleChange}
                placeholder="Enter your 4-digit PIN"
                className={`w-full px-4 py-3 border ${
                  errors.LoginPIN ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors`}
                data-testid="input-pin"
                disabled={isLoading}
                maxLength={4}
              />
              {errors.LoginPIN && (
                <p className="mt-1 text-sm text-red-500" data-testid="error-pin">
                  {errors.LoginPIN}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              data-testid="button-login"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Test Credentials Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
              Test Credentials:
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Mobile: <span className="font-mono">9876543211</span>
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              PIN: <span className="font-mono">1234</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
