import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { resolveMediaUrl } from '../assets/media';

interface ArchitecturalImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  priority?: boolean;
}

export const ArchitecturalImage: React.FC<ArchitecturalImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = resolveMediaUrl(src);

  if (hasError || !resolvedSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#060608] via-[#0D0E12] to-[#1A160D] border border-white/10 text-white/80 p-6 text-center select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <Building2 className="w-8 h-8 text-[#C9A962] mb-3 stroke-[1.4]" />
        <span className="font-display text-lg tracking-wide text-white">
          {fallbackLabel || alt}
        </span>
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#C9A962]/80 mt-1.5">
          WEBXDIGITAL ESTATE ARCHIVE
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      loading={priority ? 'eager' : 'lazy'}
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
