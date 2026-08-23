import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Main } from '@/components/layout/main'
import { AirfarexHeader } from '@/components/layout/airfarex-header'
import { dashboardApi } from '@/lib/backendApi'
import { IconCheck } from '@tabler/icons-react'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export function BacktestingPage() {
  const [metrics, setMetrics] = useState<any[]>([])
  const [forecastSeries, setForecastSeries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [mRes, fRes] = await Promise.all([
          dashboardApi.getForecastMetrics(),
          dashboardApi.getForecast(),
        ])
        setMetrics(Array.isArray(mRes) ? mRes : [])
        setForecastSeries(Array.isArray(fRes) ? fRes : [])
      } catch (err) {
        console.warn('[AirFareX] Backtesting data fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <>
      <AirfarexHeader title='Forecast Accuracy & Empirical Model Backtesting' />
      <Main className='space-y-6'>
        {/* Banner */}
        <div className='p-4 rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-950 dark:text-sky-200 text-xs space-y-1.5'>
          <div className='flex items-center gap-2 font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 text-sm'>
            <IconCheck className='size-5 text-sky-600 dark:text-sky-400' />
            LIVE PIPELINE INTEGRATION — FORECAST vs ACTUAL BENCHMARK
          </div>
          <p className='leading-relaxed'>
            Statistical tracking metrics and forecast convergence series are queried directly from the backend data pipeline (`forecast_metrics.csv` & `airfare_forecast.csv`).
          </p>
        </div>

        {/* Page Header */}
        <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b pb-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Empirical Forecast & Validation Benchmark</h1>
            <p className='text-sm text-muted-foreground mt-0.5'>
              Fidelity evaluation of model predictions against actual captured index values.
            </p>
          </div>
          <Badge variant='outline' className='font-mono text-xs w-fit'>
            14-Day Horizon
          </Badge>
        </div>

        {/* 4 KPI Cards */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {metrics.map((m, idx) => (
            <Card key={idx} className='border-l-4 border-l-sky-500'>
              <CardHeader className='pb-1 text-xs font-semibold uppercase text-muted-foreground flex flex-row items-center justify-between'>
                <span>{m.metric}</span>
                <IconCheck className='size-4 text-emerald-500' />
              </CardHeader>
              <CardContent className='pt-1'>
                {loading ? (
                  <Skeleton className='h-10 w-24' />
                ) : (
                  <>
                    <div className='text-2xl font-bold font-mono text-foreground'>
                      {m.value}
                    </div>
                    <p className='text-xs text-muted-foreground mt-0.5'>{m.benchmark_status}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Forecast vs Actual Chart */}
        <Card>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-base font-semibold'>Forecast Index vs. Actual Index Convergence</CardTitle>
                <CardDescription className='text-xs mt-0.5'>
                  14-Day out-of-sample forecast confidence interval overlay.
                </CardDescription>
              </div>
              <Badge variant='outline' className='text-[10px]'>Live Pipeline Feed</Badge>
            </div>
          </CardHeader>
          <CardContent className='pt-2'>
            <div className='h-[300px] w-full'>
              {loading ? (
                <Skeleton className='h-full w-full' />
              ) : (
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={forecastSeries} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' className='stroke-border/50' vertical={false} />
                    <XAxis dataKey='date' tickFormatter={(val) => (val ? val.slice(5) : '')} tick={{ fontSize: 11 }} />
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type='monotone' name='Forecast Index' dataKey='forecast_index' stroke='#0284c7' strokeWidth={2.5} />
                    <Line type='monotone' name='Actual Index' dataKey='actual_index' stroke='#10b981' strokeWidth={2} dot={{ r: 4 }} />
                    <Line type='monotone' name='Upper Bound (+95%)' dataKey='upper_bound' stroke='#94a3b8' strokeDasharray='3 3' dot={false} />
                    <Line type='monotone' name='Lower Bound (-95%)' dataKey='lower_bound' stroke='#94a3b8' strokeDasharray='3 3' dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
