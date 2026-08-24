export function getDueUrgencyDisplay(urgency: 'Tomorrow' | 'Soon' | null) {
  if (urgency === 'Tomorrow') return { label: 'Yarın Bitiyor', color: '#EA580C' } // turuncu
  if (urgency === 'Soon') return { label: 'Yakında Bitiyor', color: '#CA8A04' } // sarı
  return null
}
