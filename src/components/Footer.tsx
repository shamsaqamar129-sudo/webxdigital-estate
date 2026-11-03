import React, { useState } from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { useEstate } from '../context/EstateContext';
import { CurrencyCode, PageRoute } from '../types/estate';

const CURRENCIES: CurrencyCode[] = [
  CurrencyCode.USD,
  CurrencyCode.EUR,
  CurrencyCode.GBP,
  CurrencyCode.AED,
  CurrencyCode.SAR,
];

export const Footer: React.FC = () => {
  const {
    navigateTo,
    currency,
    setCurrency,
    favouriteIds,
    compareIds,
    settings,
  } = useEstate();
  const [showCryptoInfo, setShowCryptoInfo] = useState(false);

  const footerLink = (label: string, route: PageRoute) => (
    <li>
      <button
        type="button"
        onClick={() => navigateTo(route)}
        className="text-sm text-zinc-400 hover:text-[#DFC07A] transition-colors duration-150 cursor-pointer whitespace-nowrap"
      >
        {label}
      </button>
    </li>
  );

  return (
    <footer className="bg-[#050507] text-white border-t border-[#C9A962]/20">
      <div className="max-w-[1380px] mx-auto px-6 py-16 lg:py-20">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-14 border-b border-white/10">
          {/* Column 1: Brand & Currency */}
          <div className="lg:col-span-4 space-y-5">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="font-display text-2xl font-semibold tracking-[0.14em] text-white hover:text-[#DFC07A] transition-colors text-left cursor-pointer"
            >
              WEBXDIGITAL ESTATE
            </button>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              Exclusive international luxury real estate brokerage advising sovereign principals, family offices, and global collectors across London, Dubai, New York, Monaco, and Los Angeles.
            </p>
            <div className="pt-1">
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-2">
                Portfolio Display Currency
              </p>
              <div className="inline-flex flex-wrap items-center p-1 bg-white/[0.03] border border-white/10 rounded-md gap-1">
                {CURRENCIES.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setCurrency(code)}
                    className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer whitespace-nowrap ${
                      currency === code
                        ? 'bg-[#C9A962] text-[#060608] font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Portfolio & Categories */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A962]">
              Portfolio
            </h3>
            <ul className="space-y-2.5">
              {footerLink('Home', 'home')}
              {footerLink('Buy Residences', 'buy')}
              {footerLink('Luxury Leases', 'rent')}
              {footerLink('List a Mandate', 'sell')}
              {footerLink('38% Off-Market Vault', 'off-market')}
              {footerLink(`Compare (${compareIds.length}/3)`, 'compare')}
            </ul>
          </div>

          {/* Column 3: Firm & VIP Workspaces */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A962]">
              Firm &amp; Portals
            </h3>
            <ul className="space-y-2.5">
              {footerLink('Private Client Advisors', 'agents')}
              {footerLink('About WebxDigital Estate', 'about')}
              {footerLink('Contact & Global Desks', 'contact')}
              {footerLink(
                `VIP Client Dashboard (${favouriteIds.length})`,
                'user-dashboard'
              )}
              {footerLink('Executive Admin Console', 'admin-dashboard')}
              {footerLink('Login & Registration', 'auth')}
            </ul>
          </div>

          {/* Column 4: Global Luxury Destinations */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A962]">
              International Desks
            </h3>
            <div className="space-y-2.5 text-sm text-zinc-400">
              <p>
                <span className="text-white font-medium">London</span> · Mayfair W1K
              </p>
              <p>
                <span className="text-white font-medium">Dubai</span> · DIFC Gate Village
              </p>
              <p>
                <span className="text-white font-medium">New York</span> · Fifth Avenue
              </p>
              <p>
                <span className="text-white font-medium">Monaco</span> · Carré d’Or, 98000
              </p>
              <p>
                <span className="text-white font-medium">Los Angeles</span> · Malibu &amp; Beverly Hills
              </p>
              <p className="pt-1 font-mono text-xs text-[#C9A962] tabular-nums">
                private@webxdigital-estate.com
              </p>
            </div>
          </div>
        </div>

        {/* Cryptocurrency Settlement Badges & Honest Disclosure */}
        <div className="py-7 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs uppercase tracking-[0.18em] text-zinc-400 mr-1">
              Digital Asset Settlement Advisory:
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-[#C9A962]/35 bg-[#C9A962]/10 text-xs font-mono text-[#F3E3B6]">
              <span className="text-[#C9A962] font-bold">₿</span> BTC Accepted
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-[#C9A962]/35 bg-[#C9A962]/10 text-xs font-mono text-[#F3E3B6]">
              <span className="text-[#C9A962] font-bold">Ξ</span> ETH Accepted
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-[#C9A962]/35 bg-[#C9A962]/10 text-xs font-mono text-[#F3E3B6]">
              <span className="text-[#C9A962] font-bold">₮</span> USDT Accepted
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowCryptoInfo((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-[#DFC07A] transition-colors cursor-pointer self-start lg:self-auto"
          >
            <Info className="w-3.5 h-3.5 text-[#C9A962]" />
            <span>
              {settings.cryptoSettlementVerified && settings.cryptoEscrowProvider
                ? `Escrow Desk: ${settings.cryptoEscrowProvider}`
                : 'View Digital Asset Escrow & Compliance Protocol'}
            </span>
          </button>
        </div>

        {showCryptoInfo && (
          <div className="mt-4 p-4 rounded-lg bg-[#0E1015] border border-[#C9A962]/30 text-xs text-zinc-300 leading-relaxed flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-[#C9A962] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white mb-1">
                Regulated Notarial &amp; Digital Asset Settlement Disclosure
              </p>
              <p>
                WEBXDIGITAL ESTATE does not process online cryptocurrency checkouts or hold client funds on this website. Where sellers authorize digital asset consideration (BTC, ETH, or USDT), settlement is coordinated offline through a licensed institutional OTC custody and real estate escrow partner subject to full KYC/AML verification in the property jurisdiction.{' '}
                {settings.cryptoEscrowProvider
                  ? `Configured Institutional Desk: ${settings.cryptoEscrowProvider}.`
                  : 'No live payment gateway is connected in demonstration mode; administrators may configure institutional escrow details in the Admin Console.'}
              </p>
            </div>
          </div>
        )}

        {/* Copyright & Explicit WebxDigital Attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-500">
          <p>
            © {new Date().getFullYear()} WEBXDIGITAL ESTATE. Architectural photography and specifications subject to formal contract verification.
          </p>
          <p className="text-zinc-300 font-medium">
            Designed &amp; Developed by{' '}
            <span className="gold-gradient-text font-semibold tracking-wider">
              WebxDigital
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};
