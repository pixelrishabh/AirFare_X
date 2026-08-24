import { requireRole } from '@/lib/require-role'
import { createFileRoute } from '@tanstack/react-router'
import { ApiDocsPage } from '@/features/api-docs'

export const Route = createFileRoute('/_authenticated/api-docs')({
  beforeLoad: () => requireRole(['ADMIN', 'ANALYST'], '/api-docs'),
  component: ApiDocsPage,
})
