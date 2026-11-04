import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { formatDate } from '../../utils/formatters.js';
import {
  ShieldCheck,
  UserPlus,
  Mail,
  Phone,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Lock,
  User,
  ShieldAlert,
} from 'lucide-react';
import { ConfirmModal } from '../../components/common/ConfirmModal.js';

export const AdminTeamPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();

  const [team, setTeam] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
  }>({
    isOpen: false,
    id: '',
    name: '',
  });

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'admin',
  });

  const loadTeam = async () => {
    setIsLoading(true);
    try {
      const res = await api.getTeamMembers();
      if (res.success) {
        setTeam(res.data);
      }
    } catch (err: any) {
      error('Error', err.message || 'Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) {
      error('Missing Information', 'Full name, email, and password are required.');
      return;
    }

    if (form.password.length < 8) {
      error('Password Too Short', 'Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createTeamMember(form);
      if (res.success) {
        success('Personnel Added', `Administrator ${form.fullName} has been granted access.`);
        setIsModalOpen(false);
        setForm({ fullName: '', email: '', phone: '', password: '', role: 'admin' });
        loadTeam();
      } else {
        throw new Error(res.message || 'Failed to create team member');
      }
    } catch (err: any) {
      error('Creation Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean, name: string) => {
    if (id === currentUser?.id) {
      error('Restricted Action', 'You cannot deactivate your own administrative credentials.');
      return;
    }

    const newStatus = !currentStatus;
    try {
      const res = await api.toggleTeamMemberStatus(id, newStatus);
      if (res.success) {
        success('Status Updated', `${name} is now ${newStatus ? 'active' : 'deactivated'}.`);
        setTeam((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isActive: newStatus } : m))
        );
      }
    } catch (err: any) {
      error('Update Error', err.message);
    }
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (id === currentUser?.id) {
      error('Restricted Action', 'You cannot remove your own administrative credentials.');
      return;
    }
    setDeleteConfirm({
      isOpen: true,
      id,
      name,
    });
  };

  const executeDeleteMember = async () => {
    const { id, name } = deleteConfirm;
    setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));

    try {
      const res = await api.deleteTeamMember(id);
      if (res.success) {
        success('Personnel Removed', `Administrative access for "${name}" has been revoked.`);
        setTeam((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err: any) {
      error('Removal Error', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-espresso-900 font-medium">
            Concierge & Administrative Team
          </h1>
          <p className="text-xs text-charcoal tracking-editorial uppercase mt-0.5">
            Manage authenticated concierge personnel, administrators, and fulfillment staff
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-espresso-900 hover:bg-espresso-800 text-ivory-100 text-xs uppercase tracking-editorial font-semibold transition-colors inline-flex items-center space-x-1.5 shadow-sm self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Admin Personnel</span>
        </button>
      </div>

      {/* Team Roster */}
      <div className="bg-white border border-stone overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-charcoal tracking-editorial uppercase">
            Loading administrative personnel roster...
          </div>
        ) : team.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <ShieldAlert className="w-8 h-8 text-stone-muted mx-auto" />
            <p className="font-serif text-xl text-espresso-900">No personnel registered</p>
            <p className="text-xs text-charcoal">Invite administrators to delegate operations.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-50 text-charcoal uppercase tracking-editorial text-[10px] font-semibold border-b border-stone/50">
                <tr>
                  <th className="py-3 px-4">Personnel</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Authority Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Granted On</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/40">
                {team.map((m) => {
                  const isSelf = m.id === currentUser?.id;
                  return (
                    <tr key={m.id} className="hover:bg-ivory-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-espresso-900 text-champagne flex items-center justify-center font-serif text-sm font-semibold shrink-0">
                            {m.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-espresso-900 font-serif flex items-center space-x-1.5">
                              <span>{m.fullName}</span>
                              {isSelf && (
                                <span className="text-[9px] bg-champagne/30 text-espresso-900 px-1.5 py-0.2 rounded font-sans uppercase font-bold tracking-wider">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-charcoal/70 font-mono">{m.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 space-y-0.5">
                        <div className="flex items-center space-x-1.5 text-espresso-900 font-mono">
                          <Mail className="w-3 h-3 text-stone-muted" />
                          <span>{m.email}</span>
                        </div>
                        {m.phone && (
                          <div className="flex items-center space-x-1.5 text-stone-muted font-mono text-[11px]">
                            <Phone className="w-3 h-3" />
                            <span>{m.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[9px] uppercase tracking-wider px-2 py-0.5 font-semibold ${
                            m.role === 'admin'
                              ? 'bg-espresso-900 text-champagne'
                              : 'bg-stone text-espresso-900'
                          }`}
                        >
                          {m.role === 'admin' ? 'Lead Administrator' : 'Concierge Staff'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 text-[10px] uppercase font-semibold ${
                            m.isActive ? 'text-emerald-700' : 'text-stone-muted'
                          }`}
                        >
                          {m.isActive ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-stone-muted" />
                              <span>Deactivated</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-charcoal">
                        {m.createdAt ? formatDate(m.createdAt) : 'Initial Seed'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {!isSelf && (
                          <>
                            <button
                              onClick={() => handleToggleStatus(m.id, m.isActive, m.fullName)}
                              className="px-2 py-1 border border-stone text-[10px] uppercase tracking-wider text-charcoal hover:text-espresso-900 hover:bg-ivory-50 transition-colors"
                            >
                              {m.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteMember(m.id, m.fullName)}
                              className="p-1.5 text-stone-muted hover:text-red-700 inline-block transition-colors"
                              title="Revoke and Delete Access"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Admin Personnel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-stone max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-muted hover:text-espresso-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="w-10 h-10 rounded-full bg-ivory-100 border border-champagne/40 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5 text-champagne-dark" />
              </div>
              <h2 className="font-serif text-2xl text-espresso-900 font-medium">
                Add Admin Personnel
              </h2>
              <p className="text-xs text-charcoal tracking-editorial uppercase mt-0.5">
                Grant luxury desk privileges to concierge team members
              </p>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Genevieve Althaus"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full bg-ivory-50 border border-stone pl-9 pr-3 py-2 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                  Official Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-muted absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. concierge@magnifiscent.luxury"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-ivory-50 border border-stone pl-9 pr-3 py-2 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                  Telephone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-muted absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="e.g. +2348011223344"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-ivory-50 border border-stone pl-9 pr-3 py-2 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                  Access Password * (Min 8 Characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-muted absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-ivory-50 border border-stone pl-9 pr-3 py-2 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                  Administrative Privilege Level *
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-ivory-50 border border-stone px-3 py-2 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
                >
                  <option value="admin">Lead Administrator (Full Catalog & Team Controls)</option>
                  <option value="staff">Fulfillment Concierge (Order & Receipt Verification)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-stone">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone text-xs uppercase tracking-editorial hover:bg-stone-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-espresso-900 hover:bg-espresso-800 disabled:opacity-50 text-ivory-100 text-xs uppercase tracking-editorial font-semibold transition-colors flex items-center space-x-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Granting Access...' : 'Create Admin Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Revoke Administrative Access"
        message={`Are you sure you want to permanently revoke administrative access for "${deleteConfirm.name}"? They will no longer be able to log in to the concierge desk.`}
        confirmLabel="Revoke Access"
        variant="danger"
        onConfirm={executeDeleteMember}
        onCancel={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
