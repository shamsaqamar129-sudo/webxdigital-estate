import React, { useState } from 'react';
import { Menu, X, Lock } from 'lucide-react';
import { useEstate } from '../context/EstateContext';
import { PageRoute, UserRole } from '../types/estate';

const PRIMARY_NAV_ITEMS: { label: string; route: PageRoute; isVault?: boolean }[] = [
  { label: 'Buy', route: 'buy' },
  { label: 'Rent', route: 'rent' },
  { label: 'Sell', route: 'sell' },
  { label: 'Off-Market', route: 'off-market', isVault: true },
  { label: 'Agents', route: 'agents' },
];

export const Navbar: React.FC = () => {
  const {
    currentRoute,
    navigateTo,
    currentUser,
    favouriteIds,
    compareIds,
    offMarketUnlocked,
  } = useEstate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (route: PageRoute) => {
    navigateTo(route);
    setMobileMenuOpen(false);
  };

  const handlePortalAction = () => {
    setMobileMenuOpen(false);
    if (!currentUser) {
      navigateTo('auth');
      return;
    }
    navigateTo(
      currentUser.role === UserRole.ADMIN ? 'admin-dashboard' : 'user-dashboard'
    );
  };

  const portalButtonLabel = !currentUser
    ? 'VIP Portal'
    : currentUser.role === UserRole.ADMIN
    ? 'Admin Console'
    : 'VIP Dashboard';

  return (
    <header className="sticky top-0 z-40 bg-[#060608]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-[1380px] mx-auto flex items-center justify-between gap-8 px-6 h-18">
        {/* Zone 1: Single clean text element Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="font-display text-xl md:text-2xl font-semibold tracking-[0.14em] text-white hover:text-[#DFC07A] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A962]"
        >
          WEBXDIGITAL ESTATE
        </button>

        {/* Zone 2: 5 clean single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300"
        >
          {PRIMARY_NAV_ITEMS.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => handleNavClick(item.route)}
                className={`relative py-1 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A962] ${
                  isActive
                    ? 'text-[#DFC07A] after:content-[""] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-[1.5px] after:bg-[#C9A962]'
                    : 'hover:text-white'
                }`}
              >
                {item.isVault && (
                  <Lock
                    className={`w-3.5 h-3.5 ${
                      offMarketUnlocked ? 'text-emerald-400' : 'text-[#C9A962]'
                    }`}
                  />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action (+ mobile menu trigger on small screens) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handlePortalAction}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] rounded-md gold-metallic-btn transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A962]"
          >
            {portalButtonLabel}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={
              mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
            className="md:hidden inline-flex items-center justify-center w-10 h-10 text-zinc-200 hover:text-[#C9A962] rounded-md border border-white/15 focus-visible:outline-2 focus-visible:outline-[#C9A962]"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Responsive Mobile & Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0B0F] border-b border-white/10 px-6 py-6">
          <div className="flex flex-col space-y-3">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`text-left py-2 text-base font-medium ${
                currentRoute === 'home' ? 'text-[#C9A962]' : 'text-zinc-200'
              }`}
            >
              Home
            </button>
            {PRIMARY_NAV_ITEMS.map((item) => (
              <button
                key={item.route}
                type="button"
                onClick={() => handleNavClick(item.route)}
                className={`text-left py-2 text-base font-medium flex items-center gap-2 ${
                  currentRoute === item.route
                    ? 'text-[#C9A962]'
                    : 'text-zinc-200'
                }`}
              >
                {item.isVault && <Lock className="w-4 h-4 text-[#C9A962]" />}
                <span>{item.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleNavClick('compare')}
              className={`text-left py-2 text-base font-medium ${
                currentRoute === 'compare' ? 'text-[#C9A962]' : 'text-zinc-200'
              }`}
            >
              Compare Residences ({compareIds.length}/3)
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className={`text-left py-2 text-base font-medium ${
                currentRoute === 'about' ? 'text-[#C9A962]' : 'text-zinc-200'
              }`}
            >
              About WebxDigital Estate
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('contact')}
              className={`text-left py-2 text-base font-medium ${
                currentRoute === 'contact' ? 'text-[#C9A962]' : 'text-zinc-200'
              }`}
            >
              Contact &amp; Global Desks
            </button>

            <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => handleNavClick('user-dashboard')}
                className="text-left py-2 text-sm text-zinc-300 hover:text-white"
              >
                VIP Client Dashboard ({favouriteIds.length} Saved)
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('admin-dashboard')}
                className="text-left py-2 text-sm text-zinc-300 hover:text-white"
              >
                Executive Admin Console
              </button>
              <button
                type="button"
                onClick={handlePortalAction}
                className="mt-2 w-full py-3 px-4 text-xs font-semibold uppercase tracking-[0.14em] rounded-md gold-metallic-btn text-center"
              >
                {portalButtonLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
