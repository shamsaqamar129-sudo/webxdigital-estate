/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X } from 'lucide-react';
import { CompareFloatingBar } from './components/CompareFloatingBar';
import { CurrencyBar } from './components/CurrencyBar';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { PrivateViewingModal } from './components/PrivateViewingModal';
import { WhatsAppConciergeButton } from './components/WhatsAppConciergeButton';
import { EstateProvider, useEstate } from './context/EstateContext';
import { AboutPage } from './pages/AboutPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AgentsPage } from './pages/AgentsPage';
import { AuthPage } from './pages/AuthPage';
import { ComparePage } from './pages/ComparePage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { ListingsPage } from './pages/ListingsPage';
import { OffMarketPage } from './pages/OffMarketPage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';
import { SellPropertyPage } from './pages/SellPropertyPage';
import { UserDashboardPage } from './pages/UserDashboardPage';

const EstateAppShell: React.FC = () => {
  const { currentRoute, toast, dismissToast } = useEstate();

  const renderActivePage = () => {
    switch (currentRoute) {
      case 'home':
        return <HomePage />;
      case 'buy':
        return <ListingsPage mode="buy" />;
      case 'rent':
        return <ListingsPage mode="rent" />;
      case 'sell':
        return <SellPropertyPage />;
      case 'off-market':
        return <OffMarketPage />;
      case 'compare':
        return <ComparePage />;
      case 'property-detail':
        return <PropertyDetailsPage />;
      case 'agents':
        return <AgentsPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'auth':
        return <AuthPage />;
      case 'user-dashboard':
        return <UserDashboardPage />;
      case 'admin-dashboard':
        return <AdminDashboardPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060608] text-white selection:bg-[#C9A962] selection:text-[#060608]">
      <Navbar />
      <CurrencyBar />

      <main className="flex-1">{renderActivePage()}</main>

      <Footer />

      {/* Global Interactive Overlays */}
      <PrivateViewingModal />
      <CompareFloatingBar />
      <WhatsAppConciergeButton />

      {/* Luxury Non-Blocking Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-22 right-6 z-50 max-w-sm bg-[#0D0E12] text-white border border-[#C9A962]/50 rounded-xl px-4 py-3.5 shadow-2xl flex items-start justify-between gap-3"
        >
          <div>
            <p className="text-xs font-semibold text-[#DFC07A]">{toast.title}</p>
            {toast.description && (
              <p className="text-xs text-zinc-300 mt-0.5 line-clamp-2">
                {toast.description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={dismissToast}
            aria-label="Dismiss notification"
            className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <EstateProvider>
      <EstateAppShell />
    </EstateProvider>
  );
}
