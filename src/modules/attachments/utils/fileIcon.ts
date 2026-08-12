import { File, FileText, Image, type LucideIcon } from 'lucide-react'

export function getAttachmentIcon(contentType: string): LucideIcon {
  if (contentType.startsWith('image/')) {
    return Image
  }
  if (contentType === 'application/pdf') {
    return FileText
  }
  return File
}
