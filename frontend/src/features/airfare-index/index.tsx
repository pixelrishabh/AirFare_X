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
import {
  airfareApi,
  type IndexSummary,
  type IndexHistoryPoint,
} from '@/services/api'
import { type RouteInfo, type AirlineInfo } from '@/lib/mock/data'
import { formatINR } from '@/lib/utils/format'
import {
  IconAlertTriangle,
  IconScale,
  IconCalculator,
  IconChartArcs,
  IconBuildingBank,
} from '@tabler/icons-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export function AirfareIndexPage() {
  const [indexData, setIndexData] = useState<IndexSummary | null>(null)
  const [history, setHistory] = useState<IndexHistoryPoint[]>([])
  const [monthly, setMonthly] = useState<any[]>([])
  const [routes, setRoutes] = useState<RouteInfo[]>([])
  const [airlines, setAirlines] = useState<AirlineInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [curr, hist, mth, rts, airls] = await Promise.all([
          airfareApi.getCurrentIndex(),
          airfareApi.getIndexHistory('30D'),
          airfareApi.getMonthlyIndex(),
          airfareApi.getRoutes(),
          airfareApi.getAirlineComparison(),
        ])
        setIndexData(curr)
        setHistory(hist)
        setMonthly(mth)
        setRoutes(rts)
        setAirlines(airls)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Top 8 route weights for horizontal contribution chart
  const routeWeights = [...routes].sort((a, b) => b.weight - a.weight).slice(0, 8)

  return (
    <>
      <AirfarexHeader title='Airfare Price Index (APIx)' />
      <Main className='space-y-6'>
        {/* Top Disclaimer Banner */}
        <div className='flex items-start gap-3 p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs'>
          <IconAlertTriangle className='size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5' />
          <div>
            <span className='font-bold uppercase tracking-wider text-[11px] block text-amber-700 dark:text-amber-300'>
              Demonstration & Research Sandbox Data
            </span>
            All index values, route weights, and pricing statistics shown on this page are modeled for technical demonstration of the AirFareX price intelligence platform. Route weights are illustrative approximations modeled on DGCA passenger traffic share.
          </div>
        </div>

        {/* Hero Index KPI Card */}
        <Card className='border-l-4 border-l-primary bg-card/80'>
          <CardContent className='p-6'>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
              <div className='space-y-1.5'>
                <div className='flex items-center gap-2'>
                  <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                    Airfare Price Index (APIx)
                  </span>
                  <Badge variant='outline' className='text-[10px] font-medium'>
                    Base: Jan 2026 = 100
                  </Badge>
                </div>
                <div className='flex items-baseline gap-4'>
                  {loading || !indexData ? (
                    <Skeleton className='h-14 w-40' />
                  ) : (
                    <>
                      <span className='text-5xl font-black font-mono tracking-tight text-foreground'>
                        {indexData.currentIndex.toFixed(2)}
                      </span>
                      <span className='text-sm text-muted-foreground'>Points</span>
                    </>
                  )}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Route-weighted price relative index representing domestic commercial airfares in India.
                </p>
              </div>

              {/* Sub-period Shifts */}
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/40 p-3 rounded-lg border'>
                <div className='text-center p-2 rounded bg-background/60'>
                  <span className='text-[10px] uppercase font-semibold text-muted-foreground block'>Daily</span>
                  <span className='text-sm font-mono font-bold text-rose-600 dark:text-rose-400'>+0.4%</span>
                </div>
                <div className='text-center p-2 rounded bg-background/60'>
                  <span className='text-[10px] uppercase font-semibold text-muted-foreground block'>Weekly</span>
                  <span className='text-sm font-mono font-bold text-rose-600 dark:text-rose-400'>+1.2%</span>
                </div>
                <div className='text-center p-2 rounded bg-background/60'>
                  <span className='text-[10px] uppercase font-semibold text-muted-foreground block'>Monthly (MoM)</span>
                  <span className='text-sm font-mono font-bold text-rose-600 dark:text-rose-400'>+4.2%</span>
                </div>
                <div className='text-center p-2 rounded bg-background/60'>
                  <span className='text-[10px] uppercase font-semibold text-muted-foreground block'>YTD Growth</span>
                  <span className='text-sm font-mono font-bold text-rose-600 dark:text-rose-400'>+28.64%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historical 30-Day APIx vs Sub-Indices */}
        <Card>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-base font-semibold'>APIx Historical Progression & Sub-Indices</CardTitle>
              <Badge variant='outline' className='text-[10px]'>Daily Sampling (30D)</Badge>
            </div>
            <CardDescription className='text-xs'>
              Aggregate APIx compared with Metro-to-Metro, Metro-to-Non-Metro, and Tier-2 sub-indices.
            </CardDescription>
          </CardHeader>
          <CardContent className='pt-2'>
            <div className='h-[280px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={history} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray='3 3' className='stroke-border/50' vertical={false} />
                  <XAxis dataKey='date' tickFormatter={(val) => val.slice(5)} tick={{ fontSize: 11 }} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 11 }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className='rounded-lg border bg-popover p-3 shadow-md text-xs space-y-1.5'>
                            <div className='font-semibold text-foreground'>{label}</div>
                            {payload.map((entry) => (
                              <div key={entry.name} className='flex justify-between gap-4'>
                                <span style={{ color: entry.color }}>{entry.name}:</span>
                                <span className='font-mono font-bold'>{Number(entry.value).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <ReferenceLine y={100} stroke='#6b7280' strokeDasharray='3 3' />
                  <Line type='monotone' name='APIx (Aggregate)' dataKey='apix' stroke='#0284c7' strokeWidth={2.5} dot={false} />
                  <Line type='monotone' name='Metro-Metro' dataKey='metroMetroIndex' stroke='#dc2626' strokeWidth={1.5} dot={false} />
                  <Line type='monotone' name='Metro-Non-Metro' dataKey='metroNonMetroIndex' stroke='#f59e0b' strokeWidth={1.5} dot={false} />
                  <Line type='monotone' name='Tier-2 Corridors' dataKey='tier2Index' stroke='#10b981' strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 2-Column: Monthly APIx Trend | Index vs Average Airfare */}
        <div className='grid gap-6 md:grid-cols-2'>
          {/* Monthly APIx Bar Chart */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-semibold'>Monthly APIx Progression (2025 - 2026)</CardTitle>
              <CardDescription className='text-xs'>
                Monthly index values capturing seasonal peaks (Diwali, Year-end, Summer surge).
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-2'>
              <div className='h-[250px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={monthly} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' className='stroke-border/50' vertical={false} />
                    <XAxis dataKey='month' tick={{ fontSize: 10 }} tickFormatter={(val) => val.split(' ')[0]} />
                    <YAxis domain={[90, 140]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload
                          return (
                            <div className='rounded-lg border bg-popover p-2.5 shadow-md text-xs space-y-1'>
                              <div className='font-semibold'>{item.month}</div>
                              <div className='flex justify-between gap-4'>
                                <span className='text-muted-foreground'>APIx:</span>
                                <span className='font-mono font-bold'>{item.apix.toFixed(1)}</span>
                              </div>
                              <div className='flex justify-between gap-4'>
                                <span className='text-muted-foreground'>Avg Fare:</span>
                                <span className='font-mono'>{formatINR(item.avgFare)}</span>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey='apix' fill='var(--primary)' radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Index vs Average Airfare Dual-Axis Chart */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-semibold'>Index vs. Average Domestic Airfare (₹)</CardTitle>
              <CardDescription className='text-xs'>
                Correlation between unit price levels and normalized index points.
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-2'>
              <div className='h-[250px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={history} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' className='stroke-border/50' vertical={false} />
                    <XAxis dataKey='date' tickFormatter={(val) => val.slice(5)} tick={{ fontSize: 11 }} />
                    <YAxis yAxisId='left' domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 10 }} />
                    <YAxis yAxisId='right' orientation='right' domain={['dataMin - 50', 'dataMax + 50']} tick={{ fontSize: 10 }} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload as IndexHistoryPoint
                          return (
                            <div className='rounded-lg border bg-popover p-2.5 shadow-md text-xs space-y-1'>
                              <div className='font-semibold'>{item.date}</div>
                              <div className='flex justify-between gap-4'>
                                <span className='text-primary'>APIx Index:</span>
                                <span className='font-mono font-bold'>{item.apix.toFixed(2)}</span>
                              </div>
                              <div className='flex justify-between gap-4'>
                                <span className='text-emerald-600'>Avg Fare:</span>
                                <span className='font-mono font-bold'>{formatINR(item.avgFare ?? 0)}</span>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line yAxisId='left' type='monotone' name='APIx (Left)' dataKey='apix' stroke='var(--primary)' strokeWidth={2} dot={false} />
                    <Line yAxisId='right' type='monotone' name='Avg Fare ₹ (Right)' dataKey='avgFare' stroke='#10b981' strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2-Column: Route Contribution Weights | Airline Contribution */}
        <div className='grid gap-6 md:grid-cols-2'>
          {/* Route Contribution Weights */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-semibold'>Route Basket Weights in APIx</CardTitle>
              <CardDescription className='text-xs'>
                Top sector weight allocations based on relative passenger capacity share.
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-2 space-y-2.5'>
              {routeWeights.map((r) => (
                <div key={r.id} className='space-y-1 text-xs'>
                  <div className='flex justify-between'>
                    <span className='font-mono font-semibold'>{r.id} ({r.originCity} - {r.destinationCity})</span>
                    <span className='font-mono text-muted-foreground'>{r.weight}% weight</span>
                  </div>
                  <div className='h-2 w-full bg-muted rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-primary rounded-full transition-all'
                      style={{ width: `${r.weight * 5}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Airline Contribution Share */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-semibold'>Airline Capacity & Quote Contribution</CardTitle>
              <CardDescription className='text-xs'>
                Proportion of analyzed flight quotes by carrier in the national index.
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-2 flex flex-col items-center'>
              <div className='h-[180px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={airlines}
                      dataKey='quoteShare'
                      nameKey='shortName'
                      cx='50%'
                      cy='50%'
                      outerRadius={70}
                      innerRadius={42}
                      paddingAngle={2}
                    >
                      {airlines.map((entry) => (
                        <Cell key={entry.code} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload as AirlineInfo
                          return (
                            <div className='rounded-lg border bg-popover p-2 shadow-md text-xs'>
                              <div className='font-semibold'>{item.name}</div>
                              <div>Quote Share: {item.quoteShare}%</div>
                              <div>Avg Fare: {formatINR(item.avgFare)}</div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className='flex flex-wrap justify-center gap-3 text-xs mt-2'>
                {airlines.map((a) => (
                  <div key={a.code} className='flex items-center gap-1.5'>
                    <span className='size-2.5 rounded-full' style={{ backgroundColor: a.color }} />
                    <span className='text-muted-foreground'>{a.shortName} ({a.quoteShare}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Index Methodology Info Card */}
        <Card className='border-muted-foreground/20 bg-muted/20'>
          <CardHeader className='pb-3'>
            <div className='flex items-center gap-2'>
              <IconCalculator className='size-5 text-primary' />
              <CardTitle className='text-base font-semibold'>APIx Index Construction Methodology</CardTitle>
            </div>
            <CardDescription className='text-xs'>
              Technical formulation adapted for dynamic high-frequency air travel price monitoring.
            </CardDescription>
          </CardHeader>
          <CardContent className='text-xs space-y-3.5 text-muted-foreground leading-relaxed'>
            <div className='grid gap-4 md:grid-cols-3'>
              <div className='p-3 rounded-lg border bg-background/60 space-y-1.5'>
                <div className='font-semibold text-foreground flex items-center gap-1.5'>
                  <IconBuildingBank className='size-4 text-primary' />
                  1. Base Period Specification
                </div>
                <p>
                  Indexed to <strong>January 2026 = 100.00</strong>. Fares are evaluated relative to normalized base-period seat-mile prices to maintain comparability over multi-year cycles.
                </p>
              </div>

              <div className='p-3 rounded-lg border bg-background/60 space-y-1.5'>
                <div className='font-semibold text-foreground flex items-center gap-1.5'>
                  <IconScale className='size-4 text-primary' />
                  2. Route Traffic Weighting
                </div>
                <p>
                  Each route is assigned an illustrative weight proportional to DGCA city-pair scheduled passenger density (e.g. DEL-BOM at 14.8%, DEL-BLR at 9.5%).
                </p>
              </div>

              <div className='p-3 rounded-lg border bg-background/60 space-y-1.5'>
                <div className='font-semibold text-foreground flex items-center gap-1.5'>
                  <IconChartArcs className='size-4 text-primary' />
                  3. Paasche / PSD Price-Relative
                </div>
                <p>
                  Calculates price relatives across advance purchase buckets (T+1, T+7, T+15, T+30, T+45) to prevent last-minute surge distortions from skewing standard travel baselines.
                </p>
              </div>
            </div>

            <div className='p-3 rounded bg-muted/60 border text-[11px] text-foreground font-mono'>
              {'APIx_t = 100 * Σ [ w_r * ( Σ_k ( c_k * P_{r,k,t} / P_{r,k,0} ) ) ]'}
            </div>
            <p className='text-[11px]'>
              *Note: Weights and formulas shown here are illustrative research models designed for analytical demonstration purposes, not official NSO/MoSPI published indices.
            </p>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}

