import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Main } from '@/components/layout/main'
import { AirfarexHeader } from '@/components/layout/airfarex-header'
import { airfareApi } from '@/services/api'
import { type AirlineInfo, MOCK_SYSTEM_STATUS } from '@/lib/mock/data'
import { formatNumber } from '@/lib/utils/format'
import {
  IconCheck,
  IconClock,
} from '@tabler/icons-react'

export function SystemStatusPage() {
  const [data, setData] = useState<{
    status: typeof MOCK_SYSTEM_STATUS
    airlines: AirlineInfo[]
  } | null>(null)

  useEffect(() => {
    async function loadData() {
      const res = await airfareApi.getSystemStatus()
      setData(res)
    }
    loadData()
  }, [])


  const status = data?.status
  const airlines = data?.airlines || []

  return (
    <>
      <AirfarexHeader title='Scraper Pipeline Health & Operations' />
      <Main className='space-y-6'>
        {/* Page Header */}
        <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b pb-4'>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-2xl font-bold tracking-tight'>System & Scraper Status</h1>
              <Badge variant='outline' className='bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs gap-1'>
                <span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
                All Systems Operational
              </Badge>
            </div>
            <p className='text-sm text-muted-foreground mt-0.5'>
              Real-time telemetry on distributed scraping workers, ingestion queues, validation filters, and index publishers.
            </p>
          </div>
          <div className='text-xs font-mono text-muted-foreground'>
            Last Cycle: 23 Aug 2026, 09:30 AM IST
          </div>
        </div>

        {/* Pipeline Metric Cards */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7'>
          {/* Last Scrape */}
          <Card>
            <CardHeader className='pb-1 text-[11px] font-semibold uppercase text-muted-foreground'>
              Last Scrape
            </CardHeader>
            <CardContent className='pt-1'>
              <div className='text-sm font-bold font-mono text-foreground'>09:28:40 AM</div>
              <div className='text-[10px] text-muted-foreground mt-0.5'>Cycle interval: 30m</div>
            </CardContent>
          </Card>

          {/* Records Collected */}
          <Card>
            <CardHeader className='pb-1 text-[11px] font-semibold uppercase text-muted-foreground'>
              Collected
            </CardHeader>
            <CardContent className='pt-1'>
              <div className='text-lg font-bold font-mono text-foreground'>{formatNumber(status?.recordsCollected || 12480)}</div>
              <div className='text-[10px] text-muted-foreground mt-0.5'>Raw quote payloads</div>
            </CardContent>
          </Card>

          {/* Validated */}
          <Card>
            <CardHeader className='pb-1 text-[11px] font-semibold uppercase text-muted-foreground'>
              Validated
            </CardHeader>
            <CardContent className='pt-1'>
              <div className='text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400'>
                {formatNumber(status?.recordsValidated || 11931)}
              </div>
              <div className='text-[10px] text-muted-foreground mt-0.5'>Passed sanity rules</div>
            </CardContent>
          </Card>

          {/* Rejected */}
          <Card>
            <CardHeader className='pb-1 text-[11px] font-semibold uppercase text-muted-foreground'>
              Rejected
            </CardHeader>
            <CardContent className='pt-1'>
              <div className='text-lg font-bold font-mono text-rose-600 dark:text-rose-400'>
                {formatNumber(status?.recordsRejected || 549)}
              </div>
              <div className='text-[10px] text-muted-foreground mt-0.5'>Bot captcha / outliers</div>
            </CardContent>
          </Card>

          {/* Data Quality */}
          <Card>
            <CardHeader className='pb-1 text-[11px] font-semibold uppercase text-muted-foreground'>
              Data Quality
            </CardHeader>
            <CardContent className='pt-1'>
              <div className='text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400'>
                {status?.dataQualityScore || 95.6}%
              </div>
              <div className='text-[10px] text-muted-foreground mt-0.5'>Score threshold &gt;90%</div>
            </CardContent>
          </Card>

          {/* API Gateway */}
          <Card>
            <CardHeader className='pb-1 text-[11px] font-semibold uppercase text-muted-foreground'>
              API Uptime
            </CardHeader>
            <CardContent className='pt-1'>
              <div className='text-lg font-bold font-mono text-foreground'>{status?.apiUptime || 99.98}%</div>
              <div className='text-[10px] text-muted-foreground mt-0.5'>Edge gateway SLA</div>
            </CardContent>
          </Card>

          {/* DB Latency */}
          <Card>
            <CardHeader className='pb-1 text-[11px] font-semibold uppercase text-muted-foreground'>
              DB Latency
            </CardHeader>
            <CardContent className='pt-1'>
              <div className='text-lg font-bold font-mono text-foreground'>{status?.dbResponseP95Ms || 42} ms</div>
              <div className='text-[10px] text-muted-foreground mt-0.5'>p95 query response</div>
            </CardContent>
          </Card>
        </div>

        {/* Airline Scraper Health Table */}
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-base font-semibold'>Carrier Endpoint Scraper Health</CardTitle>
                <CardDescription className='text-xs mt-0.5'>
                  Individual scraper cluster status, network latency, and success rates by carrier.
                </CardDescription>
              </div>
              <Badge variant='outline' className='text-xs'>5 Active Scrapers</Badge>
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <table className='w-full text-xs text-left border-collapse'>
                <thead>
                  <tr className='border-y bg-muted/40 text-muted-foreground'>
                    <th className='p-3 font-medium'>Carrier</th>
                    <th className='p-3 font-medium'>Status</th>
                    <th className='p-3 font-medium text-right'>Scraper Latency</th>
                    <th className='p-3 font-medium text-right'>Success Rate</th>
                    <th className='p-3 font-medium text-right'>Last Sync</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border/60'>
                  {airlines.map((a) => (
                    <tr key={a.code} className='hover:bg-muted/30'>
                      <td className='p-3 font-semibold text-foreground flex items-center gap-2'>
                        <span className='size-2.5 rounded-full' style={{ backgroundColor: a.color }} />
                        {a.name} ({a.code})
                      </td>
                      <td className='p-3'>
                        <Badge
                          variant='outline'
                          className='text-[10px] uppercase font-semibold bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1'
                        >
                          <IconCheck className='size-3' />
                          Operational
                        </Badge>
                      </td>
                      <td className='p-3 font-mono text-right text-foreground'>{a.scraperLatencyMs} ms</td>
                      <td className='p-3 font-mono text-right text-emerald-600 dark:text-emerald-400 font-medium'>
                        {a.scraperSuccessRate}%
                      </td>
                      <td className='p-3 font-mono text-right text-muted-foreground'>{a.lastScraped}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Execution Chronology Timeline */}
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-center gap-2'>
              <IconClock className='size-4 text-primary' />
              <CardTitle className='text-base font-semibold'>Daily Pipeline Execution Chronology</CardTitle>
            </div>
            <CardDescription className='text-xs'>
              Standard automated scheduled sequence from 09:00 scrape dispatch to 09:18 APIx index publication.
            </CardDescription>
          </CardHeader>
          <CardContent className='pt-1'>
            <div className='space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-border/60'>
              {(status?.pipelineTimeline || []).map((step, idx) => (
                <div key={idx} className='relative flex items-start gap-4 pl-8'>
                  <span className='absolute left-1.5 top-1 size-3.5 rounded-full bg-primary border-2 border-background ring-2 ring-primary/20' />
                  <div className='space-y-0.5 text-xs'>
                    <div className='flex items-center gap-2'>
                      <span className='font-mono font-bold text-primary'>{step.time}</span>
                      <span className='font-semibold text-foreground'>{step.stage}</span>
                      <Badge variant='outline' className='text-[9px] uppercase text-emerald-600 border-emerald-500/30'>
                        {step.status}
                      </Badge>
                    </div>
                    <p className='text-muted-foreground text-[11px]'>{step.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
