import { Request, Response } from 'express';
import { store } from '../../database/index.js';
import { DEFAULT_STORE_SETTINGS } from '../../shared/index.js';

export async function getPublicSettings(req: Request, res: Response) {
  const settings = store.storeSettings.get('general') || DEFAULT_STORE_SETTINGS;

  return res.json({
    success: true,
    data: {
      storeName: settings.storeName || 'MagnifiScent',
      tagline: settings.tagline || 'Made to Be Remembered',
      supportEmail: settings.supportEmail || 'concierge@magnifiscent.site',
      whatsappNumber: settings.whatsappNumber || '+2348000000000',
      whatsappEnabled: settings.whatsappEnabled ?? true,
      currency: settings.currency || 'NGN',
      currencySymbol: settings.currencySymbol || '₦',
      announcement: settings.announcement,
      bankDetails: settings.bankDetails,
      shipping: settings.shipping,
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

  store.storeSettings.set('general', newSettings);

  store.auditLogs.push({
    id: `aud-${Date.now()}`,
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
