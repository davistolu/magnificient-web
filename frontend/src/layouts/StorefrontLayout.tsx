import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AnnouncementBar } from '../components/storefront/AnnouncementBar.js';
import { Header } from '../components/storefront/Header.js';
import { Footer } from '../components/storefront/Footer.js';
import { CartDrawer } from '../components/storefront/CartDrawer.js';
import { SearchModal } from '../components/storefront/SearchModal.js';
import { api } from '../services/api.js';

export const StorefrontLayout: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.getPublicSettings();
        if (res.success) {
          setSettings(res.data);
        }
      } catch (e) {
        console.warn('Using default store settings');
      }
    }
    loadSettings();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-ivory-100 text-espresso-800 font-sans selection:bg-champagne/30">
      <AnnouncementBar
        enabled={settings?.announcement?.enabled}
        text={settings?.announcement?.text}
        link={settings?.announcement?.link}
      />
      <Header onOpenSearch={() => setSearchOpen(true)} />

      <main className="flex-1">
        <Outlet context={{ settings }} />
      </main>

      <Footer />
      <CartDrawer />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};
