import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import {
  ListingCategory,
  PropertyFilterState,
  PropertyType,
} from '../types/estate';

interface PropertyFilterBarProps {
  category?: ListingCategory;
  filters: PropertyFilterState;
  onChange: React.Dispatch<React.SetStateAction<PropertyFilterState>>;
  onReset: () => void;
  availableLocations: string[];
  totalCount: number;
}

const PROPERTY_TYPE_OPTIONS = [
  'All',
  PropertyType.VILLA,
  PropertyType.PENTHOUSE,
  PropertyType.APARTMENT,
  PropertyType.MANSION,
  PropertyType.COMMERCIAL,
  PropertyType.WATERFRONT,
  PropertyType.LAND,
];

const BEDROOM_OPTIONS = [
  { value: 0, label: 'Any Beds' },
  { value: 3, label: '3+ Beds' },
  { value: 4, label: '4+ Beds' },
  { value: 5, label: '5+ Beds' },
  { value: 6, label: '6+ Beds' },
  { value: 7, label: '7+ Beds' },
];

const BATHROOM_OPTIONS = [
  { value: 0, label: 'Any Baths' },
  { value: 3, label: '3+ Baths' },
  { value: 5, label: '5+ Baths' },
  { value: 7, label: '7+ Baths' },
];

export const PropertyFilterBar: React.FC<PropertyFilterBarProps> = ({
  category,
  filters,
  onChange,
  onReset,
  availableLocations,
  totalCount,
}) => {
  const hasActiveFilters =
    filters.searchQuery.trim() !== '' ||
    filters.location !== 'All' ||
    filters.propertyType !== 'All' ||
    filters.minPrice.trim() !== '' ||
    filters.maxPrice.trim() !== '' ||
    filters.minBedrooms > 0 ||
    filters.minBathrooms > 0 ||
    filters.minSqFt.trim() !== '' ||
    filters.sortBy !== 'featured';

  return (
    <section
      aria-label="Advanced Property Search and Filters"
      className="bg-[#0D0E12] border border-white/10 rounded-xl p-5 md:p-6 space-y-5"
    >
      {/* Row 1: Keyword, Destination, Buy/Rent, Min Price, Max Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3.5">
        <div className="lg:col-span-4 relative">
          <label htmlFor="property-search-input" className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
            Location, Residence or Ref
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#C9A962] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="property-search-input"
              type="text"
              value={filters.searchQuery}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              placeholder="London, Palm Jumeirah, WXD-101..."
              className="w-full pl-10 pr-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none placeholder:text-zinc-600"
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="filter-location" className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
            Destination
          </label>
          <select
            id="filter-location"
            value={filters.location}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, location: e.target.value }))
            }
            className="w-full px-3 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none cursor-pointer"
          >
            <option value="All">All Destinations</option>
            {availableLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="filter-disposition" className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
            Tenure Type
          </label>
          <select
            id="filter-disposition"
            value={category ? category : filters.disposition}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                disposition: e.target.value as PropertyFilterState['disposition'],
              }))
            }
            className="w-full px-3 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none cursor-pointer"
          >
            <option value="ALL">Buy &amp; Rent</option>
            <option value="BUY">Buy Only</option>
            <option value="RENT">Rent Only</option>
          </select>
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="filter-min-price" className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
            Min Price (USD)
          </label>
          <input
            id="filter-min-price"
            type="number"
            min={0}
            value={filters.minPrice}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, minPrice: e.target.value }))
            }
            placeholder="e.g. 15000000"
            className="w-full px-3 py-2.5 text-sm text-white font-mono bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none placeholder:text-zinc-600 tabular-nums"
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="filter-max-price" className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
            Max Price (USD)
          </label>
          <input
            id="filter-max-price"
            type="number"
            min={0}
            value={filters.maxPrice}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, maxPrice: e.target.value }))
            }
            placeholder="e.g. 60000000"
            className="w-full px-3 py-2.5 text-sm text-white font-mono bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none placeholder:text-zinc-600 tabular-nums"
          />
        </div>
      </div>

      {/* Row 2: Beds, Baths, Min Area, Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
        <div className="lg:col-span-2">
          <label htmlFor="filter-bedrooms" className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
            Bedrooms
          </label>
          <select
            id="filter-bedrooms"
            value={filters.minBedrooms}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                minBedrooms: Number(e.target.value),
              }))
            }
            className="w-full px-3 py-2 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none cursor-pointer"
          >
            {BEDROOM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="filter-bathrooms" className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
            Bathrooms
          </label>
          <select
            id="filter-bathrooms"
            value={filters.minBathrooms}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                minBathrooms: Number(e.target.value),
              }))
            }
            className="w-full px-3 py-2 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none cursor-pointer"
          >
            {BATHROOM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-3">
          <label htmlFor="filter-min-sqft" className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
            Min Interior Size (sq ft)
          </label>
          <input
            id="filter-min-sqft"
            type="number"
            min={0}
            value={filters.minSqFt}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, minSqFt: e.target.value }))
            }
            placeholder="e.g. 6000"
            className="w-full px-3 py-2 text-sm text-white font-mono bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none placeholder:text-zinc-600 tabular-nums"
          />
        </div>

        <div className="lg:col-span-3">
          <label htmlFor="sort-select" className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
            Sort Portfolio
          </label>
          <select
            id="sort-select"
            value={filters.sortBy}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                sortBy: e.target.value as PropertyFilterState['sortBy'],
              }))
            }
            className="w-full px-3 py-2 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none cursor-pointer"
          >
            <option value="featured">Featured Curation</option>
            <option value="newest">Newest Mandates</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="sqft-desc">Largest Interior Area</option>
          </select>
        </div>

        <div className="lg:col-span-2 flex items-center justify-between lg:justify-end gap-3 pb-1">
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onReset}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#060608] bg-[#C9A962] hover:bg-[#DFC07A] rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          ) : (
            <span className="text-xs text-zinc-400 tabular-nums">
              <strong className="text-white">{totalCount}</strong>{' '}
              {totalCount === 1 ? 'Residence' : 'Residences'}
            </span>
          )}
        </div>
      </div>

      {/* Row 3: All 7 Luxury Property Categories */}
      <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {PROPERTY_TYPE_OPTIONS.map((typeOption) => {
            const active = filters.propertyType === typeOption;
            return (
              <button
                key={typeOption}
                type="button"
                onClick={() =>
                  onChange((prev) => ({ ...prev, propertyType: typeOption }))
                }
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#C9A962] text-[#060608] border-[#C9A962] font-semibold'
                    : 'bg-[#060608] text-zinc-300 border-white/10 hover:border-[#C9A962]/50 hover:text-white'
                }`}
              >
                {typeOption === 'All' ? 'All Categories' : typeOption}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <span className="text-xs text-zinc-400 tabular-nums">
            Showing <strong className="text-[#DFC07A]">{totalCount}</strong>{' '}
            matching {totalCount === 1 ? 'mandate' : 'mandates'}
          </span>
        )}
      </div>
    </section>
  );
};
