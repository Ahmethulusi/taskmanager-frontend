import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { getPriorityDisplay } from '@/modules/tasks/utils/taskDisplay'
import type { DashboardPriorityCount } from '@/modules/dashboard/utils/types'

const PRIORITY_BAR_COLORS: Record<string, string> = {
  Dusuk: '#16A34A',
  Orta: '#CA8A04',
  Yuksek: '#DC2626',
}

interface PriorityDistributionChartProps {
  data: DashboardPriorityCount[]
}

export function PriorityDistributionChart({ data }: PriorityDistributionChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: getPriorityDisplay(item.priority).label,
  }))

  if (chartData.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Veri yok</p>
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((item) => (
              <Cell
                key={item.priority}
                fill={PRIORITY_BAR_COLORS[item.priority] ?? '#71717A'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
