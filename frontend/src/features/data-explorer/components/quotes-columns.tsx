import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { type FareQuote } from '@/lib/mock/data'
import { formatINR } from '@/lib/utils/format'

export const quotesColumns: ColumnDef<FareQuote>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-0.5'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-0.5'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'timestamp',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Timestamp' />
    ),
    cell: ({ row }) => (
      <span className='font-mono text-xs text-muted-foreground whitespace-nowrap'>
        {row.getValue('timestamp')}
      </span>
    ),
  },
  {
    accessorKey: 'origin',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Origin' />
    ),
    cell: ({ row }) => (
      <div className='font-mono font-bold text-foreground text-xs'>
        {row.getValue('origin')}
        <span className='text-[10px] text-muted-foreground font-normal block'>
          {row.original.originCity}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'destination',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Destination' />
    ),
    cell: ({ row }) => (
      <div className='font-mono font-bold text-foreground text-xs'>
        {row.getValue('destination')}
        <span className='text-[10px] text-muted-foreground font-normal block'>
          {row.original.destinationCity}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'airline',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Airline' />
    ),
    cell: ({ row }) => (
      <span className='font-medium text-xs text-foreground whitespace-nowrap'>
        {row.getValue('airline')}
      </span>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'flightNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Flight No' />
    ),
    cell: ({ row }) => (
      <span className='font-mono text-xs font-semibold text-primary whitespace-nowrap'>
        {row.getValue('flightNumber')}
      </span>
    ),
  },
  {
    accessorKey: 'departureDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Departure' />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-xs text-muted-foreground whitespace-nowrap'>
        {row.getValue('departureDate')}
        <span className='text-[10px] text-muted-foreground block'>
          {row.original.departureTime}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'advanceDays',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Advance' />
    ),
    cell: ({ row }) => (
      <Badge variant='outline' className='font-mono text-[10px]'>
        T+{row.getValue('advanceDays')}
      </Badge>
    ),
  },
  {
    accessorKey: 'fareClass',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Class' />
    ),
    cell: ({ row }) => (
      <span className='text-xs text-muted-foreground'>
        {row.getValue('fareClass')}
      </span>
    ),
  },
  {
    accessorKey: 'baseFare',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Base Fare' className='justify-end' />
    ),
    cell: ({ row }) => (
      <div className='text-right font-mono text-xs text-muted-foreground'>
        {formatINR(row.getValue('baseFare'))}
      </div>
    ),
  },
  {
    accessorKey: 'taxes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Taxes' className='justify-end' />
    ),
    cell: ({ row }) => (
      <div className='text-right font-mono text-xs text-muted-foreground'>
        {formatINR(row.getValue('taxes'))}
      </div>
    ),
  },
  {
    accessorKey: 'udf',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='UDF' className='justify-end' />
    ),
    cell: ({ row }) => (
      <div className='text-right font-mono text-xs text-muted-foreground'>
        {formatINR(row.getValue('udf'))}
      </div>
    ),
  },
  {
    accessorKey: 'convenienceFee',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fee' className='justify-end' />
    ),
    cell: ({ row }) => (
      <div className='text-right font-mono text-xs text-muted-foreground'>
        {formatINR(row.getValue('convenienceFee'))}
      </div>
    ),
  },
  {
    accessorKey: 'totalFare',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total Fare' className='justify-end' />
    ),
    cell: ({ row }) => (
      <div className='text-right font-mono font-bold text-xs text-foreground'>
        {formatINR(row.getValue('totalFare'))}
      </div>
    ),
  },
  {
    accessorKey: 'availability',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Availability' />
    ),
    cell: ({ row }) => {
      const avail = row.getValue('availability') as string
      return (
        <span
          className={`text-[11px] font-medium whitespace-nowrap ${
            avail === 'Available'
              ? 'text-emerald-600 dark:text-emerald-400'
              : avail.includes('Low Seats')
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-amber-600 dark:text-amber-400'
          }`}
        >
          {avail}
        </span>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'source',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Source' />
    ),
    cell: ({ row }) => {
      const src = row.getValue('source') as string
      const isDirect = src.includes('.com') || src.includes('.in')
      return (
        <Badge
          variant='secondary'
          className={`text-[10px] font-mono whitespace-nowrap ${
            isDirect
              ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {src}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
]
