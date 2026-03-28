import { describe, it, expect } from 'vitest'
import { calcDays, findOverlap, detectUniversity } from './rental-utils'

// ─── calcDays ─────────────────────────────────────────────────────────────────

describe('calcDays', () => {
  it('returns 1 for same start and end date', () => {
    expect(calcDays('2024-03-01', '2024-03-01')).toBe(1)
  })

  it('returns correct days for multi-day range', () => {
    expect(calcDays('2024-03-01', '2024-03-03')).toBe(3)
  })

  it('returns 0 for empty strings', () => {
    expect(calcDays('', '')).toBe(0)
    expect(calcDays('2024-03-01', '')).toBe(0)
    expect(calcDays('', '2024-03-01')).toBe(0)
  })

  it('returns 0 if end is before start (never shown in UI, guarded)', () => {
    expect(calcDays('2024-03-05', '2024-03-01')).toBe(0)
  })

  it('handles month-boundary correctly', () => {
    expect(calcDays('2024-01-30', '2024-02-02')).toBe(4)
  })
})

// ─── findOverlap ──────────────────────────────────────────────────────────────

describe('findOverlap', () => {
  const blocked = [
    { start_date: '2024-03-10', end_date: '2024-03-15' },
    { start_date: '2024-03-20', end_date: '2024-03-25' },
  ]

  it('returns undefined when no overlap', () => {
    expect(findOverlap('2024-03-01', '2024-03-09', blocked)).toBeUndefined()
    expect(findOverlap('2024-03-16', '2024-03-19', blocked)).toBeUndefined()
    expect(findOverlap('2024-03-26', '2024-03-30', blocked)).toBeUndefined()
  })

  it('detects full overlap inside a blocked range', () => {
    expect(findOverlap('2024-03-11', '2024-03-14', blocked)).toEqual(blocked[0])
  })

  it('detects overlap at exact boundaries', () => {
    expect(findOverlap('2024-03-15', '2024-03-16', blocked)).toEqual(blocked[0])
    expect(findOverlap('2024-03-09', '2024-03-10', blocked)).toEqual(blocked[0])
  })

  it('detects overlap spanning multiple blocks', () => {
    expect(findOverlap('2024-03-12', '2024-03-22', blocked)).toEqual(blocked[0])
  })

  it('returns undefined for empty blocked list', () => {
    expect(findOverlap('2024-03-01', '2024-03-31', [])).toBeUndefined()
  })
})

// ─── detectUniversity ─────────────────────────────────────────────────────────

describe('detectUniversity', () => {
  it('detects NUS from u.nus.edu domain', () => {
    expect(detectUniversity('student@u.nus.edu')).toBe('NUS')
  })

  it('detects NUS from nus.edu.sg domain', () => {
    expect(detectUniversity('admin@nus.edu.sg')).toBe('NUS')
  })

  it('detects NTU from e.ntu.edu.sg domain', () => {
    expect(detectUniversity('student@e.ntu.edu.sg')).toBe('NTU')
  })

  it('detects SMU from smu.edu.sg domain', () => {
    expect(detectUniversity('student@smu.edu.sg')).toBe('SMU')
  })

  it('detects SUTD from sutd.edu.sg domain', () => {
    expect(detectUniversity('student@sutd.edu.sg')).toBe('SUTD')
  })

  it('detects SIT from singaporetech.edu.sg domain', () => {
    expect(detectUniversity('student@singaporetech.edu.sg')).toBe('SIT')
  })

  it('detects SUSS from suss.edu.sg domain', () => {
    expect(detectUniversity('student@suss.edu.sg')).toBe('SUSS')
  })

  it('detects Ngee Ann Polytechnic', () => {
    expect(detectUniversity('student@connect.np.edu.sg')).toBe('Ngee Ann Poly')
  })

  it('detects Singapore Polytechnic', () => {
    expect(detectUniversity('student@ichat.sp.edu.sg')).toBe('Singapore Poly')
  })

  it('detects Temasek Polytechnic', () => {
    expect(detectUniversity('student@tp.edu.sg')).toBe('Temasek Poly')
  })

  it('detects Nanyang Polytechnic', () => {
    expect(detectUniversity('student@nyp.edu.sg')).toBe('Nanyang Poly')
  })

  it('detects Republic Polytechnic', () => {
    expect(detectUniversity('student@rp.edu.sg')).toBe('Republic Poly')
  })

  // Alumni domains
  it('detects NUS from alumni.nus.edu.sg domain', () => {
    expect(detectUniversity('john@alumni.nus.edu.sg')).toBe('NUS')
  })

  it('detects NTU from alumni.ntu.edu.sg domain', () => {
    expect(detectUniversity('john@alumni.ntu.edu.sg')).toBe('NTU')
  })

  it('detects SMU from alumni.smu.edu.sg domain', () => {
    expect(detectUniversity('john@alumni.smu.edu.sg')).toBe('SMU')
  })

  it('detects SUTD from alumni.sutd.edu.sg domain', () => {
    expect(detectUniversity('john@alumni.sutd.edu.sg')).toBe('SUTD')
  })

  it('detects SIT from alumni.singaporetech.edu.sg domain', () => {
    expect(detectUniversity('john@alumni.singaporetech.edu.sg')).toBe('SIT')
  })

  it('detects SUSS from alumni.suss.edu.sg domain', () => {
    expect(detectUniversity('john@alumni.suss.edu.sg')).toBe('SUSS')
  })

  it('returns empty string for unknown domain', () => {
    expect(detectUniversity('user@gmail.com')).toBe('')
    expect(detectUniversity('user@harvard.edu')).toBe('')
  })

  it('is case-insensitive for domain part', () => {
    expect(detectUniversity('student@E.NTU.EDU.SG')).toBe('NTU')
  })

  it('returns empty string for email with no domain', () => {
    expect(detectUniversity('nodomain')).toBe('')
  })
})
