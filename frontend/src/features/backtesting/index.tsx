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
import { airfareApi, type BacktestAnalysis } from '@/services/api'
import { formatINR } from '@/lib/utils/format'
import {
  IconScale,
  IconAlertTriangle,
  IconCheck,
  IconMathFunction,
  IconFileCertificate,
} from '@tabler/icons-react'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts'

export function BacktestingPage() {
  const [data, setData] = useState<BacktestAnalysis | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const res = await airfareApi.getBacktest()
        setData(res)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const metrics = data?.metrics
  const series = data?.series || []
  const monthly = data?.monthlyComparison || []

  return (
    <>
      <AirfarexHeader title='Index Empirical Backtesting & Validation' />
      <Main className='space-y-6'>
        {/* Prominent Hard Disclaimer Banner */}
        <div className='p-4 rounded-lg border-2 border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-200 text-xs space-y-1.5'>
          <div className='flex items-center gap-2 font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 text-sm'>
            <IconAlertTriangle className='size-5 text-amber-600 dark:text-amber-400' />
            CRITICAL NOTICE: SYNTHETIC BACKTEST & DEMONSTRATION DATA
          </div>
          <p className='leading-relaxed'>
            The backtesting benchmarks, statistical metrics (Pearson r = 0.942, MAPE = 2.41%), and reference curves displayed here are strictly synthetic demonstration artifacts. They are engineered to model the statistical convergence workflow between the real-time AirFareX APIx index and DGCA scheduled passenger yield benchmarks. They do not constitute official statistical audits or government-certified validation.
          </p>
        </div>

        {/* Page Header */}
        <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b pb-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>DGCA Reference Benchmark Backtest</h1>
            <p className='text-sm text-muted-foreground mt-0.5'>
              Empirical tracking fidelity of APIx against DGCA monthly average scheduled airline passenger yield data.
            </p>
          </div>
          <Badge variant='outline' className='font-mono text-xs w-fit'>
            30-Day Period: 25 Jul 2026 – 23 Aug 2026
          </Badge>
        </div>

        {/* 4 Statistical Validation KPI Cards */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {/* Pearson Correlation */}
          <Card className='border-l-4 border-l-emerald-500'>
            <CardHeader className='pb-1 text-xs font-semibold uppercase text-muted-foreground flex flex-row items-center justify-between'>
              <span>Pearson Correlation (r)</span>
              <IconCheck className='size-4 text-emerald-500' />
            </CardHeader>
            <CardContent className='pt-1'>
              {loading || !metrics ? (
                <Skeleton className='h-12 w-28' />
              ) : (
                <>
                  <div className='text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400'>
                    {metrics.pearsonCorrelation.toFixed(3)}
                  </div>
                  <p className='text-xs text-muted-foreground mt-0.5'>Strong tracking alignment (p &lt; 0.0001)</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Mean Absolute Error (MAE) */}
          <Card className='border-l-4 border-l-sky-500'>
            <CardHeader className='pb-1 text-xs font-semibold uppercase text-muted-foreground flex flex-row items-center justify-between'>
              <span>Mean Absolute Error (MAE)</span>
              <IconMathFunction className='size-4 text-sky-500' />
            </CardHeader>
            <CardContent className='pt-1'>
              {loading || !metrics ? (
                <Skeleton className='h-12 w-28' />
              ) : (
                <>
                  <div className='text-3xl font-bold font-mono text-foreground'>
                    {formatINR(metrics.mae, { showZeroDecimal: true })}
                  </div>
                  <p className='text-xs text-muted-foreground mt-0.5'>Per-ticket average spread</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Root Mean Square Error (RMSE) */}
          <Card className='border-l-4 border-l-indigo-500'>
            <CardHeader className='pb-1 text-xs font-semibold uppercase text-muted-foreground flex flex-row items-center justify-between'>
              <span>Root Mean Square (RMSE)</span>
              <IconScale className='size-4 text-indigo-500' />
            </CardHeader>
            <CardContent className='pt-1'>
              {loading || !metrics ? (
                <Skeleton className='h-12 w-28' />
              ) : (
                <>
                  <div className='text-3xl font-bold font-mono text-foreground'>
                    {formatINR(metrics.rmse, { showZeroDecimal: true })}
                  </div>
                  <p className='text-xs text-muted-foreground mt-0.5'>Variance penalty indicator</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* MAPE */}
          <Card className='border-l-4 border-l-primary'>
            <CardHeader className='pb-1 text-xs font-semibold uppercase text-muted-foreground flex flex-row items-center justify-between'>
              <span>Mean Abs % Error (MAPE)</span>
              <IconFileCertificate className='size-4 text-primary' />
            </CardHeader>
            <CardContent className='pt-1'>
              {loading || !metrics ? (
                <Skeleton className='h-12 w-28' />
              ) : (
                <>
                  <div className='text-3xl font-bold font-mono text-foreground'>
                    {metrics.mape}%
                  </div>
                  <p className='text-xs text-muted-foreground mt-0.5'>High predictive fidelity (&lt;5% threshold)</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Master Chart: APIx vs Reference Index */}
        <Card>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-base font-semibold'>APIx Index vs. DGCA Reference Series</CardTitle>
                <CardDescription className='text-xs mt-0.5'>
                  Synchronized 30-day time-series overlay of simulated real-time index vs benchmark truth.
                </CardDescription>
              </div>
              <Badge variant='outline' className='text-[10px]'>N = 30 Daily Observations</Badge>
            </div>
          </CardHeader>
          <CardContent className='pt-2'>
            <div className='h-[280px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={series} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray='3 3' className='stroke-border/50' vertical={false} />
                  <XAxis dataKey='date' tickFormatter={(val) => val.slice(5)} tick={{ fontSize: 11 }} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 11 }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload
                        return (
                          <div className='rounded-lg border bg-popover p-2.5 shadow-md text-xs space-y-1'>
                            <div className='font-semibold'>{label}</div>
                            <div className='flex justify-between gap-4 text-primary'>
                              <span>APIx (Real-Time):</span>
                              <span className='font-mono font-bold'>{item.apix.toFixed(2)}</span>
                            </div>
                            <div className='flex justify-between gap-4 text-muted-foreground'>
                              <span>DGCA Reference:</span>
                              <span className='font-mono font-bold'>{item.dgcaRef.toFixed(2)}</span>
                            </div>
                            <div className='flex justify-between gap-4 text-amber-600 border-t pt-1'>
                              <span>Spread (Error):</span>
                              <span className='font-mono font-bold'>+{item.error.toFixed(2)} pts</span>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type='monotone' name='AirFareX APIx' dataKey='apix' stroke='#0284c7' strokeWidth={2.5} dot={false} />
                  <Line type='monotone' name='DGCA Reference Series' dataKey='dgcaRef' stroke='#6b7280' strokeWidth={2} strokeDasharray='4 4' dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 2-Column: Residual Error Over Time | Monthly Comparison */}
        <div className='grid gap-6 lg:grid-cols-2'>
          {/* Error Over Time Bar Chart */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-semibold'>Residual Error Spread (APIx - DGCA)</CardTitle>
              <CardDescription className='text-xs'>Daily delta in index points.</CardDescription>
            </CardHeader>
            <CardContent className='pt-2'>
              <div className='h-[220px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' className='stroke-border/50' vertical={false} />
                    <XAxis dataKey='date' tickFormatter={(val) => val.slice(8)} tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload
                          return (
                            <div className='rounded-lg border bg-popover p-2 shadow-md text-xs'>
                              <div>{item.date}</div>
                              <div className='font-mono font-bold'>Delta: +{item.error.toFixed(2)} pts ({item.errorPercent}%)</div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <ReferenceLine y={0.38} stroke='#f59e0b' strokeDasharray='3 3' label={{ value: 'Mean = 0.38', fill: '#f59e0b', fontSize: 10 }} />
                    <Bar dataKey='error' fill='#0284c7' radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Comparison */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-semibold'>Monthly Aggregated Benchmark Alignment</CardTitle>
              <CardDescription className='text-xs'>Comparison by calendar month.</CardDescription>
            </CardHeader>
            <CardContent className='pt-2'>
              <div className='h-[220px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' className='stroke-border/50' vertical={false} />
                    <XAxis dataKey='month' tickFormatter={(val) => val.split(' ')[0]} tick={{ fontSize: 10 }} />
                    <YAxis domain={[90, 140]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey='apix' name='APIx' fill='#0284c7' radius={[2, 2, 0, 0]} />
                    <Bar dataKey='dgcaRef' name='DGCA' fill='#94a3b8' radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Validation Summary Card */}
        <Card className='border-muted-foreground/20 bg-muted/20'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-semibold'>Statistical Evaluation & Methodology Notes</CardTitle>
          </CardHeader>
          <CardContent className='text-xs space-y-2 text-muted-foreground leading-relaxed'>
            <p>
              1. <strong>Tracking Error:</strong> Across the 30-day evaluation window, APIx demonstrated a mean spread of +0.38 index points against DGCA reference yields, primarily driven by real-time capture of intraday surge fares on high-demand sectors (DEL-BOM, BOM-BLR).
            </p>
            <p>
              2. <strong>Convergence & R²:</strong> The coefficient of determination (R² = 0.887) confirms that over 88% of macro airfare variance is captured by the 25-route Paasche weighted basket.
            </p>
            <p className='font-semibold text-amber-700 dark:text-amber-400'>
              *Disclaimer: This evaluation is generated for technical feasibility testing and does not represent an audited statutory validation report.
            </p>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
