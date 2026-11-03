import React from 'react';
import { Heart, ArrowUpRight, Calendar, Scale } from 'lucide-react';
import { useEstate } from '../context/EstateContext';
import { ListingCategory, Property } from '../types/estate';
import { ArchitecturalImage } from './ArchitecturalImage';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const {
    navigateTo,
    formatPrice,
    isFavourite,
    toggleFavourite,
    isCompared,
    toggleCompare,
    openBookingModal,
  } = useEstate();

  const saved = isFavourite(property.id);
  const compared = isCompared(property.id);

  const handleOpenProperty = () => {
    navigateTo('property-detail', { propertyId: property.id });
  };

  const statusHeadline = property.isOffMarket
    ? 'Off-Market Sovereign'
    : property.isExclusive
    ? 'Exclusive Mandate'
    : property.featured
    ? 'Featured Residence'
    : property.category === ListingCategory.RENT
    ? 'Executive Lease'
    : 'Private Listing';

  return (
    <article className="group bg-[#0E1015] border border-white/10 hover:border-[#C9A962]/50 rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-0.5">
      {/* 4:3 Lead Imagery (70% visual weight) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#060608]">
        <button
          type="button"
          onClick={handleOpenProperty}
          className="block w-full h-full text-left focus-visible:outline-2 focus-visible:outline-[#C9A962] cursor-pointer"
          aria-label={`View details for ${property.title}`}
        >
          <ArchitecturalImage
            src={property.heroImage}
            alt={`${property.title} in ${property.city}, ${property.country}`}
            fallbackLabel={property.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060608]/85 via-transparent to-black/30" />
        </button>

        {/* Top-Right Interactive Controls: Compare (max 3) + Favourite */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(property.id);
            }}
            title={
              compared ? 'Remove from comparison' : 'Select to compare (up to 3)'
            }
            aria-label={
              compared
                ? `Remove ${property.title} from comparison`
                : `Compare ${property.title}`
            }
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#C9A962] ${
              compared
                ? 'bg-[#C9A962] text-[#060608] border-[#C9A962]'
                : 'bg-black/55 text-white border-white/15 hover:border-[#C9A962]/70'
            }`}
          >
            <Scale className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavourite(property.id);
            }}
            aria-label={
              saved
                ? `Remove ${property.title} from shortlist`
                : `Save ${property.title} to shortlist`
            }
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#C9A962] ${
              saved
                ? 'bg-[#C9A962] text-[#060608] border-[#C9A962]'
                : 'bg-black/55 text-white border-white/15 hover:border-[#C9A962]/70'
            }`}
          >
            <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Scrim Metadata Line (Zero-Pill Discipline) */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
          <span className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#DFC07A]">
            {statusHeadline}
          </span>
          <span className="font-mono text-[11px] text-zinc-300 tabular-nums">
            {property.referenceCode}
          </span>
        </div>
      </div>

      {/* Card Body — Clean Unboxed Metadata */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2 truncate">
            <span className="text-[#C9A962]">{property.type}</span>
            <span aria-hidden="true">·</span>
            <span>
              {property.city}, {property.country}
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenProperty}
            className="text-left group/title focus-visible:outline-2 focus-visible:outline-[#C9A962] cursor-pointer block w-full"
          >
            <h3 className="font-display text-2xl font-semibold text-white group-hover/title:text-[#DFC07A] transition-colors leading-snug line-clamp-1">
              {property.title}
            </h3>
          </button>

          <p className="text-sm text-zinc-400 mt-1 line-clamp-1">
            {property.neighborhood}
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-white/10 space-y-4">
          {/* Unboxed Architectural Specs with typographic separators */}
          <div className="flex items-center gap-2 text-xs text-zinc-300 tabular-nums">
            {property.specs.bedrooms > 0 ? (
              <>
                <span>{property.specs.bedrooms} Beds</span>
                <span aria-hidden="true" className="text-zinc-600">
                  ·
                </span>
                <span>{property.specs.bathrooms} Baths</span>
                <span aria-hidden="true" className="text-zinc-600">
                  ·
                </span>
              </>
            ) : (
              <>
                <span>{property.specs.tenure}</span>
                <span aria-hidden="true" className="text-zinc-600">
                  ·
                </span>
              </>
            )}
            <span>
              {property.specs.interiorSqFt.toLocaleString('en-US')} sq ft
            </span>
            <span aria-hidden="true" className="text-zinc-600">
              ·
            </span>
            <span className="text-emerald-400/90">{property.status}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-lg font-semibold text-white tabular-nums">
              {formatPrice(property.priceUsd, property.pricePeriod)}
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openBookingModal(property)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#DFC07A] border border-[#C9A962]/45 hover:bg-[#C9A962] hover:text-[#060608] rounded transition-colors whitespace-nowrap cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Private Viewing</span>
              </button>

              <button
                type="button"
                onClick={handleOpenProperty}
                aria-label={`Inspect ${property.title}`}
                className="inline-flex items-center justify-center w-8 h-8 rounded bg-white/5 hover:bg-white/15 text-white transition-colors cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
