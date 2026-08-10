export type StatusColorKey = 'gray' | 'yellow' | 'orange' | 'green' | 'blue' | 'purple'

export interface StatusColorTokens {
  bg: string
  dot: string
}

export const STATUS_COLOR_KEYS: StatusColorKey[] = [
  'gray',
  'yellow',
  'orange',
  'green',
  'blue',
  'purple',
]

export const STATUS_COLOR_MAP: Record<StatusColorKey, StatusColorTokens> = {
  gray: { bg: '#F4F4F5', dot: '#71717A' },
  yellow: { bg: '#FEFCE8', dot: '#CA8A04' },
  orange: { bg: '#FFF1E6', dot: '#C2410C' },
  green: { bg: '#F0FDF4', dot: '#16A34A' },
  blue: { bg: '#EFF6FF', dot: '#2563EB' },
  purple: { bg: '#FAF5FF', dot: '#9333EA' },
}

export function getStatusColor(colorKey: string | null | undefined): StatusColorTokens {
  if (colorKey && colorKey in STATUS_COLOR_MAP) {
    return STATUS_COLOR_MAP[colorKey as StatusColorKey]
  }
  return STATUS_COLOR_MAP.gray
}
