import { useState } from 'react'
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { DataTablePagination } from '@/components/data-table/pagination'
import { DataTableToolbar } from '@/components/data-table/toolbar'
import { type FareQuote } from '@/lib/mock/data'
import { quotesColumns } from './quotes-columns'
import { IconDownload } from '@tabler/icons-react'
import { toast } from 'sonner'


import { useAuthStore } from '@/stores/auth-store'

interface QuotesTableProps {
  data: FareQuote[]
}

export function QuotesTable({ data }: QuotesTableProps) {
  const { user } = useAuthStore()
  const canExport = user?.role === 'ADMIN' || user?.role === 'ANALYST'

  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    convenienceFee: false, // Default hidden to keep dense layout clean
    udf: false,
  })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'totalFare', desc: false },
  ])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns: quotesColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const handleExportCSV = () => {
    toast.info('CSV Export Triggered (Demo Stub)', {
      description: `Exporting ${table.getFilteredRowModel().rows.length} filtered fare quotes to CSV. In production, this streams a direct S3 pre-signed CSV report.`,
    })
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <DataTableToolbar
          table={table}
          searchPlaceholder='Filter by flight, city, sector...'
          filters={[
            {
              columnId: 'airline',
              title: 'Airline',
              options: [
                { label: 'IndiGo', value: 'IndiGo' },
                { label: 'Air India', value: 'Air India' },
                { label: 'Air India Express', value: 'Air India Express' },
                { label: 'Akasa Air', value: 'Akasa Air' },
                { label: 'SpiceJet', value: 'SpiceJet' },
              ],
            },
            {
              columnId: 'source',
              title: 'Source',
              options: [
                { label: 'IndiGo.com', value: 'IndiGo.com' },
                { label: 'AirIndia.in', value: 'AirIndia.in' },
                { label: 'MakeMyTrip', value: 'MakeMyTrip' },
                { label: 'Yatra', value: 'Yatra' },
                { label: 'EaseMyTrip', value: 'EaseMyTrip' },
                { label: 'Cleartrip', value: 'Cleartrip' },
                { label: 'Ixigo', value: 'Ixigo' },
                { label: 'Goibibo', value: 'Goibibo' },
              ],
            },
            {
              columnId: 'availability',
              title: 'Availability',
              options: [
                { label: 'Available', value: 'Available' },
                { label: 'Low Seats (<5)', value: 'Low Seats (<5)' },
                { label: 'Filling Fast', value: 'Filling Fast' },
                { label: 'Sold Out', value: 'Sold Out' },
              ],
            },
          ]}
        />

        <div className='flex items-center gap-2 self-end sm:self-auto'>
          {canExport && (
            <Button
              variant='outline'
              size='sm'
              onClick={handleExportCSV}
              className='h-8 text-xs gap-1.5'
            >
              <IconDownload className='size-3.5' />
              Export CSV (Stub)
            </Button>
          )}
        </div>
      </div>

      <div className='rounded-md border bg-card overflow-hidden'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='bg-muted/40'>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className='text-xs h-9 px-3'>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='hover:bg-muted/30 text-xs'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className='p-2.5 px-3'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={quotesColumns.length} className='h-24 text-center text-xs text-muted-foreground'>
                  No fare quotes match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
