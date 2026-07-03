import { describe, expect, it } from 'vitest'

import { formatOccasion, isGiftListCurrent } from './giftDisplay'

describe('formatOccasion', () => {
  it('formats known occasion values for display', () => {
    expect(formatOccasion('baby_shower')).toBe('Baby shower')
    expect(formatOccasion('housewarming')).toBe('Housewarming')
  })

  it('formats unknown enum-like values without leaking underscores', () => {
    expect(formatOccasion('new_year_party')).toBe('New Year Party')
  })
})

describe('isGiftListCurrent', () => {
  const now = new Date('2026-07-03T10:00:00.000Z')

  it('keeps active never-expiring lists current', () => {
    expect(isGiftListCurrent({ is_active: true, never_expires: true }, now)).toBe(true)
  })

  it('moves inactive or expired lists to previous', () => {
    expect(isGiftListCurrent({ is_active: false, never_expires: true }, now)).toBe(false)
    expect(isGiftListCurrent({ is_active: true, never_expires: false, expires_at: '2026-07-03T09:59:00.000Z' }, now)).toBe(false)
  })

  it('keeps active future-expiring lists current', () => {
    expect(isGiftListCurrent({ is_active: true, never_expires: false, expires_at: '2026-07-03T10:01:00.000Z' }, now)).toBe(true)
  })
})
