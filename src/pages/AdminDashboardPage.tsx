import React, { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  MessageSquare,
  Users,
  UserCheck,
  Quote,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Star,
  Lock,
  ShieldAlert,
  RotateCcw,
  Upload,
  X,
} from 'lucide-react';
import { SUBMISSION_PHOTO_PRESETS } from '../assets/media';
import { ArchitecturalImage } from '../components/ArchitecturalImage';
import { useEstate } from '../context/EstateContext';
import {
  AppointmentStatus,
  InquiryStatus,
  ListingCategory,
  Property,
  PropertyStatus,
  PropertyType,
  UserRole,
} from '../types/estate';

type AdminSection =
  | 'overview'
  | 'properties'
  | 'appointments'
  | 'crm'
  | 'agents'
  | 'clients'
  | 'testimonials'
  | 'settings';

export const AdminDashboardPage: React.FC = () => {
  const {
    properties,
    offMarketProperties,
    agents,
    appointments,
    inquiries,
    users,
    testimonials,
    settings,
    formatPrice,
    currentUser,
    signInAsDemoRole,
    adminSaveProperty,
    adminDeleteProperty,
    adminUpdateInquiry,
    adminUpdateAppointmentStatus,
    adminAddAgent,
    adminDeleteAgent,
    adminUpdateUser,
    adminAddTestimonial,
    adminDeleteTestimonial,
    adminUpdateSettings,
    adminResetDatabase,
    navigateTo,
  } = useEstate();

  const [section, setSection] = useState<AdminSection>('overview');
  const [crmFilter, setCrmFilter] = useState<string>('All');
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  // Property Add / Edit Modal State
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isNewProperty, setIsNewProperty] = useState(false);

  // New Agent Form State
  const [agentName, setAgentName] = useState('');
  const [agentTitle, setAgentTitle] = useState('Partner, Private Office');
  const [agentOffice, setAgentOffice] = useState<
    'London' | 'Dubai' | 'New York' | 'Monaco' | 'Los Angeles'
  >('London');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentPhone, setAgentPhone] = useState('+44 20 7946 0000');
  const [agentSpec, setAgentSpec] = useState('Prime Residential & Off-Market Estates');

  // New Testimonial Form State
  const [testName, setTestName] = useState('');
  const [testTitle, setTestTitle] = useState('');
  const [testProp, setTestProp] = useState('');
  const [testQuote, setTestQuote] = useState('');
  const [testIsDemo, setTestIsDemo] = useState(true);

  // Settings Form State
  const [whatsappInput, setWhatsappInput] = useState(
    settings.whatsappBusinessNumber || ''
  );
  const [escrowInput, setEscrowInput] = useState(
    settings.cryptoEscrowProvider || ''
  );
  const [escrowVerified, setEscrowVerified] = useState(
    settings.cryptoSettlementVerified
  );

  const allManagedProperties = useMemo(() => {
    const map = new Map<string, Property>();
    properties.forEach((p) => map.set(p.id, p));
    offMarketProperties.forEach((p) => map.set(p.id, p));
    return Array.from(map.values());
  }, [properties, offMarketProperties]);

  const totalPortfolioUsd = useMemo(
    () =>
      allManagedProperties
        .filter((p) => p.category === ListingCategory.BUY)
        .reduce((sum, p) => sum + p.priceUsd, 0),
    [allManagedProperties]
  );

  const filteredInquiries = useMemo(() => {
    if (crmFilter === 'All') return inquiries;
    return inquiries.filter((i) => i.status === crmFilter);
  }, [inquiries, crmFilter]);

  // STRICT RBAC PROTECTION SCREEN FOR NON-ADMIN USERS
  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
    return (
      <div className="min-h-[calc(100vh-110px)] bg-[#060608] text-white flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-[#0D0E12] border border-[#C9A962]/45 rounded-2xl p-8 md:p-10 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-[#C9A962]/15 border border-[#C9A962]/40 text-[#DFC07A] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#C9A962]">
              Role-Based Access Control Enforced
            </p>
            <h1 className="font-display text-3xl font-semibold text-white">
              Executive Admin Authorization Required
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              All administrative API endpoints (<code className="font-mono text-xs">/api/admin/*</code>) verify signed <code className="font-mono text-xs">Executive Admin</code> session tokens server-side. Sign in with executive credentials or launch the Demo Executive Admin session below.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => signInAsDemoRole('admin')}
              className="w-full sm:w-auto px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] rounded-lg gold-metallic-btn cursor-pointer"
            >
              Authorize Demo Executive Admin
            </button>
            <button
              type="button"
              onClick={() => navigateTo('auth')}
              className="w-full sm:w-auto px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-300 border border-white/15 hover:border-[#C9A962] rounded-lg cursor-pointer"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const openCreatePropertyModal = () => {
    setIsNewProperty(true);
    setEditingProperty({
      id: `prop-admin-${Date.now()}`,
      referenceCode: `WXD-${Math.floor(300 + Math.random() * 699)}`,
      title: '',
      subtitle: '',
      category: ListingCategory.BUY,
      type: PropertyType.VILLA,
      status: PropertyStatus.ACTIVE,
      priceUsd: 25000000,
      city: 'London',
      country: 'United Kingdom',
      neighborhood: 'Mayfair',
      address: 'Mayfair Enclave, London W1K',
      featured: true,
      isExclusive: true,
      isOffMarket: false,
      heroImage: SUBMISSION_PHOTO_PRESETS[0].url,
      gallery: [SUBMISSION_PHOTO_PRESETS[0].url],
      description: ['Bespoke architectural residence curated by WebxDigital Estate.'],
      amenities: ['Private Lift', '24-Hour Concierge', 'Wellness Spa'],
      specs: {
        bedrooms: 5,
        bathrooms: 6,
        interiorSqFt: 7500,
        exteriorSqFt: 1800,
        yearBuilt: 2025,
        parkingSpaces: 4,
        tenure: 'Freehold',
        architecturalStyle: 'Contemporary Luxury',
        exposure: 'South-West Aspect',
      },
      geo: {
        lat: 51.5099,
        lng: -0.1508,
        osmBbox: '-0.1658,51.5019,-0.1358,51.5179',
        districtSummary: 'Prime central enclave.',
      },
      videoTour: {
        title: 'Executive Architectural Tour',
        duration: '03:00',
        highlights: ['Grand reception salon', 'Primary suite', 'Private terrace'],
      },
      agentId: agents[0]?.id || 'agent-victoria-sterling',
      createdAt: new Date().toISOString().split('T')[0],
    });
  };

  const handlePropertyImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProperty) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result;
        setEditingProperty({
          ...editingProperty,
          heroImage: dataUrl,
          gallery: [dataUrl, ...editingProperty.gallery.slice(0, 3)],
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePropertyModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty || !editingProperty.title.trim()) return;
    await adminSaveProperty(editingProperty, !isNewProperty);
    setEditingProperty(null);
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim() || !agentEmail.trim()) return;
    const initials = agentName
      .trim()
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    await adminAddAgent({
      name: agentName.trim(),
      title: agentTitle.trim(),
      office: agentOffice,
      isPrincipal: false,
      initials,
      specialization: agentSpec.trim(),
      languages: ['English', 'French'],
      closedVolume: '$320M Portfolio',
      yearsExperience: 10,
      email: agentEmail.trim(),
      phone: agentPhone.trim(),
      bio: `${agentName.trim()} represents private residential and off-market mandates from our ${agentOffice} desk.`,
    });
    setAgentName('');
    setAgentEmail('');
  };

  const handleCreateTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim() || !testQuote.trim()) return;
    const initials = testName
      .trim()
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    await adminAddTestimonial({
      clientName: testName.trim(),
      clientTitle: testTitle.trim() || 'Private Principal',
      initials,
      propertyAcquired: testProp.trim() || 'Private Estate Mandate',
      transactionType: 'Purchased',
      location: 'International Desk',
      quote: testQuote.trim(),
      isDemonstration: testIsDemo,
    });
    setTestName('');
    setTestTitle('');
    setTestProp('');
    setTestQuote('');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminUpdateSettings({
      whatsappBusinessNumber: whatsappInput.trim(),
      cryptoEscrowProvider: escrowInput.trim(),
      cryptoSettlementVerified: escrowVerified,
    });
  };

  const navItem = (
    id: AdminSection,
    label: string,
    icon: React.ReactNode,
    badge?: number
  ) => (
    <button
      key={id}
      type="button"
      onClick={() => setSection(id)}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer ${
        section === id
          ? 'bg-[#C9A962] text-[#060608]'
          : 'text-zinc-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      <span className="inline-flex items-center gap-2.5">
        {icon}
        <span>{label}</span>
      </span>
      {badge !== undefined && (
        <span className="font-mono text-[11px] tabular-nums">{badge}</span>
      )}
    </button>
  );

  return (
    <div className="min-h-[calc(100vh-110px)] bg-[#060608] text-white flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-[276px] bg-[#0B0C10] border-b lg:border-b-0 lg:border-r border-white/10 shrink-0 flex flex-col justify-between p-5">
        <div className="space-y-6">
          <div className="px-2">
            <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#C9A962]">
              Protected RBAC Console
            </p>
            <h1 className="font-display text-2xl font-semibold text-white mt-0.5">
              Executive Admin
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">{currentUser.fullName}</p>
          </div>

          <nav className="space-y-1">
            {navItem(
              'overview',
              'Statistics',
              <LayoutDashboard className="w-4 h-4" />
            )}
            {navItem(
              'properties',
              'Properties',
              <Building2 className="w-4 h-4" />,
              allManagedProperties.length
            )}
            {navItem(
              'appointments',
              'Appointments',
              <Calendar className="w-4 h-4" />,
              appointments.length
            )}
            {navItem(
              'crm',
              'Lead CRM',
              <MessageSquare className="w-4 h-4" />,
              inquiries.length
            )}
            {navItem(
              'agents',
              'Advisors',
              <UserCheck className="w-4 h-4" />,
              agents.length
            )}
            {navItem(
              'clients',
              'VIP Clients',
              <Users className="w-4 h-4" />,
              users.length
            )}
            {navItem(
              'testimonials',
              'Testimonials',
              <Quote className="w-4 h-4" />,
              testimonials.length
            )}
            {navItem(
              'settings',
              'Settings & Escrow',
              <Settings className="w-4 h-4" />
            )}
          </nav>
        </div>

        <div className="pt-6 mt-6 border-t border-white/10 space-y-2">
          <button
            type="button"
            onClick={() => navigateTo('user-dashboard')}
            className="w-full py-2 px-3 text-xs text-zinc-300 hover:text-white bg-white/5 rounded-lg text-left cursor-pointer"
          >
            ← Open VIP Client Dashboard
          </button>
          <button
            type="button"
            onClick={adminResetDatabase}
            className="w-full inline-flex items-center gap-2 py-2 px-3 text-xs text-zinc-400 hover:text-[#DFC07A] rounded-lg cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Seed Portfolio</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 p-6 lg:p-10 space-y-8 max-w-[1300px]">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#C9A962] font-semibold">
              WEBXDIGITAL ESTATE · Administration
            </p>
            <h2 className="font-display text-3xl font-semibold text-white capitalize mt-0.5">
              {section === 'crm' ? 'CRM & Lead Management' : section}
            </h2>
          </div>

          <button
            type="button"
            onClick={openCreatePropertyModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Property</span>
          </button>
        </div>

        {/* 1. OVERVIEW STATISTICS */}
        {section === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-[#0D0E12] border border-white/10 rounded-2xl p-6">
                <p className="text-xs text-zinc-400">Sale Inventory Value</p>
                <p className="font-mono text-2xl font-semibold text-[#DFC07A] mt-2 tabular-nums">
                  {formatPrice(totalPortfolioUsd)}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {allManagedProperties.length} total properties (incl. Off-Market)
                </p>
              </div>

              <div className="bg-[#0D0E12] border border-white/10 rounded-2xl p-6">
                <p className="text-xs text-zinc-400">Private Viewing Bookings</p>
                <p className="font-mono text-2xl font-semibold text-white mt-2 tabular-nums">
                  {appointments.length}
                </p>
                <p className="text-xs text-emerald-400 mt-1">
                  Slot collision protection active
                </p>
              </div>

              <div className="bg-[#0D0E12] border border-white/10 rounded-2xl p-6">
                <p className="text-xs text-zinc-400">Active CRM Leads</p>
                <p className="font-mono text-2xl font-semibold text-[#DFC07A] mt-2 tabular-nums">
                  {
                    inquiries.filter((i) => i.status !== InquiryStatus.CLOSED)
                      .length
                  }
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  New · Contacted · Qualified
                </p>
              </div>

              <div className="bg-[#0D0E12] border border-white/10 rounded-2xl p-6">
                <p className="text-xs text-zinc-400">VIP Accounts &amp; Advisors</p>
                <p className="font-mono text-2xl font-semibold text-white mt-2 tabular-nums">
                  {users.length} / {agents.length}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Registered principals &amp; partners
                </p>
              </div>
            </div>

            {/* Lead Funnel Summary */}
            <div className="bg-[#0D0E12] border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="font-display text-2xl font-semibold text-white">
                CRM Pipeline Breakdown
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.values(InquiryStatus).map((st) => {
                  const count = inquiries.filter((i) => i.status === st).length;
                  return (
                    <div
                      key={st}
                      className="p-4 rounded-xl bg-[#060608] border border-white/10"
                    >
                      <p className="text-xs uppercase tracking-wider text-zinc-400">
                        {st}
                      </p>
                      <p className="font-mono text-2xl font-semibold text-white mt-1 tabular-nums">
                        {count}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. MANAGE PROPERTIES */}
        {section === 'properties' && (
          <div className="bg-[#0D0E12] border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#090A0E] text-[11px] uppercase tracking-wider text-zinc-400">
                    <th className="py-3.5 px-5">Ref</th>
                    <th className="py-3.5 px-5">Property</th>
                    <th className="py-3.5 px-5">Price</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-center">Featured</th>
                    <th className="py-3.5 px-5 text-center">Off-Market</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-sm">
                  {allManagedProperties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-white/[0.02]">
                      <td className="py-4 px-5 font-mono text-xs text-[#C9A962] tabular-nums">
                        {prop.referenceCode}
                      </td>
                      <td className="py-4 px-5">
                        <p className="font-semibold text-white">{prop.title}</p>
                        <p className="text-xs text-zinc-400">
                          {prop.type} · {prop.city} ({prop.category})
                        </p>
                      </td>
                      <td className="py-4 px-5 font-mono text-xs text-[#DFC07A] tabular-nums">
                        {formatPrice(prop.priceUsd, prop.pricePeriod)}
                      </td>
                      <td className="py-4 px-5">
                        <select
                          value={prop.status}
                          onChange={(e) =>
                            adminSaveProperty(
                              {
                                ...prop,
                                status: e.target.value as PropertyStatus,
                              },
                              true
                            )
                          }
                          className="px-2.5 py-1 text-xs text-white bg-[#060608] border border-white/15 rounded-md cursor-pointer"
                        >
                          {Object.values(PropertyStatus).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            adminSaveProperty(
                              { ...prop, featured: !prop.featured },
                              true
                            )
                          }
                          aria-label="Toggle featured"
                          className={`p-1.5 rounded cursor-pointer ${
                            prop.featured ? 'text-[#C9A962]' : 'text-zinc-600'
                          }`}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              prop.featured ? 'fill-current' : ''
                            }`}
                          />
                        </button>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            adminSaveProperty(
                              { ...prop, isOffMarket: !prop.isOffMarket },
                              true
                            )
                          }
                          aria-label="Toggle Off-Market"
                          className={`p-1.5 rounded cursor-pointer ${
                            prop.isOffMarket
                              ? 'text-[#DFC07A] bg-[#C9A962]/15'
                              : 'text-zinc-600'
                          }`}
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsNewProperty(false);
                            setEditingProperty(prop);
                          }}
                          aria-label={`Edit ${prop.title}`}
                          className="p-1.5 text-zinc-300 hover:text-[#DFC07A] cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => adminDeleteProperty(prop.id)}
                          aria-label={`Delete ${prop.title}`}
                          className="p-1.5 text-zinc-400 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. MANAGE APPOINTMENTS */}
        {section === 'appointments' && (
          <div className="bg-[#0D0E12] border border-white/10 rounded-2xl divide-y divide-white/10">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <p className="font-mono text-xs text-[#C9A962]">
                    {apt.preferredDate} · {apt.preferredTime} · {apt.guests}{' '}
                    Guests
                  </p>
                  <h3 className="text-lg font-semibold text-white">
                    {apt.propertyTitle} ({apt.propertyReference})
                  </h3>
                  <p className="text-xs text-zinc-300">
                    Client: {apt.clientName} ({apt.clientEmail} ·{' '}
                    {apt.clientPhone})
                  </p>
                  {apt.message && (
                    <p className="text-xs text-zinc-400 mt-1">“{apt.message}”</p>
                  )}
                </div>

                <select
                  value={apt.status}
                  onChange={(e) =>
                    adminUpdateAppointmentStatus(
                      apt.id,
                      e.target.value as AppointmentStatus
                    )
                  }
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-[#060608] border border-white/15 rounded-lg cursor-pointer self-start lg:self-center"
                >
                  {Object.values(AppointmentStatus).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* 4. CRM & LEAD MANAGEMENT */}
        {section === 'crm' && (
          <div className="space-y-6">
            <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#0D0E12] border border-white/10 rounded-lg">
              {['All', ...Object.values(InquiryStatus)].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setCrmFilter(st)}
                  className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md cursor-pointer ${
                    crmFilter === st
                      ? 'bg-[#C9A962] text-[#060608]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredInquiries.map((inq) => {
                const noteVal =
                  notesDraft[inq.id] !== undefined
                    ? notesDraft[inq.id]
                    : inq.internalNotes || '';
                return (
                  <div
                    key={inq.id}
                    className="bg-[#0D0E12] border border-white/10 rounded-2xl p-6 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-xs text-[#C9A962]">
                          {inq.createdAt} ·{' '}
                          {inq.propertyTitle || 'Private Consultation'}
                        </p>
                        <h3 className="text-lg font-semibold text-white mt-0.5">
                          {inq.clientName}{' '}
                          <span className="text-xs font-normal text-zinc-400">
                            ({inq.clientEmail} · {inq.clientPhone})
                          </span>
                        </h3>
                        <p className="text-sm text-zinc-300 mt-2">
                          {inq.message}
                        </p>
                      </div>

                      <select
                        value={inq.status}
                        onChange={(e) =>
                          adminUpdateInquiry(inq.id, {
                            status: e.target.value as InquiryStatus,
                          })
                        }
                        className="px-3.5 py-2 text-xs font-semibold text-[#DFC07A] bg-[#060608] border border-[#C9A962]/40 rounded-lg cursor-pointer shrink-0"
                      >
                        {Object.values(InquiryStatus).map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={noteVal}
                        onChange={(e) =>
                          setNotesDraft((prev) => ({
                            ...prev,
                            [inq.id]: e.target.value,
                          }))
                        }
                        placeholder="Add internal partner qualification or liquidity notes..."
                        className="flex-1 px-3.5 py-2 text-xs text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          adminUpdateInquiry(inq.id, { internalNotes: noteVal })
                        }
                        className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn cursor-pointer shrink-0"
                      >
                        Save CRM Note
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. MANAGE AGENTS */}
        {section === 'agents' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-[#0D0E12] border border-white/10 rounded-2xl divide-y divide-white/10">
              {agents.map((ag) => (
                <div
                  key={ag.id}
                  className="p-5 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-xs text-[#C9A962] font-semibold">
                      {ag.office} Desk
                    </p>
                    <h3 className="text-base font-semibold text-white">
                      {ag.name}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {ag.title} · {ag.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => adminDeleteAgent(ag.id)}
                    aria-label={`Remove ${ag.name}`}
                    className="p-2 text-zinc-400 hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleCreateAgent}
              className="lg:col-span-5 bg-[#0D0E12] border border-white/10 rounded-2xl p-6 space-y-4"
            >
              <h3 className="font-display text-2xl font-semibold text-white">
                Add Regional Advisor
              </h3>
              <input
                type="text"
                required
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Advisor Full Name *"
                className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg"
              />
              <input
                type="text"
                value={agentTitle}
                onChange={(e) => setAgentTitle(e.target.value)}
                placeholder="Title"
                className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg"
              />
              <select
                value={agentOffice}
                onChange={(e) =>
                  setAgentOffice(
                    e.target.value as
                      | 'London'
                      | 'Dubai'
                      | 'New York'
                      | 'Monaco'
                      | 'Los Angeles'
                  )
                }
                className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg"
              >
                <option value="London">London</option>
                <option value="Dubai">Dubai</option>
                <option value="New York">New York</option>
                <option value="Monaco">Monaco</option>
                <option value="Los Angeles">Los Angeles</option>
              </select>
              <input
                type="email"
                required
                value={agentEmail}
                onChange={(e) => setAgentEmail(e.target.value)}
                placeholder="Official Email *"
                className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg"
              />
              <input
                type="tel"
                value={agentPhone}
                onChange={(e) => setAgentPhone(e.target.value)}
                placeholder="Desk Phone"
                className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg"
              />
              <input
                type="text"
                value={agentSpec}
                onChange={(e) => setAgentSpec(e.target.value)}
                placeholder="Specialization"
                className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg"
              />
              <button
                type="submit"
                className="w-full py-3 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn cursor-pointer"
              >
                Register Advisor
              </button>
            </form>
          </div>
        )}

        {/* 6. MANAGE CLIENTS */}
        {section === 'clients' && (
          <div className="bg-[#0D0E12] border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#090A0E] text-[11px] uppercase tracking-wider text-zinc-400">
                    <th className="py-3.5 px-5">Principal</th>
                    <th className="py-3.5 px-5">Location</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-sm">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="py-4 px-5">
                        <p className="font-semibold text-white">{u.fullName}</p>
                        <p className="text-xs text-zinc-400">
                          {u.email} · {u.phone}
                        </p>
                      </td>
                      <td className="py-4 px-5 text-xs text-zinc-300">
                        {u.location}
                      </td>
                      <td className="py-4 px-5">
                        <select
                          value={u.status}
                          onChange={(e) =>
                            adminUpdateUser(u.id, {
                              status: e.target.value as
                                | 'Active'
                                | 'Pending Verification',
                            })
                          }
                          className="px-2.5 py-1 text-xs text-white bg-[#060608] border border-white/15 rounded-md cursor-pointer"
                        >
                          <option value="Active">Active</option>
                          <option value="Pending Verification">
                            Pending Verification
                          </option>
                        </select>
                      </td>
                      <td className="py-4 px-5">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            adminUpdateUser(u.id, {
                              role: e.target.value as UserRole,
                            })
                          }
                          className="px-2.5 py-1 text-xs text-white bg-[#060608] border border-white/15 rounded-md cursor-pointer"
                        >
                          {Object.values(UserRole).map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. MANAGE TESTIMONIALS */}
        {section === 'testimonials' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="bg-[#0D0E12] border border-white/10 rounded-2xl p-5 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">
                        {t.clientName}
                      </span>
                      {t.isDemonstration && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#C9A962]/15 text-[#DFC07A]">
                          Demo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#C9A962]">
                      {t.propertyAcquired}
                    </p>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      “{t.quote}”
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => adminDeleteTestimonial(t.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-400 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleCreateTestimonial}
              className="lg:col-span-5 bg-[#0D0E12] border border-white/10 rounded-2xl p-6 space-y-4 h-fit"
            >
              <h3 className="font-display text-2xl font-semibold text-white">
                Publish Client Review
              </h3>
              <input
                type="text"
                required
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Client Name *"
                className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg"
              />
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="Client Title / Family Office"
                className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg"
              />
              <input
                type="text"
                value={testProp}
                onChange={(e) => setTestProp(e.target.value)}
                placeholder="Property Purchased / Leased"
                className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg"
              />
              <textarea
                rows={3}
                required
                value={testQuote}
                onChange={(e) => setTestQuote(e.target.value)}
                placeholder="Client review quote *"
                className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg"
              />
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={testIsDemo}
                  onChange={(e) => setTestIsDemo(e.target.checked)}
                  className="accent-[#C9A962]"
                />
                <span>Mark as Demonstration Testimonial</span>
              </label>
              <button
                type="submit"
                className="w-full py-3 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn cursor-pointer"
              >
                Publish Testimonial
              </button>
            </form>
          </div>
        )}

        {/* 8. SETTINGS & CRYPTO ESCROW CONFIGURATION */}
        {section === 'settings' && (
          <form
            onSubmit={handleSaveSettings}
            className="bg-[#0D0E12] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 max-w-2xl"
          >
            <div>
              <h3 className="font-display text-2xl font-semibold text-white">
                VIP WhatsApp &amp; Digital Asset Escrow Configuration
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Configure your verified business WhatsApp number and regulated cryptocurrency escrow partner.
              </p>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                Business WhatsApp Number (Digits with Country Code, e.g. 442079460000)
              </label>
              <input
                type="text"
                value={whatsappInput}
                onChange={(e) => setWhatsappInput(e.target.value)}
                placeholder="Leave blank until official WhatsApp Business line is active"
                className="w-full px-3.5 py-2.5 text-sm font-mono text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                Institutional Crypto Escrow Partner (BTC / ETH / USDT)
              </label>
              <input
                type="text"
                value={escrowInput}
                onChange={(e) => setEscrowInput(e.target.value)}
                placeholder="e.g. Swiss Regulated Real Estate Notary & Custody Desk"
                className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
              />
            </div>

            <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={escrowVerified}
                onChange={(e) => setEscrowVerified(e.target.checked)}
                className="accent-[#C9A962]"
              />
              <span>
                Display Institutional Escrow Desk as Active in Footer Disclosure
              </span>
            </label>

            <button
              type="submit"
              className="px-6 py-3 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn cursor-pointer"
            >
              Save Platform Configuration
            </button>
          </form>
        )}
      </div>

      {/* ADD / EDIT PROPERTY MODAL */}
      {editingProperty && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSavePropertyModal}
            className="w-full max-w-2xl bg-[#0D0E12] border border-[#C9A962]/45 rounded-2xl p-6 md:p-8 space-y-5 my-8"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-display text-2xl font-semibold text-white">
                {isNewProperty ? 'Add Luxury Property' : 'Edit Property'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProperty(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingProperty.title}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm text-white bg-[#060608] border border-white/15 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Price (USD) *
                </label>
                <input
                  type="number"
                  required
                  value={editingProperty.priceUsd}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      priceUsd: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 text-sm font-mono text-white bg-[#060608] border border-white/15 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Disposition
                </label>
                <select
                  value={editingProperty.category}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      category: e.target.value as ListingCategory,
                      pricePeriod:
                        e.target.value === ListingCategory.RENT
                          ? 'month'
                          : undefined,
                    })
                  }
                  className="w-full px-3 py-2 text-sm text-white bg-[#060608] border border-white/15 rounded-lg"
                >
                  <option value={ListingCategory.BUY}>BUY</option>
                  <option value={ListingCategory.RENT}>RENT</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Category
                </label>
                <select
                  value={editingProperty.type}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      type: e.target.value as PropertyType,
                    })
                  }
                  className="w-full px-3 py-2 text-sm text-white bg-[#060608] border border-white/15 rounded-lg"
                >
                  {Object.values(PropertyType).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">City</label>
                <select
                  value={editingProperty.city}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      city: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm text-white bg-[#060608] border border-white/15 rounded-lg"
                >
                  <option value="London">London</option>
                  <option value="Dubai">Dubai</option>
                  <option value="New York">New York</option>
                  <option value="Monaco">Monaco</option>
                  <option value="Los Angeles">Los Angeles</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Beds</label>
                <input
                  type="number"
                  value={editingProperty.specs.bedrooms}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      specs: {
                        ...editingProperty.specs,
                        bedrooms: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-sm font-mono text-white bg-[#060608] border border-white/15 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Baths</label>
                <input
                  type="number"
                  value={editingProperty.specs.bathrooms}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      specs: {
                        ...editingProperty.specs,
                        bathrooms: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-sm font-mono text-white bg-[#060608] border border-white/15 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Interior Sq Ft
                </label>
                <input
                  type="number"
                  value={editingProperty.specs.interiorSqFt}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      specs: {
                        ...editingProperty.specs,
                        interiorSqFt: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-sm font-mono text-white bg-[#060608] border border-white/15 rounded-lg"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 pt-1 text-xs text-zinc-300">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingProperty.featured}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      featured: e.target.checked,
                    })
                  }
                  className="accent-[#C9A962]"
                />
                <span>Featured</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingProperty.isExclusive}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      isExclusive: e.target.checked,
                    })
                  }
                  className="accent-[#C9A962]"
                />
                <span>Exclusive Label</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-[#DFC07A]">
                <input
                  type="checkbox"
                  checked={editingProperty.isOffMarket}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      isOffMarket: e.target.checked,
                    })
                  }
                  className="accent-[#C9A962]"
                />
                <span>Off-Market Vault</span>
              </label>
            </div>

            {/* Upload Image */}
            <div className="flex items-center gap-4 pt-2">
              <div className="w-24 h-16 rounded-lg overflow-hidden bg-[#060608] border border-white/15 shrink-0">
                <ArchitecturalImage
                  src={editingProperty.heroImage}
                  alt={editingProperty.title || 'Preview'}
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-[#DFC07A] cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Upload Property Photograph</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePropertyImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingProperty(null)}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn cursor-pointer"
              >
                Save Property
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
