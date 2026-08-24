import { cn } from '@/lib/utils'

const METRIC_COLORS: Record<string, { bg: string; text: string }> = {
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700' },
  red: { bg: 'bg-red-50', text: 'text-red-700' },
  green: { bg: 'bg-green-50', text: 'text-green-700' },
}

interface MetricCardProps {
  label: string
  value: number
  colorKey: string
}

export function MetricCard({ label, value, colorKey }: MetricCardProps) {
  const colors = METRIC_COLORS[colorKey] ?? METRIC_COLORS.yellow

  return (
    <div className={cn('rounded-xl p-4 ring-1 ring-foreground/10', colors.bg)}>
      <p className={cn('font-heading text-3xl font-semibold tabular-nums', colors.text)}>
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
