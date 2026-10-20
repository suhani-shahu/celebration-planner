export const EVENT_TYPES = ['wedding', 'birthday', 'community']

// Percentage split per event type. Each split must add up to 100.
const BUDGET_SPLITS = {
  wedding: {
    venue: 30,
    catering: 30,
    decor: 10,
    photography: 10,
    attire: 8,
    entertainment: 5,
    miscellaneous: 7,
  },
  birthday: {
    venue: 20,
    catering: 35,
    decor: 15,
    entertainment: 15,
    cake: 8,
    miscellaneous: 7,
  },
  community: {
    venue: 25,
    catering: 30,
    decor: 10,
    equipment: 15,
    promotion: 10,
    miscellaneous: 10,
  },
}

/**
 * Splits a total budget across categories for an event type.
 * Amounts are whole currency units and always add up to the total.
 * Any rounding leftover goes to 'miscellaneous' as a buffer.
 */
export function allocateBudget(total, eventType) {
  if (!Number.isInteger(total) || total <= 0) {
    throw new RangeError('Budget must be a positive whole number')
  }
  if (!Object.hasOwn(BUDGET_SPLITS, eventType)) {
    throw new RangeError(`Unknown event type: ${eventType}`)
  }

  const lines = Object.entries(BUDGET_SPLITS[eventType]).map(
    ([category, percent]) => ({
      category,
      percent,
      amount: Math.floor((total * percent) / 100),
    }),
  )

  const allocated = lines.reduce((sum, line) => sum + line.amount, 0)
  const buffer = lines.find((line) => line.category === 'miscellaneous')
  buffer.amount += total - allocated

  return lines
}
