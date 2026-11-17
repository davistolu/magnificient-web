import { Request, Response } from 'express';
import crypto from 'crypto';
import { store } from '../../database/index.js';
import { DEFAULT_STORE_SETTINGS } from '../../shared/index.js';

export async function getPublicSettings(req: Request, res: Response) {
  const settings = store.storeSettings.get('general') || DEFAULT_STORE_SETTINGS;

  const rawShipping = settings.shipping || {};
  const standardFee = Number(
    rawShipping.standardFee ?? rawShipping.standard_fee ?? 3500
  );
  const expressFee = Number(
    rawShipping.expressFee ?? rawShipping.express_fee ?? 7000
  );
  const freeShippingThreshold = Number(
    rawShipping.freeShippingThreshold ?? rawShipping.free_shipping_threshold ?? 150000
  );

  return res.json({
    success: true,
    data: {
      storeName: settings.storeName || (settings as any).store_name || 'MagnifiScent',
      tagline: settings.tagline || (settings as any).tagline || 'Made to Be Remembered',
      supportEmail: settings.supportEmail || (settings as any).support_email || 'concierge@magnifiscent.site',
      whatsappNumber: settings.whatsappNumber || (settings as any).whatsapp_number || '+2348000000000',
      whatsappEnabled: settings.whatsappEnabled ?? (settings as any).whatsapp_enabled ?? true,
      currency: settings.currency || 'NGN',
      currencySymbol: settings.currencySymbol || (settings as any).currency_symbol || '₦',
      announcement: settings.announcement,
      bankDetails: settings.bankDetails || (settings as any).bank_details,
      shipping: {
        ...rawShipping,
        standardFee,
        expressFee,
        freeShippingThreshold,
      },
      hero: settings.hero,
    },
  });
}

export async function getAdminSettings(req: Request, res: Response) {
  const settings = store.storeSettings.get('general') || DEFAULT_STORE_SETTINGS;

  return res.json({
    success: true,
    data: settings,
  });
}

export async function updateAdminSettings(req: Request, res: Response) {
  const currentSettings = store.storeSettings.get('general') || DEFAULT_STORE_SETTINGS;
  const newSettings = {
    ...currentSettings,
    ...req.body,
    updatedAt: new Date(),
  };

  await store.saveStoreSetting('general', newSettings);

  await store.saveAuditLog({
    id: crypto.randomUUID(),
    actorId: req.user?.id || 'admin',
    actorName: req.user?.fullName || 'Admin',
    action: 'settings_update',
    resourceType: 'store_settings',
    resourceId: 'general',
    metadata: { updatedKeys: Object.keys(req.body) },
    createdAt: new Date(),
  });

  return res.json({
    success: true,
    message: 'Store settings updated successfully',
    data: newSettings,
  });
}
