/**
 * AirFareX — Centralized Mock Data Engine
 * High-precision, deterministic simulation data for Indian Domestic Airfare Price Intelligence.
 * All figures, routes, airlines, and historical time-series are strictly synchronized across all views.
 */

export interface RouteInfo {
  id: string
  origin: string
  originCity: string
  destination: string
  destinationCity: string
  distanceKm: number
  weight: number // Weight in APIx index (0 - 100%)
  avgFare: number
  minFare: number
  maxFare: number
  dailyChange: number
  weeklyChange: number
  monthlyChange: number
  volatility: number
  currentIndex: number
  status: 'normal' | 'surge' | 'discount' | 'volatile'
}

export interface AirlineInfo {
  code: string
  name: string
  shortName: string
  color: string
  avgFare: number
  lowestFare: number
  highestFare: number
  quoteShare: number // Percentage of quotes (e.g. 58% for IndiGo)
  marketPassengerShare: number // DGCA passenger share estimate
  availabilityRate: number
  volatility: number
  routeCoverage: number // count of 25 routes operated
  baseRatio: number // Base fare % of total
  taxRatio: number // Taxes % of total
  feeRatio: number // UDF/Fees % of total
  scraperStatus: 'operational' | 'degraded' | 'syncing'
  scraperLatencyMs: number
  scraperSuccessRate: number
  lastScraped: string
}

export interface IndexHistoryPoint {
  date: string
  apix: number
  dgcaRef?: number
  avgFare?: number
  metroMetroIndex?: number
  metroNonMetroIndex?: number
  tier2Index?: number
  volume?: number
  upperBand?: number
  lowerBand?: number
}


export interface FareQuote {
  id: string
  timestamp: string
  origin: string
  originCity: string
  destination: string
  destinationCity: string
  airline: string
  airlineCode: string
  flightNumber: string
  departureDate: string
  departureTime: string
  advanceDays: number
  fareClass: 'Economy' | 'Premium Economy' | 'Business'
  baseFare: number
  taxes: number
  udf: number
  convenienceFee: number
  totalFare: number
  availability: 'Available' | 'Low Seats (<5)' | 'Filling Fast' | 'Sold Out'
  source: 'IndiGo.com' | 'AirIndia.in' | 'MakeMyTrip' | 'Yatra' | 'EaseMyTrip' | 'Cleartrip' | 'Ixigo' | 'Goibibo'
}

// 1. Top 25 Indian Domestic Routes
export const MOCK_ROUTES: RouteInfo[] = [
  {
    id: 'DEL-BOM',
    origin: 'DEL',
    originCity: 'Delhi',
    destination: 'BOM',
    destinationCity: 'Mumbai',
    distanceKm: 1148,
    weight: 14.8,
    avgFare: 6420,
    minFare: 4250,
    maxFare: 14200,
    dailyChange: 1.2,
    weeklyChange: 3.4,
    monthlyChange: 5.8,
    volatility: 18.4,
    currentIndex: 132.4,
    status: 'surge',
  },
  {
    id: 'BOM-DEL',
    origin: 'BOM',
    originCity: 'Mumbai',
    destination: 'DEL',
    destinationCity: 'Delhi',
    distanceKm: 1148,
    weight: 14.2,
    avgFare: 6380,
    minFare: 4190,
    maxFare: 13900,
    dailyChange: 0.8,
    weeklyChange: 2.9,
    monthlyChange: 5.1,
    volatility: 17.6,
    currentIndex: 131.2,
    status: 'normal',
  },
  {
    id: 'DEL-BLR',
    origin: 'DEL',
    originCity: 'Delhi',
    destination: 'BLR',
    destinationCity: 'Bengaluru',
    distanceKm: 1740,
    weight: 9.5,
    avgFare: 7250,
    minFare: 5100,
    maxFare: 16800,
    dailyChange: -0.5,
    weeklyChange: 1.8,
    monthlyChange: 4.6,
    volatility: 16.2,
    currentIndex: 129.8,
    status: 'normal',
  },
  {
    id: 'BLR-DEL',
    origin: 'BLR',
    originCity: 'Bengaluru',
    destination: 'DEL',
    destinationCity: 'Delhi',
    distanceKm: 1740,
    weight: 9.2,
    avgFare: 7190,
    minFare: 4980,
    maxFare: 16400,
    dailyChange: -0.2,
    weeklyChange: 1.4,
    monthlyChange: 4.1,
    volatility: 15.8,
    currentIndex: 128.9,
    status: 'normal',
  },
  {
    id: 'BOM-BLR',
    origin: 'BOM',
    originCity: 'Mumbai',
    destination: 'BLR',
    destinationCity: 'Bengaluru',
    distanceKm: 842,
    weight: 8.1,
    avgFare: 4890,
    minFare: 3450,
    maxFare: 11200,
    dailyChange: 2.4,
    weeklyChange: 5.2,
    monthlyChange: 8.9,
    volatility: 22.1,
    currentIndex: 136.2,
    status: 'surge',
  },
  {
    id: 'BLR-BOM',
    origin: 'BLR',
    originCity: 'Bengaluru',
    destination: 'BOM',
    destinationCity: 'Mumbai',
    distanceKm: 842,
    weight: 7.9,
    avgFare: 4820,
    minFare: 3390,
    maxFare: 10900,
    dailyChange: 1.9,
    weeklyChange: 4.8,
    monthlyChange: 7.8,
    volatility: 20.4,
    currentIndex: 134.5,
    status: 'surge',
  },
  {
    id: 'DEL-CCU',
    origin: 'DEL',
    originCity: 'Delhi',
    destination: 'CCU',
    destinationCity: 'Kolkata',
    distanceKm: 1305,
    weight: 5.4,
    avgFare: 6150,
    minFare: 4400,
    maxFare: 13500,
    dailyChange: -1.4,
    weeklyChange: -0.8,
    monthlyChange: 2.1,
    volatility: 14.5,
    currentIndex: 124.1,
    status: 'discount',
  },
  {
    id: 'CCU-DEL',
    origin: 'CCU',
    originCity: 'Kolkata',
    destination: 'DEL',
    destinationCity: 'Delhi',
    distanceKm: 1305,
    weight: 5.2,
    avgFare: 6080,
    minFare: 4350,
    maxFare: 13200,
    dailyChange: -1.1,
    weeklyChange: -0.5,
    monthlyChange: 2.3,
    volatility: 14.1,
    currentIndex: 124.8,
    status: 'discount',
  },
  {
    id: 'DEL-HYD',
    origin: 'DEL',
    originCity: 'Delhi',
    destination: 'HYD',
    destinationCity: 'Hyderabad',
    distanceKm: 1253,
    weight: 4.8,
    avgFare: 5740,
    minFare: 3950,
    maxFare: 12800,
    dailyChange: 0.4,
    weeklyChange: 2.1,
    monthlyChange: 3.9,
    volatility: 15.2,
    currentIndex: 127.3,
    status: 'normal',
  },
  {
    id: 'HYD-DEL',
    origin: 'HYD',
    originCity: 'Hyderabad',
    destination: 'DEL',
    destinationCity: 'Delhi',
    distanceKm: 1253,
    weight: 4.6,
    avgFare: 5690,
    minFare: 3900,
    maxFare: 12400,
    dailyChange: 0.1,
    weeklyChange: 1.8,
    monthlyChange: 3.5,
    volatility: 14.8,
    currentIndex: 126.8,
    status: 'normal',
  },
  {
    id: 'DEL-MAA',
    origin: 'DEL',
    originCity: 'Delhi',
    destination: 'MAA',
    destinationCity: 'Chennai',
    distanceKm: 1760,
    weight: 4.1,
    avgFare: 6890,
    minFare: 4800,
    maxFare: 15200,
    dailyChange: 0.9,
    weeklyChange: 3.1,
    monthlyChange: 4.9,
    volatility: 16.9,
    currentIndex: 129.4,
    status: 'normal',
  },
  {
    id: 'MAA-DEL',
    origin: 'MAA',
    originCity: 'Chennai',
    destination: 'DEL',
    destinationCity: 'Delhi',
    distanceKm: 1760,
    weight: 3.9,
    avgFare: 6810,
    minFare: 4750,
    maxFare: 14900,
    dailyChange: 0.6,
    weeklyChange: 2.7,
    monthlyChange: 4.4,
    volatility: 16.2,
    currentIndex: 128.5,
    status: 'normal',
  },
  {
    id: 'BOM-HYD',
    origin: 'BOM',
    originCity: 'Mumbai',
    destination: 'HYD',
    destinationCity: 'Hyderabad',
    distanceKm: 622,
    weight: 3.4,
    avgFare: 4120,
    minFare: 2950,
    maxFare: 9800,
    dailyChange: -0.8,
    weeklyChange: 0.6,
    monthlyChange: 2.8,
    volatility: 13.7,
    currentIndex: 123.4,
    status: 'normal',
  },
  {
    id: 'BOM-CCU',
    origin: 'BOM',
    originCity: 'Mumbai',
    destination: 'CCU',
    destinationCity: 'Kolkata',
    distanceKm: 1654,
    weight: 3.1,
    avgFare: 6640,
    minFare: 4600,
    maxFare: 14600,
    dailyChange: 1.5,
    weeklyChange: 4.1,
    monthlyChange: 6.7,
    volatility: 19.2,
    currentIndex: 133.1,
    status: 'surge',
  },
  {
    id: 'BOM-MAA',
    origin: 'BOM',
    originCity: 'Mumbai',
    destination: 'MAA',
    destinationCity: 'Chennai',
    distanceKm: 1033,
    weight: 2.8,
    avgFare: 5210,
    minFare: 3650,
    maxFare: 11800,
    dailyChange: 0.3,
    weeklyChange: 1.9,
    monthlyChange: 3.7,
    volatility: 15.0,
    currentIndex: 126.9,
    status: 'normal',
  },
  {
    id: 'BLR-HYD',
    origin: 'BLR',
    originCity: 'Bengaluru',
    destination: 'HYD',
    destinationCity: 'Hyderabad',
    distanceKm: 501,
    weight: 2.5,
    avgFare: 3680,
    minFare: 2500,
    maxFare: 8400,
    dailyChange: -1.2,
    weeklyChange: -0.4,
    monthlyChange: 1.5,
    volatility: 12.8,
    currentIndex: 121.5,
    status: 'discount',
  },
  {
    id: 'BLR-CCU',
    origin: 'BLR',
    originCity: 'Bengaluru',
    destination: 'CCU',
    destinationCity: 'Kolkata',
    distanceKm: 1561,
    weight: 2.3,
    avgFare: 6450,
    minFare: 4500,
    maxFare: 14100,
    dailyChange: 2.1,
    weeklyChange: 4.9,
    monthlyChange: 7.6,
    volatility: 21.0,
    currentIndex: 135.0,
    status: 'surge',
  },
  {
    id: 'BLR-MAA',
    origin: 'BLR',
    originCity: 'Bengaluru',
    destination: 'MAA',
    destinationCity: 'Chennai',
    distanceKm: 290,
    weight: 1.8,
    avgFare: 3150,
    minFare: 2100,
    maxFare: 7200,
    dailyChange: 0.1,
    weeklyChange: 1.1,
    monthlyChange: 2.2,
    volatility: 11.5,
    currentIndex: 122.0,
    status: 'normal',
  },
  {
    id: 'DEL-PNQ',
    origin: 'DEL',
    originCity: 'Delhi',
    destination: 'PNQ',
    destinationCity: 'Pune',
    distanceKm: 1160,
    weight: 2.1,
    avgFare: 6180,
    minFare: 4300,
    maxFare: 13800,
    dailyChange: 1.8,
    weeklyChange: 4.5,
    monthlyChange: 7.2,
    volatility: 19.8,
    currentIndex: 133.8,
    status: 'surge',
  },
  {
    id: 'BOM-PNQ',
    origin: 'BOM',
    originCity: 'Mumbai',
    destination: 'PNQ',
    destinationCity: 'Pune',
    distanceKm: 120,
    weight: 0.6,
    avgFare: 2890,
    minFare: 1950,
    maxFare: 6100,
    dailyChange: -0.4,
    weeklyChange: 0.2,
    monthlyChange: 1.1,
    volatility: 9.8,
    currentIndex: 120.4,
    status: 'normal',
  },
  {
    id: 'DEL-AMD',
    origin: 'DEL',
    originCity: 'Delhi',
    destination: 'AMD',
    destinationCity: 'Ahmedabad',
    distanceKm: 760,
    weight: 2.4,
    avgFare: 4620,
    minFare: 3200,
    maxFare: 10400,
    dailyChange: -0.6,
    weeklyChange: 1.2,
    monthlyChange: 3.1,
    volatility: 14.2,
    currentIndex: 125.6,
    status: 'normal',
  },
  {
    id: 'BOM-AMD',
    origin: 'BOM',
    originCity: 'Mumbai',
    destination: 'AMD',
    destinationCity: 'Ahmedabad',
    distanceKm: 440,
    weight: 1.9,
    avgFare: 3540,
    minFare: 2450,
    maxFare: 8100,
    dailyChange: 0.5,
    weeklyChange: 2.0,
    monthlyChange: 3.4,
    volatility: 13.1,
    currentIndex: 126.2,
    status: 'normal',
  },
  {
    id: 'DEL-COK',
    origin: 'DEL',
    originCity: 'Delhi',
    destination: 'COK',
    destinationCity: 'Kochi',
    distanceKm: 2040,
    weight: 1.7,
    avgFare: 7890,
    minFare: 5600,
    maxFare: 17900,
    dailyChange: 3.2,
    weeklyChange: 6.8,
    monthlyChange: 11.4,
    volatility: 25.6,
    currentIndex: 142.1,
    status: 'volatile',
  },
  {
    id: 'BOM-COK',
    origin: 'BOM',
    originCity: 'Mumbai',
    destination: 'COK',
    destinationCity: 'Kochi',
    distanceKm: 1065,
    weight: 1.4,
    avgFare: 5350,
    minFare: 3750,
    maxFare: 12100,
    dailyChange: 2.1,
    weeklyChange: 4.6,
    monthlyChange: 8.2,
    volatility: 20.8,
    currentIndex: 136.0,
    status: 'surge',
  },
  {
    id: 'BLR-COK',
    origin: 'BLR',
    originCity: 'Bengaluru',
    destination: 'COK',
    destinationCity: 'Kochi',
    distanceKm: 370,
    weight: 1.1,
    avgFare: 3410,
    minFare: 2350,
    maxFare: 7800,
    dailyChange: -0.2,
    weeklyChange: 0.8,
    monthlyChange: 2.4,
    volatility: 12.0,
    currentIndex: 123.0,
    status: 'normal',
  },
]

// 2. 5 Tracked Indian Carriers
export const MOCK_AIRLINES: AirlineInfo[] = [
  {
    code: '6E',
    name: 'IndiGo',
    shortName: 'IndiGo',
    color: '#0284c7', // Sky blue
    avgFare: 5540,
    lowestFare: 2100,
    highestFare: 15400,
    quoteShare: 59.2,
    marketPassengerShare: 61.4,
    availabilityRate: 98.4,
    volatility: 14.8,
    routeCoverage: 25,
    baseRatio: 72,
    taxRatio: 18,
    feeRatio: 10,
    scraperStatus: 'operational',
    scraperLatencyMs: 142,
    scraperSuccessRate: 99.8,
    lastScraped: '23 Aug 2026, 09:28 AM',
  },
  {
    code: 'AI',
    name: 'Air India',
    shortName: 'Air India',
    color: '#dc2626', // Red
    avgFare: 6680,
    lowestFare: 2800,
    highestFare: 17900,
    quoteShare: 17.8,
    marketPassengerShare: 14.6,
    availabilityRate: 95.1,
    volatility: 18.2,
    routeCoverage: 24,
    baseRatio: 68,
    taxRatio: 21,
    feeRatio: 11,
    scraperStatus: 'operational',
    scraperLatencyMs: 210,
    scraperSuccessRate: 98.9,
    lastScraped: '23 Aug 2026, 09:25 AM',
  },
  {
    code: 'IX',
    name: 'Air India Express',
    shortName: 'AI Express',
    color: '#ea580c', // Orange
    avgFare: 5320,
    lowestFare: 2200,
    highestFare: 13500,
    quoteShare: 10.4,
    marketPassengerShare: 8.8,
    availabilityRate: 93.6,
    volatility: 16.5,
    routeCoverage: 18,
    baseRatio: 74,
    taxRatio: 17,
    feeRatio: 9,
    scraperStatus: 'operational',
    scraperLatencyMs: 185,
    scraperSuccessRate: 99.2,
    lastScraped: '23 Aug 2026, 09:26 AM',
  },
  {
    code: 'QP',
    name: 'Akasa Air',
    shortName: 'Akasa Air',
    color: '#f97316', // Bright Orange/Amber
    avgFare: 5190,
    lowestFare: 1950,
    highestFare: 12800,
    quoteShare: 7.6,
    marketPassengerShare: 5.2,
    availabilityRate: 94.2,
    volatility: 15.1,
    routeCoverage: 15,
    baseRatio: 75,
    taxRatio: 16,
    feeRatio: 9,
    scraperStatus: 'operational',
    scraperLatencyMs: 160,
    scraperSuccessRate: 99.5,
    lastScraped: '23 Aug 2026, 09:27 AM',
  },
  {
    code: 'SG',
    name: 'SpiceJet',
    shortName: 'SpiceJet',
    color: '#b91c1c', // Dark Red
    avgFare: 5780,
    lowestFare: 2300,
    highestFare: 14600,
    quoteShare: 5.0,
    marketPassengerShare: 3.8,
    availabilityRate: 86.8,
    volatility: 24.5,
    routeCoverage: 12,
    baseRatio: 70,
    taxRatio: 19,
    feeRatio: 11,
    scraperStatus: 'operational',
    scraperLatencyMs: 340,
    scraperSuccessRate: 96.4,
    lastScraped: '23 Aug 2026, 09:20 AM',
  },
]

// 3. Lead Time Elasticity Data (T+1 to T+45)
export interface LeadTimeWindowInfo {
  leadTime: string
  days: number
  avgFare: number
  multiplier: number // vs T+45 base
  indigoFare: number
  airIndiaFare: number
  aiExpressFare: number
  akasaFare: number
  spicejetFare: number
}

export const MOCK_LEAD_TIME_SERIES: LeadTimeWindowInfo[] = [
  {
    leadTime: 'T+1',
    days: 1,
    avgFare: 9840,
    multiplier: 2.45,
    indigoFare: 9420,
    airIndiaFare: 11200,
    aiExpressFare: 8900,
    akasaFare: 8750,
    spicejetFare: 9780,
  },
  {
    leadTime: 'T+7',
    days: 7,
    avgFare: 6850,
    multiplier: 1.71,
    indigoFare: 6520,
    airIndiaFare: 7850,
    aiExpressFare: 6240,
    akasaFare: 6080,
    spicejetFare: 6790,
  },
  {
    leadTime: 'T+15',
    days: 15,
    avgFare: 5420,
    multiplier: 1.35,
    indigoFare: 5180,
    airIndiaFare: 6240,
    aiExpressFare: 4950,
    akasaFare: 4860,
    spicejetFare: 5390,
  },
  {
    leadTime: 'T+30',
    days: 30,
    avgFare: 4450,
    multiplier: 1.11,
    indigoFare: 4210,
    airIndiaFare: 5120,
    aiExpressFare: 4080,
    akasaFare: 3990,
    spicejetFare: 4410,
  },
  {
    leadTime: 'T+45',
    days: 45,
    avgFare: 4015,
    multiplier: 1.0,
    indigoFare: 3820,
    airIndiaFare: 4650,
    aiExpressFare: 3690,
    akasaFare: 3620,
    spicejetFare: 3980,
  },
]

// 4. 30-Day Airfare Price Index (APIx) Time Series
export const MOCK_INDEX_HISTORY: IndexHistoryPoint[] = [
  { date: '2026-07-25', apix: 123.45, dgcaRef: 122.90, avgFare: 5610, metroMetroIndex: 125.1, metroNonMetroIndex: 121.8, tier2Index: 120.4, volume: 11850, upperBand: 126.8, lowerBand: 120.1 },
  { date: '2026-07-26', apix: 123.80, dgcaRef: 123.10, avgFare: 5625, metroMetroIndex: 125.5, metroNonMetroIndex: 122.1, tier2Index: 120.7, volume: 11920, upperBand: 127.1, lowerBand: 120.5 },
  { date: '2026-07-27', apix: 124.12, dgcaRef: 123.40, avgFare: 5640, metroMetroIndex: 125.9, metroNonMetroIndex: 122.4, tier2Index: 121.0, volume: 12010, upperBand: 127.5, lowerBand: 120.8 },
  { date: '2026-07-28', apix: 124.50, dgcaRef: 123.85, avgFare: 5660, metroMetroIndex: 126.4, metroNonMetroIndex: 122.8, tier2Index: 121.2, volume: 12080, upperBand: 127.9, lowerBand: 121.1 },
  { date: '2026-07-29', apix: 124.95, dgcaRef: 124.20, avgFare: 5678, metroMetroIndex: 126.8, metroNonMetroIndex: 123.2, tier2Index: 121.6, volume: 12150, upperBand: 128.3, lowerBand: 121.5 },
  { date: '2026-07-30', apix: 125.20, dgcaRef: 124.50, avgFare: 5690, metroMetroIndex: 127.1, metroNonMetroIndex: 123.5, tier2Index: 121.9, volume: 12200, upperBand: 128.6, lowerBand: 121.8 },
  { date: '2026-07-31', apix: 125.60, dgcaRef: 124.90, avgFare: 5705, metroMetroIndex: 127.6, metroNonMetroIndex: 123.9, tier2Index: 122.2, volume: 12240, upperBand: 129.0, lowerBand: 122.2 },
  { date: '2026-08-01', apix: 125.90, dgcaRef: 125.15, avgFare: 5720, metroMetroIndex: 128.0, metroNonMetroIndex: 124.2, tier2Index: 122.5, volume: 12300, upperBand: 129.4, lowerBand: 122.5 },
  { date: '2026-08-02', apix: 126.30, dgcaRef: 125.60, avgFare: 5735, metroMetroIndex: 128.4, metroNonMetroIndex: 124.6, tier2Index: 122.9, volume: 12350, upperBand: 129.8, lowerBand: 122.8 },
  { date: '2026-08-03', apix: 126.15, dgcaRef: 125.50, avgFare: 5730, metroMetroIndex: 128.2, metroNonMetroIndex: 124.4, tier2Index: 122.7, volume: 12310, upperBand: 129.6, lowerBand: 122.6 },
  { date: '2026-08-04', apix: 126.40, dgcaRef: 125.80, avgFare: 5742, metroMetroIndex: 128.5, metroNonMetroIndex: 124.7, tier2Index: 123.0, volume: 12380, upperBand: 129.9, lowerBand: 122.9 },
  { date: '2026-08-05', apix: 126.75, dgcaRef: 126.10, avgFare: 5755, metroMetroIndex: 128.9, metroNonMetroIndex: 125.0, tier2Index: 123.3, volume: 12400, upperBand: 130.2, lowerBand: 123.2 },
  { date: '2026-08-06', apix: 127.10, dgcaRef: 126.45, avgFare: 5770, metroMetroIndex: 129.3, metroNonMetroIndex: 125.4, tier2Index: 123.7, volume: 12420, upperBand: 130.6, lowerBand: 123.6 },
  { date: '2026-08-07', apix: 127.45, dgcaRef: 126.80, avgFare: 5788, metroMetroIndex: 129.7, metroNonMetroIndex: 125.8, tier2Index: 124.0, volume: 12450, upperBand: 131.0, lowerBand: 123.9 },
  { date: '2026-08-08', apix: 127.80, dgcaRef: 127.15, avgFare: 5802, metroMetroIndex: 130.1, metroNonMetroIndex: 126.1, tier2Index: 124.4, volume: 12480, upperBand: 131.4, lowerBand: 124.3 },
  { date: '2026-08-09', apix: 128.10, dgcaRef: 127.40, avgFare: 5815, metroMetroIndex: 130.4, metroNonMetroIndex: 126.4, tier2Index: 124.7, volume: 12470, upperBand: 131.7, lowerBand: 124.6 },
  { date: '2026-08-10', apix: 127.95, dgcaRef: 127.30, avgFare: 5810, metroMetroIndex: 130.2, metroNonMetroIndex: 126.3, tier2Index: 124.5, volume: 12440, upperBand: 131.5, lowerBand: 124.4 },
  { date: '2026-08-11', apix: 128.25, dgcaRef: 127.60, avgFare: 5822, metroMetroIndex: 130.6, metroNonMetroIndex: 126.6, tier2Index: 124.8, volume: 12460, upperBand: 131.8, lowerBand: 124.7 },
  { date: '2026-08-12', apix: 128.50, dgcaRef: 127.85, avgFare: 5834, metroMetroIndex: 130.9, metroNonMetroIndex: 126.9, tier2Index: 125.1, volume: 12470, upperBand: 132.1, lowerBand: 125.0 },
  { date: '2026-08-13', apix: 128.80, dgcaRef: 128.10, avgFare: 5848, metroMetroIndex: 131.2, metroNonMetroIndex: 127.2, tier2Index: 125.4, volume: 12480, upperBand: 132.4, lowerBand: 125.3 },
  { date: '2026-08-14', apix: 129.20, dgcaRef: 128.50, avgFare: 5865, metroMetroIndex: 131.7, metroNonMetroIndex: 127.6, tier2Index: 125.8, volume: 12510, upperBand: 132.8, lowerBand: 125.7 },
  { date: '2026-08-15', apix: 129.60, dgcaRef: 128.90, avgFare: 5880, metroMetroIndex: 132.2, metroNonMetroIndex: 128.0, tier2Index: 126.2, volume: 12530, upperBand: 133.2, lowerBand: 126.1 },
  { date: '2026-08-16', apix: 129.10, dgcaRef: 128.60, avgFare: 5860, metroMetroIndex: 131.6, metroNonMetroIndex: 127.5, tier2Index: 125.7, volume: 12490, upperBand: 132.7, lowerBand: 125.6 },
  { date: '2026-08-17', apix: 127.40, dgcaRef: 127.10, avgFare: 5790, metroMetroIndex: 129.8, metroNonMetroIndex: 125.9, tier2Index: 124.1, volume: 12430, upperBand: 131.0, lowerBand: 123.9 },
  { date: '2026-08-18', apix: 127.65, dgcaRef: 127.35, avgFare: 5800, metroMetroIndex: 130.0, metroNonMetroIndex: 126.1, tier2Index: 124.3, volume: 12440, upperBand: 131.2, lowerBand: 124.1 },
  { date: '2026-08-19', apix: 127.90, dgcaRef: 127.60, avgFare: 5812, metroMetroIndex: 130.3, metroNonMetroIndex: 126.4, tier2Index: 124.6, volume: 12450, upperBand: 131.5, lowerBand: 124.4 },
  { date: '2026-08-20', apix: 128.15, dgcaRef: 127.80, avgFare: 5824, metroMetroIndex: 130.6, metroNonMetroIndex: 126.7, tier2Index: 124.9, volume: 12460, upperBand: 131.8, lowerBand: 124.7 },
  { date: '2026-08-21', apix: 128.30, dgcaRef: 127.95, avgFare: 5830, metroMetroIndex: 130.8, metroNonMetroIndex: 126.8, tier2Index: 125.0, volume: 12470, upperBand: 132.0, lowerBand: 124.9 },
  { date: '2026-08-22', apix: 128.52, dgcaRef: 128.15, avgFare: 5838, metroMetroIndex: 131.0, metroNonMetroIndex: 127.0, tier2Index: 125.2, volume: 12475, upperBand: 132.2, lowerBand: 125.1 },
  { date: '2026-08-23', apix: 128.64, dgcaRef: 128.25, avgFare: 5842, metroMetroIndex: 131.2, metroNonMetroIndex: 127.2, tier2Index: 125.4, volume: 12480, upperBand: 132.4, lowerBand: 125.3 },
]

// 5. Monthly Historical Index Trend (2026 YTD + Past Months)
export const MOCK_MONTHLY_INDEX = [
  { month: 'Sep 2025', apix: 104.2, dgcaRef: 103.8, avgFare: 4720 },
  { month: 'Oct 2025', apix: 112.8, dgcaRef: 111.9, avgFare: 5120 }, // Festive surge
  { month: 'Nov 2025', apix: 118.4, dgcaRef: 117.5, avgFare: 5380 }, // Diwali
  { month: 'Dec 2025', apix: 124.9, dgcaRef: 124.1, avgFare: 5670 }, // Year end
  { month: 'Jan 2026 (Base)', apix: 100.0, dgcaRef: 100.0, avgFare: 4540 }, // Base re-indexed
  { month: 'Feb 2026', apix: 106.5, dgcaRef: 105.9, avgFare: 4835 },
  { month: 'Mar 2026', apix: 111.2, dgcaRef: 110.6, avgFare: 5050 },
  { month: 'Apr 2026', apix: 116.8, dgcaRef: 116.2, avgFare: 5305 },
  { month: 'May 2026', apix: 125.4, dgcaRef: 124.8, avgFare: 5695 }, // Summer holidays
  { month: 'Jun 2026', apix: 122.1, dgcaRef: 121.5, avgFare: 5545 },
  { month: 'Jul 2026', apix: 123.5, dgcaRef: 122.9, avgFare: 5610 },
  { month: 'Aug 2026 (MTD)', apix: 128.64, dgcaRef: 128.25, avgFare: 5842 },
]

// 6. Backtest Statistics & Residuals
export const MOCK_BACKTEST_METRICS = {
  sampleSize: 30, // 30 daily quotes index calculations
  referenceSource: 'DGCA Domestic Scheduled Airline Passenger Traffic & Yield Statistics',
  pearsonCorrelation: 0.942,
  mae: 142.50, // Mean Absolute Error in INR
  rmse: 188.20, // Root Mean Square Error in INR
  mape: 2.41, // Mean Absolute Percentage Error (%)
  rSquared: 0.887,
  indexSpreadMean: 0.38, // APIx vs DGCA index point difference
  pVal: '< 0.0001',
  backtestPeriod: '25 Jul 2026 – 23 Aug 2026 (30 Days)',
  isMockData: true,
}

// 7. System Status Pipeline Mock
export const MOCK_SYSTEM_STATUS = {
  lastScrapeTime: '23 Aug 2026, 09:28:40 AM IST',
  lastIndexCalculation: '23 Aug 2026, 09:30:00 AM IST',
  recordsCollected: 12480,
  recordsValidated: 11931,
  recordsRejected: 549,
  dataQualityScore: 95.6,
  apiUptime: 99.98,
  dbResponseP95Ms: 42,
  activeScrapersCount: 5,
  totalScrapersCount: 5,
  pipelineTimeline: [
    { time: '09:00:00 AM', stage: 'Scraping Triggered', status: 'completed', details: 'Distributed workers dispatched across 5 carrier endpoints & 6 OTA aggregators' },
    { time: '09:08:24 AM', stage: 'Raw Ingestion Complete', status: 'completed', details: '12,480 raw flight quotes ingested into staging cache' },
    { time: '09:12:10 AM', stage: 'Normalization & Deduplication', status: 'completed', details: 'Unified schema applied: Base fare, UDF, taxes, seat buckets extracted' },
    { time: '09:14:45 AM', stage: 'Statistical Outlier Filtering', status: 'completed', details: '549 malformed / bot-blocked anomalies flagged and quarantined (95.6% valid)' },
    { time: '09:18:00 AM', stage: 'PSD Route-Weighted Index Calculation', status: 'completed', details: 'Paasche-type price relatives computed across 25 routes; APIx published at 128.64' },
    { time: '09:30:00 AM', stage: 'Cache & Distribution Sync', status: 'completed', details: 'Edge CDN and API Gateway caches invalidated and warm' },
  ],
}

// 8. Generate 600+ Deterministic Realistic Fare Quotes for Data Explorer
const SOURCES = [
  'IndiGo.com',
  'AirIndia.in',
  'MakeMyTrip',
  'Yatra',
  'EaseMyTrip',
  'Cleartrip',
  'Ixigo',
  'Goibibo',
] as const

const AVAILABILITY_STATES = [
  'Available',
  'Available',
  'Available',
  'Low Seats (<5)',
  'Filling Fast',
  'Sold Out',
] as const

export function generateMockFareQuotes(): FareQuote[] {
  const quotes: FareQuote[] = []
  let quoteId = 1001

  // Seed data across routes, airlines, advance lead times
  const leadTimes = [1, 7, 15, 30, 45]
  const baseTimes = ['06:15', '07:30', '09:45', '11:20', '13:50', '16:15', '18:40', '20:10', '21:55']

  MOCK_ROUTES.forEach((route) => {
    MOCK_AIRLINES.forEach((airline) => {
      // Check if airline covers route
      leadTimes.forEach((advDays) => {
        // Pick 2-3 sample flights per combination
        const flightsCount = airline.code === '6E' ? 3 : airline.code === 'AI' ? 2 : 1

        for (let i = 0; i < flightsCount; i++) {
          const flightNum = `${airline.code}-${100 + (quoteId % 890)}`
          const time = baseTimes[(quoteId + i) % baseTimes.length]
          
          // Lead time factor
          const leadMultiplier = advDays === 1 ? 1.75 : advDays === 7 ? 1.25 : advDays === 15 ? 1.0 : advDays === 30 ? 0.85 : 0.78
          // Airline factor
          const airlineFactor = airline.code === 'AI' ? 1.15 : airline.code === '6E' ? 0.98 : airline.code === 'SG' ? 1.02 : 0.94
          // Route baseline
          const calculatedTotal = Math.round(route.avgFare * leadMultiplier * airlineFactor * (1 + ((quoteId % 7) - 3) * 0.03))
          
          const baseFare = Math.round(calculatedTotal * 0.72)
          const taxes = Math.round(calculatedTotal * 0.18)
          const udf = Math.round(calculatedTotal * 0.06)
          const convenienceFee = calculatedTotal - (baseFare + taxes + udf)
          
          const source = SOURCES[(quoteId + i) % SOURCES.length]
          const availability = AVAILABILITY_STATES[(quoteId + i) % AVAILABILITY_STATES.length]
          
          quotes.push({
            id: `QT-${quoteId}`,
            timestamp: `2026-08-23 09:${String((quoteId % 30) + 1).padStart(2, '0')}:12`,
            origin: route.origin,
            originCity: route.originCity,
            destination: route.destination,
            destinationCity: route.destinationCity,
            airline: airline.name,
            airlineCode: airline.code,
            flightNumber: flightNum,
            departureDate: `2026-08-${String(23 + advDays > 31 ? (23 + advDays) - 31 : 23 + advDays).padStart(2, '0')}`,
            departureTime: time,
            advanceDays: advDays,
            fareClass: (quoteId % 10 === 0) ? 'Business' : 'Economy',
            baseFare,
            taxes,
            udf,
            convenienceFee,
            totalFare: calculatedTotal,
            availability,
            source,
          })
          quoteId++
        }
      })
    })
  })

  return quotes
}

export const MOCK_FARE_QUOTES = generateMockFareQuotes()
