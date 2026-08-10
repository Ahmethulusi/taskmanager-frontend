export interface LabelColorTokens {
  bg: string
  text: string
}

const LABEL_COLORS: LabelColorTokens[] = [
  { bg: '#FFEDD5', text: '#9A3412' },
  { bg: '#DBEAFE', text: '#1E40AF' },
  { bg: '#DCFCE7', text: '#166534' },
  { bg: '#F3E8FF', text: '#6B21A8' },
  { bg: '#FEF9C3', text: '#854D0E' },
  { bg: '#F1F5F9', text: '#334155' },
]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

export function getLabelColor(labelId: string): LabelColorTokens {
  const hash = hashString(labelId)
  return LABEL_COLORS[hash % LABEL_COLORS.length]
}
