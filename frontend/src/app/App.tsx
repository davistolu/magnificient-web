import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StorefrontLayout } from '../layouts/StorefrontLayout.js';
import { AdminLayout } from '../layouts/AdminLayout.js';

// Storefront pages
import { HomePage } from '../pages/storefront/HomePage.js';
import { ShopPage } from '../pages/storefront/ShopPage.js';
import { ProductDetailPage } from '../pages/storefront/ProductDetailPage.js';
import { CartPage } from '../pages/storefront/CartPage.js';
import { CheckoutPage } from '../pages/storefront/CheckoutPage.js';
import { PaymentInstructionsPage } from '../pages/storefront/PaymentInstructionsPage.js';
import { OrderTrackingPage } from '../pages/storefront/OrderTrackingPage.js';
import { AboutPage } from '../pages/storefront/AboutPage.js';
import { ContactPage } from '../pages/storefront/ContactPage.js';
import { FaqPage } from '../pages/storefront/FaqPage.js';
import { PoliciesPage } from '../pages/storefront/PoliciesPage.js';
import { TermsPage } from '../pages/storefront/TermsPage.js';
import { PrivacyPage } from '../pages/storefront/PrivacyPage.js';
import { CustomerLoginPage } from '../pages/storefront/CustomerLoginPage.js';
import { CustomerRegisterPage } from '../pages/storefront/CustomerRegisterPage.js';
import { CustomerAccountPage } from '../pages/storefront/CustomerAccountPage.js';

// Admin pages
import { AdminLoginPage } from '../pages/admin/AdminLoginPage.js';
import { DashboardOverviewPage } from '../pages/admin/DashboardOverviewPage.js';
import { PaymentVerificationPage } from '../pages/admin/PaymentVerificationPage.js';
import { OrderListPage } from '../pages/admin/OrderListPage.js';
import { OrderDetailPage } from '../pages/admin/OrderDetailPage.js';
import { ProductListPage } from '../pages/admin/ProductListPage.js';
import { ProductEditPage } from '../pages/admin/ProductEditPage.js';
import { InventoryManagerPage } from '../pages/admin/InventoryManagerPage.js';
import { CustomerListPage } from '../pages/admin/CustomerListPage.js';
import { DiscountManagerPage } from '../pages/admin/DiscountManagerPage.js';
import { StoreSettingsPage } from '../pages/admin/StoreSettingsPage.js';
import { AuditLogPage } from '../pages/admin/AuditLogPage.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Storefront Layout */}
        <Route element={<StorefrontLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/watches" element={<ShopPage categorySlug="watches" />} />
          <Route path="/jewellery" element={<ShopPage categorySlug="jewellery" />} />
          <Route path="/perfumes" element={<ShopPage categorySlug="perfumes" />} />
          <Route path="/gift-sets" element={<ShopPage categorySlug="gift-sets" />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment-instructions/:orderNumber" element={<PaymentInstructionsPage />} />
          <Route path="/order-confirmation/:orderNumber" element={<OrderTrackingPage />} />
          <Route path="/track" element={<OrderTrackingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/shipping-policy" element={<PoliciesPage />} />
          <Route path="/returns-policy" element={<PoliciesPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/privacy-policy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/terms-and-conditions" element={<TermsPage />} />
          <Route path="/login" element={<CustomerLoginPage />} />
          <Route path="/register" element={<CustomerRegisterPage />} />
          <Route path="/account" element={<CustomerAccountPage />} />
        </Route>

        {/* Administration Login (Standalone) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Administration Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardOverviewPage />} />
          <Route path="payments" element={<PaymentVerificationPage />} />
          <Route path="orders" element={<OrderListPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/new" element={<ProductEditPage />} />
          <Route path="products/:id/edit" element={<ProductEditPage />} />
          <Route path="inventory" element={<InventoryManagerPage />} />
          <Route path="customers" element={<CustomerListPage />} />
          <Route path="discounts" element={<DiscountManagerPage />} />
          <Route path="settings" element={<StoreSettingsPage />} />
          <Route path="audit" element={<AuditLogPage />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
