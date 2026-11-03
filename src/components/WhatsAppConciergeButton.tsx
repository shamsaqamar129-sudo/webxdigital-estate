import React, { useState } from 'react';
import { MessageCircle, X, Settings } from 'lucide-react';
import { useEstate } from '../context/EstateContext';

export const WhatsAppConciergeButton: React.FC = () => {
  const { settings, properties, selectedPropertyId, currentRoute, navigateTo } =
    useEstate();
  const [openDrawer, setOpenDrawer] = useState(false);

  const activeProp =
    currentRoute === 'property-detail'
      ? properties.find((p) => p.id === selectedPropertyId)
      : null;

  const prefilledText = activeProp
    ? `Hello WEBXDIGITAL ESTATE VIP Concierge, I would like to arrange a confidential consultation regarding ${activeProp.title} (Ref: ${activeProp.referenceCode}) in ${activeProp.city}.`
    : 'Hello WEBXDIGITAL ESTATE VIP Concierge, I am inquiring regarding your international luxury property portfolio.';

  const sanitizedDigits = (settings.whatsappBusinessNumber || '').replace(
    /[^\d]/g,
    ''
  );

  const hasConfiguredNumber = sanitizedDigits.length >= 7;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {openDrawer && (
        <div className="w-80 sm:w-96 bg-[#0D0E12] border border-[#C9A962]/50 rounded-2xl shadow-2xl p-5 text-white space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A962] font-semibold">
                24/7 Private Client Desk
              </p>
              <h3 className="font-display text-xl font-semibold text-white">
                WhatsApp VIP Concierge
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setOpenDrawer(false)}
              aria-label="Close VIP Concierge panel"
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 rounded-lg bg-[#060608] border border-white/10 text-xs text-zinc-300 leading-relaxed">
            <span className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
              Pre-Filled Concierge Dispatch:
            </span>
            “{prefilledText}”
          </div>

          {hasConfiguredNumber ? (
            <a
              href={`https://wa.me/${sanitizedDigits}?text=${encodeURIComponent(
                prefilledText
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-lg gold-metallic-btn text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Launch WhatsApp Concierge</span>
            </a>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-amber-200/90 bg-amber-950/40 border border-amber-500/30 rounded-lg p-3 leading-relaxed">
                No business WhatsApp number is configured yet (we never hardcode fake phone numbers). Configure your verified business WhatsApp number in the Admin Console or send a direct desk inquiry now.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpenDrawer(false);
                    navigateTo('contact');
                  }}
                  className="py-2 px-3 rounded-lg gold-metallic-btn text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  Direct Inquiry
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenDrawer(false);
                    navigateTo('admin-dashboard');
                  }}
                  className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-medium text-zinc-200 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-[#C9A962]" />
                  <span>Configure</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpenDrawer((prev) => !prev)}
        aria-label="Open WhatsApp VIP Concierge"
        className="group relative w-14 h-14 rounded-full gold-metallic-btn shadow-[0_8px_30px_rgba(201,169,98,0.4)] flex items-center justify-center transition-transform duration-300 hover:scale-105 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A962]"
      >
        <MessageCircle className="w-6 h-6 text-[#060608] fill-[#060608]/10" />
      </button>
    </div>
  );
};
