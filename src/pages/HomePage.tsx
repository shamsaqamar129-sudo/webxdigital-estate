import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Search,
  ArrowUpRight,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Quote,
  ShieldAlert,
} from 'lucide-react';
import { ESTATE_MEDIA } from '../assets/media';
import { ArchitecturalImage } from '../components/ArchitecturalImage';
import { PropertyCard } from '../components/PropertyCard';
import { useEstate } from '../context/EstateContext';
import {
  ListingCategory,
  PropertyStatus,
  PropertyType,
} from '../types/estate';

const TOP_DESTINATIONS = [
  {
    city: 'London',
    country: 'United Kingdom',
    enclave: 'Mayfair · Belgravia · Knightsbridge',
    image: ESTATE_MEDIA.mayfairResidenceLondon,
  },
  {
    city: 'Dubai',
    country: 'United Arab Emirates',
    enclave: 'Palm Jumeirah · Dubai Marina · DIFC',
    image: ESTATE_MEDIA.waterfrontSuperyachtEstate,
  },
  {
    city: 'New York',
    country: 'United States',
    enclave: 'Billionaires’ Row · Central Park South · Tribeca',
    image: ESTATE_MEDIA.manhattanParkTriplex,
  },
  {
    city: 'Monaco',
    country: 'Principality of Monaco',
    enclave: 'Carré d’Or · Monte-Carlo · Port Hercule',
    image: ESTATE_MEDIA.mediterraneanMonacoVilla,
  },
  {
    city: 'Los Angeles',
    country: 'United States',
    enclave: 'Malibu Point Dume · Beverly Hills · Bel-Air',
    image: ESTATE_MEDIA.oceanfrontVillaMalibu,
  },
] as const;

export const HomePage: React.FC = () => {
  const {
    properties,
    offMarketProperties,
    offMarketUnlocked,
    unlockOffMarketVault,
    agents,
    testimonials,
    navigateTo,
  } = useEstate();

  // Advanced Hero Search State
  const [searchMode, setSearchMode] = useState<'buy' | 'rent'>('buy');
  const [heroKeyword, setHeroKeyword] = useState('');
  const [heroLocation, setHeroLocation] = useState('All');
  const [heroType, setHeroType] = useState('All');
  const [heroMinPrice, setHeroMinPrice] = useState('');
  const [heroMaxPrice, setHeroMaxPrice] = useState('');
  const [heroMinBeds, setHeroMinBeds] = useState(0);

  // Featured Collection Toggle
  const [featuredTab, setFeaturedTab] = useState<'all' | 'buy' | 'rent'>('all');

  // Inline Off-Market Quick Unlock State
  const [vaultCode, setVaultCode] = useState('');
  const [vaultLoading, setVaultLoading] = useState(false);
  const [vaultError, setVaultError] = useState<string | null>(null);

  // Testimonials Carousel Index
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const activeProperties = useMemo(
    () => properties.filter((p) => p.status !== PropertyStatus.SOLD),
    [properties]
  );

  const featuredResidences = useMemo(() => {
    const filtered = activeProperties.filter((p) => {
      if (featuredTab === 'buy') return p.category === ListingCategory.BUY;
      if (featuredTab === 'rent') return p.category === ListingCategory.RENT;
      return p.featured;
    });
    return filtered.slice(0, 6);
  }, [activeProperties, featuredTab]);

  const principalAdvisors = useMemo(
    () => agents.filter((a) => a.isPrincipal).slice(0, 4),
    [agents]
  );

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(searchMode, {
      presetFilters: {
        searchQuery: heroKeyword,
        disposition: searchMode === 'buy' ? 'BUY' : 'RENT',
        location: heroLocation,
        propertyType: heroType,
        minPrice: heroMinPrice,
        maxPrice: heroMaxPrice,
        minBedrooms: heroMinBeds,
        minBathrooms: 0,
        minSqFt: '',
        sortBy: 'featured',
      },
    });
  };

  const handleVaultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVaultError(null);
    if (!vaultCode.trim()) {
      setVaultError('Please enter your private access code.');
      return;
    }
    setVaultLoading(true);
    const res = await unlockOffMarketVault(vaultCode.trim());
    setVaultLoading(false);
    if (!res.ok) {
      setVaultError(res.error || 'Invalid access code.');
    } else {
      setVaultCode('');
    }
  };

  const activeTestimonial =
    testimonials.length > 0
      ? testimonials[testimonialIdx % testimonials.length]
      : null;

  return (
    <div className="bg-[#060608] text-white">
      {/* 1. FULL-SCREEN LUXURY HERO SECTION */}
      <section className="relative min-h-[88vh] flex flex-col justify-between overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <ArchitecturalImage
            src={ESTATE_MEDIA.heroEstateTwilight}
            alt="The Obsidian Promontory cliffside luxury estate at twilight"
            priority
            className="w-full h-full object-cover opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060608]/95 via-[#060608]/72 to-[#060608]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-transparent to-[#060608]/50" />
        </div>

        <div className="relative max-w-[1380px] w-full mx-auto px-6 pt-16 pb-16 lg:pt-24 lg:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl space-y-6"
          >
            <p className="text-xs uppercase tracking-[0.26em] font-semibold text-[#C9A962]">
              London · Dubai · New York · Monaco · Los Angeles
            </p>

            <h1 className="font-display text-[clamp(2.7rem,5vw,4.75rem)] font-semibold leading-[1.04] tracking-tight text-white text-balance">
              Sovereign Architecture &amp;{' '}
              <span className="gold-gradient-text">Extraordinary Estates</span>
            </h1>

            <p className="text-base md:text-lg text-zinc-300 leading-relaxed max-w-2xl">
              WEBXDIGITAL ESTATE advises ultra-high-net-worth principals and global family offices on landmark mansions, superyacht waterfront estates, sky penthouses, and confidential off-market mandates.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigateTo('buy')}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] rounded-lg gold-metallic-btn transition-all cursor-pointer"
              >
                <span>Explore Portfolio</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigateTo('off-market')}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#F3E3B6] bg-black/50 hover:bg-black/80 border border-[#C9A962]/50 rounded-lg transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-[#C9A962]" />
                <span>38% Off-Market Vault</span>
              </button>
            </div>
          </motion.div>

          {/* Integrated Advanced Property Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 lg:mt-16 bg-[#0D0E12]/95 backdrop-blur-xl rounded-2xl p-5 md:p-7 shadow-2xl border border-[#C9A962]/30"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b border-white/10">
              <div className="inline-flex items-center gap-1 p-1 bg-[#060608] border border-white/10 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSearchMode('buy')}
                  className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                    searchMode === 'buy'
                      ? 'bg-[#C9A962] text-[#060608]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Buy Properties
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode('rent')}
                  className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                    searchMode === 'rent'
                      ? 'bg-[#C9A962] text-[#060608]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Luxury Rentals
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigateTo('sell')}
                className="text-xs font-semibold text-[#DFC07A] hover:text-white transition-colors cursor-pointer"
              >
                List a Private Mandate with Our Global Desk →
              </button>
            </div>

            <form
              onSubmit={handleHeroSearch}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end"
            >
              <div className="lg:col-span-3">
                <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                  Location or Residence
                </label>
                <input
                  type="text"
                  value={heroKeyword}
                  onChange={(e) => setHeroKeyword(e.target.value)}
                  placeholder="Mayfair, Palm Jumeirah, Malibu..."
                  className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none placeholder:text-zinc-600"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                  Destination
                </label>
                <select
                  value={heroLocation}
                  onChange={(e) => setHeroLocation(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none cursor-pointer"
                >
                  <option value="All">All Capitals</option>
                  {TOP_DESTINATIONS.map((d) => (
                    <option key={d.city} value={d.city}>
                      {d.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                  Category
                </label>
                <select
                  value={heroType}
                  onChange={(e) => setHeroType(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none cursor-pointer"
                >
                  <option value="All">All 7 Categories</option>
                  {Object.values(PropertyType).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                  Max Price (USD)
                </label>
                <input
                  type="number"
                  min={0}
                  value={heroMaxPrice}
                  onChange={(e) => setHeroMaxPrice(e.target.value)}
                  placeholder={searchMode === 'rent' ? '100000' : '60000000'}
                  className="w-full px-3 py-2.5 text-sm font-mono text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none placeholder:text-zinc-600 tabular-nums"
                />
              </div>

              <div className="lg:col-span-1">
                <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                  Beds
                </label>
                <select
                  value={heroMinBeds}
                  onChange={(e) => setHeroMinBeds(Number(e.target.value))}
                  className="w-full px-2.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none cursor-pointer"
                >
                  <option value={0}>Any</option>
                  <option value={3}>3+</option>
                  <option value={5}>5+</option>
                  <option value={7}>7+</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] rounded-lg gold-metallic-btn cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* 2. LUXURY STATISTICS STRIP */}
        <div className="relative border-t border-white/10 bg-[#08090C]/90 backdrop-blur-md">
          <div className="max-w-[1380px] mx-auto px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <p className="font-mono text-2xl md:text-3xl font-semibold text-[#DFC07A] tabular-nums">
                $5.80B+
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Cumulative Prime Transaction Volume (2019–2026)
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl md:text-3xl font-semibold text-white tabular-nums">
                5 Global Capitals
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                London · Dubai · New York · Monaco · Los Angeles
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl md:text-3xl font-semibold text-[#DFC07A] tabular-nums">
                38% Off-Market
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Unpublished Sovereign &amp; Private Treaty Mandates
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl md:text-3xl font-semibold text-white tabular-nums">
                7 Asset Classes
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Villas, Penthouses, Mansions, Waterfront, Commercial &amp; Land
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED LUXURY PROPERTIES */}
      <section className="max-w-[1380px] mx-auto px-6 py-20 lg:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#C9A962]">
              Curated Global Portfolio
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-white text-balance">
              Featured Luxury Properties
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1 p-1 bg-[#0D0E12] border border-white/10 rounded-lg">
              {(['all', 'buy', 'rent'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFeaturedTab(tab)}
                  className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                    featuredTab === tab
                      ? 'bg-[#C9A962] text-[#060608]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab === 'all'
                    ? 'Signature'
                    : tab === 'buy'
                    ? 'For Sale'
                    : 'For Rent'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                navigateTo(featuredTab === 'rent' ? 'rent' : 'buy')
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#DFC07A] hover:text-white transition-colors cursor-pointer"
            >
              <span>View Full Portfolio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredResidences.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* 4. BUY, RENT & SELL ADVISORY SHOWCASE */}
      <section className="bg-[#0B0C10] border-y border-white/10 py-20 lg:py-24">
        <div className="max-w-[1380px] mx-auto px-6">
          <div className="max-w-2xl space-y-2 mb-12">
            <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#C9A962]">
              Private Brokerage Architecture
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-white">
              Acquire, Lease, or Divest with Absolute Discretion
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-[#060608] border border-white/10 hover:border-[#C9A962]/45 rounded-2xl p-8 flex flex-col justify-between space-y-6 transition-colors">
              <div className="space-y-3">
                <span className="font-mono text-xs text-[#C9A962]">01 / BUY</span>
                <h3 className="font-display text-3xl font-semibold text-white">
                  Trophy Acquisitions
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Access freehold mansions, superyacht waterfront estates, flagship commercial buildings, and coastal peninsula land parcels across five capitals.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('buy')}
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#DFC07A] hover:text-white cursor-pointer"
              >
                <span>Browse Acquisitions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#060608] border border-white/10 hover:border-[#C9A962]/45 rounded-2xl p-8 flex flex-col justify-between space-y-6 transition-colors">
              <div className="space-y-3">
                <span className="font-mono text-xs text-[#C9A962]">02 / RENT</span>
                <h3 className="font-display text-3xl font-semibold text-white">
                  Diplomatic &amp; Seasonal Leases
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Turnkey designer-furnished sky penthouses and Côte d’Azur cliffside villas arranged with housekeeping, security, and yacht berthing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('rent')}
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#DFC07A] hover:text-white cursor-pointer"
              >
                <span>Explore Luxury Rentals</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#060608] border border-white/10 hover:border-[#C9A962]/45 rounded-2xl p-8 flex flex-col justify-between space-y-6 transition-colors">
              <div className="space-y-3">
                <span className="font-mono text-xs text-[#C9A962]">03 / SELL</span>
                <h3 className="font-display text-3xl font-semibold text-white">
                  Private Seller Mandates
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Submit your property for international showcase publication or confidential placement within our gated off-market family office network.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('sell')}
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#DFC07A] hover:text-white cursor-pointer"
              >
                <span>List Your Property</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EXCLUSIVE "38% OFF-MARKET OPPORTUNITIES" VAULT SECTION */}
      <section className="max-w-[1380px] mx-auto px-6 py-20 lg:py-24">
        <div className="relative rounded-2xl overflow-hidden border border-[#C9A962]/40 bg-[#0C0D12]">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-6 p-8 md:p-12 lg:p-14 flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] font-semibold text-[#C9A962]">
                  {offMarketUnlocked ? (
                    <Unlock className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-[#C9A962]" />
                  )}
                  <span>Restricted Sovereign Registry</span>
                </div>

                <h2 className="font-display text-3xl md:text-5xl font-semibold text-white leading-tight">
                  38% OFF-MARKET OPPORTUNITIES
                </h2>

                <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
                  Unpublished trophy mansions, royal lagoon palaces, and diplomatic triplexes withheld from public portals at the instruction of their principals.
                </p>
              </div>

              {!offMarketUnlocked ? (
                <form onSubmit={handleVaultSubmit} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="password"
                      value={vaultCode}
                      onChange={(e) => setVaultCode(e.target.value)}
                      placeholder="Enter Vault Access Code..."
                      aria-label="Off-market vault access code"
                      className="flex-1 px-4 py-3 text-sm font-mono text-white bg-[#060608] border border-white/20 rounded-lg focus:border-[#C9A962] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={vaultLoading}
                      className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] rounded-lg gold-metallic-btn whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      {vaultLoading ? 'Verifying...' : 'Unlock Vault'}
                    </button>
                  </div>

                  {vaultError && (
                    <p className="text-xs text-red-300">{vaultError}</p>
                  )}

                  <div className="p-3.5 rounded-lg bg-[#060608]/90 border border-[#C9A962]/25 text-xs text-zinc-400 space-y-1">
                    <p className="text-zinc-200 font-medium flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#C9A962]" />
                      <span>
                        Demonstration Access Code:{' '}
                        <code className="font-mono text-[#DFC07A]">
                          SOVEREIGN2024
                        </code>
                      </span>
                    </p>
                    <p className="text-[11px] leading-relaxed text-zinc-400">
                      Security Note: Verification is executed server-side via{' '}
                      <code className="font-mono">/api/off-market/unlock</code>{' '}
                      (never hardcoded in frontend code). Replace with principal identity authorization before publishing live confidential mandates.
                    </p>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-emerald-300 font-medium">
                    Clearance active — {offMarketProperties.length} unpublished sovereign estates unlocked below.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigateTo('off-market')}
                    className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] rounded-lg gold-metallic-btn cursor-pointer"
                  >
                    <span>Open Full Off-Market Vault</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-6 relative min-h-[340px]">
              <ArchitecturalImage
                src={ESTATE_MEDIA.offmarketSovereignMansion}
                alt="Confidential basalt and gold off-market mansion at night"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C0D12] via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#0C0D12] lg:via-transparent lg:to-transparent" />
            </div>
          </div>

          {offMarketUnlocked && offMarketProperties.length > 0 && (
            <div className="p-8 md:p-12 border-t border-white/10 bg-[#08090D]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {offMarketProperties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. TOP INTERNATIONAL LUXURY DESTINATIONS */}
      <section className="bg-[#0B0C10] border-y border-white/10 py-20 lg:py-24">
        <div className="max-w-[1380px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#C9A962]">
                Global Footprint
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-semibold text-white">
                Top International Destinations
              </h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-md">
              Select a flagship capital to inspect active villas, penthouses, commercial trophies, and waterfront estates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {TOP_DESTINATIONS.map((dest) => {
              const count = activeProperties.filter(
                (p) => p.city === dest.city
              ).length;
              return (
                <button
                  key={dest.city}
                  type="button"
                  onClick={() =>
                    navigateTo('buy', {
                      presetFilters: {
                        location: dest.city,
                        disposition: 'ALL',
                      },
                    })
                  }
                  className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 hover:border-[#C9A962]/60 text-left cursor-pointer"
                >
                  <ArchitecturalImage
                    src={dest.image}
                    alt={`${dest.city} luxury real estate`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 space-y-1">
                    <p className="font-mono text-[11px] text-[#DFC07A] tabular-nums">
                      {count} Active {count === 1 ? 'Mandate' : 'Mandates'}
                    </p>
                    <h3 className="font-display text-2xl font-semibold text-white group-hover:text-[#DFC07A] transition-colors">
                      {dest.city}
                    </h3>
                    <p className="text-xs text-zinc-300 line-clamp-1">
                      {dest.enclave}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. PREMIUM REAL ESTATE AGENTS */}
      <section className="max-w-[1380px] mx-auto px-6 py-20 lg:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#C9A962]">
              Global Private Desk Leadership
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-white">
              Senior Managing Partners
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigateTo('agents')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#DFC07A] hover:text-white cursor-pointer"
          >
            <span>View All Advisors &amp; Listed Portfolios</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {principalAdvisors.map((advisor) => (
            <div
              key={advisor.id}
              className="bg-[#0D0E12] border border-white/10 hover:border-[#C9A962]/45 rounded-xl overflow-hidden flex flex-col justify-between transition-colors"
            >
              <div className="aspect-[3/4] bg-[#060608] relative">
                <ArchitecturalImage
                  src={advisor.portrait || ''}
                  alt={advisor.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0E12] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-[#DFC07A] font-semibold">
                    {advisor.office} Desk
                  </span>
                  <h3 className="font-display text-2xl font-semibold text-white">
                    {advisor.name}
                  </h3>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <p className="text-xs text-[#C9A962] font-medium">
                    {advisor.title}
                  </p>
                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                    {advisor.bio}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-zinc-300 tabular-nums">
                    {advisor.closedVolume}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigateTo('agents')}
                    className="text-xs font-semibold text-[#DFC07A] hover:text-white cursor-pointer"
                  >
                    Consult →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. CLIENT TESTIMONIALS CAROUSEL (Transparently Labelled Demonstration) */}
      {activeTestimonial && (
        <section className="bg-[#0B0C10] border-y border-white/10 py-20 lg:py-24">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#C9A962]">
                  Principal Endorsements
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mt-1">
                  Client Perspectives
                </h2>
              </div>

              {activeTestimonial.isDemonstration && (
                <span className="px-3 py-1 rounded border border-[#C9A962]/35 bg-[#C9A962]/10 text-[11px] text-[#F3E3B6]">
                  Demonstration Testimonials · Editable in Admin Console
                </span>
              )}
            </div>

            <div className="bg-[#060608] border border-white/10 rounded-2xl p-8 md:p-12 relative">
              <Quote className="w-10 h-10 text-[#C9A962]/35 mb-6" />

              <blockquote className="font-display text-2xl md:text-3xl text-white leading-relaxed">
                “{activeTestimonial.quote}”
              </blockquote>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#C9A962]/15 border border-[#C9A962]/40 flex items-center justify-center font-display text-lg font-semibold text-[#DFC07A] shrink-0">
                    {activeTestimonial.initials}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">
                      {activeTestimonial.clientName}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {activeTestimonial.clientTitle}
                    </p>
                    <p className="text-xs text-[#C9A962] mt-0.5">
                      {activeTestimonial.transactionType}:{' '}
                      {activeTestimonial.propertyAcquired} (
                      {activeTestimonial.location})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() =>
                      setTestimonialIdx(
                        (prev) =>
                          (prev - 1 + testimonials.length) % testimonials.length
                      )
                    }
                    aria-label="Previous testimonial"
                    className="w-10 h-10 rounded-full border border-white/15 hover:border-[#C9A962] flex items-center justify-center text-white cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-xs text-zinc-400 px-2 tabular-nums">
                    {(testimonialIdx % testimonials.length) + 1} /{' '}
                    {testimonials.length}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setTestimonialIdx((prev) => (prev + 1) % testimonials.length)
                    }
                    aria-label="Next testimonial"
                    className="w-10 h-10 rounded-full border border-white/15 hover:border-[#C9A962] flex items-center justify-center text-white cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 9. STRONG INQUIRY CALL-TO-ACTION */}
      <section className="max-w-[1380px] mx-auto px-6 py-20 lg:py-24">
        <div className="rounded-2xl border border-[#C9A962]/40 bg-gradient-to-br from-[#11131A] via-[#090A0E] to-[#17130A] p-8 md:p-14 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#C9A962]">
              Begin a Confidential Dialogue
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-white leading-tight">
              Arrange a Private Portfolio Consultation
            </h2>
            <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
              Connect directly with our Mayfair, DIFC, Fifth Avenue, Monte-Carlo, or Beverly Hills partners to schedule private inspections or structure cross-border acquisitions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => navigateTo('contact')}
              className="px-7 py-4 text-xs font-semibold uppercase tracking-[0.16em] rounded-lg gold-metallic-btn cursor-pointer"
            >
              Inquire with Private Office
            </button>
            <button
              type="button"
              onClick={() => navigateTo('sell')}
              className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-white border border-white/20 hover:border-[#C9A962] rounded-lg transition-colors cursor-pointer"
            >
              Submit Seller Mandate
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
