import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateProjectMutation } from '@/modules/projects/api/useCreateProjectMutation'
import { useUpdateProjectMutation } from '@/modules/projects/api/useUpdateProjectMutation'
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
      <DialogContent className="sm:max-w-xl">
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
  const [error, setError] = useState<string | null>(null)

  const {
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
            members:
              project.members?.map((member) => ({
                userId: toId(member.userId),
                role: member.role,
              })) ?? [],
          }
        : { name: '', description: '', members: [] },
  })

  async function onSubmit(values: ProjectFormValues) {
    setError(null)
    const dto = {
      name: values.name,
      description: values.description?.trim() ? values.description : null,
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

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="project-name">Ad</Label>
          <Input id="project-name" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="project-description">Açıklama</Label>
          <Textarea id="project-description" rows={3} {...register('description')} />
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label>Üyeler</Label>
          <ProjectMembersEditor
            members={members} 
            onChange={setMembers}
            disabled={isPending}
          />
        </div>

        <DialogFooter className="sm:col-span-2">
          <Button type="submit" disabled={isPending}>
            {mode === 'create' ? 'Oluştur' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
