import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ESTATE_MEDIA } from '../assets/media';
import { ArchitecturalImage } from '../components/ArchitecturalImage';
import { useEstate } from '../context/EstateContext';

export const AboutPage: React.FC = () => {
  const { navigateTo } = useEstate();

  return (
    <div className="bg-[#060608] text-white min-h-screen pb-24">
      <section className="bg-[#0B0C10] border-b border-white/10">
        <div className="max-w-[1380px] mx-auto px-6 py-16 lg:py-24">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-10 border-b border-white/10">
            <div className="inline-flex items-center gap-1 p-1 bg-[#060608] border border-white/10 rounded-lg">
              <button
                type="button"
                onClick={() => navigateTo('about')}
                className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#C9A962] text-[#060608] rounded-md cursor-pointer"
              >
                About Firm
              </button>
              <button
                type="button"
                onClick={() => navigateTo('agents')}
                className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white rounded-md cursor-pointer"
              >
                Senior Advisors
              </button>
              <button
                type="button"
                onClick={() => navigateTo('contact')}
                className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white rounded-md cursor-pointer"
              >
                Global Desks
              </button>
            </div>

            <span className="text-xs text-zinc-400">
              Designed &amp; Developed by{' '}
              <strong className="gold-gradient-text font-semibold">
                WebxDigital
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#C9A962]">
                Our Mission &amp; Global Partnership
              </p>
              <h1 className="font-display text-[clamp(2.5rem,4.4vw,4rem)] font-semibold text-white leading-[1.06] text-balance">
                Stewardship for the World’s Most Consequential Real Estate
              </h1>
              <p className="text-zinc-300 text-base md:text-lg leading-relaxed max-w-2xl">
                WEBXDIGITAL ESTATE serves ultra-high-net-worth individuals, sovereign wealth vehicles, and multi-generational family offices with discreet real estate acquisition, leasing, and divestiture advisory across London, Dubai, New York, Monaco, and Los Angeles.
              </p>
            </div>

            <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-[#C9A962]/30 aspect-[4/3]">
              <ArchitecturalImage
                src={ESTATE_MEDIA.manhattanParkTriplex}
                alt="Central Park view residence curated by WebxDigital Estate"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1380px] mx-auto px-6 pt-16 space-y-20">
        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pb-16 border-b border-white/10">
          <div>
            <p className="font-mono text-3xl font-semibold text-[#DFC07A] tabular-nums">
              $5.80B+
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Closed Residential &amp; Commercial Trophy Volume
            </p>
          </div>
          <div>
            <p className="font-mono text-3xl font-semibold text-white tabular-nums">
              5 Capitals
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Mayfair · DIFC · Fifth Avenue · Carré d’Or · Beverly Hills
            </p>
          </div>
          <div>
            <p className="font-mono text-3xl font-semibold text-[#DFC07A] tabular-nums">
              38%
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Transactions Completed Privately Off-Market
            </p>
          </div>
          <div>
            <p className="font-mono text-3xl font-semibold text-white tabular-nums">
              94%
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Repeat Principal &amp; Family Office Advisory Rate
            </p>
          </div>
        </div>

        {/* Services & Philosophy */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-[#0D0E12] border border-white/10 rounded-2xl p-8 space-y-3">
            <p className="font-mono text-xs text-[#C9A962]">01 / PROVENANCE</p>
            <h2 className="font-display text-2xl font-semibold text-white">
              Curated Trophy Architecture
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We focus exclusively on irreplaceable mansions, superyacht waterfront estates, full-floor sky penthouses, flagship commercial properties, and entitled coastal peninsulas.
            </p>
          </div>

          <div className="bg-[#0D0E12] border border-white/10 rounded-2xl p-8 space-y-3">
            <p className="font-mono text-xs text-[#C9A962]">
              02 / INTERNATIONAL REACH
            </p>
            <h2 className="font-display text-2xl font-semibold text-white">
              Seamless Five-Hub Execution
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Clients work with a single integrated senior partnership coordinating cross-border legal diligence, live multi-currency valuation, and private aviation viewing schedules.
            </p>
          </div>

          <div className="bg-[#0D0E12] border border-white/10 rounded-2xl p-8 space-y-3">
            <p className="font-mono text-xs text-[#C9A962]">
              03 / DIGITAL CRAFTSMANSHIP
            </p>
            <h2 className="font-display text-2xl font-semibold text-white">
              Designed &amp; Developed by WebxDigital
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Engineered by WebxDigital with full-stack security, live currency intelligence, private slot-locked viewing scheduling, and enterprise CRM governance.
            </p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-[#0D0E12] border border-[#C9A962]/35 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-6 aspect-[16/10] lg:aspect-auto">
            <ArchitecturalImage
              src={ESTATE_MEDIA.mayfairResidenceLondon}
              alt="28 Grosvenor Courtyard Mansion in London"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-center space-y-6">
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#C9A962]">
              Private Client Representation
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-white leading-tight">
              Speak Directly with Our International Partners
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Explore our public portfolio, request clearance for our 38% Off-Market Vault, or arrange a private consultation at any of our five global offices.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigateTo('buy')}
                className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn cursor-pointer"
              >
                <span>Explore Portfolio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('contact')}
                className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-200 border border-white/20 hover:border-[#C9A962] rounded-lg cursor-pointer"
              >
                Contact Private Desks
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
