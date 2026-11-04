import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { Building2, MessageSquare, Truck, Bell, Save, Layers } from 'lucide-react';

export const StoreSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.getAdminSettings();
        if (res.success) {
          setSettings(res.data);
        }
      } catch (err: any) {
        error('Error', err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.updateAdminSettings(settings);
      if (res.success) {
        success('Settings Saved', 'Corporate store configuration updated.');
      }
    } catch (err: any) {
      error('Failed to update', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="p-12 text-center text-xs text-charcoal uppercase tracking-editorial">
        Loading store configuration...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="border-b border-stone pb-4">
        <h1 className="font-serif text-2xl sm:text-3xl text-espresso-900 font-medium">
          Store Configuration & Banking
        </h1>
        <p className="text-xs text-charcoal tracking-editorial uppercase mt-0.5">
          Manage corporate bank wire details, WhatsApp concierge, delivery fees, and announcements
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Corporate Banking Details */}
        <div className="bg-white border border-stone p-6 space-y-4 text-xs">
          <div className="flex items-center space-x-2 border-b border-stone/50 pb-2">
            <Building2 className="w-4 h-4 text-espresso-900" />
            <h2 className="font-serif text-base text-espresso-900 font-medium">
              1. Beneficiary Bank Wire Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                Bank Name *
              </label>
              <input
                type="text"
                required
                value={settings.bankDetails?.bankName || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bankDetails: { ...settings.bankDetails, bankName: e.target.value },
                  })
                }
                className="w-full bg-ivory-50 border border-stone px-3 py-2 text-espresso-900"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                Beneficiary Corporate Name *
              </label>
              <input
                type="text"
                required
                value={settings.bankDetails?.accountName || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bankDetails: { ...settings.bankDetails, accountName: e.target.value },
                  })
                }
                className="w-full bg-ivory-50 border border-stone px-3 py-2 text-espresso-900"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                NUBAN Account Number *
              </label>
              <input
                type="text"
                required
                value={settings.bankDetails?.accountNumber || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bankDetails: { ...settings.bankDetails, accountNumber: e.target.value },
                  })
                }
                className="w-full bg-ivory-50 border border-stone px-3 py-2 font-mono font-bold text-espresso-900"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                Wire Transfer Deadline (Hours)
              </label>
              <input
                type="number"
                value={settings.bankDetails?.deadlineHours || 24}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bankDetails: {
                      ...settings.bankDetails,
                      deadlineHours: parseInt(e.target.value, 10) || 24,
                    },
                  })
                }
                className="w-full bg-ivory-50 border border-stone px-3 py-2 font-mono text-espresso-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                Payment Instructions Note for Clients
              </label>
              <textarea
                rows={3}
                value={settings.bankDetails?.instructions || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bankDetails: { ...settings.bankDetails, instructions: e.target.value },
                  })
                }
                className="w-full bg-ivory-50 border border-stone px-3 py-2 text-espresso-900"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Concierge Setup */}
        <div className="bg-white border border-stone p-6 space-y-4 text-xs">
          <div className="flex items-center space-x-2 border-b border-stone/50 pb-2">
            <MessageSquare className="w-4 h-4 text-emerald-700" />
            <h2 className="font-serif text-base text-espresso-900 font-medium">
              2. WhatsApp Concierge Desk
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                Business Phone Number (International Format) *
              </label>
              <input
                type="text"
                required
                value={settings.whatsappNumber || ''}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                placeholder="+2348012345678"
                className="w-full bg-ivory-50 border border-stone px-3 py-2 font-mono text-espresso-900"
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="whatsappEnabled"
                checked={settings.whatsappEnabled ?? true}
                onChange={(e) => setSettings({ ...settings, whatsappEnabled: e.target.checked })}
                className="text-espresso-900 focus:ring-espresso-900"
              />
              <label htmlFor="whatsappEnabled" className="text-xs uppercase tracking-editorial font-medium cursor-pointer">
                Enable Direct WhatsApp Ordering
              </label>
            </div>
          </div>
        </div>

        {/* Shipping Rates Configuration */}
        <div className="bg-white border border-stone p-6 space-y-4 text-xs">
          <div className="flex items-center space-x-2 border-b border-stone/50 pb-2">
            <Truck className="w-4 h-4 text-espresso-900" />
            <h2 className="font-serif text-base text-espresso-900 font-medium">
              3. Courier Delivery Pricing (₦)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                Standard Courier (₦)
              </label>
              <input
                type="number"
                value={settings.shipping?.standardFee || 3500}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    shipping: {
                      ...settings.shipping,
                      standardFee: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full bg-ivory-50 border border-stone px-3 py-2 font-mono text-espresso-900"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                Priority Express Courier (₦)
              </label>
              <input
                type="number"
                value={settings.shipping?.expressFee || 7000}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    shipping: {
                      ...settings.shipping,
                      expressFee: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full bg-ivory-50 border border-stone px-3 py-2 font-mono text-espresso-900"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                Free Delivery Spend Threshold (₦)
              </label>
              <input
                type="number"
                value={settings.shipping?.freeShippingThreshold || 150000}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    shipping: {
                      ...settings.shipping,
                      freeShippingThreshold: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full bg-ivory-50 border border-stone px-3 py-2 font-mono text-espresso-900"
              />
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-white border border-stone p-6 space-y-4 text-xs">
          <div className="flex items-center space-x-2 border-b border-stone/50 pb-2">
            <Bell className="w-4 h-4 text-espresso-900" />
            <h2 className="font-serif text-base text-espresso-900 font-medium">
              4. Announcement Bar
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="announcementEnabled"
                checked={settings.announcement?.enabled ?? true}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcement: { ...settings.announcement, enabled: e.target.checked },
                  })
                }
                className="text-espresso-900 focus:ring-espresso-900"
              />
              <label htmlFor="announcementEnabled" className="text-xs uppercase tracking-editorial font-medium cursor-pointer">
                Show Announcement Bar on Storefront
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                  Message Text
                </label>
                <input
                  type="text"
                  value={settings.announcement?.text || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      announcement: { ...settings.announcement, text: e.target.value },
                    })
                  }
                  className="w-full bg-ivory-50 border border-stone px-3 py-2 text-espresso-900"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                  Destination Link
                </label>
                <input
                  type="text"
                  value={settings.announcement?.link || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      announcement: { ...settings.announcement, link: e.target.value },
                    })
                  }
                  className="w-full bg-ivory-50 border border-stone px-3 py-2 font-mono text-espresso-900"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-3.5 bg-espresso-900 hover:bg-espresso-800 disabled:opacity-50 text-ivory-100 text-xs uppercase tracking-editorial font-semibold transition-colors flex items-center space-x-2 shadow-md"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Changes...' : 'Save All Settings'}</span>
        </button>
      </form>
    </div>
  );
};
