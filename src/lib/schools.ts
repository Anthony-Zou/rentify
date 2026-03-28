/**
 * Static list of Singapore schools (universities & polytechnics)
 * Used for filtering listings by school
 */

export const SCHOOLS = [
  // Universities (6)
  'NUS',
  'NTU',
  'SUSS',
  'SUTD',
  'SIT',
  'SMU',
  // Polytechnics (5)
  'Nanyang Poly',
  'Ngee Ann Poly',
  'Republic Poly',
  'Singapore Poly',
  'Temasek Poly',
].sort()

export const SCHOOLS_WITH_ALL = ['All', ...SCHOOLS]
