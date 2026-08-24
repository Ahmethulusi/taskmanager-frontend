import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { DashboardWeeklyCompleted } from '@/modules/dashboard/utils/types'

const weekLabelFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'short',
})

interface WeeklyCompletedChartProps {
  data: DashboardWeeklyCompleted[]
}

export function WeeklyCompletedChart({ data }: WeeklyCompletedChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: weekLabelFormatter.format(new Date(item.weekStartDate)),
  }))

  if (chartData.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Veri yok</p>
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{ r: 3, fill: 'var(--primary)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
