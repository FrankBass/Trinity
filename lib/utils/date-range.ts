export type DateRange = {
  from: Date
  to: Date
}

export function inRange(iso: string, range: DateRange): boolean {
  const d = new Date(iso).getTime()
  return d >= range.from.getTime() && d <= range.to.getTime()
}

export function getMonthRange(d: Date): DateRange {
  const from = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0)
  const to = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
  return { from, to }
}

export function getLastNMonthsRange(n: number): DateRange {
  const to = new Date()
  to.setHours(23, 59, 59, 999)
  const from = new Date()
  from.setMonth(from.getMonth() - n)
  from.setDate(1)
  from.setHours(0, 0, 0, 0)
  return { from, to }
}

export function getYearRange(d: Date): DateRange {
  const from = new Date(d.getFullYear(), 0, 1, 0, 0, 0)
  const to = new Date(d.getFullYear(), 11, 31, 23, 59, 59)
  return { from, to }
}

export function formatDateRange(range: DateRange): string {
  return `${range.from.toLocaleDateString("fr-FR")} - ${range.to.toLocaleDateString("fr-FR")}`
}
