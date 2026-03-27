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
  'u.nus.edu': 'NUS — National University of Singapore',
  'nus.edu.sg': 'NUS — National University of Singapore',
  'e.ntu.edu.sg': 'NTU — Nanyang Technological University',
  'ntu.edu.sg': 'NTU — Nanyang Technological University',
  'smu.edu.sg': 'SMU — Singapore Management University',
  'mymail.sutd.edu.sg': 'SUTD — Singapore University of Technology and Design',
  'sutd.edu.sg': 'SUTD — Singapore University of Technology and Design',
  'singaporetech.edu.sg': 'SIT — Singapore Institute of Technology',
  'suss.edu.sg': 'SUSS — Singapore University of Social Sciences',
}

/**
 * Detects the university name from a university email address.
 * Returns empty string if the domain is not recognized.
 */
export function detectUniversity(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase() ?? ''
  return UNIVERSITY_DOMAIN_MAP[domain] ?? ''
}
