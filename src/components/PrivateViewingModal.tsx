import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, Users, CheckCircle2 } from 'lucide-react';
import { useEstate } from '../context/EstateContext';
import { ArchitecturalImage } from './ArchitecturalImage';

const VIEWING_TIME_SLOTS = [
  '10:00',
  '12:00',
  '14:30',
  '17:00 (Twilight)',
  '19:30 (Evening)',
];

export const PrivateViewingModal: React.FC = () => {
  const {
    bookingModalProperty,
    closeBookingModal,
    currentUser,
    isSlotBooked,
    bookPrivateViewing,
    formatPrice,
    navigateTo,
  } = useEstate();

  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState(tomorrowStr);
  const [preferredTime, setPreferredTime] = useState('14:30');
  const [guests, setGuests] = useState(2);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (bookingModalProperty) {
      setClientName(currentUser?.fullName || '');
      setClientEmail(currentUser?.email || '');
      setClientPhone(currentUser?.phone || '');
      setPreferredDate(tomorrowStr);
      setPreferredTime('14:30');
      setGuests(2);
      setMessage(
        `Requesting a private architectural inspection of ${bookingModalProperty.title} (${bookingModalProperty.referenceCode}).`
      );
      setError(null);
      setConfirmed(false);
    }
  }, [bookingModalProperty, currentUser, tomorrowStr]);

  if (!bookingModalProperty) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (clientName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (clientPhone.trim().length < 7) {
      setError('Please provide a direct phone or WhatsApp contact number.');
      return;
    }
    if (!preferredDate) {
      setError('Please choose a preferred viewing date.');
      return;
    }
    if (isSlotBooked(bookingModalProperty.id, preferredDate, preferredTime)) {
      setError(
        'The selected time slot is unavailable for this date. Please select an open time slot.'
      );
      return;
    }

    setSubmitting(true);
    const result = await bookPrivateViewing({
      propertyId: bookingModalProperty.id,
      propertyTitle: bookingModalProperty.title,
      propertyReference: bookingModalProperty.referenceCode,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      preferredDate,
      preferredTime,
      guests,
      message: message.trim(),
    });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error || 'Could not confirm booking.');
      return;
    }
    setConfirmed(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="private-viewing-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-[#0D0E12] border border-[#C9A962]/40 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Top Property Banner */}
        <div className="relative h-36 bg-[#060608] flex items-end p-6 border-b border-white/10">
          <ArchitecturalImage
            src={bookingModalProperty.heroImage}
            alt={bookingModalProperty.title}
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0E12] via-[#0D0E12]/60 to-transparent" />

          <button
            type="button"
            onClick={closeBookingModal}
            aria-label="Close private viewing modal"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 border border-white/15 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10 w-full flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A962] font-semibold">
                Private Viewing Concierge · {bookingModalProperty.referenceCode}
              </p>
              <h2
                id="private-viewing-modal-title"
                className="font-display text-2xl md:text-3xl font-semibold text-white mt-0.5"
              >
                {bookingModalProperty.title}
              </h2>
            </div>
            <span className="font-mono text-sm font-semibold text-[#DFC07A] tabular-nums">
              {formatPrice(
                bookingModalProperty.priceUsd,
                bookingModalProperty.pricePeriod
              )}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8">
          {confirmed ? (
            <div className="text-center py-6 space-y-5">
              <CheckCircle2 className="w-12 h-12 text-[#C9A962] mx-auto stroke-[1.5]" />
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-[#C9A962] font-semibold">
                  Appointment Reserved
                </p>
                <h3 className="font-display text-3xl font-semibold text-white">
                  Your Private Viewing Is Scheduled
                </h3>
                <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                  We have reserved{' '}
                  <strong className="text-white">{preferredDate}</strong> at{' '}
                  <strong className="text-white">{preferredTime}</strong> for{' '}
                  <strong className="text-white">
                    {guests} {guests === 1 ? 'principal' : 'guests'}
                  </strong>
                  . This time slot is now locked against duplicate bookings.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    closeBookingModal();
                    navigateTo('user-dashboard');
                  }}
                  className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-md gold-metallic-btn cursor-pointer"
                >
                  View in VIP Dashboard
                </button>
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-300 border border-white/15 hover:border-white/40 rounded-md cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {error && (
                <div
                  role="alert"
                  className="p-3.5 rounded-lg bg-red-950/60 border border-red-500/40 text-xs text-red-200"
                >
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Alexander Kensington"
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="principal@office.com"
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+44 20 7946 0000"
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#C9A962]" />
                      Preferred Date *
                    </span>
                  </label>
                  <input
                    type="date"
                    min={tomorrowStr}
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#C9A962]" />
                      Number of Guests *
                    </span>
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Principal' : 'Guests / Advisors'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time Slot Selector — Prevents Unavailable / Already Booked Slots */}
              <div>
                <label className="block text-xs text-zinc-400 mb-2">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#C9A962]" />
                    Select Available Time Slot ({preferredDate}) *
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {VIEWING_TIME_SLOTS.map((slot) => {
                    const booked = isSlotBooked(
                      bookingModalProperty.id,
                      preferredDate,
                      slot
                    );
                    const selected = preferredTime === slot && !booked;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={booked}
                        onClick={() => setPreferredTime(slot)}
                        className={`px-2.5 py-2 text-xs font-mono rounded-lg border text-center transition-colors ${
                          booked
                            ? 'bg-zinc-900/80 border-white/5 text-zinc-600 line-through cursor-not-allowed'
                            : selected
                            ? 'bg-[#C9A962] text-[#060608] border-[#C9A962] font-semibold cursor-pointer'
                            : 'bg-[#060608] text-zinc-300 border-white/15 hover:border-[#C9A962]/60 cursor-pointer'
                        }`}
                      >
                        {slot}
                        {booked && (
                          <span className="block text-[10px] no-underline">
                            Reserved
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  Additional Requirements / Aviation or Security Notes
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] rounded-lg gold-metallic-btn cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Confirming Slot...' : 'Confirm Private Viewing'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
