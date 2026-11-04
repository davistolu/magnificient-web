import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import {
  LayoutDashboard,
  CreditCard,
  ShoppingBag,
  Package,
  Layers,
  Users,
  Tag,
  Settings,
  ShieldAlert,
  LogOut,
  ExternalLink,
  Bell,
  Menu,
  X,
  FileCheck2,
  ShieldCheck,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }

    async function loadAlerts() {
      try {
        const queueRes = await api.getVerificationQueue();
        if (queueRes.success) {
          setPendingPaymentsCount(queueRes.data.length);
        }

        const notifRes = await api.getNotifications();
        if (notifRes.success) {
          setNotifications(notifRes.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadAlerts();
    const interval = setInterval(loadAlerts, 15000);
    return () => clearInterval(interval);
  }, [isAdmin, navigate]);

  const navItems = [
    { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    {
      label: 'Payment Queue',
      href: '/admin/payments',
      icon: FileCheck2,
      badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : null,
    },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Inventory', href: '/admin/inventory', icon: Layers },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Concierge Team', href: '/admin/team', icon: ShieldCheck },
    { label: 'Discounts', href: '/admin/discounts', icon: Tag },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
    { label: 'Audit Trail', href: '/admin/audit', icon: ShieldAlert },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-stone-light text-espresso-900 flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-espresso-900 text-ivory-100 border-r border-espresso-800 shrink-0">
        <div className="p-6 border-b border-espresso-800 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-full bg-ivory-100 p-0.5 border border-champagne/40 overflow-hidden shrink-0 flex items-center justify-center">
              <img
                src="/logo.jpg"
                alt="MagnifiScent"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="font-serif text-lg tracking-widest text-ivory-100 font-medium block leading-tight">
                Magnifi<span className="text-champagne font-semibold">Scent</span>
              </span>
              <span className="block text-[8px] tracking-[0.2em] text-champagne uppercase font-mono">
                Operations Concierge
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-espresso-800 text-champagne border-l-2 border-champagne'
                    : 'text-stone-muted hover:bg-espresso-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span className="bg-champagne text-espresso-900 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User bar */}
        <div className="p-4 border-t border-espresso-800 bg-espresso-900/80 flex items-center justify-between">
          <div className="truncate">
            <p className="text-xs font-semibold text-ivory-100 truncate">{user?.fullName}</p>
            <p className="text-[10px] text-stone-muted font-mono uppercase">{user?.role}</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="p-1.5 text-stone-muted hover:text-white transition-colors"
            title="Sign Out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Administrative Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Operational Bar */}
        <header className="h-16 bg-white border-b border-stone flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 text-espresso-900"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-medium uppercase tracking-editorial text-charcoal hidden sm:inline">
              Management Portal
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* View live store link */}
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center space-x-1.5 text-xs text-charcoal hover:text-espresso-900 transition-colors border border-stone px-3 py-1.5 bg-ivory-50"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 text-charcoal hover:text-espresso-900 relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.some((n) => !n.isRead) && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-stone shadow-xl z-50 p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-stone/50 pb-2">
                    <span className="text-xs font-semibold uppercase tracking-editorial">Alerts</span>
                    <span className="text-[10px] text-charcoal font-mono">Real-time</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-charcoal py-4 text-center">No alerts at this moment</p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div key={n.id} className="text-xs p-2 bg-ivory-50 border border-stone/40 space-y-0.5">
                          <p className="font-semibold text-espresso-900">{n.title}</p>
                          <p className="text-[11px] text-charcoal leading-tight">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-espresso-950/70 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-espresso-900 text-ivory-100 flex flex-col justify-between z-10 shadow-2xl border-r border-espresso-800 animate-in slide-in-from-left duration-200">
            <div>
              <div className="p-4 border-b border-espresso-800 flex justify-between items-center bg-espresso-950/40">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-ivory-100 p-0.5 border border-champagne/40 overflow-hidden shrink-0 flex items-center justify-center">
                    <img src="/logo.jpg" alt="MagnifiScent" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="font-serif text-base tracking-widest text-ivory-100 block leading-tight">
                      Magnifi<span className="text-champagne font-semibold">Scent</span>
                    </span>
                    <span className="block text-[8px] tracking-[0.2em] text-champagne uppercase font-mono">
                      Operations Desk
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="w-8 h-8 rounded-full bg-espresso-800 hover:bg-espresso-700 flex items-center justify-center text-stone-muted hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-sm transition-colors ${
                        active
                          ? 'bg-espresso-800 text-ivory-100 border-l-2 border-champagne'
                          : 'text-stone-muted hover:text-white hover:bg-espresso-800/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-champagne' : 'text-stone-muted'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-champagne text-espresso-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile User Bar */}
            <div className="p-4 border-t border-espresso-800 bg-espresso-950/60 flex items-center justify-between">
              <div className="truncate">
                <p className="text-xs font-semibold text-ivory-100 truncate">{user?.fullName}</p>
                <p className="text-[10px] text-stone-muted font-mono uppercase">{user?.role}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileSidebarOpen(false);
                  navigate('/admin/login');
                }}
                className="p-2 text-stone-muted hover:text-white hover:bg-espresso-800 rounded transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
