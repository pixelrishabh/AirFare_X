import { createFileRoute } from '@tanstack/react-router'
import { OverviewDashboard } from '@/features/overview'

export const Route = createFileRoute('/_authenticated/')({
  component: OverviewDashboard,
})
