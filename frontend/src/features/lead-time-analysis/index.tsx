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
import { type LeadTimeWindowInfo } from '@/lib/mock/data'
import { formatINR } from '@/lib/utils/format'
import {
  IconPercentage,
  IconFlame,
  IconTrendingDown,
  IconInfoCircle,
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
} from 'recharts'


export function LeadTimeAnalysisPage() {
  const [data, setData] = useState<{
    series: LeadTimeWindowInfo[]
    summary: {
      highestLeadTimePremium: { route: string; premiumPercent: number; t1Fare: number; t45Fare: number }
      avgEarlyBookingSavingsPercent: number
      mostPriceSensitiveRoute: { route: string; priceElasticityRatio: number }
    }
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const res = await airfareApi.getLeadTimeAnalysis()
        setData(res)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const series = data?.series || []
  const summary = data?.summary

  return (
    <>
      <AirfarexHeader title='Advance Purchase Elasticity & Lead-Time Decay' />
      <Main className='space-y-6'>
        {/* Page Header */}
        <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b pb-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Lead-Time Elasticity Analysis</h1>
            <p className='text-sm text-muted-foreground mt-0.5'>
              Airfare dynamic yield trajectories from same-day / next-day departure (T+1) to 45 days in advance (T+45).
            </p>
          </div>
          <div className='p-2 px-3 rounded-lg border bg-muted/30 text-xs text-muted-foreground flex items-center gap-1.5'>
            <IconInfoCircle className='size-4 text-primary' />
            <span>Lead-time elasticity shows how airfare changes as the booking window increases.</span>
          </div>
        </div>

        {/* 3 Summary Analytics Cards */}
        <div className='grid gap-4 sm:grid-cols-3'>
          {/* Card 1: Highest Lead-Time Premium */}
          <Card className='border-l-4 border-l-rose-500'>
            <CardHeader className='pb-1 text-xs font-semibold uppercase text-muted-foreground flex flex-row items-center justify-between'>
              <span>Highest Lead-Time Premium</span>
              <IconFlame className='size-4 text-rose-500' />
            </CardHeader>
            <CardContent className='pt-1'>
              {loading || !summary ? (
                <Skeleton className='h-16 w-full' />
              ) : (
                <div>
                  <div className='flex items-baseline justify-between'>
                    <span className='text-2xl font-bold font-mono text-rose-600 dark:text-rose-400'>
                      +{summary.highestLeadTimePremium.premiumPercent}%
                    </span>
                    <span className='font-mono font-bold text-foreground text-sm'>{summary.highestLeadTimePremium.route}</span>
                  </div>
                  <div className='text-xs text-muted-foreground mt-1'>
                    T+1: {formatINR(summary.highestLeadTimePremium.t1Fare)} vs T+45: {formatINR(summary.highestLeadTimePremium.t45Fare)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Average Early-Booking Savings */}
          <Card className='border-l-4 border-l-emerald-500'>
            <CardHeader className='pb-1 text-xs font-semibold uppercase text-muted-foreground flex flex-row items-center justify-between'>
              <span>Average Early-Booking Savings</span>
              <IconTrendingDown className='size-4 text-emerald-500' />
            </CardHeader>
            <CardContent className='pt-1'>
              {loading || !summary ? (
                <Skeleton className='h-16 w-full' />
              ) : (
                <div>
                  <div className='text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400'>
                    {summary.avgEarlyBookingSavingsPercent}%
                  </div>
                  <div className='text-xs text-muted-foreground mt-1'>
                    Average discount booking at T+45 window vs last-minute T+1
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Most Price-Sensitive Route */}
          <Card className='border-l-4 border-l-sky-500'>
            <CardHeader className='pb-1 text-xs font-semibold uppercase text-muted-foreground flex flex-row items-center justify-between'>
              <span>Most Price-Sensitive Route</span>
              <IconPercentage className='size-4 text-sky-500' />
            </CardHeader>
            <CardContent className='pt-1'>
              {loading || !summary ? (
                <Skeleton className='h-16 w-full' />
              ) : (
                <div>
                  <div className='flex items-baseline justify-between'>
                    <span className='text-2xl font-bold font-mono text-foreground'>
                      {summary.mostPriceSensitiveRoute.priceElasticityRatio}x
                    </span>
                    <span className='font-mono font-bold text-primary text-sm'>{summary.mostPriceSensitiveRoute.route}</span>
                  </div>
                  <div className='text-xs text-muted-foreground mt-1'>
                    Extreme demand surge coefficient on tech-corridor
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Master Chart: Avg Fare vs Advance Purchase Window by Airline */}
        <Card>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-base font-semibold'>Carrier Yield Decay Curves: T+1 ➔ T+45</CardTitle>
                <CardDescription className='text-xs mt-0.5'>
                  Comparative progression of unit fares by booking lead-time across IndiGo, Air India, AI Express, Akasa, and SpiceJet.
                </CardDescription>
              </div>
              <Badge variant='outline' className='text-xs'>5 Advance Windows</Badge>
            </div>
          </CardHeader>
          <CardContent className='pt-2'>
            <div className='h-[320px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={series} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray='3 3' className='stroke-border/50' vertical={false} />
                  <XAxis dataKey='leadTime' tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className='rounded-lg border bg-popover p-3 shadow-md text-xs space-y-1.5'>
                            <div className='font-semibold text-foreground border-b pb-1'>{label} Booking Window</div>
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
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Line type='monotone' name='IndiGo (6E)' dataKey='indigoFare' stroke='#0284c7' strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type='monotone' name='Air India (AI)' dataKey='airIndiaFare' stroke='#dc2626' strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type='monotone' name='AI Express (IX)' dataKey='aiExpressFare' stroke='#ea580c' strokeWidth={2} dot={{ r: 4 }} />
                  <Line type='monotone' name='Akasa Air (QP)' dataKey='akasaFare' stroke='#f97316' strokeWidth={2} dot={{ r: 4 }} />
                  <Line type='monotone' name='SpiceJet (SG)' dataKey='spicejetFare' stroke='#b91c1c' strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 2-Column: Multiplier Ladder | Advance Tier Breakdown Table */}
        <div className='grid gap-6 lg:grid-cols-2'>
          {/* Price Multiplier Ladder vs T+45 Base */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-semibold'>Last-Minute Price Surge Multiplier</CardTitle>
              <CardDescription className='text-xs'>
                Relative price multiple compared with baseline advance fare (T+45 = 1.0x).
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-2'>
              <div className='h-[230px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' className='stroke-border/50' vertical={false} />
                    <XAxis dataKey='leadTime' tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 3]} tick={{ fontSize: 11 }} tickFormatter={(val) => `${val}x`} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload as LeadTimeWindowInfo
                          return (
                            <div className='rounded-lg border bg-popover p-2.5 shadow-md text-xs space-y-1'>
                              <div className='font-semibold'>{item.leadTime} Advance</div>
                              <div>Multiplier: <span className='font-mono font-bold'>{item.multiplier.toFixed(2)}x</span></div>
                              <div>Industry Avg: <span className='font-mono'>{formatINR(item.avgFare)}</span></div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey='multiplier' fill='#0284c7' radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Lead-Time Window Summary Matrix */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-semibold'>Lead-Time Tier Matrix</CardTitle>
              <CardDescription className='text-xs'>Summary of domestic market averages by purchase window.</CardDescription>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='overflow-x-auto'>
                <table className='w-full text-xs text-left border-collapse'>
                  <thead>
                    <tr className='border-y bg-muted/40 text-muted-foreground'>
                      <th className='p-2.5 font-medium'>Window</th>
                      <th className='p-2.5 font-medium'>Days Out</th>
                      <th className='p-2.5 font-medium text-right'>Industry Avg</th>
                      <th className='p-2.5 font-medium text-right'>Multiplier</th>
                      <th className='p-2.5 font-medium text-right'>IndiGo</th>
                      <th className='p-2.5 font-medium text-right'>Air India</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border/60'>
                    {series.map((row) => (
                      <tr key={row.leadTime} className='hover:bg-muted/30'>
                        <td className='p-2.5 font-mono font-bold text-foreground'>{row.leadTime}</td>
                        <td className='p-2.5 text-muted-foreground'>{row.days} days</td>
                        <td className='p-2.5 font-mono font-bold text-right text-foreground'>{formatINR(row.avgFare)}</td>
                        <td className='p-2.5 font-mono text-right text-rose-600 dark:text-rose-400 font-semibold'>{row.multiplier.toFixed(2)}x</td>
                        <td className='p-2.5 font-mono text-right text-muted-foreground'>{formatINR(row.indigoFare)}</td>
                        <td className='p-2.5 font-mono text-right text-muted-foreground'>{formatINR(row.airIndiaFare)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
