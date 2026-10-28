import { formatDisplayDate } from './formatDate'

describe('formatDisplayDate', () => {
  it('formats a date as day, short month and year', () => {
    expect(formatDisplayDate('2027-03-12')).toBe('12 Mar 2027')
  })

  it('does not shift the day across timezones', () => {
    expect(formatDisplayDate('2027-01-01')).toBe('1 Jan 2027')
    expect(formatDisplayDate('2027-12-31')).toBe('31 Dec 2027')
  })
})
