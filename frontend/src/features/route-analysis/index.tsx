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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Main } from '@/components/layout/main'
import { AirfarexHeader } from '@/components/layout/airfarex-header'
import { airfareApi, type RouteAnalysisData } from '@/services/api'
import { type RouteInfo, type AirlineInfo } from '@/lib/mock/data'
import { formatINR, formatPercent } from '@/lib/utils/format'
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
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'


export function RouteAnalysisPage() {
  const [routes, setRoutes] = useState<RouteInfo[]>([])
  const [airlines, setAirlines] = useState<AirlineInfo[]>([])
  const [selectedRouteId, setSelectedRouteId] = useState<string>('DEL-BOM')
  const [selectedAirline, setSelectedAirline] = useState<string>('all')
  const [selectedLeadTime, setSelectedLeadTime] = useState<string>('all')
  const [data, setData] = useState<RouteAnalysisData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMeta() {
      const [rts, airls] = await Promise.all([
        airfareApi.getRoutes(),
        airfareApi.getAirlineComparison(),
      ])
      setRoutes(rts)
      setAirlines(airls)
    }
    loadMeta()
  }, [])

  useEffect(() => {
    async function loadRoute() {
      try {
        setLoading(true)
        const res = await airfareApi.getRouteAnalysis(selectedRouteId)
        setData(res)
      } finally {
        setLoading(false)
      }
    }
    loadRoute()
  }, [selectedRouteId])

  const route = data?.route

  // Filtered quotes based on controls
  const filteredQuotes = (data?.recentQuotes || []).filter((q) => {
    if (selectedAirline !== 'all' && q.airlineCode !== selectedAirline) return false
    if (selectedLeadTime !== 'all' && `T+${q.advanceDays}` !== selectedLeadTime) return false
    return true
  })

  // Fee breakdown data for chart
  const feeComposition = data ? [
    { name: 'Base Fare', value: data.fareComposition.base, color: '#0284c7' },
    { name: 'Govt Taxes & GST', value: data.fareComposition.taxes, color: '#f59e0b' },
    { name: 'UDF & Convenience Fees', value: data.fareComposition.udfAndFees, color: '#10b981' },
  ] : []

  return (
    <>
      <AirfarexHeader title='Route Price Intelligence & Micro-Analysis' />
      <Main className='space-y-6'>
        {/* Page Header & Filters */}
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b pb-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Route Deep Dive</h1>
            <p className='text-sm text-muted-foreground mt-0.5'>
              Sector pricing dynamics, airline fare distribution, fee composition, and quotes.
            </p>
          </div>

          {/* Interactive Filters Bar */}
          <div className='flex flex-wrap items-center gap-2.5'>
            {/* Route Selector */}
            <div className='flex items-center gap-1.5'>
              <span className='text-xs font-medium text-muted-foreground'>Route:</span>
              <Select value={selectedRouteId} onValueChange={setSelectedRouteId}>
                <SelectTrigger className='w-[160px] h-8 text-xs font-mono font-semibold'>
                  <SelectValue placeholder='Select Route' />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((r) => (
                    <SelectItem key={r.id} value={r.id} className='text-xs font-mono'>
                      {r.id} ({r.originCity}-{r.destinationCity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Airline Filter */}
            <div className='flex items-center gap-1.5'>
              <span className='text-xs font-medium text-muted-foreground'>Airline:</span>
              <Select value={selectedAirline} onValueChange={setSelectedAirline}>
                <SelectTrigger className='w-[130px] h-8 text-xs'>
                  <SelectValue placeholder='All Airlines' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all' className='text-xs'>All Carriers</SelectItem>
                  {airlines.map((a) => (
                    <SelectItem key={a.code} value={a.code} className='text-xs'>
                      {a.shortName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lead Time Filter */}
            <div className='flex items-center gap-1.5'>
              <span className='text-xs font-medium text-muted-foreground'>Lead Time:</span>
              <Select value={selectedLeadTime} onValueChange={setSelectedLeadTime}>
                <SelectTrigger className='w-[110px] h-8 text-xs font-mono'>
                  <SelectValue placeholder='All Windows' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all' className='text-xs'>All (T+1 - 45)</SelectItem>
                  <SelectItem value='T+1' className='text-xs font-mono'>T+1 (Tomorrow)</SelectItem>
                  <SelectItem value='T+7' className='text-xs font-mono'>T+7 (1 Week)</SelectItem>
                  <SelectItem value='T+15' className='text-xs font-mono'>T+15 (2 Weeks)</SelectItem>
                  <SelectItem value='T+30' className='text-xs font-mono'>T+30 (1 Month)</SelectItem>
                  <SelectItem value='T+45' className='text-xs font-mono'>T+45 (Advance)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Route Stats Row */}
        {loading || !route ? (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-6'>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className='h-24 w-full' />
            ))}
          </div>
        ) : (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-6'>
            <Card>
              <CardHeader className='pb-1 text-muted-foreground text-xs font-semibold uppercase'>
                Avg Sector Fare
              </CardHeader>
              <CardContent>
                <div className='text-xl font-bold font-mono text-foreground'>{formatINR(route.avgFare)}</div>
                <div className='text-[11px] text-muted-foreground mt-0.5'>{route.originCity} ➔ {route.destinationCity}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-1 text-muted-foreground text-xs font-semibold uppercase'>
                Min / Max Spread
              </CardHeader>
              <CardContent>
                <div className='text-xs font-mono font-semibold text-foreground'>{formatINR(route.minFare)} – {formatINR(route.maxFare)}</div>
                <div className='text-[11px] text-muted-foreground mt-0.5'>Spread: {formatINR(route.maxFare - route.minFare)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-1 text-muted-foreground text-xs font-semibold uppercase'>
                Sector Volatility
              </CardHeader>
              <CardContent>
                <div className='text-xl font-bold font-mono text-amber-600 dark:text-amber-400'>{route.volatility}%</div>
                <div className='text-[11px] text-muted-foreground mt-0.5'>Std dev coefficient</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-1 text-muted-foreground text-xs font-semibold uppercase'>
                Current Index
              </CardHeader>
              <CardContent>
                <div className='text-xl font-bold font-mono text-primary'>{route.currentIndex.toFixed(1)}</div>
                <div className='text-[11px] text-muted-foreground mt-0.5'>vs Jan 2026 = 100</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-1 text-muted-foreground text-xs font-semibold uppercase'>
                Monthly Shift
              </CardHeader>
              <CardContent>
                <div className='text-xl font-bold font-mono text-rose-600 dark:text-rose-400'>
                  {formatPercent(route.monthlyChange)}
                </div>
                <div className='text-[11px] text-muted-foreground mt-0.5'>MoM Inflation</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-1 text-muted-foreground text-xs font-semibold uppercase'>
                APIx Weight
              </CardHeader>
              <CardContent>
                <div className='text-xl font-bold font-mono text-foreground'>{route.weight}%</div>
                <div className='text-[11px] text-muted-foreground mt-0.5'>{route.distanceKm} km sector</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 2-Column Charts: Fare Trend (Avg, Min, Max) & Airline Comparison on Route */}
        <div className='grid gap-6 lg:grid-cols-2'>
          {/* Fare Trend Line Chart */}
          <Card>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-sm font-semibold'>Fare Band Over Time (30 Days)</CardTitle>
                <Badge variant='outline' className='font-mono text-[10px]'>{selectedRouteId}</Badge>
              </div>
              <CardDescription className='text-xs'>
                Average, lowest available, and highest premium quotes on this sector.
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-2'>
              <div className='h-[250px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={data?.fareTrend || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' className='stroke-border/50' vertical={false} />
                    <XAxis dataKey='date' tickFormatter={(val) => val.slice(5)} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload
                          return (
                            <div className='rounded-lg border bg-popover p-2.5 shadow-md text-xs space-y-1'>
                              <div className='font-semibold'>{label}</div>
                              <div className='flex justify-between gap-4 text-primary'>
                                <span>Avg Fare:</span>
                                <span className='font-mono font-bold'>{formatINR(item.avgFare)}</span>
                              </div>
                              <div className='flex justify-between gap-4 text-emerald-600'>
                                <span>Min Available:</span>
                                <span className='font-mono font-bold'>{formatINR(item.minFare)}</span>
                              </div>
                              <div className='flex justify-between gap-4 text-rose-600'>
                                <span>Peak Fare:</span>
                                <span className='font-mono font-bold'>{formatINR(item.maxFare)}</span>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type='monotone' name='Average Fare' dataKey='avgFare' stroke='#0284c7' strokeWidth={2} dot={false} />
                    <Line type='monotone' name='Min Fare' dataKey='minFare' stroke='#10b981' strokeWidth={1.5} strokeDasharray='3 3' dot={false} />
                    <Line type='monotone' name='Peak Fare' dataKey='maxFare' stroke='#ef4444' strokeWidth={1.5} strokeDasharray='3 3' dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Airline Pricing on Route */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-semibold'>Carrier Pricing & Daily Flights</CardTitle>
              <CardDescription className='text-xs'>
                Carrier average fare and frequency on {selectedRouteId}.
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-2'>
              <div className='h-[250px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={data?.airlineComparison || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' className='stroke-border/50' vertical={false} />
                    <XAxis dataKey='airline' tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload
                          return (
                            <div className='rounded-lg border bg-popover p-2.5 shadow-md text-xs space-y-1'>
                              <div className='font-semibold'>{item.airline} ({item.code})</div>
                              <div className='flex justify-between gap-4'>
                                <span className='text-muted-foreground'>Avg Fare:</span>
                                <span className='font-mono font-bold'>{formatINR(item.avgFare)}</span>
                              </div>
                              <div className='flex justify-between gap-4'>
                                <span className='text-muted-foreground'>Min Starting Fare:</span>
                                <span className='font-mono'>{formatINR(item.minFare)}</span>
                              </div>
                              <div className='flex justify-between gap-4'>
                                <span className='text-muted-foreground'>Daily Flights Tracked:</span>
                                <span className='font-mono'>{item.flightCount}</span>
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
        </div>

        {/* 3-Column: Fee Composition | Lead-Time Curve | Fare Distribution */}
        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Fee Breakdown */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-semibold'>Fare Fee Composition</CardTitle>
              <CardDescription className='text-xs'>Base fare vs Taxes & Passenger Fees.</CardDescription>
            </CardHeader>
            <CardContent className='pt-2 flex flex-col items-center'>
              <div className='h-[170px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={feeComposition}
                      dataKey='value'
                      nameKey='name'
                      cx='50%'
                      cy='50%'
                      outerRadius={65}
                      innerRadius={38}
                      paddingAngle={2}
                    >
                      {feeComposition.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload
                          return (
                            <div className='rounded-lg border bg-popover p-2 shadow-md text-xs'>
                              <div className='font-semibold'>{item.name}</div>
                              <div className='font-mono font-bold'>{formatINR(item.value)}</div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className='space-y-1 w-full text-xs mt-2'>
                {feeComposition.map((f, i) => (
                  <div key={i} className='flex items-center justify-between'>
                    <div className='flex items-center gap-1.5'>
                      <span className='size-2.5 rounded-full' style={{ backgroundColor: f.color }} />
                      <span className='text-muted-foreground'>{f.name}</span>
                    </div>
                    <span className='font-mono font-semibold'>{formatINR(f.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lead-Time Curve */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-semibold'>Sector Lead-Time Curve</CardTitle>
              <CardDescription className='text-xs'>Fare increase towards T+1 departure.</CardDescription>
            </CardHeader>
            <CardContent className='pt-2'>
              <div className='h-[210px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={data?.leadTimeCurve || []} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' className='stroke-border/50' vertical={false} />
                    <XAxis dataKey='leadTime' tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload
                          return (
                            <div className='rounded-lg border bg-popover p-2 shadow-md text-xs'>
                              <div className='font-semibold'>{item.leadTime} Advance</div>
                              <div className='font-mono font-bold'>{formatINR(item.avgFare)}</div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Line type='monotone' dataKey='avgFare' stroke='#0284c7' strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Fare Distribution Bins */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-semibold'>Fare Distribution Histogram</CardTitle>
              <CardDescription className='text-xs'>Ticket price quote concentration.</CardDescription>
            </CardHeader>
            <CardContent className='pt-2 space-y-2.5'>
              {(data?.fareDistribution || []).map((bin, i) => (
                <div key={i} className='space-y-1 text-xs'>
                  <div className='flex justify-between'>
                    <span className='font-mono'>{bin.range}</span>
                    <span className='text-muted-foreground font-mono'>{bin.count} quotes ({bin.percentage}%)</span>
                  </div>
                  <div className='h-2 w-full bg-muted rounded-full overflow-hidden'>
                    <div className='h-full bg-primary rounded-full' style={{ width: `${bin.percentage * 2.5}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Fare Quotes Table for Route */}
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-base font-semibold'>Recent Collected Quotes on {selectedRouteId}</CardTitle>
                <CardDescription className='text-xs mt-0.5'>
                  Live flight quotes with fee breakdowns, source attribution, and seat availability.
                </CardDescription>
              </div>
              <Badge variant='outline' className='text-xs font-mono'>{filteredQuotes.length} Records</Badge>
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <table className='w-full text-xs text-left border-collapse'>
                <thead>
                  <tr className='border-y bg-muted/40 text-muted-foreground'>
                    <th className='p-3 font-medium'>Flight</th>
                    <th className='p-3 font-medium'>Airline</th>
                    <th className='p-3 font-medium'>Lead Time</th>
                    <th className='p-3 font-medium'>Fare Class</th>
                    <th className='p-3 font-medium text-right'>Base Fare</th>
                    <th className='p-3 font-medium text-right'>Taxes & Fees</th>
                    <th className='p-3 font-medium text-right'>Total Fare</th>
                    <th className='p-3 font-medium'>Availability</th>
                    <th className='p-3 font-medium'>Source</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border/60'>
                  {filteredQuotes.map((q) => (
                    <tr key={q.id} className='hover:bg-muted/30 transition-colors'>
                      <td className='p-3 font-mono font-semibold text-foreground'>{q.flightNumber}</td>
                      <td className='p-3 text-muted-foreground'>{q.airline}</td>
                      <td className='p-3 font-mono text-muted-foreground'>T+{q.advanceDays}</td>
                      <td className='p-3 text-muted-foreground'>{q.fareClass}</td>
                      <td className='p-3 font-mono text-right text-foreground'>{formatINR(q.baseFare)}</td>
                      <td className='p-3 font-mono text-right text-muted-foreground'>{formatINR(q.taxes + q.udf + q.convenienceFee)}</td>
                      <td className='p-3 font-mono font-bold text-right text-foreground'>{formatINR(q.totalFare)}</td>
                      <td className='p-3'>
                        <span className={`text-[11px] font-medium ${
                          q.availability === 'Available' ? 'text-emerald-600' :
                          q.availability.includes('Low Seats') ? 'text-rose-600' : 'text-amber-600'
                        }`}>
                          {q.availability}
                        </span>
                      </td>
                      <td className='p-3 font-mono text-[11px] text-muted-foreground'>{q.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
