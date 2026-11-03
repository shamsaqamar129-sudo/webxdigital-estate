import {
  SEED_AGENTS,
  SEED_APPOINTMENTS,
  SEED_INQUIRIES,
  SEED_PROPERTIES,
  SEED_TESTIMONIALS,
  SEED_USERS,
} from '../data/seedData';
import {
  CurrencyCode,
  ExchangeRateState,
  PlatformSettings,
} from '../types/estate';

const FX_STORAGE_KEY = 'wxd_live_fx_cache_v2';
const FX_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

const CURRENCY_META: Record<
  CurrencyCode,
  { symbol: string; label: string; prefix: boolean }
> = {
  [CurrencyCode.USD]: { symbol: '$', label: 'US Dollar', prefix: true },
  [CurrencyCode.EUR]: { symbol: '€', label: 'Euro', prefix: true },
  [CurrencyCode.GBP]: { symbol: '£', label: 'British Pound', prefix: true },
  [CurrencyCode.AED]: { symbol: 'AED ', label: 'UAE Dirham', prefix: true },
  [CurrencyCode.SAR]: { symbol: 'SAR ', label: 'Saudi Riyal', prefix: true },
};

export async function fetchLiveExchangeRates(
  forceRefresh = false
): Promise<ExchangeRateState> {
  if (!forceRefresh) {
    try {
      const cachedRaw = localStorage.getItem(FX_STORAGE_KEY);
      if (cachedRaw) {
        const parsed = JSON.parse(cachedRaw) as {
          savedAtMs: number;
          state: ExchangeRateState;
        };
        if (
          parsed.state?.isLive &&
          Date.now() - parsed.savedAtMs < FX_MAX_AGE_MS
        ) {
          return parsed.state;
        }
      }
    } catch {
      // Ignore storage parse error
    }
  }

  // 1. Try full-stack backend proxy (/api/fx-rates)
  try {
    const res = await fetch('/api/fx-rates');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const payload = await res.json();
      if (payload.isLive && payload.rates) {
        const nextState: ExchangeRateState = {
          isLive: true,
          isLoading: false,
          base: CurrencyCode.USD,
          rates: payload.rates,
          lastUpdated: payload.lastUpdated,
          providerName: payload.providerName || 'ExchangeRate-API',
          error: null,
        };
        try {
          localStorage.setItem(
            FX_STORAGE_KEY,
            JSON.stringify({ savedAtMs: Date.now(), state: nextState })
          );
        } catch {
          // Ignore quota
        }
        return nextState;
      }
    }
  } catch {
    // Fall through to direct public API (useful on static Vercel deployments)
  }

  // 2. Direct reliable ExchangeRate-API fetch (for static / serverless deployments)
  try {
    const directRes = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!directRes.ok) {
      throw new Error(`HTTP ${directRes.status}`);
    }
    const data = await directRes.json();
    if (!data?.rates?.EUR) {
      throw new Error('Incomplete exchange rate response');
    }

    const nextState: ExchangeRateState = {
      isLive: true,
      isLoading: false,
      base: CurrencyCode.USD,
      rates: {
        [CurrencyCode.USD]: 1,
        [CurrencyCode.EUR]: data.rates.EUR,
        [CurrencyCode.GBP]: data.rates.GBP,
        [CurrencyCode.AED]: data.rates.AED,
        [CurrencyCode.SAR]: data.rates.SAR,
      },
      lastUpdated: data.time_last_update_utc
        ? new Date(data.time_last_update_utc).toISOString()
        : new Date().toISOString(),
      providerName: 'ExchangeRate-API (Live Feed)',
      error: null,
    };

    try {
      localStorage.setItem(
        FX_STORAGE_KEY,
        JSON.stringify({ savedAtMs: Date.now(), state: nextState })
      );
    } catch {
      // Ignore storage restrictions
    }
    return nextState;
  } catch {
    // Never present hardcoded conversion numbers as live rates!
    return {
      isLive: false,
      isLoading: false,
      base: CurrencyCode.USD,
      rates: { [CurrencyCode.USD]: 1 },
      lastUpdated: null,
      providerName: 'Offline',
      error:
        'Live exchange rate feed unavailable. Displaying verified base USD prices.',
    };
  }
}

export function formatEstatePrice(
  priceUsd: number,
  currency: CurrencyCode,
  fxState?: ExchangeRateState,
  period?: 'month' | 'year'
): string {
  const periodSuffix = period
    ? ` / ${period === 'month' ? 'mo' : 'yr'}`
    : '';

  if (currency === CurrencyCode.USD) {
    return `$${new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(Math.round(priceUsd))}${periodSuffix}`;
  }

  const liveRate = fxState?.isLive ? fxState.rates[currency] : undefined;
  if (!liveRate || typeof liveRate !== 'number') {
    // Fallback transparently to USD when live rates are unavailable
    return `$${new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(Math.round(priceUsd))}${periodSuffix} (USD)`;
  }

  const meta = CURRENCY_META[currency];
  const converted = Math.round(priceUsd * liveRate);
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(converted);

  return `${meta.symbol}${formatted}${periodSuffix}`;
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  whatsappBusinessNumber:
    (import.meta.env.VITE_WHATSAPP_BUSINESS_NUMBER as string) || '',
  cryptoEscrowProvider:
    (import.meta.env.VITE_CRYPTO_ESCROW_PROVIDER as string) || '',
  cryptoSettlementVerified: Boolean(
    import.meta.env.VITE_CRYPTO_ESCROW_PROVIDER
  ),
  acceptedAssets: ['BTC', 'ETH', 'USDT'],
};

export const FALLBACK_STATIC_SEED = {
  properties: SEED_PROPERTIES,
  agents: SEED_AGENTS,
  appointments: SEED_APPOINTMENTS,
  inquiries: SEED_INQUIRIES,
  testimonials: SEED_TESTIMONIALS,
  users: SEED_USERS,
};
