import { allocateBudget, EVENT_TYPES } from './budget.js'
import { generateChecklist } from './checklist.js'
import { generateTimeline, todayISO } from './timeline.js'

const MAX_THEME_LENGTH = 60

// Accepts only digit strings, so '1.5', '1e3', '0x10' and '' are all rejected.
const toWholeNumber = (value) =>
  /^\d+$/.test(String(value ?? '').trim()) ? Number(value) : NaN

/**
 * Validates raw form values and builds the full plan.
 * Returns { errors } with one message per bad field, or { plan }.
 */
export function buildPlan(input, today = todayISO()) {
  const errors = {}
  const eventType = input.eventType
  const guestCount = toWholeNumber(input.guestCount)
  const budget = toWholeNumber(input.budget)
  const theme = String(input.theme ?? '').trim()

  if (!EVENT_TYPES.includes(eventType)) {
    errors.eventType = 'Choose an event type'
  }

  if (!input.eventDate) {
    errors.eventDate = 'Choose the event date'
  } else {
    try {
      // The event type does not affect date validity, so any type works here.
      generateTimeline(input.eventDate, 'wedding', today)
    } catch (error) {
      errors.eventDate = error.message
    }
  }

  if (guestCount < 1 || guestCount > 10000 || Number.isNaN(guestCount)) {
    errors.guestCount = 'Enter a whole number from 1 to 10,000'
  }
  if (budget < 1000 || budget > 1000000000 || Number.isNaN(budget)) {
    errors.budget = 'Enter a whole amount from 1,000 to 1,000,000,000'
  }
  if (theme.length > MAX_THEME_LENGTH) {
    errors.theme = `Keep the theme under ${MAX_THEME_LENGTH} characters`
  }

  if (Object.keys(errors).length > 0) return { errors }

  return {
    plan: {
      input: {
        eventType,
        eventDate: input.eventDate,
        guestCount,
        budget,
        theme,
      },
      budget: allocateBudget(budget, eventType),
      timeline: generateTimeline(input.eventDate, eventType, today),
      checklist: generateChecklist(eventType, guestCount),
    },
  }
}
