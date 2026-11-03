import React, { useState } from 'react';
import {
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { useEstate } from '../context/EstateContext';

const GLOBAL_OFFICES = [
  {
    city: 'London',
    label: 'London (EMEA HQ)',
    address: '28 Grosvenor Row, Mayfair, London W1K',
    phone: '+44 20 7946 0000',
    email: 'london@webxdigital-estate.com',
    hours: 'Mon–Sat · 08:30 – 20:00 GMT',
    lat: 51.5099,
    lng: -0.1508,
    osmBbox: '-0.1658,51.5019,-0.1358,51.5179',
  },
  {
    city: 'Dubai',
    label: 'Dubai (Middle East Desk)',
    address: 'Gate Village Building 8, Level 5, DIFC, Dubai',
    phone: '+971 4 555 0100',
    email: 'dubai@webxdigital-estate.com',
    hours: 'Mon–Sat · 09:00 – 21:00 GST',
    lat: 25.2131,
    lng: 55.2816,
    osmBbox: '55.2666,25.2031,55.2966,25.2231',
  },
  {
    city: 'New York',
    label: 'New York (Americas HQ)',
    address: '712 Fifth Avenue, Suite 3400, New York, NY 10019',
    phone: '+1 212 555 0100',
    email: 'newyork@webxdigital-estate.com',
    hours: 'Mon–Fri · 08:30 – 19:30 EST',
    lat: 40.7624,
    lng: -73.9749,
    osmBbox: '-73.9899,40.7544,-73.9599,40.7704',
  },
  {
    city: 'Monaco',
    label: 'Monaco (Riviera Desk)',
    address: '12 Avenue des Beaux-Arts, Carré d’Or, 98000 Monaco',
    phone: '+377 99 99 00 00',
    email: 'monaco@webxdigital-estate.com',
    hours: 'Mon–Sat · 09:00 – 20:00 CET',
    lat: 43.7392,
    lng: 7.4272,
    osmBbox: '7.4122,43.7292,7.4422,43.7492',
  },
  {
    city: 'Los Angeles',
    label: 'Los Angeles (Pacific Desk)',
    address: '9600 Wilshire & Malibu Coast Desk, Los Angeles, CA',
    phone: '+1 310 555 0100',
    email: 'losangeles@webxdigital-estate.com',
    hours: 'Mon–Sat · 08:30 – 19:30 PST',
    lat: 34.0672,
    lng: -118.4015,
    osmBbox: '-118.4215,34.0572,-118.3815,34.0772',
  },
];

export const ContactPage: React.FC = () => {
  const { currentUser, settings, submitInquiry, navigateTo } = useEstate();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [selectedOfficeIdx, setSelectedOfficeIdx] = useState(0);
  const [subject, setSubject] = useState('Acquisition Advisory');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const activeOffice = GLOBAL_OFFICES[selectedOfficeIdx] || GLOBAL_OFFICES[0];

  const sanitizedWhatsapp = (settings.whatsappBusinessNumber || '').replace(
    /[^\d]/g,
    ''
  );
  const whatsappHref =
    sanitizedWhatsapp.length >= 7
      ? `https://wa.me/${sanitizedWhatsapp}?text=${encodeURIComponent(
          `Hello WEBXDIGITAL ESTATE (${activeOffice.label}), I would like to arrange a confidential consultation.`
        )}`
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (phone.trim().length < 7) {
      setError('Please enter a valid telephone or WhatsApp number.');
      return;
    }
    if (message.trim().length < 12) {
      setError('Please enter a brief message (minimum 12 characters).');
      return;
    }

    const res = await submitInquiry({
      type: 'GENERAL_CONTACT',
      clientName: fullName.trim(),
      clientEmail: email.trim(),
      clientPhone: phone.trim(),
      message: `[${activeOffice.label} · ${subject}] ${message.trim()}`,
    });

    if (!res.ok) {
      setError(res.error || 'Unable to submit inquiry.');
      return;
    }

    setSubmitted(true);
    setMessage('');
  };

  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    activeOffice.osmBbox
  )}&layer=mapnik&marker=${encodeURIComponent(
    `${activeOffice.lat},${activeOffice.lng}`
  )}`;

  return (
    <div className="bg-[#060608] text-white min-h-screen pb-24">
      <section className="bg-[#0B0C10] border-b border-white/10">
        <div className="max-w-[1380px] mx-auto px-6 py-16 lg:py-20">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-white/10">
            <div className="inline-flex items-center gap-1 p-1 bg-[#060608] border border-white/10 rounded-lg">
              <button
                type="button"
                onClick={() => navigateTo('contact')}
                className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#C9A962] text-[#060608] rounded-md cursor-pointer"
              >
                Global Desks
              </button>
              <button
                type="button"
                onClick={() => navigateTo('about')}
                className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white rounded-md cursor-pointer"
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
            </div>

            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp VIP Concierge</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => navigateTo('admin-dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs text-[#DFC07A] border border-[#C9A962]/40 rounded-lg hover:bg-[#C9A962]/10 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Configure Business WhatsApp in Admin</span>
              </button>
            )}
          </div>

          <div className="max-w-3xl space-y-4">
            <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#C9A962]">
              International Private Offices
            </p>
            <h1 className="font-display text-[clamp(2.35rem,4.2vw,3.75rem)] font-semibold text-white leading-tight">
              Connect with WEBXDIGITAL ESTATE
            </h1>
            <p className="text-zinc-400 text-base leading-relaxed max-w-2xl">
              Speak directly with our senior partners across London, Dubai, New York, Monaco, and Los Angeles regarding acquisitions, leases, off-market clearance, or seller mandates.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-[1380px] mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Contact Form */}
          <div className="lg:col-span-7 bg-[#0D0E12] border border-white/10 rounded-2xl p-6 md:p-10">
            {submitted ? (
              <div className="py-8 space-y-5">
                <div className="w-12 h-12 rounded-full bg-[#C9A962]/15 text-[#DFC07A] flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="font-display text-3xl font-semibold text-white">
                  Confidential Dispatch Confirmed
                </h2>
                <p className="text-sm text-zinc-300 leading-relaxed max-w-lg">
                  Thank you, <strong className="text-white">{fullName}</strong>.
                  Your inquiry has been routed to our{' '}
                  <strong className="text-[#DFC07A]">
                    {activeOffice.label}
                  </strong>{' '}
                  and recorded in our Executive CRM.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn cursor-pointer"
                  >
                    Send Another Message
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('user-dashboard')}
                    className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-200 border border-white/20 hover:border-[#C9A962] rounded-lg cursor-pointer"
                  >
                    Track in VIP Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <h2 className="font-display text-3xl font-semibold text-white">
                    Direct Private Consultation
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1">
                    All correspondence is protected under strict principal confidentiality.
                  </p>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="p-3.5 text-xs text-red-200 bg-red-950/60 border border-red-500/40 rounded-lg"
                  >
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="principal@office.com"
                      className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+44 20 7946 0000"
                      className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                      Destination Desk
                    </label>
                    <select
                      value={selectedOfficeIdx}
                      onChange={(e) =>
                        setSelectedOfficeIdx(Number(e.target.value))
                      }
                      className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none cursor-pointer"
                    >
                      {GLOBAL_OFFICES.map((o, idx) => (
                        <option key={o.city} value={idx}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                      Subject
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none cursor-pointer"
                    >
                      <option value="Acquisition Advisory">
                        Acquisition Advisory
                      </option>
                      <option value="Off-Market Vault Clearance">
                        Off-Market Vault Clearance
                      </option>
                      <option value="Executive / Seasonal Lease">
                        Executive / Seasonal Lease
                      </option>
                      <option value="Seller Valuation Mandate">
                        Seller Valuation Mandate
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                    Confidential Message *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your target destinations, architectural criteria, or preferred consultation window..."
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    type="submit"
                    className="px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] rounded-lg gold-metallic-btn cursor-pointer"
                  >
                    Dispatch Confidential Inquiry
                  </button>
                  <a
                    href={`mailto:${activeOffice.email}`}
                    className="inline-flex items-center gap-2 px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-200 border border-white/15 hover:border-[#C9A962] rounded-lg"
                  >
                    <Mail className="w-4 h-4 text-[#C9A962]" />
                    <span>Email {activeOffice.city} Desk</span>
                  </a>
                </div>
              </form>
            )}
          </div>

          {/* 5 Global Luxury Offices + OpenStreetMap Switcher */}
          <aside className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl overflow-hidden border border-[#C9A962]/35 bg-[#0D0E12]">
              <div className="h-56 bg-[#060608]">
                <iframe
                  title={`${activeOffice.label} Map`}
                  src={osmUrl}
                  loading="lazy"
                  className="w-full h-full border-0 opacity-90"
                />
              </div>
              <div className="p-5 space-y-1.5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#C9A962] font-semibold">
                  Selected Office Location
                </p>
                <h3 className="font-display text-2xl font-semibold text-white">
                  {activeOffice.label}
                </h3>
                <p className="text-xs text-zinc-300">{activeOffice.address}</p>
              </div>
            </div>

            <div className="bg-[#0D0E12] border border-white/10 rounded-2xl divide-y divide-white/10">
              {GLOBAL_OFFICES.map((office, idx) => {
                const isSelected = idx === selectedOfficeIdx;
                return (
                  <button
                    key={office.city}
                    type="button"
                    onClick={() => setSelectedOfficeIdx(idx)}
                    className={`w-full text-left p-5 space-y-2 transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#C9A962]/10' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-white">
                        {office.label}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {office.hours}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#C9A962] shrink-0 mt-0.5" />
                      <span>{office.address}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-zinc-300">
                      <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                        <Phone className="w-3.5 h-3.5 text-zinc-500" />
                        {office.phone}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[#DFC07A]">
                        <Mail className="w-3.5 h-3.5" />
                        {office.email}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
