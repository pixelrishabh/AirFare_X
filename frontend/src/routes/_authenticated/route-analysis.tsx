import { createFileRoute } from '@tanstack/react-router'
import { RouteAnalysisPage } from '@/features/route-analysis'

export const Route = createFileRoute('/_authenticated/route-analysis')({
  component: RouteAnalysisPage,
})
