import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { DEFAULT_PROJECT_ICON } from '@/lib/projectIcons'
import { useCreateProjectMutation } from '@/modules/projects/api/useCreateProjectMutation'
import { useUpdateProjectMutation } from '@/modules/projects/api/useUpdateProjectMutation'
import { IconPicker } from '@/modules/projects/components/IconPicker'
import { ProjectMembersEditor } from '@/modules/projects/components/ProjectMembersEditor'
import { projectSchema, type ProjectFormValues } from '@/modules/projects/utils/schemas'
import type { ProjectDto, ProjectMemberInput } from '@/modules/projects/utils/types'

function toId(value: string | number): string {
  return String(value)
}

interface ProjectFormDialogProps {
  mode: 'create' | 'edit'
  project?: ProjectDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectFormDialog({
  mode,
  project,
  open,
  onOpenChange,
}: ProjectFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {open && (
          <ProjectFormFields mode={mode} project={project} onOpenChange={onOpenChange} />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface ProjectFormFieldsProps {
  mode: 'create' | 'edit'
  project?: ProjectDto
  onOpenChange: (open: boolean) => void
}

function ProjectFormFields({ mode, project, onOpenChange }: ProjectFormFieldsProps) {
  const createMutation = useCreateProjectMutation()
  const updateMutation = useUpdateProjectMutation()
  const isPending = mode === 'create' ? createMutation.isPending : updateMutation.isPending

  const [members, setMembers] = useState<ProjectMemberInput[]>(
    mode === 'edit' && project
      ? project.members?.map((member) => ({
          userId: toId(member.userId),
          role: member.role,
        })) ?? []
      : []
  )
  const [activeTab, setActiveTab] = useState('general')
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues:
      mode === 'edit' && project
        ? {
            name: project.name,
            description: project.description ?? '',
            iconKey: project.iconKey ?? DEFAULT_PROJECT_ICON,
            members:
              project.members?.map((member) => ({
                userId: toId(member.userId),
                role: member.role,
              })) ?? [],
          }
        : { name: '', description: '', iconKey: DEFAULT_PROJECT_ICON, members: [] },
  })

  async function onSubmit(values: ProjectFormValues) {
    setError(null)
    const dto = {
      name: values.name,
      description: values.description?.trim() ? values.description : null,
      iconKey: values.iconKey ?? null,
      members,
    }

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(dto)
      } else if (project) {
        await updateMutation.mutateAsync({ id: toId(project.id), dto })
      }
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Proje kaydedilemedi')
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{mode === 'create' ? 'Yeni Proje' : 'Projeyi Düzenle'}</DialogTitle>
      </DialogHeader>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <form
        onSubmit={handleSubmit(onSubmit, (formErrors) => {
          if (formErrors.name || formErrors.description) {
            setActiveTab('general')
          }
        })}
        noValidate
        className="flex flex-col gap-4"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="general">Genel</TabsTrigger>
            <TabsTrigger value="icon">İkon</TabsTrigger>
            <TabsTrigger value="members">Üyeler</TabsTrigger>
          </TabsList>

          <TabsContent value="general" keepMounted className="grid gap-4 pt-2 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="project-name">Ad</Label>
              <Input id="project-name" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="project-description">Açıklama</Label>
              <Textarea id="project-description" rows={4} {...register('description')} />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="icon" keepMounted className="pt-2">
            <Controller
              control={control}
              name="iconKey"
              render={({ field }) => (
                <IconPicker
                  selectedKey={field.value ?? DEFAULT_PROJECT_ICON}
                  onChange={field.onChange}
                />
              )}
            />
          </TabsContent>

          <TabsContent value="members" keepMounted className="pt-2">
            <ProjectMembersEditor members={members} onChange={setMembers} disabled={isPending} />
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
