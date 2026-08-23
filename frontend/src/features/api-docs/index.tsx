import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { AirfarexHeader } from '@/components/layout/airfarex-header'
import {
  IconCode,
  IconCopy,
  IconCheck,
  IconTerminal2,
  IconArrowRight,
} from '@tabler/icons-react'
import { toast } from 'sonner'


interface EndpointDoc {
  id: string
  method: 'GET'
  path: string
  title: string
  description: string
  params?: { name: string; type: string; required: boolean; description: string }[]
  curlExample: string
  jsonResponse: string
}

const ENDPOINTS: EndpointDoc[] = [
  {
    id: 'index-current',
    method: 'GET',
    path: '/api/v1/index/current',
    title: 'Get Current APIx Index',
    description: 'Retrieves the latest real-time Airfare Price Index value, base period, and MoM/YoY growth rates.',
    curlExample: `curl -X GET "https://api.airfarex.gov.in/api/v1/index/current" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Accept: application/json"`,
    jsonResponse: JSON.stringify(
      {
        status: 'success',
        data: {
          currentIndex: 128.64,
          basePeriod: 'January 2026 = 100',
          changes: {
            daily: 0.4,
            weekly: 1.2,
            monthlyMoM: 4.2,
            ytd: 28.64,
          },
          avgDomesticFare: 5842,
          routesTracked: 25,
          dataQualityScore: 95.6,
          lastUpdated: '2026-08-23T09:30:00+05:30',
        },
      },
      null,
      2
    ),
  },
  {
    id: 'index-history',
    method: 'GET',
    path: '/api/v1/index/history',
    title: 'Get Historical APIx Series',
    description: 'Retrieves time-series observations of APIx with sub-indices for custom historical windows.',
    params: [
      { name: 'range', type: 'string', required: false, description: 'Time horizon: 7D, 30D, 90D, 1Y (default: 30D)' },
      { name: 'includeSubIndices', type: 'boolean', required: false, description: 'Include Metro-Metro, Tier-2 index breakdowns' },
    ],
    curlExample: `curl -X GET "https://api.airfarex.gov.in/api/v1/index/history?range=30D" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    jsonResponse: JSON.stringify(
      {
        status: 'success',
        range: '30D',
        count: 30,
        data: [
          { date: '2026-08-22', apix: 128.52, dgcaRef: 128.15, avgFare: 5838, metroMetroIndex: 131.0 },
          { date: '2026-08-23', apix: 128.64, dgcaRef: 128.25, avgFare: 5842, metroMetroIndex: 131.2 },
        ],
      },
      null,
      2
    ),
  },
  {
    id: 'fares',
    method: 'GET',
    path: '/api/v1/fares',
    title: 'Query Flight Fare Quotes',
    description: 'Searches multi-source flight quotes across direct airline sites and OTA scrapers with filtering.',
    params: [
      { name: 'origin', type: 'string', required: false, description: '3-letter IATA code (e.g. DEL)' },
      { name: 'destination', type: 'string', required: false, description: '3-letter IATA code (e.g. BOM)' },
      { name: 'airline', type: 'string', required: false, description: 'Airline code (e.g. 6E, AI, IX, QP, SG)' },
      { name: 'source', type: 'string', required: false, description: 'Quote source (e.g. IndiGo.com, MakeMyTrip)' },
      { name: 'limit', type: 'integer', required: false, description: 'Number of results (max 200, default 50)' },
    ],
    curlExample: `curl -X GET "https://api.airfarex.gov.in/api/v1/fares?origin=DEL&destination=BOM&limit=2" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    jsonResponse: JSON.stringify(
      {
        status: 'success',
        count: 2,
        data: [
          {
            id: 'QT-1001',
            timestamp: '2026-08-23T09:15:12+05:30',
            origin: 'DEL',
            destination: 'BOM',
            airline: 'IndiGo',
            flightNumber: '6E-204',
            departureDate: '2026-08-24',
            advanceDays: 1,
            baseFare: 4622,
            taxes: 1155,
            udf: 385,
            totalFare: 6420,
            availability: 'Available',
            source: 'IndiGo.com',
          },
        ],
      },
      null,
      2
    ),
  },
  {
    id: 'routes',
    method: 'GET',
    path: '/api/v1/routes',
    title: 'List Tracked Route Corridors',
    description: 'Returns the 25 key domestic routes with current average fare, weights, and volatility.',
    curlExample: `curl -X GET "https://api.airfarex.gov.in/api/v1/routes" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    jsonResponse: JSON.stringify(
      {
        status: 'success',
        routesCount: 25,
        data: [
          {
            id: 'DEL-BOM',
            origin: 'DEL',
            destination: 'BOM',
            distanceKm: 1148,
            weight: 14.8,
            avgFare: 6420,
            currentIndex: 132.4,
            monthlyChange: 5.8,
            status: 'surge',
          },
        ],
      },
      null,
      2
    ),
  },
  {
    id: 'route-lead-time',
    method: 'GET',
    path: '/api/v1/routes/:route/lead-time',
    title: 'Route Lead-Time Elasticity',
    description: 'Retrieves advance booking pricing decay curves (T+1 to T+45) for a specific route.',
    params: [
      { name: 'route', type: 'string', required: true, description: 'Route corridor ID (e.g. DEL-BOM)' },
    ],
    curlExample: `curl -X GET "https://api.airfarex.gov.in/api/v1/routes/DEL-BOM/lead-time" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    jsonResponse: JSON.stringify(
      {
        status: 'success',
        route: 'DEL-BOM',
        series: [
          { leadTime: 'T+1', avgFare: 10850, multiplier: 2.25 },
          { leadTime: 'T+7', avgFare: 7540, multiplier: 1.56 },
          { leadTime: 'T+15', avgFare: 5980, multiplier: 1.24 },
          { leadTime: 'T+30', avgFare: 4920, multiplier: 1.02 },
          { leadTime: 'T+45', avgFare: 4820, multiplier: 1.0 },
        ],
      },
      null,
      2
    ),
  },
  {
    id: 'airlines',
    method: 'GET',
    path: '/api/v1/airlines',
    title: 'Airline Comparison Summary',
    description: 'Returns price dispersion, quote share, availability, and scraper latency for 5 tracked carriers.',
    curlExample: `curl -X GET "https://api.airfarex.gov.in/api/v1/airlines" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    jsonResponse: JSON.stringify(
      {
        status: 'success',
        count: 5,
        data: [
          {
            code: '6E',
            name: 'IndiGo',
            avgFare: 5540,
            quoteShare: 59.2,
            availabilityRate: 98.4,
            scraperStatus: 'operational',
            scraperLatencyMs: 142,
          },
        ],
      },
      null,
      2
    ),
  },
  {
    id: 'system-status',
    method: 'GET',
    path: '/api/v1/system/status',
    title: 'Scraper Pipeline Health & Metrics',
    description: 'Returns ingestion health, active scrapers, error rates, and cron pipeline execution stages.',
    curlExample: `curl -X GET "https://api.airfarex.gov.in/api/v1/system/status" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    jsonResponse: JSON.stringify(
      {
        status: 'success',
        pipeline: {
          lastScrapeTime: '2026-08-23T09:28:40+05:30',
          recordsCollected: 12480,
          recordsValidated: 11931,
          dataQualityScore: 95.6,
          apiUptime: 99.98,
          activeScrapers: 5,
        },
      },
      null,
      2
    ),
  },
]

export function ApiDocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDoc>(ENDPOINTS[0])
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <AirfarexHeader title='REST API Documentation & Explorer' />
      <Main className='space-y-6'>
        {/* Page Header */}
        <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b pb-4'>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-2xl font-bold tracking-tight'>API Documentation</h1>
              <Badge variant='outline' className='font-mono text-xs'>v1.0 REST</Badge>
            </div>
            <p className='text-sm text-muted-foreground mt-0.5'>
              Programmatic access to real-time airfare indices, sector pricing curves, and raw quote feeds.
            </p>
          </div>
          <div className='flex items-center gap-2 text-xs font-mono text-muted-foreground bg-muted/40 p-2 px-3 rounded-lg border'>
            <span className='size-2 rounded-full bg-emerald-500' />
            <span>Base URL: https://api.airfarex.gov.in</span>
          </div>
        </div>

        {/* 2-Column: Endpoints List Sidebar | Detailed Explorer */}
        <div className='grid gap-6 lg:grid-cols-12'>
          {/* Left Column: Endpoints Navigation (4 cols) */}
          <div className='lg:col-span-4 space-y-2'>
            <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2'>
              Available Endpoints ({ENDPOINTS.length})
            </span>
            <div className='space-y-1.5'>
              {ENDPOINTS.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex items-center justify-between ${
                    selectedEndpoint.id === ep.id
                      ? 'bg-primary/10 border-primary text-foreground font-semibold shadow-sm'
                      : 'bg-card hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <div className='space-y-0.5'>
                    <div className='flex items-center gap-2'>
                      <Badge variant='outline' className='font-mono text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30'>
                        {ep.method}
                      </Badge>
                      <span className='font-mono font-medium text-foreground text-[11px]'>{ep.path}</span>
                    </div>
                    <div className='text-[11px] text-muted-foreground truncate'>{ep.title}</div>
                  </div>
                  <IconArrowRight className={`size-3.5 ${selectedEndpoint.id === ep.id ? 'text-primary' : 'text-transparent'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Selected Endpoint Spec (8 cols) */}
          <div className='lg:col-span-8 space-y-4'>
            <Card>
              <CardHeader className='pb-3'>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='font-mono text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30'>
                    {selectedEndpoint.method}
                  </Badge>
                  <CardTitle className='font-mono text-base'>{selectedEndpoint.path}</CardTitle>
                </div>
                <CardDescription className='text-xs mt-1'>{selectedEndpoint.description}</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4 pt-1'>
                {/* Parameters Table */}
                {selectedEndpoint.params && (
                  <div>
                    <span className='text-xs font-semibold uppercase text-muted-foreground block mb-1.5'>
                      Query Parameters
                    </span>
                    <div className='rounded border overflow-hidden'>
                      <table className='w-full text-xs text-left border-collapse'>
                        <thead>
                          <tr className='bg-muted/40 text-muted-foreground border-b'>
                            <th className='p-2 font-medium'>Parameter</th>
                            <th className='p-2 font-medium'>Type</th>
                            <th className='p-2 font-medium'>Required</th>
                            <th className='p-2 font-medium'>Description</th>
                          </tr>
                        </thead>
                        <tbody className='divide-y'>
                          {selectedEndpoint.params.map((p) => (
                            <tr key={p.name} className='hover:bg-muted/20'>
                              <td className='p-2 font-mono font-semibold text-primary'>{p.name}</td>
                              <td className='p-2 font-mono text-muted-foreground'>{p.type}</td>
                              <td className='p-2'>
                                {p.required ? (
                                  <span className='text-rose-600 font-semibold text-[10px] uppercase'>Required</span>
                                ) : (
                                  <span className='text-muted-foreground text-[10px] uppercase'>Optional</span>
                                )}
                              </td>
                              <td className='p-2 text-muted-foreground'>{p.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* cURL Request Snippet */}
                <div>
                  <div className='flex items-center justify-between mb-1.5'>
                    <span className='text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5'>
                      <IconTerminal2 className='size-3.5' />
                      Example Request (cURL)
                    </span>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => copyToClipboard(selectedEndpoint.curlExample)}
                      className='h-7 text-xs gap-1'
                    >
                      {copied ? <IconCheck className='size-3 text-emerald-600' /> : <IconCopy className='size-3' />}
                      {copied ? 'Copied' : 'Copy cURL'}
                    </Button>
                  </div>
                  <pre className='p-3 rounded-lg bg-muted font-mono text-xs overflow-x-auto text-foreground border'>
                    {selectedEndpoint.curlExample}
                  </pre>
                </div>

                {/* Live JSON Response Preview */}
                <div>
                  <div className='flex items-center justify-between mb-1.5'>
                    <span className='text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5'>
                      <IconCode className='size-3.5' />
                      Response Body (200 OK)
                    </span>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => copyToClipboard(selectedEndpoint.jsonResponse)}
                      className='h-7 text-xs gap-1'
                    >
                      {copied ? <IconCheck className='size-3 text-emerald-600' /> : <IconCopy className='size-3' />}
                      {copied ? 'Copied' : 'Copy JSON'}
                    </Button>
                  </div>
                  <pre className='p-3 rounded-lg bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto border max-h-[300px]'>
                    {selectedEndpoint.jsonResponse}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}

