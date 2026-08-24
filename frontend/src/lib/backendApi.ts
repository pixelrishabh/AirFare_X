import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

async function authedFetch(path: string, options: RequestInit = {}) {
  let token = useAuthStore.getState().auth.accessToken || 'demo-admin-token'

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.access_token) {
      token = session.access_token
    }
  } catch {}

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  }

  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
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
  getHealth: () => authedFetch('/health').then((r) => r.json()),
  getMLStatus: () => authedFetch('/api/ml/status').then((r) => r.json()),
  getScraperStatus: () => authedFetch('/api/scraper/status').then((r) => r.json()),
  getIndexSummary: () => authedFetch('/api/index/summary').then((r) => r.json()),
  runScraper: () => authedFetch('/api/scraper/run', { method: 'POST' }).then((r) => r.json()),
  computeIndex: () => authedFetch('/api/index/compute', { method: 'POST' }).then((r) => r.json()),
  runPipeline: () => authedFetch('/api/pipeline/run', { method: 'POST' }).then((r) => r.json()),
  refreshData: () => authedFetch('/api/data/refresh', { method: 'POST' }).then((r) => r.json()),
  predict: (payload: unknown) =>
    authedFetch('/api/ml/predict', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then((r) => r.json()),
}

export const dashboardApi = {
  getOverview: () => authedFetch('/api/overview').then((r) => r.json()),
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
  runPipeline: () => authedFetch('/api/pipeline/run', { method: 'POST' }).then((r) => r.json()),
  refreshData: () => authedFetch('/api/data/refresh', { method: 'POST' }).then((r) => r.json()),
}