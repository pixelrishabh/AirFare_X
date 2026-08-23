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

export const backendApi = {
  runScraper: () => authedFetch('/api/scraper/run', { method: 'POST' }),
  computeIndex: () => authedFetch('/api/index/compute', { method: 'POST' }),
  predict: (payload: unknown) =>
    authedFetch('/api/ml/predict', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
