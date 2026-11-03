import React, { useState } from 'react';
import { Lock, Unlock, ShieldAlert, KeyRound, ArrowRight } from 'lucide-react';
import { ESTATE_MEDIA } from '../assets/media';
import { ArchitecturalImage } from '../components/ArchitecturalImage';
import { PropertyCard } from '../components/PropertyCard';
import { useEstate } from '../context/EstateContext';

export const OffMarketPage: React.FC = () => {
  const {
    offMarketProperties,
    offMarketUnlocked,
    unlockOffMarketVault,
    navigateTo,
  } = useEstate();

  const [accessCode, setAccessCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!accessCode.trim()) {
      setError('Please enter your private access clearance code.');
      return;
    }
    setVerifying(true);
    const result = await unlockOffMarketVault(accessCode.trim());
    setVerifying(false);
    if (!result.ok) {
      setError(result.error || 'Access code declined by server gate.');
    } else {
      setAccessCode('');
    }
  };

  return (
    <div className="bg-[#060608] text-white min-h-screen pb-24">
      {/* Hero Banner */}
      <section className="relative border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0">
          <ArchitecturalImage
            src={ESTATE_MEDIA.offmarketSovereignMansion}
            alt="Off-Market Sovereign Compound"
            priority
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/80 to-[#060608]/50" />
        </div>

        <div className="relative max-w-[1380px] mx-auto px-6 py-18 lg:py-24">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] font-semibold text-[#C9A962]">
              {offMarketUnlocked ? (
                <Unlock className="w-4 h-4 text-emerald-400" />
              ) : (
                <Lock className="w-4 h-4 text-[#C9A962]" />
              )}
              <span>Private Treaty &amp; Sovereign Desk</span>
            </div>
            <h1 className="font-display text-[clamp(2.4rem,4.5vw,4rem)] font-semibold text-white leading-tight">
              38% OFF-MARKET OPPORTUNITIES
            </h1>
            <p className="text-zinc-300 text-base md:text-lg leading-relaxed max-w-2xl">
              Thirty-eight percent of WEBXDIGITAL ESTATE’s global transaction volume is placed quietly outside public portals for principals requiring strict anonymity.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-[1380px] mx-auto px-6 pt-12 space-y-12">
        {/* Mandatory Security Architecture Disclosure */}
        <div className="p-5 rounded-xl bg-[#0D0E12] border border-[#C9A962]/30 flex items-start gap-3.5">
          <ShieldAlert className="w-5 h-5 text-[#C9A962] shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-300 leading-relaxed space-y-1">
            <p className="font-semibold text-white">
              Server-Side Vault Security Notice
            </p>
            <p>
              Initial demonstration access code:{' '}
              <code className="font-mono text-[#DFC07A] px-1.5 py-0.5 bg-black rounded">
                SOVEREIGN2024
              </code>
              . Access validation is performed exclusively on the backend server (
              <code className="font-mono">/api/off-market/unlock</code>) and is never hardcoded in publicly accessible frontend bundles. Before publishing confidential production mandates, replace the shared demonstration code with individual principal authentication, KYC verification, and signed NDA authorization.
            </p>
          </div>
        </div>

        {!offMarketUnlocked ? (
          /* Password Access Gate */
          <div className="max-w-xl mx-auto bg-[#0D0E12] border border-[#C9A962]/45 rounded-2xl p-8 md:p-10 shadow-2xl space-y-6">
            <div className="w-12 h-12 rounded-full bg-[#C9A962]/15 border border-[#C9A962]/40 flex items-center justify-center text-[#DFC07A]">
              <KeyRound className="w-5 h-5" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-3xl font-semibold text-white">
                Enter Principal Clearance Code
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Enter your private invitation code issued by a WebxDigital Estate Managing Partner to inspect unpublished mandates.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              {error && (
                <div
                  role="alert"
                  className="p-3.5 rounded-lg bg-red-950/60 border border-red-500/40 text-xs text-red-200"
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="vault-code-input"
                  className="block text-xs uppercase tracking-wider text-zinc-400 mb-2"
                >
                  Vault Clearance Code
                </label>
                <input
                  id="vault-code-input"
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Enter access code (Demo: SOVEREIGN2024)"
                  className="w-full px-4 py-3 text-sm font-mono text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="w-full py-3.5 px-6 text-xs font-semibold uppercase tracking-[0.16em] rounded-lg gold-metallic-btn cursor-pointer disabled:opacity-50"
              >
                {verifying
                  ? 'Verifying Clearance with Server...'
                  : 'Authenticate & Reveal Off-Market Portfolio'}
              </button>
            </form>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
              <span>Need principal accreditation?</span>
              <button
                type="button"
                onClick={() => navigateTo('contact')}
                className="text-[#DFC07A] hover:text-white font-semibold cursor-pointer"
              >
                Request NDA &amp; Access Code →
              </button>
            </div>
          </div>
        ) : (
          /* Unlocked Exclusive Listings */
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-400 font-semibold">
                  Clearance Verified · Confidential Dossier View
                </p>
                <h2 className="font-display text-3xl font-semibold text-white mt-1">
                  Unpublished Sovereign Mandates ({offMarketProperties.length})
                </h2>
              </div>

              <button
                type="button"
                onClick={() => navigateTo('contact')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn cursor-pointer"
              >
                <span>Submit Proof of Liquidity</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {offMarketProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
