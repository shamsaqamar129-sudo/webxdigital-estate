import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  DEFAULT_PLATFORM_SETTINGS,
  FALLBACK_STATIC_SEED,
  fetchLiveExchangeRates,
  formatEstatePrice,
} from '../services/platformRepository';
import {
  Agent,
  AppointmentStatus,
  CurrencyCode,
  ExchangeRateState,
  Inquiry,
  InquiryStatus,
  PageRoute,
  PlatformSettings,
  Property,
  PropertyFilterState,
  Testimonial,
  UserAccount,
  UserRole,
  ViewingAppointment,
} from '../types/estate';

export const DEFAULT_FILTERS: PropertyFilterState = {
  searchQuery: '',
  disposition: 'ALL',
  location: 'All',
  propertyType: 'All',
  minPrice: '',
  maxPrice: '',
  minBedrooms: 0,
  minBathrooms: 0,
  minSqFt: '',
  sortBy: 'featured',
};

interface BookedSlotRef {
  propertyId: string;
  preferredDate: string;
  preferredTime: string;
}

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
}

interface EstateContextValue {
  currentRoute: PageRoute;
  selectedPropertyId: string | null;
  navigateTo: (
    route: PageRoute,
    options?: {
      propertyId?: string;
      presetFilters?: Partial<PropertyFilterState>;
    }
  ) => void;

  backendConnected: boolean;
  isLoadingInitial: boolean;

  properties: Property[];
  offMarketProperties: Property[];
  offMarketUnlocked: boolean;
  unlockOffMarketVault: (
    accessCode: string
  ) => Promise<{ ok: boolean; error?: string }>;

  agents: Agent[];
  testimonials: Testimonial[];
  inquiries: Inquiry[];
  appointments: ViewingAppointment[];
  bookedSlots: BookedSlotRef[];
  users: UserAccount[];
  settings: PlatformSettings;

  currentUser: UserAccount | null;
  authToken: string | null;

  // Live Currency Switcher
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  fxState: ExchangeRateState;
  refreshExchangeRates: () => Promise<void>;
  formatPrice: (priceUsd: number, period?: 'month' | 'year') => string;

  // Favourites & Property Comparison (Max 3)
  favouriteIds: string[];
  toggleFavourite: (propertyId: string) => void;
  isFavourite: (propertyId: string) => boolean;

  compareIds: string[];
  toggleCompare: (propertyId: string) => void;
  isCompared: (propertyId: string) => boolean;
  clearCompare: () => void;

  // Private Viewing Booking Modal
  bookingModalProperty: Property | null;
  openBookingModal: (property: Property) => void;
  closeBookingModal: () => void;
  isSlotBooked: (propertyId: string, date: string, time: string) => boolean;
  bookPrivateViewing: (payload: {
    propertyId: string;
    propertyTitle: string;
    propertyReference: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    preferredDate: string;
    preferredTime: string;
    guests: number;
    message: string;
  }) => Promise<{ ok: boolean; error?: string }>;

  // Filters
  catalogFilters: PropertyFilterState;
  setCatalogFilters: React.Dispatch<React.SetStateAction<PropertyFilterState>>;
  resetCatalogFilters: () => void;

  // Authentication Actions
  signInWithCredentials: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  signInAsDemoRole: (role: 'client' | 'admin') => Promise<void>;
  registerAccount: (payload: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    role: UserRole;
    password: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  updateCurrentUserProfile: (updates: Partial<UserAccount>) => Promise<void>;
  signOut: () => void;

  // Inquiries & Seller Mandate
  submitInquiry: (
    payload: Omit<
      Inquiry,
      'id' | 'createdAt' | 'status' | 'internalNotes'
    >
  ) => Promise<{ ok: boolean; error?: string }>;
  submitSellerProperty: (property: Property) => Promise<void>;

  // Protected Admin Operations
  adminSaveProperty: (
    property: Property,
    isEdit?: boolean
  ) => Promise<{ ok: boolean; error?: string }>;
  adminDeleteProperty: (propertyId: string) => Promise<void>;
  adminUpdateInquiry: (
    inquiryId: string,
    updates: { status?: InquiryStatus; internalNotes?: string }
  ) => Promise<void>;
  adminUpdateAppointmentStatus: (
    appointmentId: string,
    status: AppointmentStatus
  ) => Promise<void>;
  adminAddAgent: (agent: Omit<Agent, 'id'>) => Promise<void>;
  adminDeleteAgent: (agentId: string) => Promise<void>;
  adminUpdateUser: (
    userId: string,
    updates: { role?: UserRole; status?: 'Active' | 'Pending Verification' }
  ) => Promise<void>;
  adminAddTestimonial: (item: Omit<Testimonial, 'id'>) => Promise<void>;
  adminDeleteTestimonial: (id: string) => Promise<void>;
  adminUpdateSettings: (updates: Partial<PlatformSettings>) => Promise<void>;
  adminResetDatabase: () => Promise<void>;

  toast: ToastMessage | null;
  dismissToast: () => void;
  notify: (title: string, description?: string) => void;
}

const SESSION_TOKEN_KEY = 'wxd_auth_token_v2';
const GUEST_FAVS_KEY = 'wxd_guest_favs_v2';
const COMPARE_IDS_KEY = 'wxd_compare_ids_v2';
const OFFMARKET_TOKEN_KEY = 'wxd_offmarket_token_v2';

const EstateContext = createContext<EstateContextValue | undefined>(undefined);

export const EstateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentRoute, setCurrentRoute] = useState<PageRoute>('home');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    'prop-obsidian-promontory'
  );
  const [backendConnected, setBackendConnected] = useState<boolean>(true);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);

  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SESSION_TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const [offMarketToken, setOffMarketToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(OFFMARKET_TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const [properties, setProperties] = useState<Property[]>(() =>
    FALLBACK_STATIC_SEED.properties.filter((p) => !p.isOffMarket)
  );
  const [offMarketProperties, setOffMarketProperties] = useState<Property[]>(
    []
  );
  const [offMarketUnlocked, setOffMarketUnlocked] = useState<boolean>(false);

  const [agents, setAgents] = useState<Agent[]>(FALLBACK_STATIC_SEED.agents);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(
    FALLBACK_STATIC_SEED.testimonials
  );
  const [inquiries, setInquiries] = useState<Inquiry[]>(
    FALLBACK_STATIC_SEED.inquiries
  );
  const [appointments, setAppointments] = useState<ViewingAppointment[]>(
    FALLBACK_STATIC_SEED.appointments
  );
  const [bookedSlots, setBookedSlots] = useState<BookedSlotRef[]>(() =>
    FALLBACK_STATIC_SEED.appointments.map((a) => ({
      propertyId: a.propertyId,
      preferredDate: a.preferredDate,
      preferredTime: a.preferredTime,
    }))
  );
  const [users, setUsers] = useState<UserAccount[]>(FALLBACK_STATIC_SEED.users);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [settings, setSettings] = useState<PlatformSettings>(
    DEFAULT_PLATFORM_SETTINGS
  );

  const [guestFavourites, setGuestFavourites] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(GUEST_FAVS_KEY);
      return raw ? JSON.parse(raw) : ['prop-obsidian-promontory'];
    } catch {
      return ['prop-obsidian-promontory'];
    }
  });

  const [compareIds, setCompareIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(COMPARE_IDS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [currency, setCurrencyState] = useState<CurrencyCode>(CurrencyCode.USD);
  const [fxState, setFxState] = useState<ExchangeRateState>({
    isLive: false,
    isLoading: true,
    base: CurrencyCode.USD,
    rates: { [CurrencyCode.USD]: 1 },
    lastUpdated: null,
    providerName: 'Connecting...',
    error: null,
  });

  const [bookingModalProperty, setBookingModalProperty] =
    useState<Property | null>(null);
  const [catalogFilters, setCatalogFilters] =
    useState<PropertyFilterState>(DEFAULT_FILTERS);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const notify = useCallback((title: string, description?: string) => {
    setToast({ id: `${Date.now()}-${Math.random()}`, title, description });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => {
      setToast((prev) => (prev?.id === toast.id ? null : prev));
    }, 4500);
    return () => window.clearTimeout(t);
  }, [toast]);

  const dismissToast = () => setToast(null);

  const refreshExchangeRates = useCallback(async () => {
    setFxState((prev) => ({ ...prev, isLoading: true }));
    const next = await fetchLiveExchangeRates(true);
    setFxState(next);
  }, []);

  // Load initial FX rates
  useEffect(() => {
    fetchLiveExchangeRates(false).then(setFxState);
  }, []);

  // Load Server Bootstrap State
  const syncFromServer = useCallback(
    async (tokenOverride?: string | null) => {
      const activeToken =
        tokenOverride !== undefined ? tokenOverride : authToken;
      try {
        const headers: Record<string, string> = {};
        if (activeToken) {
          headers.Authorization = `Bearer ${activeToken}`;
        }
        const res = await fetch('/api/bootstrap', { headers });
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) {
          throw new Error('Static deployment mode');
        }
        const data = await res.json();
        setBackendConnected(true);
        setProperties(data.properties || []);
        setAgents(data.agents || []);
        setTestimonials(data.testimonials || []);
        setBookedSlots(data.bookedSlots || []);
        if (data.settings) setSettings(data.settings);
        setCurrentUser(data.currentUser || null);

        if (data.adminData) {
          setUsers(data.adminData.users || []);
          setInquiries(data.adminData.inquiries || []);
          setAppointments(data.adminData.appointments || []);
        } else {
          setAppointments(data.myAppointments || []);
          setInquiries(data.myInquiries || []);
        }
      } catch {
        setBackendConnected(false);
      } finally {
        setIsLoadingInitial(false);
      }
    },
    [authToken]
  );

  useEffect(() => {
    syncFromServer();
  }, [syncFromServer]);

  // Restore off-market vault session if clearanceToken valid
  useEffect(() => {
    if (!offMarketToken) return;
    fetch('/api/off-market/properties', {
      headers: { Authorization: `Bearer ${offMarketToken}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.properties) {
          setOffMarketProperties(data.properties);
          setOffMarketUnlocked(true);
        }
      })
      .catch(() => {});
  }, [offMarketToken]);

  // Dynamic SEO Titles & Meta Descriptions
  useEffect(() => {
    const allKnown = [...properties, ...offMarketProperties];
    const activeProp = allKnown.find((p) => p.id === selectedPropertyId);

    const routeSeo: Record<PageRoute, { title: string; desc: string }> = {
      home: {
        title: 'WEBXDIGITAL ESTATE — International Luxury Real Estate',
        desc: 'Acquire, lease, and divest landmark luxury villas, penthouses, mansions, commercial trophies, and off-market estates across London, Dubai, New York, Monaco & Los Angeles.',
      },
      buy: {
        title: 'Buy Luxury Properties | WEBXDIGITAL ESTATE',
        desc: 'Explore freehold mansions, sky penthouses, waterfront estates, commercial headquarters, and coastal investment land worldwide.',
      },
      rent: {
        title: 'Luxury Executive & Seasonal Leases | WEBXDIGITAL ESTATE',
        desc: 'Turnkey furnished penthouses, diplomatic townhouses, and Riviera villas available for seasonal and annual lease.',
      },
      sell: {
        title: 'List a Private Mandate | WEBXDIGITAL ESTATE',
        desc: 'Position your architectural residence or trophy asset before verified family offices and global principals.',
      },
      'off-market': {
        title: '38% Off-Market Opportunities Vault | WEBXDIGITAL ESTATE',
        desc: 'Restricted sovereign real estate mandates available exclusively to authorized principals.',
      },
      compare: {
        title: 'Compare Luxury Residences | WEBXDIGITAL ESTATE',
        desc: 'Side-by-side architectural specification, valuation, and amenity comparison for up to three luxury properties.',
      },
      'property-detail': {
        title: activeProp
          ? `${activeProp.title} (${activeProp.city}) | WEBXDIGITAL ESTATE`
          : 'Residence Monograph | WEBXDIGITAL ESTATE',
        desc: activeProp
          ? `${activeProp.subtitle} in ${activeProp.neighborhood}, ${activeProp.city}. Schedule a private viewing with WebxDigital Estate.`
          : 'Detailed architectural specifications, full-screen gallery, video tour, and private viewing scheduling.',
      },
      agents: {
        title: 'International Private Client Advisors | WEBXDIGITAL ESTATE',
        desc: 'Connect directly with Managing Partners across London, Dubai, New York, Monaco, and Los Angeles.',
      },
      about: {
        title: 'About Our Global Partnership | WEBXDIGITAL ESTATE',
        desc: 'Discover the mission, bespoke advisory services, and international reach of WebxDigital Estate — Designed & Developed by WebxDigital.',
      },
      contact: {
        title: 'Contact Global Private Desks | WEBXDIGITAL ESTATE',
        desc: 'Reach our Mayfair, DIFC, Fifth Avenue, Monte-Carlo, and Beverly Hills desks via confidential inquiry or VIP WhatsApp.',
      },
      auth: {
        title: 'VIP Client & Executive Portal | WEBXDIGITAL ESTATE',
        desc: 'Sign in to manage saved residences, private viewing appointments, property comparisons, and executive operations.',
      },
      'user-dashboard': {
        title: 'VIP Client Dashboard | WEBXDIGITAL ESTATE',
        desc: 'Manage your shortlisted luxury properties, private viewing appointments, inquiries, and currency settings.',
      },
      'admin-dashboard': {
        title: 'Executive Administration Console | WEBXDIGITAL ESTATE',
        desc: 'Protected role-based administration console for managing properties, off-market mandates, appointments, and CRM leads.',
      },
    };

    const currentSeo = routeSeo[currentRoute] || routeSeo.home;
    document.title = currentSeo.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', currentSeo.desc);
    }
  }, [currentRoute, selectedPropertyId, properties, offMarketProperties]);

  const navigateTo: EstateContextValue['navigateTo'] = (route, options) => {
    if (options?.propertyId) {
      setSelectedPropertyId(options.propertyId);
    }
    if (options?.presetFilters) {
      setCatalogFilters({
        ...DEFAULT_FILTERS,
        ...options.presetFilters,
      });
    } else if (route === 'buy') {
      setCatalogFilters((prev) => ({ ...prev, disposition: 'BUY' }));
    } else if (route === 'rent') {
      setCatalogFilters((prev) => ({ ...prev, disposition: 'RENT' }));
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetCatalogFilters = () => setCatalogFilters(DEFAULT_FILTERS);

  const formatPrice = useCallback(
    (priceUsd: number, period?: 'month' | 'year') =>
      formatEstatePrice(priceUsd, currency, fxState, period),
    [currency, fxState]
  );

  const setCurrency = (next: CurrencyCode) => {
    setCurrencyState(next);
    if (currentUser && authToken && backendConnected) {
      fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ preferredCurrency: next }),
      }).catch(() => {});
    }
  };

  // Favourites
  const favouriteIds = currentUser
    ? currentUser.savedPropertyIds
    : guestFavourites;

  const isFavourite = (id: string) => favouriteIds.includes(id);

  const toggleFavourite = (propertyId: string) => {
    const allProps = [...properties, ...offMarketProperties];
    const target = allProps.find((p) => p.id === propertyId);
    const exists = isFavourite(propertyId);
    const nextIds = exists
      ? favouriteIds.filter((id) => id !== propertyId)
      : [...favouriteIds, propertyId];

    if (currentUser) {
      setCurrentUser({ ...currentUser, savedPropertyIds: nextIds });
      if (authToken && backendConnected) {
        fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ savedPropertyIds: nextIds }),
        }).catch(() => {});
      }
    } else {
      setGuestFavourites(nextIds);
      try {
        localStorage.setItem(GUEST_FAVS_KEY, JSON.stringify(nextIds));
      } catch {
        // Ignore
      }
    }

    notify(
      exists ? 'Removed from Shortlist' : 'Saved to VIP Shortlist',
      target?.title
    );
  };

  // Comparison (Up to 3 properties)
  const isCompared = (id: string) => compareIds.includes(id);

  const toggleCompare = (propertyId: string) => {
    if (compareIds.includes(propertyId)) {
      const next = compareIds.filter((id) => id !== propertyId);
      setCompareIds(next);
      try {
        localStorage.setItem(COMPARE_IDS_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      notify('Removed from Comparison');
      return;
    }

    if (compareIds.length >= 3) {
      notify(
        'Comparison Limit Reached (3 Max)',
        'Remove one residence from comparison before adding another.'
      );
      return;
    }

    const next = [...compareIds, propertyId];
    setCompareIds(next);
    try {
      localStorage.setItem(COMPARE_IDS_KEY, JSON.stringify(next));
    } catch {
      // Ignore
    }
    notify(
      `Added to Property Comparison (${next.length}/3)`,
      'Open the Compare bar below to inspect side-by-side.'
    );
  };

  const clearCompare = () => {
    setCompareIds([]);
    try {
      localStorage.removeItem(COMPARE_IDS_KEY);
    } catch {
      // Ignore
    }
  };

  // Off-Market Vault Unlock
  const unlockOffMarketVault: EstateContextValue['unlockOffMarketVault'] =
    async (accessCode) => {
      if (backendConnected) {
        try {
          const res = await fetch('/api/off-market/unlock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessCode }),
          });
          const data = await res.json();
          if (!res.ok) {
            return {
              ok: false,
              error: data.error || 'Access code rejected by server.',
            };
          }
          setOffMarketToken(data.clearanceToken);
          try {
            sessionStorage.setItem(OFFMARKET_TOKEN_KEY, data.clearanceToken);
          } catch {
            // Ignore
          }
          setOffMarketProperties(data.properties || []);
          setOffMarketUnlocked(true);
          notify(
            'Sovereign Off-Market Vault Unlocked',
            `${(data.properties || []).length} unpublished mandates revealed.`
          );
          return { ok: true };
        } catch {
          return {
            ok: false,
            error: 'Unable to reach server verification gate.',
          };
        }
      }

      return {
        ok: false,
        error:
          'Server-side off-market gate is offline in static-only preview. Run the Express backend server (`npm run dev` / `npm start`) to verify vault credentials.',
      };
    };

  // Private Viewing Booking Modal & Slot Verification
  const openBookingModal = (property: Property) =>
    setBookingModalProperty(property);
  const closeBookingModal = () => setBookingModalProperty(null);

  const isSlotBooked = (propertyId: string, date: string, time: string) =>
    bookedSlots.some(
      (s) =>
        s.propertyId === propertyId &&
        s.preferredDate === date &&
        s.preferredTime === time
    );

  const bookPrivateViewing: EstateContextValue['bookPrivateViewing'] = async (
    payload
  ) => {
    if (
      isSlotBooked(
        payload.propertyId,
        payload.preferredDate,
        payload.preferredTime
      )
    ) {
      return {
        ok: false,
        error:
          'This viewing slot is already booked. Please choose another time.',
      };
    }

    if (backendConnected) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Booking failed.' };
      }
      setAppointments((prev) => [data.appointment, ...prev]);
      setBookedSlots((prev) => [
        ...prev,
        {
          propertyId: payload.propertyId,
          preferredDate: payload.preferredDate,
          preferredTime: payload.preferredTime,
        },
      ]);
      notify(
        'Private Viewing Confirmed',
        `${payload.propertyTitle} · ${payload.preferredDate} at ${payload.preferredTime}`
      );
      return { ok: true };
    }

    // Fallback local state if static build
    const fallbackApt: ViewingAppointment = {
      ...payload,
      id: `apt-${Date.now().toString().slice(-6)}`,
      status: AppointmentStatus.CONFIRMED,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAppointments((prev) => [fallbackApt, ...prev]);
    setBookedSlots((prev) => [
      ...prev,
      {
        propertyId: payload.propertyId,
        preferredDate: payload.preferredDate,
        preferredTime: payload.preferredTime,
      },
    ]);
    notify('Private Viewing Logged (Preview Mode)', payload.propertyTitle);
    return { ok: true };
  };

  // Authentication
  const signInWithCredentials: EstateContextValue['signInWithCredentials'] =
    async (email, password) => {
      if (!backendConnected) {
        return {
          ok: false,
          error:
            'Backend authentication server is unreachable in static mode. Use Instant Demo Preview below.',
        };
      }
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Authentication failed.' };
      }
      setAuthToken(data.token);
      try {
        localStorage.setItem(SESSION_TOKEN_KEY, data.token);
      } catch {
        // Ignore
      }
      await syncFromServer(data.token);
      notify(`Welcome back, ${data.user.fullName}`);
      navigateTo(
        data.user.role === UserRole.ADMIN ? 'admin-dashboard' : 'user-dashboard'
      );
      return { ok: true };
    };

  const signInAsDemoRole = async (role: 'client' | 'admin') => {
    if (backendConnected) {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const data = await res.json();
        setAuthToken(data.token);
        try {
          localStorage.setItem(SESSION_TOKEN_KEY, data.token);
        } catch {
          // Ignore
        }
        await syncFromServer(data.token);
        notify(
          `Signed in as ${data.user.fullName}`,
          role === 'admin'
            ? 'Server-verified Executive Admin session active.'
            : 'VIP Client Dashboard active.'
        );
        navigateTo(role === 'admin' ? 'admin-dashboard' : 'user-dashboard');
        return;
      }
    }

    // Fallback for static Vercel preview
    const demoUser =
      FALLBACK_STATIC_SEED.users.find((u) =>
        role === 'admin' ? u.role === UserRole.ADMIN : u.role === UserRole.CLIENT
      ) || FALLBACK_STATIC_SEED.users[0];
    setCurrentUser(demoUser);
    notify(`Preview Session: ${demoUser.fullName}`);
    navigateTo(role === 'admin' ? 'admin-dashboard' : 'user-dashboard');
  };

  const registerAccount: EstateContextValue['registerAccount'] = async (
    payload
  ) => {
    if (!backendConnected) {
      return {
        ok: false,
        error: 'Registration requires the active Express backend server.',
      };
    }
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, savedPropertyIds: guestFavourites }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error || 'Registration failed.' };
    }
    setAuthToken(data.token);
    try {
      localStorage.setItem(SESSION_TOKEN_KEY, data.token);
    } catch {
      // Ignore
    }
    await syncFromServer(data.token);
    notify('VIP Account Created', `Welcome, ${data.user.fullName}`);
    navigateTo('user-dashboard');
    return { ok: true };
  };

  const updateCurrentUserProfile = async (updates: Partial<UserAccount>) => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, ...updates });
    if (backendConnected && authToken) {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updates),
      });
    }
    notify('VIP Profile Updated');
  };

  const signOut = () => {
    setAuthToken(null);
    setCurrentUser(null);
    try {
      localStorage.removeItem(SESSION_TOKEN_KEY);
    } catch {
      // Ignore
    }
    syncFromServer(null);
    notify('Signed Out', 'Your session has been closed.');
    navigateTo('home');
  };

  // Inquiries & Seller Submission
  const submitInquiry: EstateContextValue['submitInquiry'] = async (
    payload
  ) => {
    if (backendConnected) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Submission failed.' };
      }
      setInquiries((prev) => [data.inquiry, ...prev]);
      notify(
        'Confidential Inquiry Dispatched',
        'Logged in our Private Desk CRM.'
      );
      return { ok: true };
    }

    const fallback: Inquiry = {
      ...payload,
      id: `inq-${Date.now().toString().slice(-6)}`,
      status: InquiryStatus.NEW,
      internalNotes: '',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setInquiries((prev) => [fallback, ...prev]);
    notify('Inquiry Logged (Preview Mode)');
    return { ok: true };
  };

  const submitSellerProperty = async (property: Property) => {
    if (backendConnected) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;
      const res = await fetch('/api/properties/submit', {
        method: 'POST',
        headers,
        body: JSON.stringify({ property }),
      });
      if (res.ok) {
        const data = await res.json();
        if (!data.property.isOffMarket) {
          setProperties((prev) => [data.property, ...prev]);
        } else {
          setOffMarketProperties((prev) => [data.property, ...prev]);
        }
        notify('Property Mandate Published', data.property.title);
        return;
      }
    }
    setProperties((prev) => [property, ...prev]);
    notify('Property Mandate Added', property.title);
  };

  // Admin Operations (Protected by Server Bearer Token)
  const adminHeaders = useMemo(
    () => ({
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    }),
    [authToken]
  );

  const adminSaveProperty: EstateContextValue['adminSaveProperty'] = async (
    property,
    isEdit = false
  ) => {
    if (backendConnected) {
      const url = isEdit
        ? `/api/admin/properties/${property.id}`
        : '/api/admin/properties';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: adminHeaders,
        body: JSON.stringify(isEdit ? property : { property }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Unauthorized admin operation.' };
      }
      await syncFromServer();
      notify(isEdit ? 'Property Updated' : 'Property Created', property.title);
      return { ok: true };
    }
    setProperties((prev) =>
      isEdit
        ? prev.map((p) => (p.id === property.id ? property : p))
        : [property, ...prev]
    );
    notify('Property Saved (Static Preview)');
    return { ok: true };
  };

  const adminDeleteProperty = async (propertyId: string) => {
    if (backendConnected) {
      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'DELETE',
        headers: adminHeaders,
      });
      if (!res.ok) {
        notify('Authorization Required', 'Sign in as Executive Admin first.');
        return;
      }
      await syncFromServer();
      notify('Property Deleted');
      return;
    }
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
  };

  const adminUpdateInquiry: EstateContextValue['adminUpdateInquiry'] = async (
    inquiryId,
    updates
  ) => {
    if (backendConnected) {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setInquiries((prev) =>
          prev.map((i) => (i.id === inquiryId ? data.inquiry : i))
        );
        notify('CRM Lead Updated');
      }
      return;
    }
    setInquiries((prev) =>
      prev.map((i) => (i.id === inquiryId ? { ...i, ...updates } : i))
    );
  };

  const adminUpdateAppointmentStatus = async (
    appointmentId: string,
    status: AppointmentStatus
  ) => {
    if (backendConnected) {
      const res = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await syncFromServer();
        notify('Appointment Updated', `Marked as ${status}.`);
      }
      return;
    }
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status } : a))
    );
  };

  const adminAddAgent = async (agent: Omit<Agent, 'id'>) => {
    if (backendConnected) {
      const res = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ agent }),
      });
      if (res.ok) {
        await syncFromServer();
        notify('Advisor Added to Global Desk', agent.name);
      }
    }
  };

  const adminDeleteAgent = async (agentId: string) => {
    if (backendConnected) {
      const res = await fetch(`/api/admin/agents/${agentId}`, {
        method: 'DELETE',
        headers: adminHeaders,
      });
      if (res.ok) {
        await syncFromServer();
        notify('Advisor Removed');
      }
    }
  };

  const adminUpdateUser: EstateContextValue['adminUpdateUser'] = async (
    userId,
    updates
  ) => {
    if (backendConnected) {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await syncFromServer();
        notify('Client Account Updated');
      }
    }
  };

  const adminAddTestimonial = async (item: Omit<Testimonial, 'id'>) => {
    if (backendConnected) {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ testimonial: item }),
      });
      if (res.ok) {
        await syncFromServer();
        notify('Testimonial Published');
      }
    }
  };

  const adminDeleteTestimonial = async (id: string) => {
    if (backendConnected) {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
        headers: adminHeaders,
      });
      if (res.ok) {
        await syncFromServer();
        notify('Testimonial Removed');
      }
    }
  };

  const adminUpdateSettings = async (updates: Partial<PlatformSettings>) => {
    if (backendConnected) {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        notify('Platform Configuration Saved');
      }
      return;
    }
    setSettings((prev) => ({ ...prev, ...updates }));
    notify('Platform Configuration Updated');
  };

  const adminResetDatabase = async () => {
    if (backendConnected) {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: adminHeaders,
      });
      if (res.ok) {
        await syncFromServer();
        notify('Database Restored to Initial Curated Portfolio');
      }
    }
  };

  return (
    <EstateContext.Provider
      value={{
        currentRoute,
        selectedPropertyId,
        navigateTo,
        backendConnected,
        isLoadingInitial,
        properties,
        offMarketProperties,
        offMarketUnlocked,
        unlockOffMarketVault,
        agents,
        testimonials,
        inquiries,
        appointments,
        bookedSlots,
        users,
        settings,
        currentUser,
        authToken,
        currency,
        setCurrency,
        fxState,
        refreshExchangeRates,
        formatPrice,
        favouriteIds,
        toggleFavourite,
        isFavourite,
        compareIds,
        toggleCompare,
        isCompared,
        clearCompare,
        bookingModalProperty,
        openBookingModal,
        closeBookingModal,
        isSlotBooked,
        bookPrivateViewing,
        catalogFilters,
        setCatalogFilters,
        resetCatalogFilters,
        signInWithCredentials,
        signInAsDemoRole,
        registerAccount,
        updateCurrentUserProfile,
        signOut,
        submitInquiry,
        submitSellerProperty,
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
        toast,
        dismissToast,
        notify,
      }}
    >
      {children}
    </EstateContext.Provider>
  );
};

export function useEstate() {
  const ctx = useContext(EstateContext);
  if (!ctx) {
    throw new Error('useEstate must be used within EstateProvider');
  }
  return ctx;
}
