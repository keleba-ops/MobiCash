import { useState } from 'react';
import { login } from './store';
import VergeDynamicsLogo from './components/VergeDynamicsLogo';
import DynamicLogo from './components/DynamicLogo';

interface LoginPageProps {
  onLogin: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function LoginPage({ onLogin, showToast }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = login(username, password);
      setLoading(false);
      if (result.success) {
        showToast('Welcome back!', 'success');
        onLogin();
      } else {
        setError(result.message);
        showToast(result.message, 'error');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-2xl mb-4 p-3">
            <DynamicLogo className="w-full h-full" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">MobiCash Agent</h1>
          <p className="text-green-100 text-sm md:text-base">Mobile Money Banking System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-sm text-gray-500 mt-1">Sign in to your agent account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <span>⚠️</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide flex items-center gap-1.5">
                <span>🔑</span> Demo Credentials
              </p>
              <span className="text-[10px] text-blue-500 font-medium">Click to auto-fill</span>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => { setUsername('admin'); setPassword('admin123'); }}
                className="w-full flex items-center justify-between p-2.5 bg-white hover:bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs">👑</span>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-gray-700">Administrator</p>
                    <p className="text-[10px] text-gray-500 font-mono">admin / admin123</p>
                  </div>
                </div>
                <span className="text-[10px] text-blue-600 opacity-0 group-hover:opacity-100 transition">Click →</span>
              </button>
              <button
                type="button"
                onClick={() => { setUsername('thabo'); setPassword('agent123'); }}
                className="w-full flex items-center justify-between p-2.5 bg-white hover:bg-green-50 rounded-lg border border-green-200 hover:border-green-300 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs">💼</span>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-gray-700">Agent</p>
                    <p className="text-[10px] text-gray-500 font-mono">thabo / agent123</p>
                  </div>
                </div>
                <span className="text-[10px] text-green-600 opacity-0 group-hover:opacity-100 transition">Click →</span>
              </button>
              <button
                type="button"
                onClick={() => { setUsername('mpho'); setPassword('super123'); }}
                className="w-full flex items-center justify-between p-2.5 bg-white hover:bg-orange-50 rounded-lg border border-orange-200 hover:border-orange-300 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs">🎯</span>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-gray-700">Supervisor</p>
                    <p className="text-[10px] text-gray-500 font-mono">mpho / super123</p>
                  </div>
                </div>
                <span className="text-[10px] text-orange-600 opacity-0 group-hover:opacity-100 transition">Click →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-green-100 text-xs">
            © {new Date().getFullYear()} MobiCash Agent Banking System
          </p>
          <p className="text-green-100/80 text-[11px] flex items-center justify-center gap-1.5">
            <span>Built by</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-white">
              <VergeDynamicsLogo className="w-3.5 h-3.5" />
              Verge Dynamics
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
