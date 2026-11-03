import React from 'react';
import { Scale, X, ArrowRight } from 'lucide-react';
import { useEstate } from '../context/EstateContext';
import { ArchitecturalImage } from './ArchitecturalImage';

export const CompareFloatingBar: React.FC = () => {
  const {
    compareIds,
    properties,
    offMarketProperties,
    toggleCompare,
    clearCompare,
    navigateTo,
    currentRoute,
  } = useEstate();

  if (compareIds.length === 0 || currentRoute === 'compare') {
    return null;
  }

  const allKnown = [...properties, ...offMarketProperties];
  const selectedProps = compareIds
    .map((id) => allKnown.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (selectedProps.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 right-24 z-30 max-w-2xl bg-[#0D0E12]/95 backdrop-blur-md border border-[#C9A962]/45 rounded-xl p-3.5 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-x-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DFC07A] shrink-0">
            <Scale className="w-4 h-4" />
            <span className="tabular-nums">
              Compare ({selectedProps.length}/3)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedProps.map((prop) => (
              <div
                key={prop.id}
                className="flex items-center gap-2 bg-[#060608] border border-white/10 rounded-lg pl-1.5 pr-2 py-1"
              >
                <ArchitecturalImage
                  src={prop.heroImage}
                  alt={prop.title}
                  className="w-8 h-6 rounded object-cover shrink-0"
                />
                <span className="text-xs text-white max-w-[110px] truncate">
                  {prop.title}
                </span>
                <button
                  type="button"
                  onClick={() => toggleCompare(prop.id)}
                  aria-label={`Remove ${prop.title} from comparison`}
                  className="text-zinc-500 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={clearCompare}
            className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => navigateTo('compare')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md gold-metallic-btn cursor-pointer"
          >
            <span>Compare Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
