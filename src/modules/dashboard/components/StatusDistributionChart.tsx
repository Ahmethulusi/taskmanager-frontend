import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import {
  STATUS_COLOR_MAP,
  type StatusColorKey,
} from '@/lib/statusColors'
import type { DashboardStatusCount } from '@/modules/dashboard/utils/types'

interface StatusDistributionChartProps {
  data: DashboardStatusCount[]
}

function getSliceColor(statusColorKey: string): string {
  if (statusColorKey in STATUS_COLOR_MAP) {
    return STATUS_COLOR_MAP[statusColorKey as StatusColorKey].dot
  }
  return STATUS_COLOR_MAP.gray.dot
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Veri yok</p>
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="statusName" cx="50%" cy="50%" outerRadius={90}>
            {data.map((item) => (
              <Cell key={item.statusName} fill={getSliceColor(item.statusColorKey)} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
