
import { Database, RefreshCw, Server, AlertTriangle } from 'lucide-react';

export default function DatabaseErrorState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-900 flex items-center justify-center p-4 safe-area-padding">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Error Card */}
      <div className="relative max-w-md w-full">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
        
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <Database className="w-12 h-12 text-white" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-3 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Database Connection Error
          </h2>

          {/* Message */}
          <p className="text-center text-gray-600 mb-6">
            Unable to connect to the database. Please check your configuration and try again.
          </p>

          {/* Info Box */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 mb-6 border-2 border-orange-200">
            <div className="flex items-start gap-3">
              <Server className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-semibold text-gray-800 mb-2">Possible Issues:</p>
                <ul className="space-y-1 text-gray-600 text-xs">
                  <li>• Database server not running</li>
                  <li>• Incorrect credentials in .env file</li>
                  <li>• Database not created</li>
                  <li>• Network connection issue</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-orange-500/50 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <RefreshCw className="w-6 h-6" />
            <span>Retry Connection</span>
          </button>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Check backend/.env file for DATABASE_URL
            </p>
            <p className="text-xs text-gray-400 mt-1 font-mono">
              postgresql://user:pass@localhost:5432/dbname
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
