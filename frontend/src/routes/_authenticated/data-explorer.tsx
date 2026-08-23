import { createFileRoute } from '@tanstack/react-router'
import { DataExplorerPage } from '@/features/data-explorer'

export const Route = createFileRoute('/_authenticated/data-explorer')({
  component: DataExplorerPage,
})
