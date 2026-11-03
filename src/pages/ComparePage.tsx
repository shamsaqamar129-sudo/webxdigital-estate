import React from 'react';
import { Scale, X, Plus, Calendar, ArrowUpRight, Check, Minus } from 'lucide-react';
import { ArchitecturalImage } from '../components/ArchitecturalImage';
import { useEstate } from '../context/EstateContext';

export const ComparePage: React.FC = () => {
  const {
    compareIds,
    properties,
    offMarketProperties,
    toggleCompare,
    clearCompare,
    formatPrice,
    openBookingModal,
    navigateTo,
  } = useEstate();

  const allAvailable = [...properties, ...offMarketProperties];
  const comparedProperties = compareIds
    .map((id) => allAvailable.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const remainingCandidates = allAvailable.filter(
    (p) => !compareIds.includes(p.id)
  );

  // Collect union of all amenities across selected properties
  const allAmenities = Array.from(
    new Set(comparedProperties.flatMap((p) => p.amenities))
  );

  return (
    <div className="bg-[#060608] text-white min-h-screen pb-24">
      <section className="bg-[#0B0C10] border-b border-white/10">
        <div className="max-w-[1380px] mx-auto px-6 py-14 lg:py-18 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#C9A962]">
              Side-by-Side Architectural Matrix
            </p>
            <h1 className="font-display text-[clamp(2.25rem,4vw,3.5rem)] font-semibold text-white leading-tight">
              Property Comparison ({comparedProperties.length}/3)
            </h1>
            <p className="text-sm md:text-base text-zinc-400">
              Evaluate valuation, square footage, bedrooms, tenure, and signature amenities across up to three residences simultaneously.
            </p>
          </div>

          {comparedProperties.length > 0 && (
            <button
              type="button"
              onClick={clearCompare}
              className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-300 border border-white/15 hover:border-[#C9A962] rounded-lg cursor-pointer self-start md:self-auto"
            >
              Clear All Selected
            </button>
          )}
        </div>
      </section>

      <div className="max-w-[1380px] mx-auto px-6 pt-10 space-y-12">
        {/* Quick Add Selector when fewer than 3 properties are selected */}
        {comparedProperties.length < 3 && remainingCandidates.length > 0 && (
          <div className="bg-[#0D0E12] border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-sm text-zinc-300">
              <Plus className="w-4 h-4 text-[#C9A962]" />
              <span>
                Add {comparedProperties.length === 0 ? 'up to 3 residences' : 'another residence'} to compare:
              </span>
            </div>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) toggleCompare(e.target.value);
              }}
              aria-label="Add residence to comparison"
              className="px-4 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none cursor-pointer sm:min-w-[340px]"
            >
              <option value="">Select a residence from portfolio...</option>
              {remainingCandidates.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} — {item.city} ({formatPrice(item.priceUsd, item.pricePeriod)})
                </option>
              ))}
            </select>
          </div>
        )}

        {comparedProperties.length === 0 ? (
          <div className="bg-[#0D0E12] border border-white/10 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-5">
            <Scale className="w-10 h-10 text-[#C9A962] mx-auto stroke-[1.5]" />
            <h2 className="font-display text-3xl font-semibold text-white">
              No Residences Selected Yet
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Use the dropdown above or click the scale icon on any property card in the Buy, Rent, or Off-Market portfolios to compare up to three estates side-by-side.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigateTo('buy')}
                className="px-6 py-3 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn cursor-pointer"
              >
                Browse Buy Portfolio
              </button>
              <button
                type="button"
                onClick={() => navigateTo('rent')}
                className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-200 border border-white/15 hover:border-[#C9A962] rounded-lg cursor-pointer"
              >
                Browse Luxury Rentals
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0D0E12]">
            <table className="w-full min-w-[780px] text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="w-56 p-6 align-top text-xs uppercase tracking-[0.18em] text-[#C9A962] bg-[#090A0E]">
                    Specification
                  </th>
                  {comparedProperties.map((prop) => (
                    <th
                      key={prop.id}
                      className="p-6 align-top border-l border-white/10 w-1/3"
                    >
                      <div className="space-y-4">
                        <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-[#060608]">
                          <ArchitecturalImage
                            src={prop.heroImage}
                            alt={prop.title}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => toggleCompare(prop.id)}
                            aria-label={`Remove ${prop.title}`}
                            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/70 text-zinc-200 hover:text-white flex items-center justify-center cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div>
                          <p className="font-mono text-[11px] text-[#C9A962]">
                            {prop.referenceCode} · {prop.type}
                          </p>
                          <h2 className="font-display text-2xl font-semibold text-white mt-0.5">
                            {prop.title}
                          </h2>
                          <p className="text-xs text-zinc-400 font-normal mt-0.5">
                            {prop.neighborhood}, {prop.city}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openBookingModal(prop)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider rounded gold-metallic-btn cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Book Viewing</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              navigateTo('property-detail', {
                                propertyId: prop.id,
                              })
                            }
                            className="inline-flex items-center gap-1 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-200 border border-white/15 hover:border-[#C9A962] rounded cursor-pointer"
                          >
                            <span>Details</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10 text-sm">
                <tr>
                  <td className="p-5 text-xs uppercase tracking-wider text-zinc-400 bg-[#090A0E] font-medium">
                    Guide Price / Rate
                  </td>
                  {comparedProperties.map((p) => (
                    <td
                      key={`${p.id}-price`}
                      className="p-5 border-l border-white/10 font-mono text-lg font-semibold text-[#DFC07A] tabular-nums"
                    >
                      {formatPrice(p.priceUsd, p.pricePeriod)}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-5 text-xs uppercase tracking-wider text-zinc-400 bg-[#090A0E] font-medium">
                    Location &amp; Jurisdiction
                  </td>
                  {comparedProperties.map((p) => (
                    <td
                      key={`${p.id}-loc`}
                      className="p-5 border-l border-white/10 text-zinc-200"
                    >
                      {p.city}, {p.country}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-5 text-xs uppercase tracking-wider text-zinc-400 bg-[#090A0E] font-medium">
                    Bedrooms &amp; Bathrooms
                  </td>
                  {comparedProperties.map((p) => (
                    <td
                      key={`${p.id}-beds`}
                      className="p-5 border-l border-white/10 font-mono text-zinc-200 tabular-nums"
                    >
                      {p.specs.bedrooms > 0
                        ? `${p.specs.bedrooms} Bedrooms · ${p.specs.bathrooms} Bathrooms`
                        : `Commercial / Land (${p.specs.bathrooms} Restrooms)`}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-5 text-xs uppercase tracking-wider text-zinc-400 bg-[#090A0E] font-medium">
                    Interior Living Area
                  </td>
                  {comparedProperties.map((p) => (
                    <td
                      key={`${p.id}-int`}
                      className="p-5 border-l border-white/10 font-mono text-zinc-200 tabular-nums"
                    >
                      {p.specs.interiorSqFt.toLocaleString('en-US')} sq ft
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-5 text-xs uppercase tracking-wider text-zinc-400 bg-[#090A0E] font-medium">
                    Terrace &amp; Grounds Area
                  </td>
                  {comparedProperties.map((p) => (
                    <td
                      key={`${p.id}-ext`}
                      className="p-5 border-l border-white/10 font-mono text-zinc-200 tabular-nums"
                    >
                      {p.specs.exteriorSqFt.toLocaleString('en-US')} sq ft
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-5 text-xs uppercase tracking-wider text-zinc-400 bg-[#090A0E] font-medium">
                    Tenure &amp; Status
                  </td>
                  {comparedProperties.map((p) => (
                    <td
                      key={`${p.id}-tenure`}
                      className="p-5 border-l border-white/10 text-zinc-200"
                    >
                      {p.specs.tenure} ·{' '}
                      <span className="text-emerald-400">{p.status}</span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-5 text-xs uppercase tracking-wider text-zinc-400 bg-[#090A0E] font-medium">
                    Garaging &amp; Year
                  </td>
                  {comparedProperties.map((p) => (
                    <td
                      key={`${p.id}-garage`}
                      className="p-5 border-l border-white/10 font-mono text-zinc-300 tabular-nums"
                    >
                      {p.specs.parkingSpaces} Vehicles · Built {p.specs.yearBuilt}
                    </td>
                  ))}
                </tr>

                {/* Amenities Comparison Rows */}
                {allAmenities.map((amenity) => (
                  <tr key={amenity}>
                    <td className="px-5 py-3.5 text-xs text-zinc-400 bg-[#090A0E]">
                      {amenity}
                    </td>
                    {comparedProperties.map((p) => {
                      const included = p.amenities.includes(amenity);
                      return (
                        <td
                          key={`${p.id}-${amenity}`}
                          className="px-5 py-3.5 border-l border-white/10"
                        >
                          {included ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-[#DFC07A]">
                              <Check className="w-4 h-4 text-[#C9A962]" />
                              Included
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-600">
                              <Minus className="w-4 h-4" />
                              —
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
