/** 只允许非负数字字符串（含小数） */
export function sanitizeNonNegative(value: string): string {
  let v = value.replace(/[^\d.]/g, '')
  const parts = v.split('.')
  if (parts.length > 2) {
    v = parts[0] + '.' + parts.slice(1).join('')
  }
  if (v.startsWith('.')) v = '0' + v
  return v
}

export function parseNonNegative(value: string): number {
  const n = parseFloat(sanitizeNonNegative(value))
  if (!Number.isFinite(n) || n < 0) return 0
  return n
}
