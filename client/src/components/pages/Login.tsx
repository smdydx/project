
import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, LogIn, Shield, CreditCard, ArrowRightLeft, Wallet } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate inputs
    if (!username.trim()) {
      setError('Username is required');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      // Call JWT authentication API
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Store JWT token
        localStorage.setItem('lcrpay_auth_token', data.access_token);
        localStorage.setItem('lcrpay_username', data.username);
        
        // Successful login
        onLogin(username, password);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Invalid credentials. Please check your username and password.');
        setPassword('');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-400 to-indigo-600 animate-gradient-shift"></div>
      
      {/* Animated Background Blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Payment Cards Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Card 1 */}
        <div className="absolute top-20 left-10 animate-float" style={{ animationDelay: '0s' }}>
          <div className="glass-card-dark rounded-2xl p-4 w-64 transform rotate-12 hover:rotate-0 transition-transform">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-purple-300" />
              <div>
                <div className="h-2 w-20 bg-purple-300 rounded mb-2"></div>
                <div className="h-2 w-32 bg-purple-400 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '1s' }}>
          <div className="glass-card-dark rounded-2xl p-4 w-64 transform -rotate-12 hover:rotate-0 transition-transform">
            <div className="flex items-center gap-3">
              <Wallet className="w-8 h-8 text-indigo-300" />
              <div>
                <div className="h-2 w-24 bg-indigo-300 rounded mb-2"></div>
                <div className="h-2 w-28 bg-indigo-400 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="absolute bottom-32 left-1/4 animate-float" style={{ animationDelay: '2s' }}>
          <div className="glass-card-dark rounded-2xl p-4 w-56 transform rotate-6 hover:rotate-0 transition-transform">
            <div className="flex items-center gap-3">
              <ArrowRightLeft className="w-8 h-8 text-pink-300" />
              <div>
                <div className="h-2 w-20 bg-pink-300 rounded mb-2"></div>
                <div className="h-2 w-24 bg-pink-400 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="absolute bottom-20 right-1/4 animate-float" style={{ animationDelay: '1.5s' }}>
          <div className="glass-card-dark rounded-2xl p-4 w-60 transform -rotate-6 hover:rotate-0 transition-transform">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-300" />
              <div>
                <div className="h-2 w-28 bg-purple-300 rounded mb-2"></div>
                <div className="h-2 w-20 bg-purple-400 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Transaction Lines */}
        <svg className="absolute inset-0 w-full h-full">
          <line x1="20%" y1="30%" x2="80%" y2="70%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" from="0" to="100" dur="3s" repeatCount="indefinite" />
          </line>
          <line x1="80%" y1="30%" x2="20%" y2="70%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" from="0" to="100" dur="4s" repeatCount="indefinite" />
          </line>
          <line x1="50%" y1="10%" x2="50%" y2="90%" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" from="0" to="100" dur="5s" repeatCount="indefinite" />
          </line>
        </svg>

        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-white rounded-full opacity-60 animate-ping"></div>
        <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-purple-300 rounded-full opacity-60 animate-ping animation-delay-1000"></div>
        <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-indigo-300 rounded-full opacity-60 animate-ping animation-delay-2000"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md z-10">
        {/* Floating Background Elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-300 rounded-full opacity-30 blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white rounded-full opacity-40 blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-2xl p-8 backdrop-blur-xl border border-white/20">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-lg mb-4 animate-fade-in-scale">
              <img 
                src="/lcrpay-logo.png" 
                alt="LCR Pay" 
                className="w-16 h-16 rounded-xl object-cover"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              LCRpay Admin
            </h1>
            <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              Secure Admin Portal
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter your username"
                  autoComplete="off"
                  maxLength={50}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  minLength={6}
                  maxLength={100}
                  required
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
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm animate-slide-in-down flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-purple-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />
              <p>Protected by LCRpay Security</p>
            </div>
            <p className="mt-1 text-xs">Your credentials are encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
}
