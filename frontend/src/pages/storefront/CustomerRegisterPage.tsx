import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';

export const CustomerRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error } = useToast();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters in length.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await api.register(form);
      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        success('Client Register Created', `Welcome to Magnificent, ${res.user.fullName}.`);
        navigate('/account');
      }
    } catch (err: any) {
      const msg = err.message || 'Unable to register client account. Please try again.';
      setErrorMessage(msg);
      error('Registration Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-stone-light/40">
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
              Private Client Register
            </h1>
            <p className="text-xs text-charcoal tracking-editorial uppercase mt-1">
              Join our circle for bespoke orders and real-time tracking
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-muted absolute left-3 top-3" />
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Lord / Lady Adebayo Sterling"
                className="w-full bg-ivory-50 border border-stone pl-9 pr-3.5 py-2.5 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-muted absolute left-3 top-3" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="client@domain.luxury"
                className="w-full bg-ivory-50 border border-stone pl-9 pr-3.5 py-2.5 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
              Telephone (WhatsApp / Delivery)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-muted absolute left-3 top-3" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+234 800 000 0000"
                className="w-full bg-ivory-50 border border-stone pl-9 pr-3.5 py-2.5 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
              Private Password * (Min. 8 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-muted absolute left-3 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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
            className="w-full mt-2 py-3 bg-espresso-900 hover:bg-espresso-800 text-ivory-100 text-xs uppercase tracking-editorial font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 shadow-sm"
          >
            <span>{isLoading ? 'Creating Register...' : 'Create Private Register'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-stone/60 space-y-3 text-center">
          <p className="text-xs text-charcoal">
            Already registered with us?{' '}
            <Link
              to="/login"
              className="text-espresso-900 font-semibold uppercase tracking-wider hover:text-champagne-dark underline"
            >
              Sign In to Sanctuary
            </Link>
          </p>
          <div className="flex items-center justify-center space-x-1 text-[11px] text-stone-muted pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-champagne-dark" />
            <span>Private & Confidential Client Sanctuary</span>
          </div>
        </div>
      </div>
    </div>
  );
};
