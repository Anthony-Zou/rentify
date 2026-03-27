export type BlockedRange = { start_date: string; end_date: string }

/**
 * Returns the number of rental days (inclusive) between two ISO date strings.
 * e.g. 2024-01-01 → 2024-01-03 = 3 days
 */
export function calcDays(start: string, end: string): number {
  if (!start || !end) return 0
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(0, Math.round(diff / 86400000) + 1)
}

/**
 * Returns the first blocked range that overlaps with [start, end], or undefined.
 */
export function findOverlap(
  start: string,
  end: string,
  ranges: BlockedRange[]
): BlockedRange | undefined {
  return ranges.find((r) => start <= r.end_date && end >= r.start_date)
}

export const UNIVERSITY_DOMAIN_MAP: Record<string, string> = {
  'u.nus.edu': 'NUS',
  'nus.edu.sg': 'NUS',
  'e.ntu.edu.sg': 'NTU',
  'ntu.edu.sg': 'NTU',
  'smu.edu.sg': 'SMU',
  'mymail.sutd.edu.sg': 'SUTD',
  'sutd.edu.sg': 'SUTD',
  'singaporetech.edu.sg': 'SIT',
  'suss.edu.sg': 'SUSS',
}

/**
 * Detects the university name from a university email address.
 * Returns empty string if the domain is not recognized.
 */
export function detectUniversity(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase() ?? ''
  return UNIVERSITY_DOMAIN_MAP[domain] ?? ''
}
