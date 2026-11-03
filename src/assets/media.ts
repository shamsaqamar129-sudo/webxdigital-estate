import heroEstateTwilight from './images/hero_estate_twilight_1793697045073.jpg';
import penthouseSkylineDubai from './images/penthouse_skyline_dubai_1793697047441.jpg';
import oceanfrontVillaMalibu from './images/oceanfront_villa_malibu_1793697048575.jpg';
import mayfairResidenceLondon from './images/mayfair_residence_london_1793697050420.jpg';
import mediterraneanMonacoVilla from './images/mediterranean_monaco_villa_1793697052942.jpg';
import manhattanParkTriplex from './images/manhattan_park_triplex_1793697054179.jpg';
import interiorSpaSuite from './images/interior_spa_suite_1793697055925.jpg';
import advisorDirectorFemale from './images/advisor_director_female_1793697057306.jpg';
import advisorPartnerMale from './images/advisor_partner_male_1793697057270.jpg';
import offmarketSovereignMansion from './images/offmarket_sovereign_mansion_1793715149487.jpg';
import commercialTrophyHeadquarters from './images/commercial_trophy_headquarters_1793715150954.jpg';
import waterfrontSuperyachtEstate from './images/waterfront_superyacht_estate_1793715150703.jpg';
import investmentPeninsulaLand from './images/investment_peninsula_land_1793715152801.jpg';
import advisorDubaiExecutive from './images/advisor_dubai_executive_1793715154716.jpg';
import advisorMonacoDirector from './images/advisor_monaco_director_1793715154834.jpg';

export const ESTATE_MEDIA = {
  heroEstateTwilight,
  penthouseSkylineDubai,
  oceanfrontVillaMalibu,
  mayfairResidenceLondon,
  mediterraneanMonacoVilla,
  manhattanParkTriplex,
  interiorSpaSuite,
  advisorDirectorFemale,
  advisorPartnerMale,
  offmarketSovereignMansion,
  commercialTrophyHeadquarters,
  waterfrontSuperyachtEstate,
  investmentPeninsulaLand,
  advisorDubaiExecutive,
  advisorMonacoDirector,
} as const;

export type MediaAssetKey = keyof typeof ESTATE_MEDIA;

export function resolveMediaUrl(keyOrUrl: string): string {
  if (!keyOrUrl) return '';
  if (keyOrUrl in ESTATE_MEDIA) {
    return ESTATE_MEDIA[keyOrUrl as MediaAssetKey];
  }
  return keyOrUrl;
}

export const SUBMISSION_PHOTO_PRESETS = [
  {
    id: 'preset-cliffside',
    label: 'Contemporary Cliffside Mansion',
    url: heroEstateTwilight,
  },
  {
    id: 'preset-offmarket',
    label: 'Basalt & Gold Sovereign Compound',
    url: offmarketSovereignMansion,
  },
  {
    id: 'preset-waterfront',
    label: 'Superyacht Waterfront Estate',
    url: waterfrontSuperyachtEstate,
  },
  {
    id: 'preset-penthouse',
    label: 'Skyline Duplex Penthouse',
    url: penthouseSkylineDubai,
  },
  {
    id: 'preset-townhouse',
    label: 'Mayfair Limestone Mansion',
    url: mayfairResidenceLondon,
  },
  {
    id: 'preset-commercial',
    label: 'Commercial Flagship Headquarters',
    url: commercialTrophyHeadquarters,
  },
  {
    id: 'preset-land',
    label: 'Coastal Peninsula Land Parcel',
    url: investmentPeninsulaLand,
  },
];
