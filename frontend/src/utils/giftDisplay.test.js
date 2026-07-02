import { describe, expect, it } from 'vitest'

import { formatOccasion } from './giftDisplay'

describe('formatOccasion', () => {
  it('formats known occasion values for display', () => {
    expect(formatOccasion('baby_shower')).toBe('Baby shower')
    expect(formatOccasion('housewarming')).toBe('Housewarming')
  })

  it('formats unknown enum-like values without leaking underscores', () => {
    expect(formatOccasion('new_year_party')).toBe('New Year Party')
  })
})
