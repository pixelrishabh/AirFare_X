import { supabase } from '@/lib/supabase'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

async function authedFetch(path: string, options: RequestInit = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json',
    },
  })
}

function buildQueryString(params?: Record<string, any>): string {
  if (!params) return ''
  const cleanParams: Record<string, string> = {}
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') {
      cleanParams[k] = String(v)
    }
  })
  const qs = new URLSearchParams(cleanParams).toString()
  return qs ? `?${qs}` : ''
}

export const backendApi = {
  runScraper: () => authedFetch('/api/scraper/run', { method: 'POST' }),
  computeIndex: () => authedFetch('/api/index/compute', { method: 'POST' }),
  predict: (payload: unknown) =>
    authedFetch('/api/ml/predict', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}

export const dashboardApi = {
  getIndex: () => authedFetch('/api/index').then((r) => r.json()),
  getRoutes: (params?: { origin?: string; destination?: string }) =>
    authedFetch(`/api/routes${buildQueryString(params)}`).then((r) => r.json()),
  getAirlines: (params?: { airline?: string }) =>
    authedFetch(`/api/airlines${buildQueryString(params)}`).then((r) => r.json()),
  getRouteAirline: (params?: Record<string, any>) =>
    authedFetch(`/api/route-airline${buildQueryString(params)}`).then((r) => r.json()),
  getPriceTrend: (params?: Record<string, any>) =>
    authedFetch(`/api/price-trend${buildQueryString(params)}`).then((r) => r.json()),
  getAnomalies: (params?: Record<string, any>) =>
    authedFetch(`/api/anomalies${buildQueryString(params)}`).then((r) => r.json()),
  getHistoricalTrend: (params?: Record<string, any>) =>
    authedFetch(`/api/historical-trend${buildQueryString(params)}`).then((r) => r.json()),
  getHistoricalIndex: (params?: Record<string, any>) =>
    authedFetch(`/api/historical-index${buildQueryString(params)}`).then((r) => r.json()),
  getHistoricalBooking: (params?: Record<string, any>) =>
    authedFetch(`/api/historical-booking${buildQueryString(params)}`).then((r) => r.json()),
  getHistoricalRouteAnalysis: (params?: Record<string, any>) =>
    authedFetch(`/api/historical-route-analysis${buildQueryString(params)}`).then((r) => r.json()),
  getHistoricalAirlineAnalysis: (params?: Record<string, any>) =>
    authedFetch(`/api/historical-airline-analysis${buildQueryString(params)}`).then((r) => r.json()),
  getForecast: (params?: Record<string, any>) =>
    authedFetch(`/api/forecast${buildQueryString(params)}`).then((r) => r.json()),
  getForecastMetrics: () => authedFetch('/api/forecast-metrics').then((r) => r.json()),
}
