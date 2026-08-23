import { createFileRoute } from '@tanstack/react-router'
import { AirlineAnalysisPage } from '@/features/airline-analysis'

export const Route = createFileRoute('/_authenticated/airline-analysis')({
  component: AirlineAnalysisPage,
})
