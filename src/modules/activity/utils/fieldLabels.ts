export const FIELD_LABELS: Record<string, string> = {
  Created: 'Oluşturma',
  Title: 'Başlık',
  Description: 'Açıklama',
  Priority: 'Öncelik',
  Status: 'Durum',
  DueDate: 'Bitiş Tarihi',
  Department: 'Departman',
  Project: 'Proje',
  AssignedUsers: 'Atananlar',
  Labels: 'Etiketler',
}

export function getFieldLabel(fieldName: string): string {
  return FIELD_LABELS[fieldName] ?? fieldName
}
