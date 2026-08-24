export interface DashboardDepartmentCount {
  departmentName: string
  count: number
}

export interface DashboardStatusCount {
  statusName: string
  statusColorKey: string
  count: number
}

export interface DashboardPriorityCount {
  priority: string
  count: number
}

export interface DashboardProjectCount {
  projectName: string
  count: number
}

export interface DashboardWeeklyCompleted {
  weekStartDate: string
  count: number
}

export interface DashboardSummaryDto {
  openCount: number
  inProgressCount: number
  overdueCount: number
  completedCount: number
  byDepartment: DashboardDepartmentCount[]
  byStatus: DashboardStatusCount[]
  byPriority: DashboardPriorityCount[]
  byProject: DashboardProjectCount[]
  weeklyCompleted: DashboardWeeklyCompleted[]
}
