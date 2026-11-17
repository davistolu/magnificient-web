import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App.js';
import { AuthProvider } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { ToastProvider } from './context/ToastContext.js';
import { SettingsProvider } from './context/SettingsContext.js';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <SettingsProvider>
            <App />
          </SettingsProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);
