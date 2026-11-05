import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';

export const CustomerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = (location.state as any)?.from?.pathname || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await api.login({ email, password });
      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        success('Welcome Back', `Welcome, ${res.user.fullName}.`);
        if (res.user.role === 'admin' || res.user.role === 'staff') {
          navigate('/admin/dashboard');
        } else {
          navigate(from);
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Invalid email or password. Please verify your credentials.';
      setErrorMessage(msg);
      error('Authentication Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-stone-light/40">
      <div className="w-full max-w-md bg-white border border-stone p-8 sm:p-10 shadow-sm space-y-8 animate-in fade-in duration-300">
        {/* Brand Emblem & Welcome */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-ivory-100 p-1 border border-champagne/60 shadow-sm flex items-center justify-center overflow-hidden">
              <img
                src="/logo.jpg"
                alt="MagnifiScent"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-espresso-900 font-medium tracking-wide">
              Client Sanctuary
            </h1>
            <p className="text-xs text-charcoal tracking-editorial uppercase mt-1">
              Sign in to manage and track your orders
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-muted absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@domain.luxury"
                className="w-full bg-ivory-50 border border-stone pl-9 pr-3.5 py-2.5 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
              Private Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-muted absolute left-3 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-ivory-50 border border-stone pl-9 pr-10 py-2.5 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 p-0.5 text-stone-muted hover:text-espresso-900 transition-colors focus:outline-none"
                title={showPassword ? 'Hide password' : 'View password'}
                aria-label={showPassword ? 'Hide password' : 'View password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-espresso-900 hover:bg-espresso-800 text-ivory-100 text-xs uppercase tracking-editorial font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 shadow-sm"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In to Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-stone/60 space-y-3 text-center">
          <p className="text-xs text-charcoal">
            New to Magnificent?{' '}
            <Link
              to="/register"
              className="text-espresso-900 font-semibold uppercase tracking-wider hover:text-champagne-dark underline"
            >
              Create Client Register
            </Link>
          </p>
          <div className="flex items-center justify-center space-x-1 text-[11px] text-stone-muted pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-champagne-dark" />
            <span>Encrypted Private Client Session</span>
          </div>
          <div className="pt-1">
            <Link
              to="/admin/login"
              className="text-[10px] uppercase tracking-editorial text-stone-muted hover:text-charcoal"
            >
              Internal Operations Portal &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
