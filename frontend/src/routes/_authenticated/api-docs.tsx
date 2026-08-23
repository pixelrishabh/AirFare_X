import { createFileRoute } from '@tanstack/react-router'
import { ApiDocsPage } from '@/features/api-docs'

export const Route = createFileRoute('/_authenticated/api-docs')({
  component: ApiDocsPage,
})
