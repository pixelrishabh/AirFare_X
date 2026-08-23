import { createFileRoute } from '@tanstack/react-router'
import { BacktestingPage } from '@/features/backtesting'
import { requireRole } from '@/lib/require-role'

export const Route = createFileRoute('/_authenticated/backtesting')({
  beforeLoad: () => requireRole(['ADMIN', 'ANALYST'], '/backtesting'),
  component: BacktestingPage,
})

