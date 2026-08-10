export function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) {
    return ''
  }
  return iso.slice(0, 10)
}

/** Backend DateTime bekliyor; form/takvimden gelen YYYY-MM-DD değerini ISO'ya çevirir. */
export function toApiDueDate(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }
  if (value.includes('T')) {
    return value
  }
  return `${value}T00:00:00.000Z`
}
