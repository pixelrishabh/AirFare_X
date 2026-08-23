import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Main } from '@/components/layout/main'
import { AirfarexHeader } from '@/components/layout/airfarex-header'
import { airfareApi } from '@/services/api'
import { type FareQuote } from '@/lib/mock/data'
import { QuotesTable } from './components/quotes-table'


export function DataExplorerPage() {
  const [quotes, setQuotes] = useState<FareQuote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const res = await airfareApi.getFareQuotes()
        setQuotes(res)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <>
      <AirfarexHeader title='Raw Fare Quotes Data Explorer' />
      <Main className='space-y-6'>
        {/* Page Header */}
        <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b pb-4'>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-2xl font-bold tracking-tight'>Data Explorer</h1>
              <Badge variant='outline' className='font-mono text-xs'>{quotes.length} Quotes</Badge>
            </div>
            <p className='text-sm text-muted-foreground mt-0.5'>
              Multi-source airfare quote ledger across airline direct channels and OTA aggregators (MakeMyTrip, Yatra, EaseMyTrip, Cleartrip, Ixigo, Goibibo).
            </p>
          </div>
        </div>

        {/* TanStack Table View */}
        {loading ? (
          <div className='space-y-4'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-96 w-full' />
          </div>
        ) : (
          <QuotesTable data={quotes} />
        )}
      </Main>
    </>
  )
}
