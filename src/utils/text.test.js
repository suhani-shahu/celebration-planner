import { capitalize } from './text'

describe('capitalize', () => {
  it('capitalises the first letter only', () => {
    expect(capitalize('wedding')).toBe('Wedding')
    expect(capitalize('community event')).toBe('Community event')
  })

  it('handles empty and missing values', () => {
    expect(capitalize('')).toBe('')
    expect(capitalize(undefined)).toBe('')
    expect(capitalize(null)).toBe('')
  })
})
