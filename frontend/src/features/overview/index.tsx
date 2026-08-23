import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Main } from '@/components/layout/main'
import { AirfarexHeader } from '@/components/layout/airfarex-header'
import {
  airfareApi,
  type IndexSummary,
  type IndexHistoryPoint,
} from '@/services/api'
import { type RouteInfo, type AirlineInfo, type LeadTimeWindowInfo } from '@/lib/mock/data'
import { formatINR, formatPercent, formatNumber } from '@/lib/utils/format'
import {
  IconTrendingUp,
  IconArrowUpRight,
  IconChartLine,
  IconCash,
  IconRoute,
  IconPlane,
  IconDatabase,
  IconCheck,
  IconArrowRight,
} from '@tabler/icons-react'
import {
  AreaChart,
  Area,
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
} from 'recharts'


export function OverviewDashboard() {
  const [indexData, setIndexData] = useState<IndexSummary | null>(null)
  const [historyRange, setHistoryRange] = useState<'7D' | '30D' | '90D' | '1Y'>('30D')
  const [historyData, setHistoryData] = useState<IndexHistoryPoint[]>([])
  const [routes, setRoutes] = useState<RouteInfo[]>([])
  const [airlines, setAirlines] = useState<AirlineInfo[]>([])
  const [leadTimeSeries, setLeadTimeSeries] = useState<LeadTimeWindowInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [curr, hist, rts, airls, lt] = await Promise.all([
          airfareApi.getCurrentIndex(),
          airfareApi.getIndexHistory(historyRange),
          airfareApi.getRoutes(),
          airfareApi.getAirlineComparison(),
          airfareApi.getLeadTimeAnalysis(),
        ])
        setIndexData(curr)
        setHistoryData(hist)
        setRoutes(rts)
        setAirlines(airls)
        setLeadTimeSeries(lt.series)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [historyRange])

  // Sorting for 2-column sections
  const mostExpensiveRoutes = [...routes].sort((a, b) => b.avgFare - a.avgFare).slice(0, 5)
  const fastestRisingRoutes = [...routes].sort((a, b) => b.monthlyChange - a.monthlyChange).slice(0, 5)
  const topOverviewRoutes = routes.slice(0, 8)

  return (
    <>
      <AirfarexHeader title='Indian Airfare Price Intelligence' />
      <Main className='space-y-6'>
        {/* Page Header */}
        <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b pb-4'>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-2xl font-bold tracking-tight'>Overview Dashboard</h1>
              <Badge variant='outline' className='font-mono text-xs'>APIx v1.0</Badge>
            </div>
            <p className='text-sm text-muted-foreground mt-0.5'>
              Macroeconomic price monitoring of domestic airfares across 25 high-density routes.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' asChild>
              <Link to='/airfare-index'>
                <IconChartLine className='size-4 mr-1.5' />
                Index Methodology
              </Link>
            </Button>
            <Button size='sm' asChild>
              <Link to='/data-explorer'>
                <IconDatabase className='size-4 mr-1.5' />
                Explore Raw Quotes
              </Link>
            </Button>
          </div>
        </div>

        {/* 6 KPI Cards */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
          {/* 1. APIx */}
          <Card className='relative overflow-hidden'>
            <CardHeader className='pb-2 space-y-0 flex flex-row items-center justify-between'>
              <CardTitle className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                APIx (Index)
              </CardTitle>
              <IconChartLine className='size-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              {loading || !indexData ? (
                <Skeleton className='h-8 w-24' />
              ) : (
                <>
                  <div className='text-2xl font-bold font-mono tracking-tight text-foreground'>
                    {indexData.currentIndex.toFixed(2)}
                  </div>
                  <div className='flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-medium mt-1'>
                    <IconTrendingUp className='size-3.5' />
                    <span>+{indexData.monthlyChange}% MoM</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 2. Avg Domestic Fare */}
          <Card>
            <CardHeader className='pb-2 space-y-0 flex flex-row items-center justify-between'>
              <CardTitle className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                Avg Domestic Fare
              </CardTitle>
              <IconCash className='size-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              {loading || !indexData ? (
                <Skeleton className='h-8 w-24' />
              ) : (
                <>
                  <div className='text-2xl font-bold font-mono tracking-tight text-foreground'>
                    {formatINR(indexData.avgDomesticFare)}
                  </div>
                  <div className='flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-medium mt-1'>
                    <IconTrendingUp className='size-3.5' />
                    <span>+{indexData.avgFareChangeMoM}% MoM</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 3. Routes Tracked */}
          <Card>
            <CardHeader className='pb-2 space-y-0 flex flex-row items-center justify-between'>
              <CardTitle className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                Routes Tracked
              </CardTitle>
              <IconRoute className='size-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              {loading || !indexData ? (
                <Skeleton className='h-8 w-20' />
              ) : (
                <>
                  <div className='text-2xl font-bold font-mono tracking-tight text-foreground'>
                    {indexData.routesTracked}
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>Top 25 city pairs</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* 4. Airlines Tracked */}
          <Card>
            <CardHeader className='pb-2 space-y-0 flex flex-row items-center justify-between'>
              <CardTitle className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                Airlines Tracked
              </CardTitle>
              <IconPlane className='size-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              {loading || !indexData ? (
                <Skeleton className='h-8 w-20' />
              ) : (
                <>
                  <div className='text-2xl font-bold font-mono tracking-tight text-foreground'>
                    {indexData.airlinesTracked}
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>98.4% traffic share</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* 5. Quotes Collected */}
          <Card>
            <CardHeader className='pb-2 space-y-0 flex flex-row items-center justify-between'>
              <CardTitle className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                Quotes Today
              </CardTitle>
              <IconDatabase className='size-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              {loading || !indexData ? (
                <Skeleton className='h-8 w-24' />
              ) : (
                <>
                  <div className='text-2xl font-bold font-mono tracking-tight text-foreground'>
                    {formatNumber(indexData.quotesCollected)}
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>OTA + Direct APIs</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* 6. Data Quality */}
          <Card>
            <CardHeader className='pb-2 space-y-0 flex flex-row items-center justify-between'>
              <CardTitle className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                Data Quality
              </CardTitle>
              <IconCheck className='size-4 text-emerald-600 dark:text-emerald-400' />
            </CardHeader>
            <CardContent>
              {loading || !indexData ? (
                <Skeleton className='h-8 w-20' />
              ) : (
                <>
                  <div className='text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400'>
                    {indexData.dataQualityScore}%
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>Cleaned & verified</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* APIx — Last 30 Days Area Chart */}
        <Card>
          <CardHeader className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3'>
            <div>
              <div className='flex items-center gap-2'>
                <CardTitle className='text-base font-semibold'>APIx Airfare Price Index Trend</CardTitle>
                <Badge variant='secondary' className='text-[11px] font-normal'>Base Jan 2026 = 100</Badge>
              </div>
              <CardDescription className='text-xs mt-0.5'>
                Daily aggregate weighted index value vs. 100 base baseline.
              </CardDescription>
            </div>
            <Tabs
              value={historyRange}
              onValueChange={(val) => setHistoryRange(val as any)}
              className='w-auto'
            >
              <TabsList className='h-8'>
                <TabsTrigger value='7D' className='text-xs px-2.5'>7D</TabsTrigger>
                <TabsTrigger value='30D' className='text-xs px-2.5'>30D</TabsTrigger>
                <TabsTrigger value='90D' className='text-xs px-2.5'>90D</TabsTrigger>
                <TabsTrigger value='1Y' className='text-xs px-2.5'>1Y</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className='pt-2'>
            {loading ? (
              <Skeleton className='h-[280px] w-full' />
            ) : (
              <div className='h-[280px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id='colorApix' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='var(--primary)' stopOpacity={0.25} />
                        <stop offset='95%' stopColor='var(--primary)' stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' className='stroke-border/50' vertical={false} />
                    <XAxis
                      dataKey='date'
                      tickFormatter={(val) => val.slice(5)}
                      tick={{ fontSize: 11, fill: 'currentColor' }}
                      className='text-muted-foreground'
                    />
                    <YAxis
                      domain={['dataMin - 2', 'dataMax + 2']}
                      tick={{ fontSize: 11, fill: 'currentColor' }}
                      className='text-muted-foreground'
                      tickFormatter={(val) => val.toFixed(1)}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as IndexHistoryPoint
                          return (
                            <div className='rounded-lg border bg-popover p-3 shadow-md text-xs space-y-1.5'>
                              <div className='font-semibold text-foreground'>{label}</div>
                              <div className='flex items-center justify-between gap-4'>
                                <span className='text-muted-foreground'>APIx Index:</span>
                                <span className='font-mono font-bold text-foreground'>{data.apix.toFixed(2)}</span>
                              </div>
                              <div className='flex items-center justify-between gap-4'>
                                <span className='text-muted-foreground'>Avg Domestic Fare:</span>
                                <span className='font-mono text-foreground'>{formatINR(data.avgFare ?? 0)}</span>
                              </div>
                              <div className='flex items-center justify-between gap-4'>
                                <span className='text-muted-foreground'>Metro-Metro Index:</span>
                                <span className='font-mono text-foreground'>{(data.metroMetroIndex ?? data.apix).toFixed(1)}</span>
                              </div>

                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <ReferenceLine y={100} stroke='#6b7280' strokeDasharray='3 3' label={{ value: 'Base = 100', position: 'insideBottomLeft', fill: '#6b7280', fontSize: 10 }} />
                    <Area
                      type='monotone'
                      dataKey='apix'
                      stroke='var(--primary)'
                      strokeWidth={2}
                      fillOpacity={1}
                      fill='url(#colorApix)'
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Route Price Overview Table */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-3'>
            <div>
              <CardTitle className='text-base font-semibold'>Route Price Overview</CardTitle>
              <CardDescription className='text-xs mt-0.5'>
                Key corridor average fares, daily/weekly/monthly variations, and surge states.
              </CardDescription>
            </div>
            <Button variant='outline' size='sm' asChild>
              <Link to='/route-analysis'>
                View All 25 Routes <IconArrowRight className='size-3.5 ml-1' />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <table className='w-full text-xs text-left border-collapse'>
                <thead>
                  <tr className='border-y bg-muted/40 text-muted-foreground'>
                    <th className='p-3 font-medium'>Route</th>
                    <th className='p-3 font-medium'>Sector</th>
                    <th className='p-3 font-medium text-right'>Avg Fare</th>
                    <th className='p-3 font-medium text-right'>Daily</th>
                    <th className='p-3 font-medium text-right'>Weekly</th>
                    <th className='p-3 font-medium text-right'>Monthly</th>
                    <th className='p-3 font-medium text-right'>Current Index</th>
                    <th className='p-3 font-medium text-center'>Status</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border/60'>
                  {topOverviewRoutes.map((r) => (
                    <tr key={r.id} className='hover:bg-muted/30 transition-colors'>
                      <td className='p-3 font-mono font-semibold text-foreground'>
                        <Link to='/route-analysis' className='hover:underline text-primary'>
                          {r.id}
                        </Link>
                      </td>
                      <td className='p-3 text-muted-foreground'>
                        {r.originCity} ➔ {r.destinationCity}
                      </td>
                      <td className='p-3 font-mono font-medium text-right text-foreground'>
                        {formatINR(r.avgFare)}
                      </td>
                      <td className='p-3 font-mono text-right'>
                        <span className={r.dailyChange > 0 ? 'text-rose-600 dark:text-rose-400 font-medium' : r.dailyChange < 0 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}>
                          {formatPercent(r.dailyChange)}
                        </span>
                      </td>
                      <td className='p-3 font-mono text-right'>
                        <span className={r.weeklyChange > 0 ? 'text-rose-600 dark:text-rose-400 font-medium' : r.weeklyChange < 0 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}>
                          {formatPercent(r.weeklyChange)}
                        </span>
                      </td>
                      <td className='p-3 font-mono text-right'>
                        <span className={r.monthlyChange > 0 ? 'text-rose-600 dark:text-rose-400 font-medium' : r.monthlyChange < 0 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}>
                          {formatPercent(r.monthlyChange)}
                        </span>
                      </td>
                      <td className='p-3 font-mono text-right text-foreground font-medium'>
                        {r.currentIndex.toFixed(1)}
                      </td>
                      <td className='p-3 text-center'>
                        <Badge
                          variant='outline'
                          className={`text-[10px] uppercase font-semibold ${
                            r.status === 'surge'
                              ? 'bg-rose-500/10 text-rose-600 border-rose-300 dark:border-rose-800'
                              : r.status === 'discount'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-800'
                              : r.status === 'volatile'
                              ? 'bg-amber-500/10 text-amber-600 border-amber-300 dark:border-amber-800'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 2-Column: Most Expensive Routes | Fastest Rising Routes */}
        <div className='grid gap-6 md:grid-cols-2'>
          {/* Most Expensive Routes */}
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-sm font-semibold'>Most Expensive Routes</CardTitle>
                <Badge variant='outline' className='text-[10px]'>By Avg Price</Badge>
              </div>
              <CardDescription className='text-xs'>Top 5 sectors by average fare paid across carriers.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3 pt-0'>
              {mostExpensiveRoutes.map((r, idx) => (
                <div key={r.id} className='flex items-center justify-between text-xs p-2.5 rounded-lg border bg-muted/20'>
                  <div className='flex items-center gap-2.5'>
                    <span className='size-5 flex items-center justify-center rounded-full bg-muted font-mono font-bold text-[11px] text-muted-foreground'>
                      {idx + 1}
                    </span>
                    <div>
                      <div className='font-semibold font-mono text-foreground'>{r.id}</div>
                      <div className='text-[11px] text-muted-foreground'>{r.originCity} to {r.destinationCity} ({r.distanceKm} km)</div>
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='font-mono font-bold text-foreground'>{formatINR(r.avgFare)}</div>
                    <div className='text-[11px] text-muted-foreground'>Min: {formatINR(r.minFare)}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Fastest Rising Routes */}
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-sm font-semibold'>Fastest Rising Routes</CardTitle>
                <Badge variant='outline' className='text-[10px] text-rose-600 dark:text-rose-400'>MoM Surge</Badge>
              </div>
              <CardDescription className='text-xs'>Top 5 sectors with highest month-over-month price inflation.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3 pt-0'>
              {fastestRisingRoutes.map((r, idx) => (
                <div key={r.id} className='flex items-center justify-between text-xs p-2.5 rounded-lg border bg-muted/20'>
                  <div className='flex items-center gap-2.5'>
                    <span className='size-5 flex items-center justify-center rounded-full bg-rose-500/10 text-rose-600 font-mono font-bold text-[11px]'>
                      {idx + 1}
                    </span>
                    <div>
                      <div className='font-semibold font-mono text-foreground'>{r.id}</div>
                      <div className='text-[11px] text-muted-foreground'>{r.originCity} to {r.destinationCity}</div>
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='font-mono font-bold text-rose-600 dark:text-rose-400 flex items-center justify-end gap-0.5'>
                      <IconArrowUpRight className='size-3.5' />
                      +{r.monthlyChange}%
                    </div>
                    <div className='text-[11px] font-mono text-muted-foreground'>{formatINR(r.avgFare)}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 2-Column: Airline Comparison Bar Chart | Booking Lead-Time Discount Curve */}
        <div className='grid gap-6 md:grid-cols-2'>
          {/* Airline Fare Comparison Bar Chart */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-semibold'>Airline Average Fare Comparison</CardTitle>
              <CardDescription className='text-xs'>
                Network-wide average airfare across the 5 tracked domestic carriers.
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-2'>
              <div className='h-[240px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={airlines} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' className='stroke-border/50' vertical={false} />
                    <XAxis
                      dataKey='shortName'
                      tick={{ fontSize: 11, fill: 'currentColor' }}
                      className='text-muted-foreground'
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'currentColor' }}
                      className='text-muted-foreground'
                      tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload as AirlineInfo
                          return (
                            <div className='rounded-lg border bg-popover p-2.5 shadow-md text-xs space-y-1'>
                              <div className='font-semibold text-foreground'>{item.name} ({item.code})</div>
                              <div className='flex justify-between gap-4'>
                                <span className='text-muted-foreground'>Avg Fare:</span>
                                <span className='font-mono font-bold text-foreground'>{formatINR(item.avgFare)}</span>
                              </div>
                              <div className='flex justify-between gap-4'>
                                <span className='text-muted-foreground'>Market Quote Share:</span>
                                <span className='font-mono text-foreground'>{item.quoteShare}%</span>
                              </div>
                              <div className='flex justify-between gap-4'>
                                <span className='text-muted-foreground'>Availability Rate:</span>
                                <span className='font-mono text-foreground'>{item.availabilityRate}%</span>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey='avgFare' fill='var(--primary)' radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Booking Lead-Time Curve */}
          <Card>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-sm font-semibold'>Booking Lead-Time Fare Decay Curve</CardTitle>
                <Badge variant='outline' className='text-[10px]'>T+1 ➔ T+45</Badge>
              </div>
              <CardDescription className='text-xs'>
                Aggregated average fare paid by advance booking window.
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-2'>
              <div className='h-[240px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={leadTimeSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' className='stroke-border/50' vertical={false} />
                    <XAxis
                      dataKey='leadTime'
                      tick={{ fontSize: 11, fill: 'currentColor' }}
                      className='text-muted-foreground'
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'currentColor' }}
                      className='text-muted-foreground'
                      tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload as LeadTimeWindowInfo
                          return (
                            <div className='rounded-lg border bg-popover p-2.5 shadow-md text-xs space-y-1'>
                              <div className='font-semibold text-foreground'>{item.leadTime} Advance Window</div>
                              <div className='flex justify-between gap-4'>
                                <span className='text-muted-foreground'>Avg Fare:</span>
                                <span className='font-mono font-bold text-foreground'>{formatINR(item.avgFare)}</span>
                              </div>
                              <div className='flex justify-between gap-4'>
                                <span className='text-muted-foreground'>Multiplier vs T+45:</span>
                                <span className='font-mono text-foreground'>{item.multiplier.toFixed(2)}x</span>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Line
                      type='monotone'
                      dataKey='avgFare'
                      stroke='#0284c7'
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#0284c7' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
