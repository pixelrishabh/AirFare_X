import { createFileRoute } from '@tanstack/react-router'
import { AirfareIndexPage } from '@/features/airfare-index'

export const Route = createFileRoute('/_authenticated/airfare-index')({
  component: AirfareIndexPage,
})
