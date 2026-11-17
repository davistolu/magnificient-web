import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api.js';

export interface ShippingSettings {
  standardFee?: number;
  expressFee?: number;
  freeShippingThreshold?: number;
  standard_fee?: number;
  express_fee?: number;
  free_shipping_threshold?: number;
  estimated_days_standard?: string;
  estimated_days_express?: string;
}

export interface StoreSettings {
  storeName?: string;
  tagline?: string;
  supportEmail?: string;
  whatsappNumber?: string;
  whatsappEnabled?: boolean;
  currency?: string;
  currencySymbol?: string;
  announcement?: {
    enabled?: boolean;
    text?: string;
    link?: string;
  };
  bankDetails?: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    deadlineHours?: number;
    instructions?: string;
  };
  shipping?: ShippingSettings;
  hero?: any;
}

interface SettingsContextType {
  settings: StoreSettings | null;
  whatsappNumber: string;
  whatsappEnabled: boolean;
  cleanWhatsappNumber: string;
  buildWhatsAppUrl: (message: string) => string;
  standardShippingFee: number;
  expressShippingFee: number;
  freeShippingThreshold: number;
  calculateShippingFee: (method: 'standard' | 'express', currentSubtotal: number) => number;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.getPublicSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.warn('[SettingsContext] Failed to load public settings from API, using defaults:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const rawWhatsapp =
    settings?.whatsappNumber ||
    (settings as any)?.whatsapp_number ||
    (import.meta.env.VITE_WHATSAPP_NUMBER as string) ||
    '+2348000000000';

  const cleanWhatsappNumber = rawWhatsapp.replace(/[^0-9]/g, '');
  const whatsappEnabled = settings?.whatsappEnabled ?? (settings as any)?.whatsapp_enabled ?? true;

  const buildWhatsAppUrl = (message: string): string => {
    const encoded = encodeURIComponent(message.trim());
    return `https://wa.me/${cleanWhatsappNumber}?text=${encoded}`;
  };

  const rawShipping = settings?.shipping;
  const standardShippingFee = Number(
    rawShipping?.standardFee ?? rawShipping?.standard_fee ?? 3500
  );
  const expressShippingFee = Number(
    rawShipping?.expressFee ?? rawShipping?.express_fee ?? 7000
  );
  const freeShippingThreshold = Number(
    rawShipping?.freeShippingThreshold ?? rawShipping?.free_shipping_threshold ?? 150000
  );

  const calculateShippingFee = (method: 'standard' | 'express', currentSubtotal: number): number => {
    if (currentSubtotal === 0) return 0;
    if (method === 'express') return expressShippingFee;
    if (currentSubtotal >= freeShippingThreshold) return 0;
    return standardShippingFee;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        whatsappNumber: rawWhatsapp,
        whatsappEnabled,
        cleanWhatsappNumber,
        buildWhatsAppUrl,
        standardShippingFee,
        expressShippingFee,
        freeShippingThreshold,
        calculateShippingFee,
        isLoading,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
