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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Main } from '@/components/layout/main'
import { AirfarexHeader } from '@/components/layout/airfarex-header'
import { airfareApi, type HeatmapData, type HeatmapCell } from '@/services/api'
import { formatINR, formatPercent } from '@/lib/utils/format'
import { IconInfoCircle } from '@tabler/icons-react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function RouteHeatmapPage() {
  const [data, setData] = useState<HeatmapData | null>(null)
  const [metric, setMetric] = useState<'avgFare' | 'priceChange' | 'currentIndex'>('avgFare')
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const res = await airfareApi.getRouteHeatmap()
        setData(res)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const airports = data?.airports || []
  const matrix = data?.matrix || {}

  // Color interpolation for heatmap cells
  const getCellColor = (cell: HeatmapCell | null) => {
    if (!cell) return 'bg-muted/30 text-muted-foreground/40' // Same city diagonal

    if (metric === 'avgFare') {
      const fare = cell.avgFare
      if (fare < 4000) return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
      if (fare < 5500) return 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/20'
      if (fare < 7000) return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
      return 'bg-rose-500/25 text-rose-700 dark:text-rose-300 border-rose-500/40 font-bold'
    }

    if (metric === 'priceChange') {
      const chg = cell.monthlyChange
      if (chg <= 0) return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
      if (chg < 4) return 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
      if (chg < 8) return 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
      return 'bg-rose-500/25 text-rose-700 dark:text-rose-300 font-bold'
    }

    // currentIndex
    const idx = cell.currentIndex
    if (idx < 122) return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
    if (idx < 128) return 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
    if (idx < 134) return 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
    return 'bg-rose-500/25 text-rose-700 dark:text-rose-300 font-bold'
  }

  const formatCellValue = (cell: HeatmapCell | null) => {
    if (!cell) return '—'
    if (metric === 'avgFare') return formatINR(cell.avgFare)
    if (metric === 'priceChange') return formatPercent(cell.monthlyChange)
    return cell.currentIndex.toFixed(1)
  }

  const airportCityNames: Record<string, string> = {
    DEL: 'Delhi',
    BOM: 'Mumbai',
    BLR: 'Bengaluru',
    CCU: 'Kolkata',
    HYD: 'Hyderabad',
    MAA: 'Chennai',
    PNQ: 'Pune',
    AMD: 'Ahmedabad',
    COK: 'Kochi',
  }

  return (
    <>
      <AirfarexHeader title='Route Price Matrix Heatmap' />
      <Main className='space-y-6'>
        {/* Page Header & Metric Switcher */}
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Origin × Destination Price Heatmap</h1>
            <p className='text-sm text-muted-foreground mt-0.5'>
              Bi-directional spatial matrix across 9 key Indian metro and regional hubs.
            </p>
          </div>

          <Tabs
            value={metric}
            onValueChange={(val) => setMetric(val as any)}
            className='w-auto'
          >
            <TabsList>
              <TabsTrigger value='avgFare' className='text-xs'>Average Fare (₹)</TabsTrigger>
              <TabsTrigger value='priceChange' className='text-xs'>Monthly Change %</TabsTrigger>
              <TabsTrigger value='currentIndex' className='text-xs'>Route APIx</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Heatmap Legend Bar */}
        <div className='flex flex-wrap items-center justify-between gap-4 p-3 rounded-lg border bg-muted/20 text-xs'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <IconInfoCircle className='size-4 text-primary' />
            <span>Rows: <strong>Origin</strong> · Columns: <strong>Destination</strong>. Click or hover any cell for route analytics.</span>
          </div>

          <div className='flex items-center gap-3'>
            <span className='text-muted-foreground text-[11px] font-medium'>Heat Intensity:</span>
            <div className='flex items-center gap-1.5'>
              <span className='size-3 rounded bg-emerald-500/30' />
              <span className='text-[11px] text-muted-foreground'>Low (&lt;₹4k / Stable)</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='size-3 rounded bg-sky-500/30' />
              <span className='text-[11px] text-muted-foreground'>Moderate</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='size-3 rounded bg-amber-500/30' />
              <span className='text-[11px] text-muted-foreground'>High</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='size-3 rounded bg-rose-500/40' />
              <span className='text-[11px] text-muted-foreground'>Surge (&gt;₹7k / High Inflation)</span>
            </div>
          </div>
        </div>

        {/* Heatmap Matrix Grid */}
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base font-semibold'>9 × 9 Sector Pricing Grid</CardTitle>
            <CardDescription className='text-xs'>
              Showing {metric === 'avgFare' ? 'Average Unit Domestic Fare (INR)' : metric === 'priceChange' ? 'Month-over-Month Price Growth (%)' : 'Current Route Price Index (APIx)'}
            </CardDescription>
          </CardHeader>
          <CardContent className='p-4 pt-2 overflow-x-auto'>
            {loading ? (
              <Skeleton className='h-[420px] w-full' />
            ) : (
              <TooltipProvider delayDuration={100}>
                <div className='min-w-[700px]'>
                  <table className='w-full border-collapse text-center text-xs'>
                    <thead>
                      <tr>
                        <th className='p-2 font-semibold text-muted-foreground border-b border-r bg-muted/40 text-left text-[11px]'>
                          Origin \ Dest
                        </th>
                        {airports.map((dest) => (
                          <th key={dest} className='p-2 font-mono font-bold text-foreground border-b bg-muted/20'>
                            <div>{dest}</div>
                            <div className='text-[9px] font-normal text-muted-foreground'>{airportCityNames[dest]}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {airports.map((origin) => (
                        <tr key={origin}>
                          <th className='p-2 font-mono font-bold text-foreground border-r bg-muted/20 text-left'>
                            <div>{origin}</div>
                            <div className='text-[9px] font-normal text-muted-foreground'>{airportCityNames[origin]}</div>
                          </th>
                          {airports.map((dest) => {
                            const cell = matrix[origin]?.[dest] || null
                            return (
                              <td key={`${origin}-${dest}`} className='p-1 border border-border/40'>
                                {cell ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div
                                        onMouseEnter={() => setHoveredCell(cell)}
                                        className={`h-11 flex flex-col items-center justify-center rounded cursor-pointer transition-all border ${getCellColor(
                                          cell
                                        )} hover:scale-105 hover:shadow-md`}
                                      >
                                        <span className='font-mono font-bold text-[11px]'>{formatCellValue(cell)}</span>
                                        <span className='text-[9px] opacity-75'>{cell.carrierCount} airlines</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side='top' className='p-3 text-xs space-y-1 bg-popover shadow-lg'>
                                      <div className='font-bold text-foreground border-b pb-1'>
                                        {cell.routeId} ({airportCityNames[origin]} ➔ {airportCityNames[dest]})
                                      </div>
                                      <div className='flex justify-between gap-4'>
                                        <span className='text-muted-foreground'>Avg Fare:</span>
                                        <span className='font-mono font-bold text-foreground'>{formatINR(cell.avgFare)}</span>
                                      </div>
                                      <div className='flex justify-between gap-4'>
                                        <span className='text-muted-foreground'>Monthly Change:</span>
                                        <span className='font-mono font-bold text-rose-600 dark:text-rose-400'>
                                          {formatPercent(cell.monthlyChange)}
                                        </span>
                                      </div>
                                      <div className='flex justify-between gap-4'>
                                        <span className='text-muted-foreground'>Route Index:</span>
                                        <span className='font-mono font-bold text-primary'>{cell.currentIndex.toFixed(1)}</span>
                                      </div>
                                      <div className='flex justify-between gap-4'>
                                        <span className='text-muted-foreground'>Daily Sampled Quotes:</span>
                                        <span className='font-mono'>{cell.dailyQuotes}</span>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <div className='h-11 flex items-center justify-center rounded bg-muted/20 text-muted-foreground text-[10px] font-mono'>
                                    —
                                  </div>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TooltipProvider>
            )}
          </CardContent>
        </Card>

        {/* Selected / Hovered Hub Preview Panel */}
        {hoveredCell && (
          <Card className='border-primary/40 bg-primary/5'>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-sm font-semibold'>
                  Active Corridor Insight: {hoveredCell.routeId} ({airportCityNames[hoveredCell.origin]} ➔ {airportCityNames[hoveredCell.destination]})
                </CardTitle>
                <Badge variant='outline' className='font-mono text-xs'>APIx {hoveredCell.currentIndex.toFixed(1)}</Badge>
              </div>
            </CardHeader>
            <CardContent className='grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1'>
              <div className='p-2 rounded bg-background border'>
                <span className='text-muted-foreground block text-[10px] uppercase'>Average Fare</span>
                <span className='text-base font-bold font-mono text-foreground'>{formatINR(hoveredCell.avgFare)}</span>
              </div>
              <div className='p-2 rounded bg-background border'>
                <span className='text-muted-foreground block text-[10px] uppercase'>MoM Price Growth</span>
                <span className='text-base font-bold font-mono text-rose-600 dark:text-rose-400'>
                  {formatPercent(hoveredCell.monthlyChange)}
                </span>
              </div>
              <div className='p-2 rounded bg-background border'>
                <span className='text-muted-foreground block text-[10px] uppercase'>Daily Quotes</span>
                <span className='text-base font-bold font-mono text-foreground'>{hoveredCell.dailyQuotes} / day</span>
              </div>
              <div className='p-2 rounded bg-background border'>
                <span className='text-muted-foreground block text-[10px] uppercase'>Operators Active</span>
                <span className='text-base font-bold font-mono text-foreground'>{hoveredCell.carrierCount} Carriers</span>
              </div>
            </CardContent>
          </Card>
        )}
      </Main>
    </>
  )
}
