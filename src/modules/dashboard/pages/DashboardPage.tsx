import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboardQuery } from '@/modules/dashboard/api/useDashboardQuery'
import { DepartmentDistributionChart } from '@/modules/dashboard/components/DepartmentDistributionChart'
import { MetricCard } from '@/modules/dashboard/components/MetricCard'
import { PriorityDistributionChart } from '@/modules/dashboard/components/PriorityDistributionChart'
import { ProjectDistributionChart } from '@/modules/dashboard/components/ProjectDistributionChart'
import { StatusDistributionChart } from '@/modules/dashboard/components/StatusDistributionChart'
import { WeeklyCompletedChart } from '@/modules/dashboard/components/WeeklyCompletedChart'

export function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboardQuery()

  function renderContent() {
    if (isLoading) {
      return <p className="p-4 text-base">Yükleniyor...</p>
    }

    if (isError) {
      return (
        <p className="p-4 text-base text-destructive">
          {error instanceof Error ? error.message : 'Dashboard yüklenemedi'}
        </p>
      )
    }

    if (!data) {
      return <p className="p-4 text-base text-muted-foreground">Veri bulunamadı</p>
    }

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard label="Açık" value={data.openCount} colorKey="yellow" />
          <MetricCard label="Devam Ediyor" value={data.inProgressCount} colorKey="orange" />
          <MetricCard label="Gecikmiş" value={data.overdueCount} colorKey="red" />
          <MetricCard label="Tamamlandı" value={data.completedCount} colorKey="green" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Durum Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusDistributionChart data={data.byStatus} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Departman Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <DepartmentDistributionChart data={data.byDepartment} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Öncelik Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <PriorityDistributionChart data={data.byPriority} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Proje Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectDistributionChart data={data.byProject} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Haftalık Tamamlanan</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyCompletedChart data={data.weeklyCompleted} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <PageHeader title="Dashboard" />
      <div className="min-h-0 flex-1 overflow-y-auto">{renderContent()}</div>
    </div>
  )
}
