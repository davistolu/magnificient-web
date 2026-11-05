import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@magnifiscent.luxury');
  const [password, setPassword] = useState('MagnifiScentAdmin2026!');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const { login, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { success } = useToast();

  React.useEffect(() => {
    if (!authLoading && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAdmin, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');

    try {
      const res = await api.login({ email, password });
      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        success('Concierge Authenticated', `Welcome back, ${res.user.fullName}.`);
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-espresso-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-stone shadow-2xl p-8 sm:p-10 space-y-8 animate-in zoom-in-95 duration-200">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-ivory-100 p-1 border border-champagne/60 shadow-md flex items-center justify-center overflow-hidden">
              <img
                src="/logo.jpg"
                alt="MagnifiScent Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div>
            <span className="font-serif text-3xl font-medium tracking-widest text-espresso-900 block">
              Magnifi<span className="text-champagne-dark font-semibold">Scent</span>
            </span>
            <p className="text-[10px] uppercase tracking-widest text-charcoal/80 font-mono mt-1">
              Administration & Operations Access
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs">
              {authError}
            </div>
          )}

          <div>
            <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
              Staff Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-muted absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-ivory-50 border border-stone pl-9 pr-3.5 py-2.5 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
              Secret Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-muted absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-ivory-50 border border-stone pl-9 pr-3.5 py-2.5 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-espresso-900 hover:bg-espresso-800 disabled:opacity-50 text-ivory-100 text-xs uppercase tracking-editorial font-semibold transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <span>{isLoading ? 'Verifying...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-stone/50 text-center space-y-2">
          <div className="flex items-center justify-center space-x-1.5 text-[11px] text-charcoal">
            <ShieldCheck className="w-4 h-4 text-champagne-dark" />
            <span>Role-Based Access Protected</span>
          </div>
          <p className="text-[10px] text-stone-muted font-mono">
            Demo Credentials Pre-filled: admin@magnificent.luxury
          </p>
        </div>
      </div>
    </div>
  );
};
