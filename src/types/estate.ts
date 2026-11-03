export enum ListingCategory {
  BUY = 'BUY',
  RENT = 'RENT',
}

export enum PropertyType {
  VILLA = 'Luxury Villas',
  PENTHOUSE = 'Penthouses',
  APARTMENT = 'Apartments',
  MANSION = 'Mansions',
  COMMERCIAL = 'Commercial Properties',
  WATERFRONT = 'Waterfront Properties',
  LAND = 'Land and Investment Properties',
}

export enum PropertyStatus {
  ACTIVE = 'Available',
  RESERVED = 'Reserved',
  PENDING = 'Under Offer',
  SOLD = 'Sold / Leased',
}

export enum InquiryStatus {
  NEW = 'New',
  CONTACTED = 'Contacted',
  QUALIFIED = 'Qualified',
  CLOSED = 'Closed',
}

export enum AppointmentStatus {
  CONFIRMED = 'Confirmed',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export enum UserRole {
  CLIENT = 'VIP Client',
  INVESTOR = 'Family Office Investor',
  AGENT = 'Senior Advisor',
  ADMIN = 'Executive Admin',
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  AED = 'AED',
  SAR = 'SAR',
}

export type PageRoute =
  | 'home'
  | 'buy'
  | 'rent'
  | 'sell'
  | 'off-market'
  | 'compare'
  | 'property-detail'
  | 'agents'
  | 'about'
  | 'contact'
  | 'auth'
  | 'user-dashboard'
  | 'admin-dashboard';

export interface PropertySpecifications {
  bedrooms: number;
  bathrooms: number;
  interiorSqFt: number;
  exteriorSqFt: number;
  yearBuilt: number;
  parkingSpaces: number;
  tenure: string;
  architecturalStyle: string;
  exposure: string;
}

export interface GeoLocationInfo {
  lat: number;
  lng: number;
  osmBbox: string; // minLon,minLat,maxLon,maxLat for OpenStreetMap embed
  districtSummary: string;
}

export interface VideoTourSpec {
  title: string;
  duration: string;
  videoUrl?: string;
  virtualTourUrl?: string;
  highlights: string[];
}

export interface Property {
  id: string;
  referenceCode: string;
  title: string;
  subtitle: string;
  category: ListingCategory;
  type: PropertyType;
  status: PropertyStatus;
  priceUsd: number;
  pricePeriod?: 'month' | 'year';
  city: 'London' | 'Dubai' | 'New York' | 'Monaco' | 'Los Angeles' | string;
  country: string;
  neighborhood: string;
  address: string;
  featured: boolean;
  isExclusive: boolean;
  isOffMarket: boolean;
  heroImage: string;
  gallery: string[];
  description: string[];
  amenities: string[];
  specs: PropertySpecifications;
  geo: GeoLocationInfo;
  videoTour: VideoTourSpec;
  agentId: string;
  createdAt: string;
  submittedByUserId?: string;
}

export interface Agent {
  id: string;
  name: string;
  title: string;
  office: 'London' | 'Dubai' | 'New York' | 'Monaco' | 'Los Angeles';
  isPrincipal: boolean;
  portrait?: string;
  initials: string;
  specialization: string;
  languages: string[];
  closedVolume: string;
  yearsExperience: number;
  email: string;
  phone: string;
  bio: string;
}

export interface ViewingAppointment {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyReference: string;
  userId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  preferredDate: string;
  preferredTime: string;
  guests: number;
  message: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  type: 'PROPERTY_INQUIRY' | 'ADVISOR_CONSULTATION' | 'GENERAL_CONTACT';
  propertyId?: string;
  propertyTitle?: string;
  propertyReference?: string;
  agentId?: string;
  agentName?: string;
  userId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  preferredDate?: string;
  message: string;
  status: InquiryStatus;
  internalNotes: string;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  clientTitle: string;
  portrait?: string;
  initials: string;
  propertyAcquired: string;
  transactionType: 'Purchased' | 'Leased' | 'Divested';
  location: string;
  quote: string;
  isDemonstration: boolean;
}

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  location: string;
  preferredCurrency: CurrencyCode;
  status: 'Active' | 'Pending Verification';
  joinedAt: string;
  savedPropertyIds: string[];
}

export interface ExchangeRateState {
  isLive: boolean;
  isLoading: boolean;
  base: CurrencyCode.USD;
  rates: Partial<Record<CurrencyCode, number>>;
  lastUpdated: string | null;
  providerName: string;
  error: string | null;
}

export interface PropertyFilterState {
  searchQuery: string;
  disposition: 'ALL' | 'BUY' | 'RENT';
  location: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  minBedrooms: number;
  minBathrooms: number;
  minSqFt: string;
  sortBy: 'featured' | 'newest' | 'price-desc' | 'price-asc' | 'sqft-desc';
}

export interface PlatformSettings {
  whatsappBusinessNumber: string;
  cryptoEscrowProvider: string;
  cryptoSettlementVerified: boolean;
  acceptedAssets: ('BTC' | 'ETH' | 'USDT')[];
}
