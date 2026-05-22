export function formatLedgerDates(start: string, end: string): string {
  if (!start) return '未设日期'
  if (!end) return `${start} — 进行中`
  return `${start} — ${end}`
}
