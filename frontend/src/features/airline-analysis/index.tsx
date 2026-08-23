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
import { airfareApi } from '@/services/api'
import { type AirlineInfo, type LeadTimeWindowInfo } from '@/lib/mock/data'
import { formatINR } from '@/lib/utils/format'
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
} from 'recharts'


export function AirlineAnalysisPage() {
  const [airlines, setAirlines] = useState<AirlineInfo[]>([])
  const [leadTimeSeries, setLeadTimeSeries] = useState<LeadTimeWindowInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [airls, lt] = await Promise.all([
          airfareApi.getAirlineComparison(),
          airfareApi.getLeadTimeAnalysis(),
        ])
        setAirlines(airls)
        setLeadTimeSeries(lt.series)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Stacked fee composition data
  const fareCompositionData = airlines.map((a) => ({
    name: a.shortName,
    base: Math.round(a.avgFare * (a.baseRatio / 100)),
    tax: Math.round(a.avgFare * (a.taxRatio / 100)),
    fees: Math.round(a.avgFare * (a.feeRatio / 100)),
    total: a.avgFare,
  }))

  return (
    <>
      <AirfarexHeader title='Domestic Carrier Price & Fleet Intelligence' />
      <Main className='space-y-6'>
        {/* Page Header */}
        <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b pb-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Airline Analysis</h1>
            <p className='text-sm text-muted-foreground mt-0.5'>
              Comparative price dispersion, volatility, route network coverage, and lead-time yield behavior across Indian carriers.
            </p>
          </div>
          <Badge variant='outline' className='font-mono text-xs w-fit'>5 Tracked Operators</Badge>
        </div>

        {/* 5 Airline Headline KPI Cards */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
          {loading ? (
            [...Array(5)].map((_, i) => <Skeleton key={i} className='h-32 w-full' />)
          ) : (
            airlines.map((a) => (
              <Card key={a.code} className='border-t-4' style={{ borderTopColor: a.color }}>
                <CardHeader className='pb-1 text-xs font-semibold uppercase flex flex-row items-center justify-between'>
                  <span>{a.shortName}</span>
                  <span className='font-mono text-muted-foreground'>{a.code}</span>
                </CardHeader>
                <CardContent className='space-y-1.5 pt-1'>
                  <div className='text-2xl font-bold font-mono text-foreground'>{formatINR(a.avgFare)}</div>
                  <div className='text-[11px] text-muted-foreground space-y-0.5'>
                    <div className='flex justify-between'>
                      <span>Quote Share:</span>
                      <span className='font-mono font-medium text-foreground'>{a.quoteShare}%</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Seat Availability:</span>
                      <span className='font-mono font-medium text-emerald-600 dark:text-emerald-400'>{a.availabilityRate}%</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Network Reach:</span>
                      <span className='font-mono font-medium text-foreground'>{a.routeCoverage} / 25 routes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 2-Column: Lead-Time Curve by Carrier | Fare Composition */}
        <div className='grid gap-6 lg:grid-cols-2'>
          {/* Multi-Carrier Lead-Time Pricing Curve */}
          <Card>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-sm font-semibold'>Carrier Lead-Time Pricing Strategies (T+1 to T+45)</CardTitle>
                <Badge variant='outline' className='text-[10px]'>Yield Decay</Badge>
              </div>
              <CardDescription className='text-xs'>
                Airfare escalation curves as departure date approaches.
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-2'>
              <div className='h-[260px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={leadTimeSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' className='stroke-border/50' vertical={false} />
                    <XAxis dataKey='leadTime' tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className='rounded-lg border bg-popover p-2.5 shadow-md text-xs space-y-1'>
                              <div className='font-semibold'>{label} Advance Window</div>
                              {payload.map((entry) => (
                                <div key={entry.name} className='flex justify-between gap-4'>
                                  <span style={{ color: entry.color }}>{entry.name}:</span>
                                  <span className='font-mono font-bold'>{formatINR(Number(entry.value))}</span>
                                </div>
                              ))}
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type='monotone' name='IndiGo' dataKey='indigoFare' stroke='#0284c7' strokeWidth={2} dot={{ r: 3 }} />
                    <Line type='monotone' name='Air India' dataKey='airIndiaFare' stroke='#dc2626' strokeWidth={2} dot={{ r: 3 }} />
                    <Line type='monotone' name='AI Express' dataKey='aiExpressFare' stroke='#ea580c' strokeWidth={1.5} dot={{ r: 3 }} />
                    <Line type='monotone' name='Akasa Air' dataKey='akasaFare' stroke='#f97316' strokeWidth={1.5} dot={{ r: 3 }} />
                    <Line type='monotone' name='SpiceJet' dataKey='spicejetFare' stroke='#b91c1c' strokeWidth={1.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Stacked Fare Fee Composition */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-semibold'>Fare Component Breakdown (₹)</CardTitle>
              <CardDescription className='text-xs'>
                Base fare portion vs. fuel/GST taxes and airport UDF/convenience fees.
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-2'>
              <div className='h-[260px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={fareCompositionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' className='stroke-border/50' vertical={false} />
                    <XAxis dataKey='name' tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const total = payload.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)
                          return (
                            <div className='rounded-lg border bg-popover p-2.5 shadow-md text-xs space-y-1'>
                              <div className='font-semibold'>{label} (Total: {formatINR(total)})</div>
                              {payload.map((entry) => (
                                <div key={entry.name} className='flex justify-between gap-4'>
                                  <span style={{ color: entry.color }}>{entry.name}:</span>
                                  <span className='font-mono'>{formatINR(Number(entry.value))}</span>
                                </div>
                              ))}
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey='base' name='Base Fare' stackId='a' fill='#0284c7' />
                    <Bar dataKey='tax' name='Taxes & GST' stackId='a' fill='#f59e0b' />
                    <Bar dataKey='fees' name='UDF & Fees' stackId='a' fill='#10b981' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2-Column: Volatility Ranking | Network Route Coverage */}
        <div className='grid gap-6 lg:grid-cols-2'>
          {/* Volatility Ranking */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-semibold'>Fare Volatility Index (%)</CardTitle>
              <CardDescription className='text-xs'>Price variance and dynamic surge intensity.</CardDescription>
            </CardHeader>
            <CardContent className='pt-2'>
              <div className='h-[200px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={airlines} layout='vertical' margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray='3 3' className='stroke-border/50' horizontal={false} />
                    <XAxis type='number' tick={{ fontSize: 11 }} unit='%' />
                    <YAxis type='category' dataKey='shortName' tick={{ fontSize: 11 }} width={80} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload as AirlineInfo
                          return (
                            <div className='rounded-lg border bg-popover p-2 shadow-md text-xs'>
                              <div className='font-semibold'>{item.name}</div>
                              <div>Volatility: {item.volatility}%</div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey='volatility' fill='#ea580c' radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Network Route Coverage */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-semibold'>Route Network Coverage</CardTitle>
              <CardDescription className='text-xs'>Number of top 25 domestic sectors operated.</CardDescription>
            </CardHeader>
            <CardContent className='pt-2'>
              <div className='h-[200px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={airlines} layout='vertical' margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray='3 3' className='stroke-border/50' horizontal={false} />
                    <XAxis type='number' domain={[0, 25]} tick={{ fontSize: 11 }} />
                    <YAxis type='category' dataKey='shortName' tick={{ fontSize: 11 }} width={80} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload as AirlineInfo
                          return (
                            <div className='rounded-lg border bg-popover p-2 shadow-md text-xs'>
                              <div className='font-semibold'>{item.name}</div>
                              <div>Operated Routes: {item.routeCoverage} / 25</div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey='routeCoverage' fill='#0284c7' radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Airline Comparison Master Table */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base font-semibold'>Carrier Intelligence Comparison Matrix</CardTitle>
            <CardDescription className='text-xs'>
              Comprehensive summary of all 5 monitored airlines across pricing, market share, and operational metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <table className='w-full text-xs text-left border-collapse'>
                <thead>
                  <tr className='border-y bg-muted/40 text-muted-foreground'>
                    <th className='p-3 font-medium'>Airline</th>
                    <th className='p-3 font-medium'>Code</th>
                    <th className='p-3 font-medium text-right'>Avg Fare</th>
                    <th className='p-3 font-medium text-right'>Lowest Fare</th>
                    <th className='p-3 font-medium text-right'>Highest Fare</th>
                    <th className='p-3 font-medium text-right'>Quote Share</th>
                    <th className='p-3 font-medium text-right'>DGCA Share</th>
                    <th className='p-3 font-medium text-right'>Availability</th>
                    <th className='p-3 font-medium text-right'>Volatility</th>
                    <th className='p-3 font-medium text-right'>Routes</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border/60'>
                  {airlines.map((a) => (
                    <tr key={a.code} className='hover:bg-muted/30 transition-colors'>
                      <td className='p-3 font-semibold text-foreground flex items-center gap-2'>
                        <span className='size-2.5 rounded-full' style={{ backgroundColor: a.color }} />
                        {a.name}
                      </td>
                      <td className='p-3 font-mono text-muted-foreground'>{a.code}</td>
                      <td className='p-3 font-mono font-bold text-right text-foreground'>{formatINR(a.avgFare)}</td>
                      <td className='p-3 font-mono text-right text-emerald-600 dark:text-emerald-400'>{formatINR(a.lowestFare)}</td>
                      <td className='p-3 font-mono text-right text-rose-600 dark:text-rose-400'>{formatINR(a.highestFare)}</td>
                      <td className='p-3 font-mono text-right text-foreground'>{a.quoteShare}%</td>
                      <td className='p-3 font-mono text-right text-muted-foreground'>{a.marketPassengerShare}%</td>
                      <td className='p-3 font-mono text-right text-emerald-600 dark:text-emerald-400'>{a.availabilityRate}%</td>
                      <td className='p-3 font-mono text-right text-amber-600 dark:text-amber-400'>{a.volatility}%</td>
                      <td className='p-3 font-mono text-right text-foreground'>{a.routeCoverage} / 25</td>
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
