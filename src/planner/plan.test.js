import { buildPlan } from './plan'

const TODAY = '2026-10-21'
const valid = {
  eventType: 'wedding',
  eventDate: '2027-06-01',
  guestCount: '150',
  budget: '500000',
  theme: '  Garden  ',
}

describe('buildPlan', () => {
  it('builds a full plan from valid input', () => {
    const { plan, errors } = buildPlan(valid, TODAY)
    expect(errors).toBeUndefined()
    expect(plan.budget.reduce((sum, line) => sum + line.amount, 0)).toBe(500000)
    expect(plan.timeline.length).toBeGreaterThan(0)
    expect(plan.checklist.length).toBeGreaterThan(0)
  })

  it('trims the theme and converts numbers', () => {
    expect(buildPlan(valid, TODAY).plan.input).toEqual({
      eventType: 'wedding',
      eventDate: '2027-06-01',
      guestCount: 150,
      budget: 500000,
      theme: 'Garden',
    })
  })

  it('reports every invalid field at once', () => {
    const { plan, errors } = buildPlan(
      { eventType: '', eventDate: '', guestCount: '', budget: '', theme: '' },
      TODAY,
    )
    expect(plan).toBeUndefined()
    expect(Object.keys(errors).sort()).toEqual([
      'budget',
      'eventDate',
      'eventType',
      'guestCount',
    ])
  })

  it.each([
    ['', 'Choose the event date'],
    ['2026-10-20', 'Event date cannot be in the past'],
  ])('rejects date "%s"', (eventDate, message) => {
    expect(buildPlan({ ...valid, eventDate }, TODAY).errors.eventDate).toBe(
      message,
    )
  })

  it('rejects a theme that is too long', () => {
    const { errors } = buildPlan({ ...valid, theme: 'x'.repeat(61) }, TODAY)
    expect(errors.theme).toBeDefined()
  })

  it.each(['0', 'abc', '10001', '1.5', ''])(
    'rejects guest count "%s"',
    (guestCount) => {
      expect(
        buildPlan({ ...valid, guestCount }, TODAY).errors.guestCount,
      ).toBeDefined()
    },
  )

  it.each(['0', '999', 'abc', '', '1000000001'])(
    'rejects budget "%s"',
    (budget) => {
      expect(buildPlan({ ...valid, budget }, TODAY).errors.budget).toBeDefined()
    },
  )

  it('rejects an unknown event type', () => {
    const { errors } = buildPlan({ ...valid, eventType: 'party' }, TODAY)
    expect(errors.eventType).toBeDefined()
  })
})
