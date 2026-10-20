import { allocateBudget, EVENT_TYPES } from './budget'

const sum = (lines, key) => lines.reduce((total, line) => total + line[key], 0)

describe('allocateBudget', () => {
  it.each(EVENT_TYPES)('%s percentages add up to exactly 100', (type) => {
    expect(sum(allocateBudget(100000, type), 'percent')).toBe(100)
  })

  it.each([1, 7, 999, 100001, 2500000])(
    'amounts add up to the total (%i)',
    (total) => {
      for (const type of EVENT_TYPES) {
        expect(sum(allocateBudget(total, type), 'amount')).toBe(total)
      }
    },
  )

  it('calculates a known wedding split', () => {
    const lines = allocateBudget(100000, 'wedding')
    const venue = lines.find((line) => line.category === 'venue')
    expect(venue.amount).toBe(30000)
  })

  it.each([0, -5, 1.5, NaN, '5000', null])(
    'rejects invalid budget %s',
    (bad) => {
      expect(() => allocateBudget(bad, 'wedding')).toThrow(RangeError)
    },
  )

  it.each(['party', '', 'constructor', undefined])(
    'rejects unknown event type %s',
    (bad) => {
      expect(() => allocateBudget(100000, bad)).toThrow(RangeError)
    },
  )
})
