import { formatINR } from './formatCurrency'

describe('formatINR', () => {
  it('uses Indian digit grouping and no decimals', () => {
    expect(formatINR(500000).replace(/\s/g, '')).toBe('₹5,00,000')
    expect(formatINR(1234567).replace(/\s/g, '')).toBe('₹12,34,567')
  })
})
