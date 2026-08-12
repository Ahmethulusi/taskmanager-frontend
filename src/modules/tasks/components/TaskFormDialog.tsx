import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { DatePicker } from '@/components/shared/DatePicker'
import { MultiSelectCheckList } from '@/components/shared/MultiSelectCheckList'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/AuthContext'
import { getCurrentUserId } from '@/lib/currentUser'
import { useDepartmentsQuery } from '@/modules/departments/api/useDepartmentsQuery'
import type { DepartmentDto } from '@/modules/departments/utils/types'
import type { LabelDto } from '@/modules/labels/utils/types'
import { useProjectsQuery } from '@/modules/projects/api/useProjectsQuery'
import type { ProjectDto } from '@/modules/projects/utils/types'
import { useAssignTaskMutation } from '@/modules/tasks/api/useAssignTaskMutation'
import { useCreateTaskMutation } from '@/modules/tasks/api/useCreateTaskMutation'
import { useUpdateTaskLabelsMutation } from '@/modules/tasks/api/useUpdateTaskLabelsMutation'
import { useUpdateTaskMutation } from '@/modules/tasks/api/useUpdateTaskMutation'
import { AttachmentList } from '@/modules/attachments/components/AttachmentList'
import {
  confirmUpload,
  presignUpload,
  uploadToR2,
} from '@/modules/attachments/api/attachmentsApi'
import { LabelPicker } from '@/modules/tasks/components/LabelPicker'
import { PendingFilesPicker } from '@/modules/tasks/components/PendingFilesPicker'
import { getAssignableUserItems } from '@/modules/tasks/utils/assignableUsers'
import { createTaskSchema, updateTaskSchema, type CreateTaskFormValues } from '@/modules/tasks/utils/schemas'
import { toApiDueDate, toDateInputValue } from '@/modules/tasks/utils/dueDate'
import type { TaskDto } from '@/modules/tasks/utils/types'
import { useUsersQuery } from '@/modules/users/api/useUsersQuery'

const NO_DEPARTMENT = 'none'
const NO_PROJECT = 'none'

function toId(value: string | number | null | undefined): string | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined
  }
  return String(value)
}

function filterDepartmentsForUser(
  departments: DepartmentDto[] | undefined,
  options: { isAdmin: boolean; userId: string | null; selectedDepartmentId?: string }
): DepartmentDto[] {
  if (!departments) {
    return []
  }
  if (options.isAdmin || !options.userId) {
    return departments
  }
  return departments.filter((department) => {
    if (options.selectedDepartmentId && String(department.id) === options.selectedDepartmentId) {
      return true
    }
    if (department.managerId != null && String(department.managerId) === options.userId) {
      return true
    }
    return department.users?.some((member) => String(member.id) === options.userId) ?? false
  })
}

function filterProjectsForUser(
  projects: ProjectDto[] | undefined,
  options: { isAdmin: boolean; userId: string | null; selectedProjectId?: string }
): ProjectDto[] {
  if (!projects) {
    return []
  }
  if (options.isAdmin || !options.userId) {
    return projects
  }
  return projects.filter((project) => {
    if (options.selectedProjectId && String(project.id) === options.selectedProjectId) {
      return true
    }
    return project.members?.some((member) => String(member.userId) === options.userId) ?? false
  })
}

const PRIORITY_OPTIONS: { value: CreateTaskFormValues['priority']; label: string }[] = [
  { value: 'Dusuk', label: 'Düşük' },
  { value: 'Orta', label: 'Orta' },
  { value: 'Yuksek', label: 'Yüksek' },
]

interface TaskFormDialogProps {
  mode: 'create' | 'edit'
  task?: TaskDto
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultProjectId?: string
}

export function TaskFormDialog({
  mode,
  task,
  open,
  onOpenChange,
  defaultProjectId,
}: TaskFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {/* Mounted fresh each time the dialog opens, so form state naturally starts clean
            from current props instead of needing a reset-on-open effect. */}
        {open && (
          <TaskFormFields
            mode={mode}
            task={task}
            onOpenChange={onOpenChange}
            defaultProjectId={defaultProjectId}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface TaskFormFieldsProps {
  mode: 'create' | 'edit'
  task?: TaskDto
  onOpenChange: (open: boolean) => void
  defaultProjectId?: string
}

function TaskFormFields({ mode, task, onOpenChange, defaultProjectId }: TaskFormFieldsProps) {
  const { user, hasPermission } = useAuth()
  const { data: departments } = useDepartmentsQuery()
  const { data: projects } = useProjectsQuery()
  const { data: users } = useUsersQuery()
  const showAssignField = hasPermission('tasks.assign')
  const isAdmin = user?.role === 'Admin'
  const currentUserId = getCurrentUserId()

  const [assignedUserIds, setAssignedUserIds] = useState<string[]>(() => {
    if (mode === 'edit' && task) {
      return task.assignedUsers?.map((assigned) => String(assigned.id)) ?? []
    }
    if (!showAssignField || !defaultProjectId) {
      return []
    }
    const project = projects?.find((p) => String(p.id) === toId(defaultProjectId))
    return project?.members?.length ? project.members.map((member) => String(member.userId)) : []
  })
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(() =>
    mode === 'edit' && task ? toId(task.projectId) : toId(defaultProjectId)
  )
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | undefined>(() =>
    mode === 'edit' && task ? toId(task.departmentId) : undefined
  )
  const [selectedLabels, setSelectedLabels] = useState<LabelDto[]>(() =>
    mode === 'edit' && task?.labels ? [...task.labels] : []
  )
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [activeTab, setActiveTab] = useState('general')
  const [error, setError] = useState<string | null>(null)
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)

  const createMutation = useCreateTaskMutation()
  const updateMutation = useUpdateTaskMutation()
  const updateLabelsMutation = useUpdateTaskLabelsMutation()
  const assignMutation = useAssignTaskMutation()
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    updateLabelsMutation.isPending ||
    assignMutation.isPending ||
    isUploadingFiles

  const visibleDepartments = filterDepartmentsForUser(departments, {
    isAdmin,
    userId: currentUserId,
    selectedDepartmentId,
  })
  const visibleProjects = filterProjectsForUser(projects, {
    isAdmin,
    userId: currentUserId,
    selectedProjectId,
  })

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(mode === 'create' ? createTaskSchema : updateTaskSchema),
    defaultValues:
      mode === 'edit' && task
        ? {
            title: task.title,
            description: task.description ?? '',
            priority: task.priority as CreateTaskFormValues['priority'],
            departmentId: toId(task.departmentId),
            projectId: toId(task.projectId),
            dueDate: toDateInputValue(task.dueDate),
          }
        : {
            title: '',
            description: '',
            priority: undefined,
            departmentId: undefined,
            projectId: toId(defaultProjectId),
            dueDate: '',
          },
  })

  const selectedProject = projects?.find((p) => String(p.id) === selectedProjectId)
  const selectedDepartment = departments?.find((d) => String(d.id) === selectedDepartmentId)
  const assignItems = getAssignableUserItems({
    workspaceUsers: users,
    projectMembers: selectedProject?.members,
    departmentUsers: selectedDepartment?.users,
    projectId: selectedProjectId,
    departmentId: selectedDepartmentId,
  })

  function getAssignableIds(projectId: string | undefined, departmentId: string | undefined) {
    const project = projects?.find((p) => String(p.id) === projectId)
    const department = departments?.find((d) => String(d.id) === departmentId)
    return getAssignableUserItems({
      workspaceUsers: users,
      projectMembers: project?.members,
      departmentUsers: department?.users,
      projectId,
      departmentId,
    }).map((item) => item.id)
  }

  function applyProjectMembers(projectId: string | undefined) {
    setSelectedProjectId(projectId)
    if (!showAssignField) {
      return
    }
    if (projectId) {
      setAssignedUserIds(getAssignableIds(projectId, selectedDepartmentId))
      return
    }
    const allowedIds = new Set(getAssignableIds(undefined, selectedDepartmentId))
    setAssignedUserIds((prev) => prev.filter((id) => allowedIds.has(id)))
  }

  function applyDepartmentFilter(departmentId: string | undefined) {
    setSelectedDepartmentId(departmentId)
    if (!showAssignField) {
      return
    }
    const allowedIds = new Set(getAssignableIds(selectedProjectId, departmentId))
    setAssignedUserIds((prev) => prev.filter((id) => allowedIds.has(id)))
  }

  async function onSubmit(values: CreateTaskFormValues) {
    setError(null)
    try {
      const labelIds = selectedLabels.map((label) => String(label.id))

      if (mode === 'create') {
        const created = await createMutation.mutateAsync({
          title: values.title,
          description: values.description || null,
          priority: values.priority,
          departmentId: toId(values.departmentId),
          projectId: toId(values.projectId) ?? null,
          assignedUserIds: showAssignField ? assignedUserIds : [],
          dueDate: toApiDueDate(values.dueDate),
        })
        if (labelIds.length > 0) {
          await updateLabelsMutation.mutateAsync({
            taskId: String(created.id),
            labelIds,
          })
        }

        const failedFiles: string[] = []
        if (pendingFiles.length > 0) {
          setIsUploadingFiles(true)
          try {
            for (const file of pendingFiles) {
              try {
                const { uploadUrl, storageKey } = await presignUpload(
                  String(created.id),
                  file.name,
                  file.type,
                  file.size
                )
                await uploadToR2(uploadUrl, file)
                await confirmUpload({
                  storageKey,
                  fileName: file.name,
                  fileSize: file.size,
                  contentType: file.type,
                  taskId: String(created.id),
                })
              } catch {
                failedFiles.push(file.name)
              }
            }
          } finally {
            setIsUploadingFiles(false)
          }
        }

        if (failedFiles.length > 0) {
          const message =
            failedFiles.length === 1
              ? `1 dosya yüklenemedi: ${failedFiles[0]}`
              : `${failedFiles.length} dosya yüklenemedi: ${failedFiles.join(', ')}`
          alert(message)
        }

        setPendingFiles([])
      } else if (task) {
        const taskId = String(task.id)
        const departmentId = toId(values.departmentId ?? selectedDepartmentId) ?? null
        const projectId = toId(values.projectId ?? selectedProjectId) ?? null

        // update önce bitmeli; assign paralel çalışırsa backend eski task'ı
        // kaydedip department/project alanlarını null'a çekebiliyor.
        await updateMutation.mutateAsync({
          taskId,
          dto: {
            title: values.title,
            description: values.description || null,
            priority: values.priority,
            departmentId,
            projectId,
            dueDate: toApiDueDate(values.dueDate),
          },
        })
        await Promise.all([
          updateLabelsMutation.mutateAsync({
            taskId,
            labelIds,
          }),
          ...(showAssignField
            ? [assignMutation.mutateAsync({ taskId, assignedUserIds })]
            : []),
        ])
      }
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görev kaydedilemedi')
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{mode === 'create' ? 'Yeni Görev' : 'Görevi Düzenle'}</DialogTitle>
      </DialogHeader>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <form
        onSubmit={handleSubmit(onSubmit, (formErrors) => {
          if (
            formErrors.title ||
            formErrors.description ||
            formErrors.priority ||
            formErrors.dueDate
          ) {
            setActiveTab('general')
          }
        })}
        noValidate
        className="flex flex-col gap-4"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="general">Genel</TabsTrigger>
            <TabsTrigger value="assignment">Atama</TabsTrigger>
            <TabsTrigger value="attachments">Ekler</TabsTrigger>
          </TabsList>

          <TabsContent value="general" keepMounted className="grid gap-4 pt-2 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="title">Başlık</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea id="description" rows={3} {...register('description')} />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Öncelik</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select
                    items={PRIORITY_OPTIONS}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Öncelik seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.priority && (
                <p className="text-xs text-destructive">{errors.priority.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="dueDate">Bitiş Tarihi</Label>
              <Controller
                control={control}
                name="dueDate"
                render={({ field }) => (
                  <DatePicker
                    id="dueDate"
                    value={field.value ?? null}
                    onChange={field.onChange}
                    disabled={isPending}
                  />
                )}
              />
              {errors.dueDate && (
                <p className="text-xs text-destructive">{errors.dueDate.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label>Etiketler</Label>
              <LabelPicker selectedLabels={selectedLabels} onChange={setSelectedLabels} />
            </div>
          </TabsContent>

          <TabsContent value="assignment" keepMounted className="grid gap-4 pt-2 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Departman</Label>
              <Controller
                control={control}
                name="departmentId"
                render={({ field }) => (
                  <Select
                    items={[
                      { value: NO_DEPARTMENT, label: 'Departman Yok' },
                      ...visibleDepartments.map((department) => ({
                        value: toId(department.id)!,
                        label: department.name,
                      })),
                    ]}
                    value={field.value ?? NO_DEPARTMENT}
                    onValueChange={(value) => {
                      const nextValue = value === NO_DEPARTMENT ? undefined : toId(value)
                      field.onChange(nextValue)
                      applyDepartmentFilter(nextValue)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Departman seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_DEPARTMENT}>Departman Yok</SelectItem>
                      {visibleDepartments.map((department) => (
                        <SelectItem key={toId(department.id)} value={toId(department.id)!}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Proje</Label>
              <Controller
                control={control}
                name="projectId"
                render={({ field }) => (
                  <Select
                    items={[
                      { value: NO_PROJECT, label: 'Proje Yok' },
                      ...visibleProjects.map((project) => ({
                        value: toId(project.id)!,
                        label: project.name,
                      })),
                    ]}
                    value={field.value ?? NO_PROJECT}
                    onValueChange={(value) => {
                      const nextValue = value === NO_PROJECT ? undefined : toId(value)
                      field.onChange(nextValue)
                      applyProjectMembers(nextValue)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Proje seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_PROJECT}>Proje Yok</SelectItem>
                      {visibleProjects.map((project) => (
                        <SelectItem key={toId(project.id)} value={toId(project.id)!}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {showAssignField && (
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label>Ata</Label>
                <MultiSelectCheckList
                  items={assignItems}
                  selectedIds={assignedUserIds}
                  onChange={setAssignedUserIds}
                  disabled={isPending}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="attachments" keepMounted className="pt-2">
            {mode === 'edit' && task ? (
              <AttachmentList taskId={String(task.id)} />
            ) : (
              <PendingFilesPicker files={pendingFiles} onChange={setPendingFiles} />
            )}
          </TabsContent>

        </Tabs>

        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {mode === 'create' ? 'Oluştur' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
