import { createFileRoute } from '@tanstack/react-router'
import { RouteHeatmapPage } from '@/features/route-heatmap'

export const Route = createFileRoute('/_authenticated/route-heatmap')({
  component: RouteHeatmapPage,
})
