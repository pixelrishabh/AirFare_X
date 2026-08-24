import { requireRole } from '@/lib/require-role'
import { createFileRoute } from '@tanstack/react-router'
import { SystemStatusPage } from '@/features/system-status'

export const Route = createFileRoute('/_authenticated/system-status')({
  beforeLoad: () => requireRole(['ADMIN'], '/system-status'),
  component: SystemStatusPage,
})
