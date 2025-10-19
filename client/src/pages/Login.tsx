
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Lock, Mail, Eye, EyeOff, LogIn, Shield, Smartphone, CreditCard, ArrowRightLeft, Wallet, Zap, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

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
      const API_URL = import.meta.env.VITE_API_URL || '';
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
        login(data.access_token, { username: data.username });
        setLocation('/');
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
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
      {/* Animated Gradient Background - PhonePe/GPay Style */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-900 animate-gradient-shift"></div>

      {/* Animated Background Blobs */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Payment Elements - PhonePe Style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Card 1 */}
        <div className="absolute top-20 left-10 animate-float" style={{ animationDelay: '0s' }}>
          <div className="glass-card-dark rounded-2xl p-6 w-72 transform rotate-12 hover:rotate-0 transition-all duration-500">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="h-3 w-24 bg-purple-300/40 rounded-full mb-2"></div>
                <div className="h-2 w-32 bg-purple-400/40 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Card 2 */}
        <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '1s' }}>
          <div className="glass-card-dark rounded-2xl p-6 w-72 transform -rotate-12 hover:rotate-0 transition-all duration-500">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="h-3 w-28 bg-indigo-300/40 rounded-full mb-2"></div>
                <div className="h-2 w-24 bg-indigo-400/40 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Card 3 */}
        <div className="absolute bottom-32 left-1/4 animate-float" style={{ animationDelay: '2s' }}>
          <div className="glass-card-dark rounded-2xl p-6 w-64 transform rotate-6 hover:rotate-0 transition-all duration-500">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center">
                <ArrowRightLeft className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="h-3 w-20 bg-pink-300/40 rounded-full mb-2"></div>
                <div className="h-2 w-28 bg-pink-400/40 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Card 4 */}
        <div className="absolute bottom-20 right-1/4 animate-float" style={{ animationDelay: '1.5s' }}>
          <div className="glass-card-dark rounded-2xl p-6 w-64 transform -rotate-6 hover:rotate-0 transition-all duration-500">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="h-3 w-24 bg-purple-300/40 rounded-full mb-2"></div>
                <div className="h-2 w-20 bg-purple-400/40 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Transaction Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <line x1="20%" y1="30%" x2="80%" y2="70%" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="8,8">
            <animate attributeName="stroke-dashoffset" from="0" to="100" dur="3s" repeatCount="indefinite" />
          </line>
          <line x1="80%" y1="30%" x2="20%" y2="70%" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="8,8">
            <animate attributeName="stroke-dashoffset" from="0" to="100" dur="4s" repeatCount="indefinite" />
          </line>
          <line x1="50%" y1="10%" x2="50%" y2="90%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="8,8">
            <animate attributeName="stroke-dashoffset" from="0" to="100" dur="5s" repeatCount="indefinite" />
          </line>
        </svg>

        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-white rounded-full opacity-70 animate-ping"></div>
        <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-purple-300 rounded-full opacity-70 animate-ping animation-delay-1000"></div>
        <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-indigo-300 rounded-full opacity-70 animate-ping animation-delay-2000"></div>
      </div>

      {/* Login Card - PhonePe/GPay Professional Style */}
      <div className="relative w-full max-w-md z-10">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>

        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 rounded-3xl shadow-2xl mb-6 animate-fade-in-scale relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <img 
                src="/lcrpay-logo.png" 
                alt="LCR Pay" 
                className="w-20 h-20 rounded-2xl object-cover relative z-10"
              />
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 bg-clip-text text-transparent mb-2">
              LCRpay Admin
            </h1>
            
            <p className="text-gray-600 flex items-center justify-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-purple-600" />
              Secure Admin Portal
            </p>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Bank-Grade Security</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Instant Access</span>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Admin Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-base font-medium"
                  placeholder="Enter your username"
                  autoComplete="off"
                  maxLength={50}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Admin Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-base font-medium"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  minLength={6}
                  maxLength={100}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-600 transition-colors"
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
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm animate-slide-in-down flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Submit Button - PhonePe Style */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white py-4 rounded-2xl font-bold text-lg hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {isLoading ? (
                <>
                  <div className="spinner border-white"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-6 h-6" />
                  <span>Sign In Securely</span>
                </>
              )}
            </button>
          </form>

          {/* Test Credentials - Professional Design */}
          <div className="mt-8 p-5 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-gray-800 font-bold">
                Admin Test Credentials
              </p>
            </div>
            <div className="space-y-2 bg-white/70 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 font-medium">Username:</span>
                <span className="font-mono font-bold text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-lg">AdminLCR</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 font-medium">Password:</span>
                <span className="font-mono font-bold text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-lg">LCRADMIN1216SMDYDX</span>
              </div>
            </div>
          </div>

          {/* Security Footer */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4 text-purple-600" />
              <p className="font-medium">256-bit SSL Encrypted Connection</p>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Your credentials are secured with bank-grade encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
