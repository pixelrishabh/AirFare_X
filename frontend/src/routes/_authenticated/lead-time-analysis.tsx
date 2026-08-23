import { createFileRoute } from '@tanstack/react-router'
import { LeadTimeAnalysisPage } from '@/features/lead-time-analysis'

export const Route = createFileRoute('/_authenticated/lead-time-analysis')({
  component: LeadTimeAnalysisPage,
})
