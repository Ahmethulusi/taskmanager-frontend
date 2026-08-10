export interface ProjectColorTokens {
  bg: string
  accent: string
}

const PROJECT_CARD_COLORS: ProjectColorTokens[] = [
  { bg: '#FFF1E6', accent: '#C2410C' },
  { bg: '#EFF6FF', accent: '#2563EB' },
  { bg: '#F0FDF4', accent: '#16A34A' },
  { bg: '#FAF5FF', accent: '#9333EA' },
  { bg: '#FEFCE8', accent: '#CA8A04' },
  { bg: '#F4F4F5', accent: '#71717A' },
]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

export function getProjectColor(projectId: string): ProjectColorTokens {
  const hash = hashString(projectId)
  return PROJECT_CARD_COLORS[hash % PROJECT_CARD_COLORS.length]
}
