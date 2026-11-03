import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, Upload, Lock } from 'lucide-react';
import { SUBMISSION_PHOTO_PRESETS } from '../assets/media';
import { ArchitecturalImage } from '../components/ArchitecturalImage';
import { useEstate } from '../context/EstateContext';
import {
  ListingCategory,
  Property,
  PropertyStatus,
  PropertyType,
} from '../types/estate';

const CITY_GEO_DEFAULTS: Record<
  string,
  { country: string; lat: number; lng: number; osmBbox: string }
> = {
  London: {
    country: 'United Kingdom',
    lat: 51.5099,
    lng: -0.1508,
    osmBbox: '-0.1658,51.5019,-0.1358,51.5179',
  },
  Dubai: {
    country: 'United Arab Emirates',
    lat: 25.1124,
    lng: 55.139,
    osmBbox: '55.1190,25.1024,55.1590,25.1224',
  },
  'New York': {
    country: 'United States',
    lat: 40.7662,
    lng: -73.9786,
    osmBbox: '-73.9936,40.7582,-73.9636,40.7742',
  },
  Monaco: {
    country: 'Monaco',
    lat: 43.7384,
    lng: 7.4246,
    osmBbox: '7.4096,43.7284,7.4396,43.7484',
  },
  'Los Angeles': {
    country: 'United States',
    lat: 34.0325,
    lng: -118.695,
    osmBbox: '-118.7150,34.0225,-118.6750,34.0425',
  },
};

export const SellPropertyPage: React.FC = () => {
  const { submitSellerProperty, agents, currentUser, navigateTo } = useEstate();

  const [category, setCategory] = useState<ListingCategory>(ListingCategory.BUY);
  const [propertyType, setPropertyType] = useState<PropertyType>(
    PropertyType.VILLA
  );
  const [isOffMarket, setIsOffMarket] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [city, setCity] = useState('London');
  const [country, setCountry] = useState('United Kingdom');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [priceUsd, setPriceUsd] = useState('');
  const [bedrooms, setBedrooms] = useState('5');
  const [bathrooms, setBathrooms] = useState('6');
  const [interiorSqFt, setInteriorSqFt] = useState('7200');
  const [exteriorSqFt, setExteriorSqFt] = useState('2400');
  const [yearBuilt, setYearBuilt] = useState('2025');
  const [virtualTourUrl, setVirtualTourUrl] = useState('');
  const [description, setDescription] = useState('');
  const [amenitiesInput, setAmenitiesInput] = useState(
    'Zero-Edge Infinity Pool, Subterranean Wine Vault, Private Lift Core, 24-Hour Security'
  );
  const [selectedCoverUrl, setSelectedCoverUrl] = useState<string>(
    SUBMISSION_PHOTO_PRESETS[0].url
  );

  // Owner Contact
  const [ownerName, setOwnerName] = useState(currentUser?.fullName || '');
  const [ownerEmail, setOwnerEmail] = useState(currentUser?.email || '');
  const [ownerPhone, setOwnerPhone] = useState(currentUser?.phone || '');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdProperty, setCreatedProperty] = useState<Property | null>(null);

  const handleCitySelect = (nextCity: string) => {
    setCity(nextCity);
    if (CITY_GEO_DEFAULTS[nextCity]) {
      setCountry(CITY_GEO_DEFAULTS[nextCity].country);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setError('Uploaded image must be under 4MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedCoverUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 4) {
      setError('Please enter a residence title (minimum 4 characters).');
      return;
    }
    if (!neighborhood.trim() || !address.trim()) {
      setError('Please provide the enclave/neighborhood and street address.');
      return;
    }
    const parsedPrice = Number(priceUsd.replace(/[^0-9.]/g, ''));
    if (!parsedPrice || parsedPrice < 5000) {
      setError('Please enter a valid numeric guide price or monthly rate in USD.');
      return;
    }
    if (description.trim().length < 25) {
      setError(
        'Please provide an architectural description (at least 25 characters).'
      );
      return;
    }
    if (
      !ownerName.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail.trim()) ||
      ownerPhone.trim().length < 7
    ) {
      setError(
        'Please complete valid owner or family office contact details.'
      );
      return;
    }

    const assignedAdvisor =
      agents.find((a) => a.office.toLowerCase() === city.toLowerCase()) ||
      agents[0];

    const geoDefault =
      CITY_GEO_DEFAULTS[city] || CITY_GEO_DEFAULTS.London;

    const referenceCode = isOffMarket
      ? `WXD-OM-${Math.floor(10 + Math.random() * 89)}`
      : `WXD-${Math.floor(300 + Math.random() * 699)}`;

    const newProperty: Property = {
      id: `prop-custom-${Date.now()}`,
      referenceCode,
      title: title.trim(),
      subtitle:
        subtitle.trim() ||
        `${propertyType} Mandate in ${neighborhood.trim()}, ${city.trim()}`,
      category,
      type: propertyType,
      status: PropertyStatus.ACTIVE,
      priceUsd: parsedPrice,
      pricePeriod: category === ListingCategory.RENT ? 'month' : undefined,
      city: city.trim(),
      country: country.trim(),
      neighborhood: neighborhood.trim(),
      address: address.trim(),
      featured: !isOffMarket,
      isExclusive: true,
      isOffMarket,
      heroImage: selectedCoverUrl,
      gallery: [
        selectedCoverUrl,
        SUBMISSION_PHOTO_PRESETS[2].url,
        SUBMISSION_PHOTO_PRESETS[3].url,
      ],
      description: [
        description.trim(),
        `Represented exclusively via WEBXDIGITAL ESTATE Private Mandate (${ownerName.trim()}). Full architectural inspection and legal title pack available to qualified principals.`,
      ],
      amenities: amenitiesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      specs: {
        bedrooms: Math.max(0, Number(bedrooms) || 0),
        bathrooms: Math.max(0, Number(bathrooms) || 0),
        interiorSqFt: Math.max(500, Number(interiorSqFt) || 5000),
        exteriorSqFt: Math.max(0, Number(exteriorSqFt) || 1200),
        yearBuilt: Number(yearBuilt) || 2025,
        parkingSpaces: 4,
        tenure:
          category === ListingCategory.RENT ? 'Executive Lease' : 'Freehold',
        architecturalStyle: 'Bespoke Contemporary Architecture',
        exposure: 'Primary Panoramic Aspect',
      },
      geo: {
        lat: geoDefault.lat,
        lng: geoDefault.lng,
        osmBbox: geoDefault.osmBbox,
        districtSummary: `${neighborhood.trim()}, ${city.trim()} private enclave.`,
      },
      videoTour: {
        title: `${title.trim()} — Private Architectural Preview`,
        duration: '03:00',
        virtualTourUrl: virtualTourUrl.trim() || undefined,
        highlights: [
          'Arrival gallery & reception proportions',
          'Primary suite & terrace aspect',
          'Private wellness & garaging facilities',
        ],
      },
      agentId: assignedAdvisor?.id || 'agent-victoria-sterling',
      createdAt: new Date().toISOString().split('T')[0],
      submittedByUserId: currentUser?.id,
    };

    setSubmitting(true);
    await submitSellerProperty(newProperty);
    setSubmitting(false);
    setCreatedProperty(newProperty);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#060608] text-white min-h-screen pb-24">
      <section className="bg-[#0B0C10] border-b border-white/10">
        <div className="max-w-[1380px] mx-auto px-6 py-16 lg:py-20">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#C9A962]">
              Private Seller &amp; Family Office Representation
            </p>
            <h1 className="font-display text-[clamp(2.35rem,4.2vw,3.75rem)] font-semibold text-white leading-tight text-balance">
              List a Property Mandate with WEBXDIGITAL ESTATE
            </h1>
            <p className="text-zinc-400 text-base leading-relaxed max-w-2xl">
              Publish directly to our international portfolio or designate your asset for confidential placement inside our gated 38% Off-Market Vault.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-[1380px] mx-auto px-6 pt-12">
        {createdProperty ? (
          <div className="bg-[#0D0E12] border border-[#C9A962]/45 rounded-2xl p-8 md:p-12 max-w-2xl mx-auto space-y-6">
            <div className="w-12 h-12 rounded-full bg-[#C9A962]/15 text-[#DFC07A] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <p className="font-mono text-xs text-[#C9A962] tabular-nums">
                REFERENCE {createdProperty.referenceCode}
              </p>
              <h2 className="font-display text-3xl font-semibold text-white">
                Mandate Registered in Global Portfolio
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                <strong className="text-white">{createdProperty.title}</strong>{' '}
                has been saved and synchronized with the Executive Admin Console.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  navigateTo('property-detail', {
                    propertyId: createdProperty.id,
                  })
                }
                className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn cursor-pointer"
              >
                <span>Open Residence Monograph</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  navigateTo(
                    createdProperty.isOffMarket
                      ? 'off-market'
                      : createdProperty.category === ListingCategory.RENT
                      ? 'rent'
                      : 'buy'
                  )
                }
                className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-200 border border-white/20 hover:border-[#C9A962] rounded-lg cursor-pointer"
              >
                View in Portfolio
              </button>
              <button
                type="button"
                onClick={() => setCreatedProperty(null)}
                className="px-4 py-3 text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
              >
                Submit Another Mandate
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="lg:col-span-8 bg-[#0D0E12] border border-white/10 rounded-2xl p-6 md:p-10 space-y-8"
            >
              <div className="border-b border-white/10 pb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl font-semibold text-white">
                    Property Mandate Dossier
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1">
                    Provide architectural specifications, photography, and valuation guidance.
                  </p>
                </div>

                <label className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-[#060608] border border-[#C9A962]/35 text-xs text-[#DFC07A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOffMarket}
                    onChange={(e) => setIsOffMarket(e.target.checked)}
                    className="accent-[#C9A962]"
                  />
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confidential Off-Market Placement</span>
                </label>
              </div>

              {error && (
                <div
                  role="alert"
                  className="p-4 text-xs text-red-200 bg-red-950/60 border border-red-500/40 rounded-lg"
                >
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
                    Mandate Disposition *
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-[#060608] border border-white/10 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setCategory(ListingCategory.BUY)}
                      className={`py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                        category === ListingCategory.BUY
                          ? 'bg-[#C9A962] text-[#060608]'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      For Sale
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategory(ListingCategory.RENT)}
                      className={`py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                        category === ListingCategory.RENT
                          ? 'bg-[#C9A962] text-[#060608]'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      For Rent / Lease
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
                    Property Category *
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) =>
                      setPropertyType(e.target.value as PropertyType)
                    }
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none cursor-pointer"
                  >
                    {Object.values(PropertyType).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                    Property Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Villa Lumière Cap Ferrat"
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                    {category === ListingCategory.RENT
                      ? 'Monthly Rate (USD) *'
                      : 'Guide Price (USD) *'}
                  </label>
                  <input
                    type="number"
                    min={5000}
                    required
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(e.target.value)}
                    placeholder={
                      category === ListingCategory.RENT ? '65000' : '25000000'
                    }
                    className="w-full px-3.5 py-2.5 text-sm font-mono text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                  Architectural Subtitle
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Panoramic Limestone Estate with Superyacht Mooring"
                  className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                    Destination Hub *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => handleCitySelect(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none cursor-pointer"
                  >
                    <option value="London">London</option>
                    <option value="Dubai">Dubai</option>
                    <option value="New York">New York</option>
                    <option value="Monaco">Monaco</option>
                    <option value="Los Angeles">Los Angeles</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                    Enclave / Neighborhood *
                  </label>
                  <input
                    type="text"
                    required
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="e.g. Mayfair W1K"
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                    Address / Enclave Reference *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="14 Grosvenor Crescent, London"
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                    3D Virtual Tour URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={virtualTourUrl}
                    onChange={(e) => setVirtualTourUrl(e.target.value)}
                    placeholder="https://my.matterport.com/..."
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono text-white bg-[#060608] border border-white/15 rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono text-white bg-[#060608] border border-white/15 rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    Interior Sq Ft
                  </label>
                  <input
                    type="number"
                    min={400}
                    value={interiorSqFt}
                    onChange={(e) => setInteriorSqFt(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono text-white bg-[#060608] border border-white/15 rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    Exterior Sq Ft
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={exteriorSqFt}
                    onChange={(e) => setExteriorSqFt(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono text-white bg-[#060608] border border-white/15 rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    Year Built
                  </label>
                  <input
                    type="number"
                    min={1750}
                    max={2030}
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono text-white bg-[#060608] border border-white/15 rounded-lg tabular-nums"
                  />
                </div>
              </div>

              {/* Photo Upload + Curated Architectural Presets */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="text-xs uppercase tracking-wider text-zinc-400">
                    Property Cover Photography
                  </label>
                  <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-medium text-[#DFC07A] cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Custom Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SUBMISSION_PHOTO_PRESETS.slice(0, 4).map((preset) => {
                    const active = selectedCoverUrl === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedCoverUrl(preset.url)}
                        className={`text-left rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          active
                            ? 'border-[#C9A962]'
                            : 'border-white/10 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="aspect-[16/10] bg-[#060608]">
                          <ArchitecturalImage
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="px-2 py-1.5 text-[11px] text-zinc-300 truncate bg-[#060608]">
                          {preset.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                    Architectural Narrative *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe architectural lineage, rare stone or timber finishes, exposure, and entertaining spaces..."
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                    Amenities &amp; Facilities (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={amenitiesInput}
                    onChange={(e) => setAmenitiesInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-4">
                <h3 className="text-xs uppercase tracking-[0.18em] font-semibold text-[#C9A962]">
                  Principal or Family Office Contact
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Full Name *"
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                  />
                  <input
                    type="email"
                    required
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="Email Address *"
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                  />
                  <input
                    type="tel"
                    required
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="Direct Phone *"
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em] rounded-lg gold-metallic-btn cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Publishing Mandate...' : 'Publish Property Mandate'}
              </button>
            </form>

            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-[#0D0E12] border border-[#C9A962]/35 rounded-2xl p-7 space-y-6">
                <h3 className="font-display text-2xl font-semibold text-white">
                  The WebxDigital Seller Protocol
                </h3>
                <div className="space-y-5 text-sm text-zinc-300">
                  <div>
                    <p className="font-semibold text-[#DFC07A]">
                      01. Cross-Border Valuation
                    </p>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Comparative prime market benchmarking across London, Dubai, New York, Monaco, and Los Angeles.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#DFC07A]">
                      02. Monograph &amp; Cinema Production
                    </p>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Twilight architectural photography, drone surveys, and private digital data rooms.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#DFC07A]">
                      03. Off-Market Sovereign Option
                    </p>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Check “Confidential Off-Market Placement” to restrict visibility to pre-vetted principals inside our Vault.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};
