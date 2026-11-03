import React, { useMemo } from 'react';
import { SlidersHorizontal, Lock } from 'lucide-react';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyFilterBar } from '../components/PropertyFilterBar';
import { useEstate } from '../context/EstateContext';
import { ListingCategory, PropertyStatus } from '../types/estate';

interface ListingsPageProps {
  mode: 'buy' | 'rent';
}

export const ListingsPage: React.FC<ListingsPageProps> = ({ mode }) => {
  const {
    properties,
    catalogFilters,
    setCatalogFilters,
    resetCatalogFilters,
    navigateTo,
  } = useEstate();

  const targetCategory =
    mode === 'buy' ? ListingCategory.BUY : ListingCategory.RENT;

  const baseProperties = useMemo(() => {
    return properties.filter((p) => {
      if (p.status === PropertyStatus.SOLD) return false;
      if (catalogFilters.disposition === 'ALL') {
        return p.category === targetCategory;
      }
      return p.category === catalogFilters.disposition;
    });
  }, [properties, targetCategory, catalogFilters.disposition]);

  const availableLocations = useMemo(() => {
    const cities = new Set([
      'London',
      'Dubai',
      'New York',
      'Monaco',
      'Los Angeles',
      ...properties.map((p) => p.city),
    ]);
    return Array.from(cities).sort();
  }, [properties]);

  const filteredProperties = useMemo(() => {
    const query = catalogFilters.searchQuery.trim().toLowerCase();
    const minPriceNum = catalogFilters.minPrice
      ? Number(catalogFilters.minPrice)
      : 0;
    const maxPriceNum = catalogFilters.maxPrice
      ? Number(catalogFilters.maxPrice)
      : Infinity;
    const minSqFtNum = catalogFilters.minSqFt
      ? Number(catalogFilters.minSqFt)
      : 0;

    const list = baseProperties.filter((property) => {
      if (query) {
        const haystack = `${property.title} ${property.subtitle} ${property.city} ${property.country} ${property.neighborhood} ${property.referenceCode} ${property.type}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (
        catalogFilters.location !== 'All' &&
        property.city !== catalogFilters.location
      ) {
        return false;
      }

      if (
        catalogFilters.propertyType !== 'All' &&
        property.type !== catalogFilters.propertyType
      ) {
        return false;
      }

      if (
        catalogFilters.minBedrooms > 0 &&
        property.specs.bedrooms < catalogFilters.minBedrooms
      ) {
        return false;
      }

      if (
        catalogFilters.minBathrooms > 0 &&
        property.specs.bathrooms < catalogFilters.minBathrooms
      ) {
        return false;
      }

      if (minPriceNum > 0 && property.priceUsd < minPriceNum) {
        return false;
      }

      if (maxPriceNum < Infinity && property.priceUsd > maxPriceNum) {
        return false;
      }

      if (minSqFtNum > 0 && property.specs.interiorSqFt < minSqFtNum) {
        return false;
      }

      return true;
    });

    return [...list].sort((a, b) => {
      switch (catalogFilters.sortBy) {
        case 'price-desc':
          return b.priceUsd - a.priceUsd;
        case 'price-asc':
          return a.priceUsd - b.priceUsd;
        case 'sqft-desc':
          return b.specs.interiorSqFt - a.specs.interiorSqFt;
        case 'newest':
          return b.createdAt.localeCompare(a.createdAt);
        case 'featured':
        default:
          return Number(b.featured) - Number(a.featured);
      }
    });
  }, [baseProperties, catalogFilters]);

  return (
    <div className="bg-[#060608] text-white min-h-screen pb-24">
      {/* Header */}
      <section className="bg-[#0B0C10] border-b border-white/10">
        <div className="max-w-[1380px] mx-auto px-6 py-16 lg:py-20">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#C9A962]">
              {mode === 'buy'
                ? 'International Freehold & Trophy Acquisitions'
                : 'Turnkey Diplomatic, Corporate & Seasonal Residences'}
            </p>
            <h1 className="font-display text-[clamp(2.35rem,4.2vw,3.75rem)] font-semibold text-white leading-tight text-balance">
              {mode === 'buy'
                ? 'Acquire Extraordinary Residences'
                : 'Luxury Executive & Seasonal Leases'}
            </h1>
            <p className="text-zinc-400 text-base leading-relaxed max-w-2xl">
              {mode === 'buy'
                ? 'Filter across luxury villas, sky penthouses, mansions, superyacht waterfront estates, commercial headquarters, and coastal peninsula land.'
                : 'Immediate-occupancy residences delivered with bespoke furnishings, private concierge staffing, and flexible diplomatic or annual terms.'}
            </p>
          </div>
        </div>
      </section>

      {/* Filter Bar & Grid */}
      <div className="max-w-[1380px] mx-auto px-6 py-10 lg:py-14 space-y-10">
        <PropertyFilterBar
          filters={catalogFilters}
          onChange={setCatalogFilters}
          onReset={() =>
            setCatalogFilters({
              searchQuery: '',
              disposition: mode === 'buy' ? 'BUY' : 'RENT',
              location: 'All',
              propertyType: 'All',
              minPrice: '',
              maxPrice: '',
              minBedrooms: 0,
              minBathrooms: 0,
              minSqFt: '',
              sortBy: 'featured',
            })
          }
          availableLocations={availableLocations}
          totalCount={filteredProperties.length}
        />

        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="bg-[#0D0E12] border border-white/10 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#C9A962]/15 text-[#DFC07A] flex items-center justify-center mx-auto">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <h2 className="font-display text-3xl font-semibold text-white">
              No Residences Match Your Criteria
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Broaden your price, size, or category filters, or unlock our 38% Off-Market Vault for unpublished sovereign estates.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={resetCatalogFilters}
                className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn cursor-pointer"
              >
                Clear All Filters
              </button>
              <button
                type="button"
                onClick={() => navigateTo('off-market')}
                className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-200 border border-white/15 hover:border-[#C9A962] rounded-lg cursor-pointer"
              >
                Open Off-Market Vault
              </button>
            </div>
          </div>
        )}

        {/* Off-Market Callout */}
        <div className="bg-[#0D0E12] border border-[#C9A962]/35 rounded-2xl p-8 md:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-[#C9A962] font-semibold inline-flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Private Placement Desk</span>
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-white">
              Looking for Confidential Off-Market Opportunities?
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Enter your principal clearance code in our Off-Market Vault or brief a Managing Partner directly.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigateTo('off-market')}
              className="px-5 py-3 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn cursor-pointer"
            >
              Access 38% Off-Market Vault
            </button>
            <button
              type="button"
              onClick={() => navigateTo('sell')}
              className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-200 border border-white/20 hover:border-[#C9A962] rounded-lg transition-colors cursor-pointer"
            >
              List a Property
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
