import React, { useEffect, useMemo, useState } from 'react';
import {
  Heart,
  Calendar,
  MessageSquare,
  Scale,
  User,
  LogOut,
  Shield,
  ArrowUpRight,
} from 'lucide-react';
import { PropertyCard } from '../components/PropertyCard';
import { useEstate } from '../context/EstateContext';
import { CurrencyCode } from '../types/estate';

type ClientTab =
  | 'saved'
  | 'appointments'
  | 'inquiries'
  | 'compare'
  | 'settings';

export const UserDashboardPage: React.FC = () => {
  const {
    currentUser,
    properties,
    offMarketProperties,
    appointments,
    inquiries,
    favouriteIds,
    compareIds,
    currency,
    setCurrency,
    updateCurrentUserProfile,
    signInAsDemoRole,
    signOut,
    navigateTo,
  } = useEstate();

  const [activeTab, setActiveTab] = useState<ClientTab>('saved');

  const [profileName, setProfileName] = useState(
    currentUser?.fullName || 'Alexander Kensington'
  );
  const [profilePhone, setProfilePhone] = useState(
    currentUser?.phone || '+44 20 7946 0410'
  );
  const [profileLocation, setProfileLocation] = useState(
    currentUser?.location || 'London, United Kingdom'
  );

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.fullName);
      setProfilePhone(currentUser.phone);
      setProfileLocation(currentUser.location);
    }
  }, [currentUser]);

  const allKnown = useMemo(
    () => [...properties, ...offMarketProperties],
    [properties, offMarketProperties]
  );

  const savedProperties = useMemo(
    () => allKnown.filter((p) => favouriteIds.includes(p.id)),
    [allKnown, favouriteIds]
  );

  const comparedProperties = useMemo(
    () => allKnown.filter((p) => compareIds.includes(p.id)),
    [allKnown, compareIds]
  );

  const myAppointments = useMemo(() => {
    if (!currentUser) return appointments;
    const filtered = appointments.filter(
      (a) =>
        a.userId === currentUser.id ||
        a.clientEmail.toLowerCase() === currentUser.email.toLowerCase()
    );
    return filtered.length > 0 ? filtered : appointments;
  }, [appointments, currentUser]);

  const myInquiries = useMemo(() => {
    if (!currentUser) return inquiries;
    const filtered = inquiries.filter(
      (i) =>
        i.userId === currentUser.id ||
        i.clientEmail.toLowerCase() === currentUser.email.toLowerCase()
    );
    return filtered.length > 0 ? filtered : inquiries;
  }, [inquiries, currentUser]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      await signInAsDemoRole('client');
      return;
    }
    await updateCurrentUserProfile({
      fullName: profileName.trim(),
      phone: profilePhone.trim(),
      location: profileLocation.trim(),
      preferredCurrency: currency,
    });
  };

  return (
    <div className="min-h-[calc(100vh-110px)] bg-[#060608] text-white pb-24">
      <div className="max-w-[1380px] mx-auto px-6 py-10 lg:py-14">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#C9A962]">
              VIP Client Workspace
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mt-1">
              {currentUser
                ? `Welcome, ${currentUser.fullName}`
                : 'VIP Client Dashboard'}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {currentUser
                ? `${currentUser.role} · ${currentUser.location}`
                : 'Guest Preview — Activate Demo VIP Client to persist profile changes.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!currentUser && (
              <button
                type="button"
                onClick={() => signInAsDemoRole('client')}
                className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn cursor-pointer"
              >
                Activate Demo VIP Session
              </button>
            )}

            <button
              type="button"
              onClick={() => navigateTo('admin-dashboard')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-200 bg-[#0D0E12] border border-white/15 hover:border-[#C9A962] rounded-lg cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-[#C9A962]" />
              <span>Admin Console</span>
            </button>

            {currentUser && (
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-zinc-400 hover:text-red-400 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-4">
            <nav
              aria-label="VIP Client Dashboard Navigation"
              className="bg-[#0D0E12] border border-white/10 rounded-2xl p-2.5 space-y-1"
            >
              <button
                type="button"
                onClick={() => setActiveTab('saved')}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'saved'
                    ? 'bg-[#C9A962] text-[#060608]'
                    : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <span className="inline-flex items-center gap-2.5">
                  <Heart className="w-4 h-4" />
                  <span>Saved Properties</span>
                </span>
                <span className="font-mono tabular-nums">
                  {savedProperties.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('appointments')}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'appointments'
                    ? 'bg-[#C9A962] text-[#060608]'
                    : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <span className="inline-flex items-center gap-2.5">
                  <Calendar className="w-4 h-4" />
                  <span>Viewing Appointments</span>
                </span>
                <span className="font-mono tabular-nums">
                  {myAppointments.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('inquiries')}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'inquiries'
                    ? 'bg-[#C9A962] text-[#060608]'
                    : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <span className="inline-flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>Inquiry History</span>
                </span>
                <span className="font-mono tabular-nums">
                  {myInquiries.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('compare')}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'compare'
                    ? 'bg-[#C9A962] text-[#060608]'
                    : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <span className="inline-flex items-center gap-2.5">
                  <Scale className="w-4 h-4" />
                  <span>Comparison List</span>
                </span>
                <span className="font-mono tabular-nums">
                  {compareIds.length}/3
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#C9A962] text-[#060608]'
                    : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <span className="inline-flex items-center gap-2.5">
                  <User className="w-4 h-4" />
                  <span>Profile &amp; Settings</span>
                </span>
              </button>
            </nav>

            <div className="bg-[#0D0E12] border border-[#C9A962]/30 rounded-2xl p-5 space-y-3">
              <p className="text-xs uppercase tracking-wider font-semibold text-[#C9A962]">
                Private Placement
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Positioning a luxury residence or commercial trophy for sale or lease?
              </p>
              <button
                type="button"
                onClick={() => navigateTo('sell')}
                className="w-full py-2.5 px-3 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn cursor-pointer"
              >
                Submit Seller Mandate
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {activeTab === 'saved' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-3xl font-semibold text-white">
                    Saved Luxury Properties ({savedProperties.length})
                  </h2>
                  <button
                    type="button"
                    onClick={() => navigateTo('buy')}
                    className="text-xs font-semibold text-[#DFC07A] hover:underline cursor-pointer"
                  >
                    Explore Portfolio →
                  </button>
                </div>

                {savedProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {savedProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#0D0E12] border border-white/10 rounded-2xl p-12 text-center space-y-4">
                    <h3 className="font-display text-2xl font-semibold text-white">
                      Your VIP Shortlist Is Empty
                    </h3>
                    <p className="text-sm text-zinc-400 max-w-md mx-auto">
                      Click the heart icon on any residence to save it to your private shortlist.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigateTo('buy')}
                      className="px-6 py-3 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn cursor-pointer"
                    >
                      Browse Residences
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="bg-[#0D0E12] border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h2 className="font-display text-3xl font-semibold text-white">
                    Private Viewing Appointments
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Confirmed inspection times reserved with our international desks.
                  </p>
                </div>

                {myAppointments.length > 0 ? (
                  <div className="divide-y divide-white/10">
                    {myAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <p className="font-mono text-xs text-[#C9A962]">
                            {apt.propertyReference} · {apt.preferredDate} at{' '}
                            {apt.preferredTime}
                          </p>
                          <h3 className="font-display text-2xl font-semibold text-white">
                            {apt.propertyTitle}
                          </h3>
                          <p className="text-xs text-zinc-400">
                            {apt.guests}{' '}
                            {apt.guests === 1 ? 'Principal' : 'Guests'} ·{' '}
                            {apt.message}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="px-3 py-1 rounded border border-[#C9A962]/40 bg-[#C9A962]/10 text-xs font-semibold text-[#DFC07A]">
                            {apt.status}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              navigateTo('property-detail', {
                                propertyId: apt.propertyId,
                              })
                            }
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                            aria-label={`Open ${apt.propertyTitle}`}
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center space-y-4">
                    <p className="text-sm text-zinc-400">
                      No private viewing appointments booked yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigateTo('buy')}
                      className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn cursor-pointer"
                    >
                      Schedule a Viewing
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'inquiries' && (
              <div className="bg-[#0D0E12] border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h2 className="font-display text-3xl font-semibold text-white">
                    Inquiry &amp; Dossier History
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Synced with the WebxDigital Estate CRM pipeline.
                  </p>
                </div>

                {myInquiries.length > 0 ? (
                  <div className="divide-y divide-white/10">
                    {myInquiries.map((inq) => (
                      <div
                        key={inq.id}
                        className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 max-w-xl">
                          <p className="font-mono text-xs text-zinc-400 tabular-nums">
                            {inq.createdAt} ·{' '}
                            {inq.agentName || 'Global Private Desk'}
                          </p>
                          <h3 className="text-base font-semibold text-white">
                            {inq.propertyTitle || 'Private Office Consultation'}
                          </h3>
                          <p className="text-xs text-zinc-400 line-clamp-2">
                            {inq.message}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-semibold text-[#DFC07A]">
                            {inq.status}
                          </span>
                          {inq.propertyId && (
                            <button
                              type="button"
                              onClick={() =>
                                navigateTo('property-detail', {
                                  propertyId: inq.propertyId,
                                })
                              }
                              className="inline-flex items-center gap-1 text-xs text-zinc-300 hover:text-white cursor-pointer"
                            >
                              <span>Open</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-sm text-zinc-400">
                    No inquiries dispatched yet.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'compare' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-3xl font-semibold text-white">
                      Selected for Comparison ({comparedProperties.length}/3)
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Open the full comparison matrix to evaluate specs and amenities side-by-side.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTo('compare')}
                    className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn cursor-pointer"
                  >
                    Open Full Comparison Matrix
                  </button>
                </div>

                {comparedProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {comparedProperties.map((p) => (
                      <PropertyCard key={p.id} property={p} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#0D0E12] border border-white/10 rounded-2xl p-10 text-center text-sm text-zinc-400">
                    Select up to 3 residences using the scale icon on any property card.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <form
                onSubmit={handleProfileSave}
                className="bg-[#0D0E12] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 max-w-2xl"
              >
                <div className="border-b border-white/10 pb-4">
                  <h2 className="font-display text-3xl font-semibold text-white">
                    Profile &amp; Currency Preferences
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Manage your principal contact coordinates and live portfolio currency.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                      Direct Telephone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                      Primary Jurisdiction
                    </label>
                    <input
                      type="text"
                      value={profileLocation}
                      onChange={(e) => setProfileLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                      Preferred Live Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) =>
                        setCurrency(e.target.value as CurrencyCode)
                      }
                      className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none cursor-pointer"
                    >
                      {Object.values(CurrencyCode).map((code) => (
                        <option key={code} value={code}>
                          {code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] rounded-lg gold-metallic-btn cursor-pointer"
                >
                  Save Account Settings
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
