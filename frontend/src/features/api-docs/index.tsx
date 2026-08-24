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
  IconShieldLock,
} from '@tabler/icons-react'
import { toast } from 'sonner'

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

interface EndpointDoc {
  id: string
  method: 'GET' | 'POST'
  path: string
  title: string
  roles: string
  description: string
  params?: { name: string; type: string; required: boolean; description: string }[]
  curlExample: string
  jsonResponse: string
}

const ENDPOINTS: EndpointDoc[] = [
  {
    id: 'health',
    method: 'GET',
    path: '/health',
    title: 'Health Check',
    roles: 'Public / All Roles',
    description: 'System liveness and heartbeat check.',
    curlExample: 'curl -X GET "' + BACKEND_BASE_URL + '/health"',
    jsonResponse: JSON.stringify({ status: 'ok' }, null, 2),
  },
  {
    id: 'ml-status',
    method: 'GET',
    path: '/api/ml/status',
    title: 'ML Model Metadata & Metrics',
    roles: 'Viewer, Analyst, Admin',
    description: 'Retrieves active scikit-learn model architecture, feature requirements, and R2 / MAE / RMSE evaluation metrics.',
    curlExample: 'curl -X GET "' + BACKEND_BASE_URL + '/api/ml/status" \\\n  -H "Authorization: Bearer YOUR_SESSION_TOKEN"',
    jsonResponse: JSON.stringify(
      {
        status: 'active',
        model_version: 'v1.4-rf-pipeline',
        model_name: 'Airfare Predictor (scikit-learn Pipeline)',
        features: ['origin', 'destination', 'airline', 'advance_days', 'day_of_week', 'month'],
        metrics: {
          mae: 288.5,
          rmse: 402.49,
          r2: 0.9653,
          mape: '4.41%',
        },
        directional_accuracy: '96.5%',
      },
      null,
      2
    ),
  },
  {
    id: 'ml-predict',
    method: 'POST',
    path: '/api/ml/predict',
    title: 'Real-Time Airfare Inference',
    roles: 'Analyst, Admin',
    description: 'Computes ML price prediction, prediction interval bounds, and lead-time curve elasticity recommendation.',
    params: [
      { name: 'origin', type: 'string', required: true, description: '3-letter airport code (e.g. DEL)' },
      { name: 'destination', type: 'string', required: true, description: '3-letter airport code (e.g. BOM)' },
      { name: 'airline', type: 'string', required: false, description: '2-letter airline carrier code (6E, AI, IX, QP, SG)' },
      { name: 'departure_date', type: 'string', required: false, description: 'Target flight date in YYYY-MM-DD format' },
      { name: 'advance_days', type: 'integer', required: false, description: 'Booking lead time in days (0-180)' },
    ],
    curlExample: 'curl -X POST "' + BACKEND_BASE_URL + '/api/ml/predict" \\\n  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "origin": "DEL",\n    "destination": "BOM",\n    "airline": "6E",\n    "advance_days": 15,\n    "departure_date": "2026-09-10"\n  }\'',
    jsonResponse: JSON.stringify(
      {
        origin: 'DEL',
        destination: 'BOM',
        airline: '6E',
        airline_name: 'IndiGo',
        advance_days: 17,
        departure_date: '2026-09-10',
        prediction: 5009.43,
        predicted_fare: 5009.43,
        lower_bound: 4633.72,
        upper_bound: 5385.14,
        currency: 'INR',
        confidence_score: 0.965,
        lead_time_multiplier: 1.0,
        recommendation: 'Optimal Booking Window',
        model_version: 'v1.4-rf-pipeline',
        model: 'Airfare Predictor (scikit-learn Pipeline)',
        status: 'success',
      },
      null,
      2
    ),
  },
  {
    id: 'routes',
    method: 'GET',
    path: '/api/routes',
    title: 'Route Intelligence Analysis',
    roles: 'Viewer, Analyst, Admin',
    description: 'Retrieves aggregated route-level median, minimum, maximum fares, distance, and weekly changes.',
    params: [
      { name: 'origin', type: 'string', required: false, description: 'Filter by origin airport' },
      { name: 'destination', type: 'string', required: false, description: 'Filter by destination airport' },
    ],
    curlExample: 'curl -X GET "' + BACKEND_BASE_URL + '/api/routes?origin=DEL&destination=BOM" \\\n  -H "Authorization: Bearer YOUR_SESSION_TOKEN"',
    jsonResponse: JSON.stringify(
      [
        {
          origin: 'DEL',
          destination: 'BOM',
          origin_city: 'Delhi',
          destination_city: 'Mumbai',
          distance_km: 1148,
          avg_fare: 5650,
          min_fare: 4100,
          max_fare: 11200,
          weekly_change: 2.4,
        },
      ],
      null,
      2
    ),
  },
  {
    id: 'scraper-run',
    method: 'POST',
    path: '/api/scraper/run',
    title: 'Execute Ingestion Job',
    roles: 'Admin Only',
    description: 'Triggers real-time distributed ingestion pipeline across domestic airline portals.',
    curlExample: 'curl -X POST "' + BACKEND_BASE_URL + '/api/scraper/run" \\\n  -H "Authorization: Bearer ADMIN_SESSION_TOKEN"',
    jsonResponse: JSON.stringify(
      {
        status: 'completed',
        executed_by: 'admin.test@airfarex.com',
        role: 'ADMIN',
        recordsIngested: 840,
        anomaliesDetected: 4,
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
    toast.success('Copied snippet to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <AirfarexHeader title='REST API Reference & Developer Documentation' />
      <Main className='space-y-6'>
        {/* Header */}
        <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b pb-4'>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-2xl font-bold tracking-tight'>Backend REST API Reference</h1>
              <Badge variant='outline' className='font-mono text-xs'>FastAPI v1.0</Badge>
            </div>
            <p className='text-sm text-muted-foreground mt-0.5'>
              Official endpoints for programmatic access to APIx index metrics, route intelligence, and ML predictions.
            </p>
          </div>
          <div className='flex items-center gap-2 text-xs font-mono p-2 px-3 rounded-lg border bg-muted/40'>
            <span className='text-muted-foreground'>Base URL:</span>
            <span className='font-semibold text-primary'>{BACKEND_BASE_URL}</span>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
          {/* Left Navigation: Endpoints List */}
          <div className='lg:col-span-4 space-y-2'>
            <div className='text-xs font-semibold uppercase text-muted-foreground tracking-wider px-1 mb-2'>
              Available Endpoints
            </div>
            {ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.id === ep.id
              return (
                <button
                  key={ep.id}
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-foreground font-semibold shadow-sm'
                      : 'bg-card hover:bg-muted/40 text-muted-foreground border-border/70'
                  }`}
                >
                  <div className='space-y-1 overflow-hidden pr-2'>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant='secondary'
                        className={`text-[10px] font-mono px-1.5 py-0 font-bold ${
                          ep.method === 'GET'
                            ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {ep.method}
                      </Badge>
                      <span className='font-mono font-medium text-foreground truncate'>{ep.path}</span>
                    </div>
                    <div className='text-[11px] text-muted-foreground truncate'>{ep.title}</div>
                  </div>
                  {isSelected && <IconArrowRight className='size-4 text-primary shrink-0' />}
                </button>
              )
            })}
          </div>

          {/* Right Content: Selected Endpoint Details */}
          <div className='lg:col-span-8'>
            <Card className='shadow-md border-border/80'>
              <CardHeader className='pb-4 border-b bg-muted/20'>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <div className='flex items-center gap-2.5'>
                    <Badge
                      className={`text-xs font-mono font-bold px-2 py-0.5 ${
                        selectedEndpoint.method === 'GET'
                          ? 'bg-sky-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {selectedEndpoint.method}
                    </Badge>
                    <CardTitle className='text-base font-mono'>{selectedEndpoint.path}</CardTitle>
                  </div>
                  <Badge variant='outline' className='text-[11px] font-mono gap-1 text-muted-foreground'>
                    <IconShieldLock className='size-3 text-primary' />
                    <span>{selectedEndpoint.roles}</span>
                  </Badge>
                </div>
                <CardDescription className='text-xs mt-1.5'>{selectedEndpoint.description}</CardDescription>
              </CardHeader>

              <CardContent className='pt-5 space-y-5'>
                {/* Parameters Table if any */}
                {selectedEndpoint.params && selectedEndpoint.params.length > 0 && (
                  <div>
                    <div className='text-xs font-semibold uppercase text-muted-foreground mb-2'>
                      Request Parameters / Payload
                    </div>
                    <div className='border rounded-lg overflow-hidden text-xs'>
                      <table className='w-full text-left'>
                        <thead className='bg-muted/50 text-muted-foreground border-b'>
                          <tr>
                            <th className='p-2.5 font-medium'>Field</th>
                            <th className='p-2.5 font-medium'>Type</th>
                            <th className='p-2.5 font-medium'>Required</th>
                            <th className='p-2.5 font-medium'>Description</th>
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-border'>
                          {selectedEndpoint.params.map((p, i) => (
                            <tr key={i} className='hover:bg-muted/20'>
                              <td className='p-2.5 font-mono font-semibold text-foreground'>{p.name}</td>
                              <td className='p-2.5 font-mono text-muted-foreground'>{p.type}</td>
                              <td className='p-2.5'>
                                {p.required ? (
                                  <Badge variant='destructive' className='text-[10px] px-1.5 py-0'>Required</Badge>
                                ) : (
                                  <span className='text-muted-foreground text-[11px]'>Optional</span>
                                )}
                              </td>
                              <td className='p-2.5 text-muted-foreground'>{p.description}</td>
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