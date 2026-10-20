import { generateTimeline } from './timeline'

describe('generateTimeline', () => {
  it('returns milestones in chronological order', () => {
    const dates = generateTimeline('2027-06-01', 'wedding', '2026-10-21').map(
      (m) => m.dueDate,
    )
    expect(dates).toEqual([...dates].sort())
  })

  it('calculates known due dates', () => {
    const plan = generateTimeline('2026-12-20', 'birthday', '2026-10-21')
    expect(plan[0]).toEqual({
      task: 'Set budget and guest list',
      dueDate: '2026-10-21',
      overdue: false,
    })
    expect(plan.at(-1).dueDate).toBe('2026-12-19')
  })

  it('marks early milestones overdue when planning late', () => {
    const plan = generateTimeline('2026-10-31', 'wedding', '2026-10-21')
    expect(plan[0].overdue).toBe(true)
    expect(plan.at(-1).overdue).toBe(false)
  })

  it('accepts an event happening today', () => {
    const plan = generateTimeline('2026-10-21', 'birthday', '2026-10-21')
    expect(plan.at(-1).dueDate).toBe('2026-10-20')
    expect(plan.at(-1).overdue).toBe(true)
  })

  it('rejects a past event date', () => {
    expect(() =>
      generateTimeline('2026-10-20', 'wedding', '2026-10-21'),
    ).toThrow(RangeError)
  })

  it.each([
    '2026-13-01',
    '2026-02-30',
    '21/10/2026',
    '',
    20261021,
    null,
    undefined,
  ])('rejects invalid date %s', (bad) => {
    expect(() => generateTimeline(bad, 'wedding', '2026-10-21')).toThrow(
      RangeError,
    )
  })

  it.each(['party', '', 'constructor', undefined])(
    'rejects unknown event type %s',
    (bad) => {
      expect(() => generateTimeline('2027-01-01', bad, '2026-10-21')).toThrow(
        RangeError,
      )
    },
  )
})
