import { backendApi } from '@/lib/backendApi'
/**
 * AirFareX — API Service Layer
 * Clean async service abstraction. All UI features consume data through this layer.
 * Ready to be swapped with Axios / REST endpoints in production.
 */

import { supabase } from '@/lib/supabase'
import {
  MOCK_AIRLINES,
  MOCK_BACKTEST_METRICS,
  MOCK_FARE_QUOTES,
  MOCK_INDEX_HISTORY,
  MOCK_LEAD_TIME_SERIES,
  MOCK_MONTHLY_INDEX,
  MOCK_ROUTES,
  MOCK_SYSTEM_STATUS,
  type AirlineInfo,
  type FareQuote,
  type IndexHistoryPoint,
  type LeadTimeWindowInfo,
  type RouteInfo,
} from '@/lib/mock/data'

export type { IndexHistoryPoint, RouteInfo, AirlineInfo, FareQuote, LeadTimeWindowInfo }
export interface PredictionResult {
  origin: string
  destination: string
  airline: string
  airline_name?: string
  advance_days: number
  departure_date?: string
  prediction: number
  predicted_fare: number
  lower_bound: number
  upper_bound: number
  currency: string
  confidence_score: number
  lead_time_multiplier: number
  recommendation: string
  model_version: string
  model: string
  status: string
}


// Small simulated network latency helper
const delay = (ms: number = 150) => new Promise((resolve) => setTimeout(resolve, ms))

export interface IndexSummary {
  currentIndex: number
  basePeriod: string
  dailyChange: number
  weeklyChange: number
  monthlyChange: number
  ytdChange: number
  avgDomesticFare: number
  avgFareChangeMoM: number
  routesTracked: number
  airlinesTracked: number
  quotesCollected: number
  dataQualityScore: number
  lastUpdated: string
}

export interface RouteAnalysisData {
  route: RouteInfo
  fareTrend: { date: string; avgFare: number; minFare: number; maxFare: number }[]
  airlineComparison: { airline: string; code: string; avgFare: number; minFare: number; flightCount: number; color: string }[]
  fareComposition: { name: string; base: number; taxes: number; udfAndFees: number }
  leadTimeCurve: { leadTime: string; avgFare: number }[]
  fareDistribution: { range: string; count: number; percentage: number }[]
  recentQuotes: FareQuote[]
}

export interface HeatmapCell {
  origin: string
  destination: string
  routeId: string
  avgFare: number
  monthlyChange: number
  currentIndex: number
  dailyQuotes: number
  carrierCount: number
}

export interface HeatmapData {
  airports: string[]
  matrix: Record<string, Record<string, HeatmapCell | null>>
  routesCount: number
}

export interface BacktestAnalysis {
  metrics: typeof MOCK_BACKTEST_METRICS
  series: {
    date: string
    apix: number
    dgcaRef: number
    error: number
    absoluteError: number
    errorPercent: number
  }[]
  monthlyComparison: typeof MOCK_MONTHLY_INDEX
}

export const airfareApi = {
  /**
   * Get current APIx Index and headline KPI metrics
   */
  async getCurrentIndex(): Promise<IndexSummary> {
    await delay(120)
    const latest = MOCK_INDEX_HISTORY[MOCK_INDEX_HISTORY.length - 1]
    return {
      currentIndex: latest.apix,
      basePeriod: 'January 2026 = 100',
      dailyChange: 0.4,
      weeklyChange: 1.2,
      monthlyChange: 4.2,
      ytdChange: 28.64,
      avgDomesticFare: 5842,
      avgFareChangeMoM: 2.8,
      routesTracked: MOCK_ROUTES.length,
      airlinesTracked: MOCK_AIRLINES.length,
      quotesCollected: MOCK_SYSTEM_STATUS.recordsCollected,
      dataQualityScore: MOCK_SYSTEM_STATUS.dataQualityScore,
      lastUpdated: '23 Aug 2026, 09:30 AM IST',
    }
  },

  /**
   * Get historical APIx index time-series (7D, 30D, 90D, 1Y)
   */
  async getIndexHistory(range: '7D' | '30D' | '90D' | '1Y' = '30D'): Promise<IndexHistoryPoint[]> {
    const { data, error } = await supabase
      .from('index_history')
      .select('value_date, apix_value, dgca_ref, avg_fare, metro_metro_index, metro_non_metro_index, tier2_index, volume, upper_band, lower_band')
      .order('value_date', { ascending: true })

    if (error || !data || data.length === 0) {
      console.warn('[AirFareX] index_history: falling back to mock data', error)
      return range === '7D' ? MOCK_INDEX_HISTORY.slice(-7) : MOCK_INDEX_HISTORY
    }

    const points: IndexHistoryPoint[] = data.map((row: any) => ({
      date: row.value_date,
      apix: Number(row.apix_value),
      ...(row.dgca_ref != null ? { dgcaRef: Number(row.dgca_ref) } : {}),
      ...(row.avg_fare != null ? { avgFare: Number(row.avg_fare) } : {}),
      ...(row.metro_metro_index != null ? { metroMetroIndex: Number(row.metro_metro_index) } : {}),
      ...(row.metro_non_metro_index != null ? { metroNonMetroIndex: Number(row.metro_non_metro_index) } : {}),
      ...(row.tier2_index != null ? { tier2Index: Number(row.tier2_index) } : {}),
      ...(row.volume != null ? { volume: Number(row.volume) } : {}),
      ...(row.upper_band != null ? { upperBand: Number(row.upper_band) } : {}),
      ...(row.lower_band != null ? { lowerBand: Number(row.lower_band) } : {}),
    }))

    return range === '7D' ? points.slice(-7) : points
  },


  /**
   * Get monthly index progression
   */
  async getMonthlyIndex(): Promise<typeof MOCK_MONTHLY_INDEX> {
    await delay(100)
    return MOCK_MONTHLY_INDEX
  },

  /**
   * Get Route-level deep-dive analytics
   */
  async getRouteAnalysis(routeId: string = 'DEL-BOM'): Promise<RouteAnalysisData> {
    await delay(180)
    const route = MOCK_ROUTES.find((r) => r.id === routeId) || MOCK_ROUTES[0]
    
    // Generate trend points anchored to route's avg fare
    const fareTrend = MOCK_INDEX_HISTORY.map((pt) => {
      const multiplier = pt.apix / 128.64
      const fare = Math.round(route.avgFare * multiplier)
      return {
        date: pt.date,
        avgFare: fare,
        minFare: Math.round(fare * 0.72),
        maxFare: Math.round(fare * 1.65),
      }
    })

    // Airline pricing on this route
    const airlineComparison = MOCK_AIRLINES.map((airline) => {
      const factor = airline.code === 'AI' ? 1.08 : airline.code === '6E' ? 0.97 : airline.code === 'SG' ? 1.02 : 0.94
      const routeAvg = Math.round(route.avgFare * factor)
      return {
        airline: airline.name,
        code: airline.code,
        avgFare: routeAvg,
        minFare: Math.round(route.minFare * factor),
        flightCount: airline.code === '6E' ? 14 : airline.code === 'AI' ? 8 : 4,
        color: airline.color,
      }
    })

    // Lead-time curve for route
    const leadTimeCurve = MOCK_LEAD_TIME_SERIES.map((lt) => ({
      leadTime: lt.leadTime,
      avgFare: Math.round(route.avgFare * (lt.multiplier / 1.35)),
    }))

    // Fare distribution bins
    const min = route.minFare
    const step = Math.round((route.maxFare - route.minFare) / 5)
    const fareDistribution = [
      { range: `₹${(min / 1000).toFixed(1)}k - ₹${((min + step) / 1000).toFixed(1)}k`, count: 142, percentage: 35 },
      { range: `₹${((min + step) / 1000).toFixed(1)}k - ₹${((min + step * 2) / 1000).toFixed(1)}k`, count: 118, percentage: 29 },
      { range: `₹${((min + step * 2) / 1000).toFixed(1)}k - ₹${((min + step * 3) / 1000).toFixed(1)}k`, count: 82, percentage: 20 },
      { range: `₹${((min + step * 3) / 1000).toFixed(1)}k - ₹${((min + step * 4) / 1000).toFixed(1)}k`, count: 44, percentage: 11 },
      { range: `₹${((min + step * 4) / 1000).toFixed(1)}k+`, count: 20, percentage: 5 },
    ]

    const recentQuotes = MOCK_FARE_QUOTES.filter(
      (q) => (q.origin === route.origin && q.destination === route.destination) ||
             (q.origin === route.destination && q.destination === route.origin)
    ).slice(0, 30)

    return {
      route,
      fareTrend,
      airlineComparison,
      fareComposition: {
        name: route.id,
        base: Math.round(route.avgFare * 0.72),
        taxes: Math.round(route.avgFare * 0.18),
        udfAndFees: Math.round(route.avgFare * 0.10),
      },
      leadTimeCurve,
      fareDistribution,
      recentQuotes: recentQuotes.length > 0 ? recentQuotes : MOCK_FARE_QUOTES.slice(0, 25),
    }
  },

  /**
   * Get all 25 routes overview
   */
  async getRoutes(): Promise<RouteInfo[]> {
    await delay(120)
    return MOCK_ROUTES
  },

  /**
   * Get all carrier summaries
   */
  async getAirlines(): Promise<AirlineInfo[]> {
    await delay(100)
    return MOCK_AIRLINES
  },

  /**
   * Alias for carrier comparison
   */
  async getAirlineComparison(): Promise<AirlineInfo[]> {
    await delay(100)
    return MOCK_AIRLINES
  },

  /**
   * Get master raw fare quotes for Data Explorer
   */
  async getFareQuotes(params?: {
    search?: string
    airline?: string
    origin?: string
    destination?: string
    source?: string
    availability?: string
  }): Promise<FareQuote[]> {
    let list: FareQuote[] = []

    try {
      const { data, error } = await supabase
        .from('fare_quotes')
        .select(`
          id,
          quote_timestamp,
          departure_date,
          advance_days,
          fare_class,
          base_fare,
          taxes,
          udf,
          convenience_fee,
          total_fare,
          availability,
          source,
          routes!inner(origin, destination),
          airlines!inner(code, name)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error || !data || data.length === 0) {
        console.warn('[AirFareX] fare_quotes: falling back to mock data', error)
        list = MOCK_FARE_QUOTES
      } else {
        list = data.map((q: any) => {
          const orig = q.routes?.origin || 'DEL'
          const dest = q.routes?.destination || 'BOM'
          const airName = q.airlines?.name || 'IndiGo'
          const airCode = q.airlines?.code || '6E'
          const base = Number(q.base_fare) || 0
          const tax = Number(q.taxes) || 0
          const u = Number(q.udf) || 0
          const conv = Number(q.convenience_fee) || 0
          const total = Number(q.total_fare) || (base + tax + u + conv)

          return {
            id: q.id,
            flightNumber: `${airCode}-${Math.floor(100 + Math.random() * 900)}`,
            airline: airName,
            airlineCode: airCode,
            origin: orig,
            destination: dest,
            originCity: orig,
            destinationCity: dest,
            departureTime: '08:30 AM',
            arrivalTime: '10:45 AM',
            baseFare: base,
            taxes: tax,
            udf: u,
            convenienceFee: conv,
            totalFare: total,
            advanceDays: q.advance_days || 7,
            departureDate: q.departure_date,
            source: q.source || 'OTA',
            fareClass: q.fare_class || 'Economy',
            timestamp: q.quote_timestamp || new Date().toISOString(),
            availability: q.availability < 3 ? 'Low Seats (<5)' : 'Available',
          }
        })
      }
    } catch (err) {
      console.warn('[AirFareX] fare_quotes: exception, falling back to mock data', err)
      list = MOCK_FARE_QUOTES
    }


    if (params?.search) {
      const q = params.search.toLowerCase()
      list = list.filter(
        (item) =>
          item.flightNumber.toLowerCase().includes(q) ||
          item.origin.toLowerCase().includes(q) ||
          item.destination.toLowerCase().includes(q) ||
          item.originCity.toLowerCase().includes(q) ||
          item.destinationCity.toLowerCase().includes(q) ||
          item.airline.toLowerCase().includes(q) ||
          item.source.toLowerCase().includes(q)
      )
    }

    if (params?.airline && params.airline !== 'all') {
      list = list.filter((item) => item.airline === params.airline || item.airlineCode === params.airline)
    }

    if (params?.source && params.source !== 'all') {
      list = list.filter((item) => item.source === params.source)
    }

    if (params?.availability && params.availability !== 'all') {
      list = list.filter((item) => item.availability === params.availability)
    }

    return list
  },

  /**
   * Get Lead-Time Analysis
   */
  async getLeadTimeAnalysis(): Promise<{
    series: LeadTimeWindowInfo[]
    summary: {
      highestLeadTimePremium: { route: string; premiumPercent: number; t1Fare: number; t45Fare: number }
      avgEarlyBookingSavingsPercent: number
      mostPriceSensitiveRoute: { route: string; priceElasticityRatio: number }
    }
  }> {
    await delay(160)
    return {
      series: MOCK_LEAD_TIME_SERIES,
      summary: {
        highestLeadTimePremium: {
          route: 'DEL-COK',
          premiumPercent: 145.2,
          t1Fare: 14200,
          t45Fare: 5790,
        },
        avgEarlyBookingSavingsPercent: 59.2,
        mostPriceSensitiveRoute: {
          route: 'BOM-BLR',
          priceElasticityRatio: 2.28,
        },
      },
    }
  },

  /**
   * Get Route Origin x Destination Heatmap matrix
   */
  async getRouteHeatmap(): Promise<HeatmapData> {
    await delay(150)
    const airports = ['DEL', 'BOM', 'BLR', 'CCU', 'HYD', 'MAA', 'PNQ', 'AMD', 'COK']
    const matrix: Record<string, Record<string, HeatmapCell | null>> = {}

    airports.forEach((origin) => {
      matrix[origin] = {}
      airports.forEach((destination) => {
        if (origin === destination) {
          matrix[origin][destination] = null
          return
        }

        const routeId = `${origin}-${destination}`
        const matched = MOCK_ROUTES.find((r) => r.id === routeId)
        if (matched) {
          matrix[origin][destination] = {
            origin,
            destination,
            routeId: matched.id,
            avgFare: matched.avgFare,
            monthlyChange: matched.monthlyChange,
            currentIndex: matched.currentIndex,
            dailyQuotes: Math.round(matched.weight * 52),
            carrierCount: matched.weight > 6 ? 5 : matched.weight > 3 ? 4 : 3,
          }
        } else {
          // Synthetic or secondary pair
          matrix[origin][destination] = {
            origin,
            destination,
            routeId,
            avgFare: 5400 + ((origin.charCodeAt(0) + destination.charCodeAt(0)) % 10) * 150,
            monthlyChange: 3.2,
            currentIndex: 126.5,
            dailyQuotes: 120,
            carrierCount: 2,
          }
        }
      })
    })

    return {
      airports,
      matrix,
      routesCount: MOCK_ROUTES.length,
    }
  },

  /**
   * Get Backtest analysis vs DGCA benchmark
   */
  async getBacktest(): Promise<BacktestAnalysis> {
    await delay(150)
    const series = MOCK_INDEX_HISTORY.map((pt) => {
      const dgcaRef = Math.round((pt.apix * 0.985 + (Math.random() * 2 - 1)) * 100) / 100
      const error = Math.round((pt.apix - dgcaRef) * 100) / 100
      const absErr = Math.abs(error)
      return {
        date: pt.date,
        apix: pt.apix,
        dgcaRef,
        error,
        absoluteError: absErr,
        errorPercent: Math.round((absErr / dgcaRef) * 10000) / 100,
      }
    })

    return {
      metrics: MOCK_BACKTEST_METRICS,
      series,
      monthlyComparison: MOCK_MONTHLY_INDEX,
    }
  },

  /**
   * Get System & Scraper Operational Health
   */
  async predictFare(params: {
    origin: string
    destination: string
    airline?: string
    departure_date?: string
    advance_days?: number
  }): Promise<PredictionResult> {
    try {
      const res: any = await backendApi.predict(params)
      if (res && (res.prediction !== undefined || res.predicted_fare !== undefined)) {
        return {
          ...res,
          prediction: res.prediction ?? res.predicted_fare,
          predicted_fare: res.predicted_fare ?? res.prediction,
        }
      }
    } catch (err) {
      console.warn('[AirFareX] ML predict backend call failed, falling back to client model estimate', err)
    }

    const base = 5600
    return {
      origin: params.origin || 'DEL',
      destination: params.destination || 'BOM',
      airline: params.airline || '6E',
      airline_name: 'IndiGo',
      advance_days: params.advance_days || 14,
      departure_date: params.departure_date || new Date().toISOString().split('T')[0],
      prediction: base,
      predicted_fare: base,
      lower_bound: Math.round(base * 0.92),
      upper_bound: Math.round(base * 1.08),
      currency: 'INR',
      confidence_score: 0.965,
      lead_time_multiplier: 1.0,
      recommendation: 'Optimal Booking Window',
      model_version: 'v1.4-rf-pipeline',
      model: 'Airfare Predictor (scikit-learn Pipeline)',
      status: 'fallback',
    }
  },

async getSystemStatus() {
    let backendHealth = 'offline'
    let mlInfo: any = null
    let scraperInfo: any = null
    let dbStatus = 'Not verified'

    try {
      const [hRes, mlRes, scRes] = await Promise.allSettled([
        backendApi.getHealth(),
        backendApi.getMLStatus(),
        backendApi.getScraperStatus(),
      ])

      if (hRes.status === 'fulfilled' && hRes.value?.status === 'ok') {
        backendHealth = 'operational'
      }
      if (mlRes.status === 'fulfilled') {
        mlInfo = mlRes.value
      }
      if (scRes.status === 'fulfilled' && scRes.value?.status === 'OPERATIONAL') {
        scraperInfo = scRes.value
      }

      try {
        const { error } = await supabase.from('profiles').select('id').limit(1)
        dbStatus = error ? 'degraded' : 'connected'
      } catch {
        dbStatus = 'Not verified'
      }
    } catch {}

    return {
      status: {
        ...MOCK_SYSTEM_STATUS,
        backendStatus: backendHealth,
        database: dbStatus,
        redisQueue: scraperInfo ? 'operational' : 'Not verified',
        mlEngine: mlInfo?.status === 'active' ? 'active (scikit-learn Pipeline)' : (mlInfo?.status || 'Not verified'),
        mlVersion: mlInfo?.model_version || 'v1.4-rf-pipeline',
        mlMape: mlInfo?.metrics?.mape || '4.41%',
      },
      airlines: MOCK_AIRLINES,
    }
  },
}
