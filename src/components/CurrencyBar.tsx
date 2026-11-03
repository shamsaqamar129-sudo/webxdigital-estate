import React from 'react';
import { RefreshCw, Scale, Heart, AlertCircle } from 'lucide-react';
import { useEstate } from '../context/EstateContext';
import { CurrencyCode } from '../types/estate';

const CURRENCIES: CurrencyCode[] = [
  CurrencyCode.USD,
  CurrencyCode.EUR,
  CurrencyCode.GBP,
  CurrencyCode.AED,
  CurrencyCode.SAR,
];

export const CurrencyBar: React.FC = () => {
  const {
    currency,
    setCurrency,
    fxState,
    refreshExchangeRates,
    compareIds,
    favouriteIds,
    navigateTo,
    currentRoute,
  } = useEstate();

  const formattedUpdatedTime = fxState.lastUpdated
    ? new Date(fxState.lastUpdated).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="bg-[#0B0C10] border-b border-white/10 text-xs text-zinc-400">
      <div className="max-w-[1380px] mx-auto px-6 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Live Currency Switcher + Honest Rate Status */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1" role="group" aria-label="Display Currency">
            <span className="text-[11px] uppercase tracking-[0.16em] text-zinc-500 mr-1 hidden sm:inline">
              Currency:
            </span>
            {CURRENCIES.map((code) => {
              const active = currency === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCurrency(code)}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#C9A962] text-[#060608] font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {code}
                </button>
              );
            })}
          </div>

          <span className="text-white/15 hidden md:inline" aria-hidden="true">|</span>

          {fxState.isLive ? (
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 tabular-nums">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="hidden sm:inline">
                Live FX ({fxState.providerName})
              </span>
              {formattedUpdatedTime && (
                <span className="text-zinc-500">
                  · Updated {formattedUpdatedTime}
                </span>
              )}
              <button
                type="button"
                onClick={() => refreshExchangeRates()}
                disabled={fxState.isLoading}
                title="Refresh live exchange rates"
                aria-label="Refresh live exchange rates"
                className="p-1 text-zinc-400 hover:text-[#C9A962] transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3 h-3 ${fxState.isLoading ? 'animate-spin' : ''}`}
                />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[11px] text-amber-300/90">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>
                {fxState.isLoading
                  ? 'Fetching live FX rates...'
                  : fxState.error || 'Exchange rates unavailable — showing USD base'}
              </span>
              {!fxState.isLoading && (
                <button
                  type="button"
                  onClick={() => refreshExchangeRates()}
                  className="underline hover:text-white cursor-pointer"
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Compare, Shortlist, About & Contact utility links */}
        <div className="flex items-center gap-5 text-[11px]">
          <button
            type="button"
            onClick={() => navigateTo('compare')}
            className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              currentRoute === 'compare'
                ? 'text-[#C9A962] font-medium'
                : 'text-zinc-300 hover:text-[#C9A962]'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-[#C9A962]" />
            <span className="tabular-nums">Compare ({compareIds.length}/3)</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('user-dashboard')}
            className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-[#C9A962] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Heart className="w-3.5 h-3.5 text-[#C9A962]" />
            <span className="tabular-nums">Shortlist ({favouriteIds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('about')}
            className={`hidden sm:inline transition-colors cursor-pointer whitespace-nowrap ${
              currentRoute === 'about'
                ? 'text-[#C9A962] font-medium'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            About Firm
          </button>

          <button
            type="button"
            onClick={() => navigateTo('contact')}
            className={`hidden sm:inline transition-colors cursor-pointer whitespace-nowrap ${
              currentRoute === 'contact'
                ? 'text-[#C9A962] font-medium'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Global Desks
          </button>
        </div>
      </div>
    </div>
  );
};
