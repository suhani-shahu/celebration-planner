import { EVENT_TYPES } from './budget'
import { generateChecklist } from './checklist'

describe('generateChecklist', () => {
  it.each(EVENT_TYPES)('%s has vendor groups with items', (type) => {
    const list = generateChecklist(type, 50)
    expect(list.length).toBeGreaterThan(0)
    for (const group of list) {
      expect(group.vendor).toBeTruthy()
      expect(group.items.length).toBeGreaterThan(0)
    }
  })

  it('adds no capacity items for a small event', () => {
    const items = generateChecklist('wedding', 50).flatMap((g) => g.items)
    expect(items.some((item) => item.includes('crowd flow'))).toBe(false)
    expect(items.some((item) => item.includes('Confirm capacity'))).toBe(false)
  })

  it('adds capacity and crowd items for a large event', () => {
    const venue = generateChecklist('wedding', 500)[0]
    expect(venue.items).toContain('Confirm capacity for 500 guests')
    expect(venue.items).toContain('Plan crowd flow, parking and security')
  })

  it('never lets callers change the shared defaults', () => {
    const first = generateChecklist('wedding', 50)
    first[0].items.push('junk')
    const second = generateChecklist('wedding', 50)
    expect(second[0].items).not.toContain('junk')
  })

  it.each([0, -1, 1.5, NaN, '50', null, 10001])(
    'rejects invalid guest count %s',
    (bad) => {
      expect(() => generateChecklist('wedding', bad)).toThrow(RangeError)
    },
  )

  it.each(['party', '', 'constructor', undefined])(
    'rejects unknown event type %s',
    (bad) => {
      expect(() => generateChecklist(bad, 50)).toThrow(RangeError)
    },
  )
})
