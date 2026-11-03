import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Check,
  Calendar,
  Scale,
  Maximize2,
  Play,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import { ArchitecturalImage } from '../components/ArchitecturalImage';
import { PropertyCard } from '../components/PropertyCard';
import { useEstate } from '../context/EstateContext';
import { ListingCategory } from '../types/estate';

export const PropertyDetailsPage: React.FC = () => {
  const {
    properties,
    offMarketProperties,
    agents,
    selectedPropertyId,
    navigateTo,
    formatPrice,
    isFavourite,
    toggleFavourite,
    isCompared,
    toggleCompare,
    openBookingModal,
    currentUser,
    submitInquiry,
  } = useEstate();

  const allKnownProperties = useMemo(
    () => [...properties, ...offMarketProperties],
    [properties, offMarketProperties]
  );

  const property = useMemo(
    () =>
      allKnownProperties.find((p) => p.id === selectedPropertyId) ||
      properties[0],
    [allKnownProperties, properties, selectedPropertyId]
  );

  const advisor = useMemo(
    () => agents.find((a) => a.id === property?.agentId) || agents[0],
    [agents, property]
  );

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Inquiry Form State
  const [clientName, setClientName] = useState(currentUser?.fullName || '');
  const [clientEmail, setClientEmail] = useState(currentUser?.email || '');
  const [clientPhone, setClientPhone] = useState(currentUser?.phone || '');
  const [preferredDate, setPreferredDate] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
    setSubmittedSuccess(false);
    setFormError(null);
    if (property) {
      setMessage(
        `Please share the private architectural dossier and floorplans for ${property.title} (${property.referenceCode}).`
      );
    }
  }, [property?.id]);

  useEffect(() => {
    if (currentUser) {
      setClientName(currentUser.fullName);
      setClientEmail(currentUser.email);
      setClientPhone(currentUser.phone);
    }
  }, [currentUser?.id]);

  const galleryImages = useMemo(() => {
    if (!property) return [];
    return property.gallery && property.gallery.length > 0
      ? property.gallery
      : [property.heroImage];
  }, [property]);

  // Keyboard navigation for Full-Screen Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
      }
      if (e.key === 'ArrowLeft') {
        setActiveImageIndex(
          (prev) => (prev - 1 + galleryImages.length) % galleryImages.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen, galleryImages.length]);

  if (!property) return null;

  const relatedProperties = properties
    .filter((p) => p.id !== property.id && p.category === property.category)
    .slice(0, 3);

  const saved = isFavourite(property.id);
  const compared = isCompared(property.id);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (clientName.trim().length < 2) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim())) {
      setFormError('Please provide a valid email address.');
      return;
    }
    if (clientPhone.trim().length < 7) {
      setFormError('Please provide a valid telephone or WhatsApp number.');
      return;
    }
    if (message.trim().length < 10) {
      setFormError('Please include a brief note regarding your inquiry.');
      return;
    }

    const res = await submitInquiry({
      type: 'PROPERTY_INQUIRY',
      propertyId: property.id,
      propertyTitle: property.title,
      propertyReference: property.referenceCode,
      agentId: advisor?.id,
      agentName: advisor?.name,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      preferredDate: preferredDate || undefined,
      message: message.trim(),
    });

    if (!res.ok) {
      setFormError(res.error || 'Submission failed.');
      return;
    }
    setSubmittedSuccess(true);
  };

  const osmEmbedUrl = property.geo?.osmBbox
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
        property.geo.osmBbox
      )}&layer=mapnik&marker=${encodeURIComponent(
        `${property.geo.lat},${property.geo.lng}`
      )}`
    : null;

  return (
    <div className="bg-[#060608] text-white pb-24">
      {/* Breadcrumb Bar */}
      <div className="bg-[#0B0C10] border-b border-white/10">
        <div className="max-w-[1380px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() =>
              navigateTo(
                property.isOffMarket
                  ? 'off-market'
                  : property.category === ListingCategory.RENT
                  ? 'rent'
                  : 'buy'
              )
            }
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-[#DFC07A] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#C9A962]" />
            <span>
              Back to{' '}
              {property.isOffMarket
                ? 'Off-Market Vault'
                : property.category === ListingCategory.RENT
                ? 'Luxury Rentals'
                : 'Buy Portfolio'}
            </span>
          </button>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>{property.country}</span>
            <span aria-hidden="true">/</span>
            <span>{property.city}</span>
            <span aria-hidden="true">/</span>
            <span className="font-mono text-[#DFC07A] tabular-nums">
              {property.referenceCode}
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-[1380px] mx-auto px-6 pt-8 lg:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column (7 cols): Gallery, Video Tour, Specs, Narrative, Amenities, Location */}
          <div className="lg:col-span-7 space-y-10">
            {/* Gallery Stage */}
            <div className="space-y-3">
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#0D0E12] border border-white/10 group">
                <ArchitecturalImage
                  src={galleryImages[activeImageIndex] || property.heroImage}
                  alt={`${property.title} photograph ${activeImageIndex + 1}`}
                  priority
                  className="w-full h-full object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25 pointer-events-none" />

                {/* Prev / Next Gallery Arrows */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex(
                          (prev) =>
                            (prev - 1 + galleryImages.length) %
                            galleryImages.length
                        )
                      }
                      aria-label="Previous photograph"
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-[#C9A962] text-white hover:text-[#060608] border border-white/15 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex(
                          (prev) => (prev + 1) % galleryImages.length
                        )
                      }
                      aria-label="Next photograph"
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-[#C9A962] text-white hover:text-[#060608] border border-white/15 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Bottom Action Strip: Full-Screen Lightbox & Video Tour */}
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLightboxOpen(true)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-black/75 hover:bg-[#C9A962] text-white hover:text-[#060608] border border-white/15 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>
                        Full-Screen Gallery ({activeImageIndex + 1}/
                        {galleryImages.length})
                      </span>
                    </button>

                    {property.videoTour && (
                      <button
                        type="button"
                        onClick={() => setVideoModalOpen(true)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg gold-metallic-btn text-xs font-semibold cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Video Tour ({property.videoTour.duration})</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {galleryImages.map((imgSrc, idx) => (
                    <button
                      key={`${property.id}-thumb-${idx}`}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      aria-label={`Select photograph ${idx + 1}`}
                      className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-[#C9A962] opacity-100'
                          : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <ArchitecturalImage
                        src={imgSrc}
                        alt={`${property.title} thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Architectural Specifications */}
            <section className="bg-[#0D0E12] border border-white/10 rounded-2xl p-6 md:p-8">
              <h2 className="font-display text-2xl font-semibold text-white mb-6">
                Architectural Specifications
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-8">
                <div>
                  <p className="text-xs text-zinc-400">Bedrooms</p>
                  <p className="font-mono text-lg font-medium text-white mt-0.5 tabular-nums">
                    {property.specs.bedrooms > 0
                      ? `${property.specs.bedrooms} Suites`
                      : 'N/A (Commercial / Land)'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Bathrooms</p>
                  <p className="font-mono text-lg font-medium text-white mt-0.5 tabular-nums">
                    {property.specs.bathrooms}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Interior Area</p>
                  <p className="font-mono text-lg font-medium text-[#DFC07A] mt-0.5 tabular-nums">
                    {property.specs.interiorSqFt.toLocaleString('en-US')} sq ft
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Terrace &amp; Grounds</p>
                  <p className="font-mono text-lg font-medium text-white mt-0.5 tabular-nums">
                    {property.specs.exteriorSqFt.toLocaleString('en-US')} sq ft
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Year Completed</p>
                  <p className="font-mono text-lg font-medium text-white mt-0.5 tabular-nums">
                    {property.specs.yearBuilt}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Collector Garaging</p>
                  <p className="font-mono text-lg font-medium text-white mt-0.5 tabular-nums">
                    {property.specs.parkingSpaces} Vehicles
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Tenure</p>
                  <p className="text-sm font-medium text-white mt-1">
                    {property.specs.tenure}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Architecture</p>
                  <p className="text-sm font-medium text-white mt-1">
                    {property.specs.architecturalStyle}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Primary Exposure</p>
                  <p className="text-sm font-medium text-white mt-1">
                    {property.specs.exposure}
                  </p>
                </div>
              </div>
            </section>

            {/* Editorial Narrative */}
            <section className="space-y-4">
              <h2 className="font-display text-3xl font-semibold text-white">
                Residence Monograph
              </h2>
              <div className="space-y-4 text-zinc-300 leading-relaxed text-[15px]">
                {property.description.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </section>

            {/* Amenities */}
            <section className="pt-6 border-t border-white/10 space-y-5">
              <h2 className="font-display text-3xl font-semibold text-white">
                Amenities &amp; Private Facilities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[#0D0E12] border border-white/10 text-sm text-zinc-200"
                  >
                    <Check className="w-4 h-4 text-[#C9A962] shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Location & Enclave (OpenStreetMap Embed + Global Enclaves) */}
            <section className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-3xl font-semibold text-white">
                  Location &amp; Sovereign Enclave
                </h2>
                <span className="inline-flex items-center gap-1.5 text-xs text-[#DFC07A]">
                  <MapPin className="w-3.5 h-3.5" />
                  {property.city}, {property.country}
                </span>
              </div>
              <p className="text-sm font-medium text-white">
                {property.address}
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {property.geo?.districtSummary ||
                  `Prime ${property.neighborhood} enclave in ${property.city}. Exact cadastral title plans provided upon principal verification.`}
              </p>

              {osmEmbedUrl && (
                <div className="rounded-xl overflow-hidden border border-white/15 bg-[#0D0E12] h-72">
                  <iframe
                    title={`Map of ${property.title} in ${property.city}`}
                    src={osmEmbedUrl}
                    loading="lazy"
                    className="w-full h-full border-0 opacity-90 contrast-110"
                  />
                </div>
              )}
            </section>
          </div>

          {/* Right Column (5 cols): Valuation, Private Viewing Booking, Compare, Advisor & Inquiry */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div className="bg-[#0D0E12] border border-[#C9A962]/35 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="space-y-3 pb-6 border-b border-white/10">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wider text-[#C9A962] font-semibold">
                    {property.isOffMarket
                      ? 'Off-Market Mandate'
                      : property.isExclusive
                      ? 'Exclusive Mandate'
                      : property.type}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleCompare(property.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                        compared
                          ? 'bg-[#C9A962] text-[#060608] border-[#C9A962] font-semibold'
                          : 'bg-[#060608] text-zinc-300 border-white/15 hover:border-[#C9A962]'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>{compared ? 'Comparing' : 'Compare'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleFavourite(property.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                        saved
                          ? 'bg-[#C9A962] text-[#060608] border-[#C9A962] font-semibold'
                          : 'bg-[#060608] text-zinc-300 border-white/15 hover:border-[#C9A962]'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`}
                      />
                      <span>{saved ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>
                </div>

                <h1 className="font-display text-3xl md:text-4xl font-semibold text-white leading-tight">
                  {property.title}
                </h1>
                <p className="text-sm text-zinc-400">{property.subtitle}</p>

                <div className="pt-2 flex items-baseline justify-between gap-4">
                  <span className="font-mono text-2xl md:text-3xl font-semibold text-[#DFC07A] tabular-nums">
                    {formatPrice(property.priceUsd, property.pricePeriod)}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">
                    {property.status}
                  </span>
                </div>

                {/* Primary Private Viewing Booking Modal Trigger */}
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => openBookingModal(property)}
                    className="w-full py-3.5 px-5 rounded-lg gold-metallic-btn text-xs font-semibold uppercase tracking-[0.16em] inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Schedule Private Viewing</span>
                  </button>
                </div>
              </div>

              {/* Assigned Senior Advisor */}
              {advisor && (
                <div className="flex items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-3.5">
                    {advisor.portrait ? (
                      <ArchitecturalImage
                        src={advisor.portrait}
                        alt={advisor.name}
                        className="w-12 h-12 rounded-full object-cover border border-[#C9A962]/50 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#C9A962]/20 text-[#DFC07A] flex items-center justify-center font-display text-base font-semibold shrink-0">
                        {advisor.initials}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {advisor.name}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {advisor.office} Desk · {advisor.phone}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTo('agents')}
                    className="text-xs font-semibold text-[#DFC07A] hover:text-white whitespace-nowrap cursor-pointer"
                  >
                    Advisor →
                  </button>
                </div>
              )}

              {/* Confidential Dossier Inquiry Form */}
              {submittedSuccess ? (
                <div className="bg-[#060608] border border-[#C9A962]/40 rounded-xl p-6 space-y-4">
                  <p className="text-xs uppercase tracking-wider font-semibold text-[#C9A962]">
                    Inquiry Logged in Private CRM
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-white">
                    Architectural Dossier Requested
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {advisor?.name}’s desk has received your inquiry regarding{' '}
                    <strong className="text-white">{property.title}</strong>.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => navigateTo('user-dashboard')}
                      className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md gold-metallic-btn cursor-pointer"
                    >
                      Open VIP Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubmittedSuccess(false)}
                      className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Send Follow-up
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleInquirySubmit}
                  className="space-y-4"
                  noValidate
                >
                  <h3 className="text-xs uppercase tracking-[0.16em] font-semibold text-zinc-300">
                    Request Confidential Dossier
                  </h3>

                  {formError && (
                    <div
                      role="alert"
                      className="p-3 text-xs text-red-200 bg-red-950/60 border border-red-500/40 rounded-lg"
                    >
                      {formError}
                    </div>
                  )}

                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Full Name *"
                    aria-label="Full Name"
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="Email Address *"
                      aria-label="Email Address"
                      className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                    />
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Phone / WhatsApp *"
                      aria-label="Phone or WhatsApp"
                      className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                    />
                  </div>

                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    aria-label="Inquiry message"
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                  />

                  <button
                    type="submit"
                    className="w-full py-3 px-5 text-xs font-semibold uppercase tracking-[0.15em] text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors cursor-pointer"
                  >
                    Request Architectural Dossier
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>

        {/* Comparable Residences */}
        {relatedProperties.length > 0 && (
          <section className="mt-20 pt-16 border-t border-white/10">
            <h2 className="font-display text-3xl font-semibold text-white mb-8">
              Comparable Portfolio Residences
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProperties.map((item) => (
                <PropertyCard key={item.id} property={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* FULL-SCREEN LIGHTBOX GALLERY */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Full-screen property gallery"
        >
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="font-mono text-xs text-[#C9A962]">
                {property.referenceCode} · Photograph {activeImageIndex + 1} of{' '}
                {galleryImages.length}
              </p>
              <h3 className="font-display text-2xl">{property.title}</h3>
            </div>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close full-screen gallery"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#C9A962] text-white hover:text-[#060608] flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <ArchitecturalImage
              src={galleryImages[activeImageIndex] || property.heroImage}
              alt={`${property.title} full screen ${activeImageIndex + 1}`}
              className="max-h-[72vh] max-w-full object-contain rounded-lg"
            />

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex(
                      (prev) =>
                        (prev - 1 + galleryImages.length) % galleryImages.length
                    )
                  }
                  aria-label="Previous image"
                  className="absolute left-2 md:left-6 w-12 h-12 rounded-full bg-black/70 hover:bg-[#C9A962] text-white hover:text-[#060608] border border-white/20 flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex(
                      (prev) => (prev + 1) % galleryImages.length
                    )
                  }
                  aria-label="Next image"
                  className="absolute right-2 md:right-6 w-12 h-12 rounded-full bg-black/70 hover:bg-[#C9A962] text-white hover:text-[#060608] border border-white/20 flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 overflow-x-auto py-2">
            {galleryImages.map((imgSrc, idx) => (
              <button
                key={`lb-${idx}`}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`w-20 h-14 rounded overflow-hidden border-2 shrink-0 cursor-pointer ${
                  activeImageIndex === idx
                    ? 'border-[#C9A962]'
                    : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <ArchitecturalImage
                  src={imgSrc}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* VIDEO & VIRTUAL TOUR MODAL */}
      {videoModalOpen && property.videoTour && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Property video and virtual tour"
        >
          <div className="w-full max-w-3xl bg-[#0D0E12] border border-[#C9A962]/45 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A962] font-semibold">
                  Cinema Walkthrough · {property.videoTour.duration}
                </p>
                <h3 className="font-display text-2xl text-white">
                  {property.videoTour.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                aria-label="Close video tour"
                className="w-9 h-9 rounded-full bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video bg-[#060608] relative overflow-hidden">
              {property.videoTour.videoUrl ? (
                <video
                  src={property.videoTour.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full relative flex flex-col justify-end p-8">
                  <ArchitecturalImage
                    src={galleryImages[activeImageIndex] || property.heroImage}
                    alt={property.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-55 scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/50 to-transparent" />
                  <div className="relative z-10 space-y-4">
                    <span className="px-3 py-1 rounded bg-[#C9A962]/20 border border-[#C9A962]/50 text-xs font-mono text-[#DFC07A]">
                      Interactive ArchitecturalReel · Reel Chapters
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {property.videoTour.highlights.map((hl, idx) => (
                        <button
                          key={hl}
                          type="button"
                          onClick={() =>
                            setActiveImageIndex(idx % galleryImages.length)
                          }
                          className="p-3 rounded-lg bg-black/75 border border-white/15 hover:border-[#C9A962] text-left cursor-pointer"
                        >
                          <span className="font-mono text-[10px] text-[#C9A962] block">
                            CHAPTER 0{idx + 1}
                          </span>
                          <span className="text-xs text-white mt-0.5 block">
                            {hl}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 bg-[#090A0E] flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-zinc-400">
                Private 4K drone &amp; architectural cinema master file available upon viewing confirmation.
              </p>
              <div className="flex items-center gap-3">
                {property.videoTour.virtualTourUrl && (
                  <a
                    href={property.videoTour.virtualTourUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#DFC07A] border border-[#C9A962]/40 rounded-lg hover:bg-[#C9A962] hover:text-[#060608] transition-colors"
                  >
                    <span>3D Virtual Tour</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setVideoModalOpen(false);
                    openBookingModal(property);
                  }}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn cursor-pointer"
                >
                  Book Live Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
