export const MILESTONES = {
  wedding: [
    { task: 'Set budget and guest list', daysBefore: 180 },
    { task: 'Book venue and caterer', daysBefore: 150 },
    { task: 'Book photographer and decorator', daysBefore: 120 },
    { task: 'Send invitations', daysBefore: 60 },
    { task: 'Finalise menu and decor', daysBefore: 30 },
    { task: 'Confirm all vendors', daysBefore: 7 },
    { task: 'Share final headcount', daysBefore: 3 },
  ],
  birthday: [
    { task: 'Set budget and guest list', daysBefore: 60 },
    { task: 'Book venue', daysBefore: 45 },
    { task: 'Order cake and decor', daysBefore: 30 },
    { task: 'Send invitations', daysBefore: 21 },
    { task: 'Confirm vendors', daysBefore: 7 },
    { task: 'Prepare games and playlist', daysBefore: 1 },
  ],
  community: [
    { task: 'Define goals and budget', daysBefore: 90 },
    { task: 'Secure venue and permits', daysBefore: 60 },
    { task: 'Recruit volunteers', daysBefore: 45 },
    { task: 'Promote the event', daysBefore: 30 },
    { task: 'Confirm equipment and vendors', daysBefore: 14 },
    { task: 'Brief volunteers', daysBefore: 3 },
  ],
}

const MS_PER_DAY = 86400000
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Today's date in the user's local timezone, as YYYY-MM-DD. */
export function todayISO() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function parseDate(value) {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) {
    throw new RangeError('Date must be in YYYY-MM-DD format')
  }
  const date = new Date(`${value}T00:00:00Z`)
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new RangeError('Not a real calendar date')
  }
  return date
}

/**
 * Builds a chronological list of planning milestones working back from
 * the event date. Dates are handled in UTC to avoid timezone drift.
 * A milestone is 'overdue' when its due date is before today.
 */
export function generateTimeline(eventDate, eventType, today = todayISO()) {
  if (!Object.hasOwn(MILESTONES, eventType)) {
    throw new RangeError(`Unknown event type: ${eventType}`)
  }
  const event = parseDate(eventDate)
  const now = parseDate(today)
  if (event < now) {
    throw new RangeError('Event date cannot be in the past')
  }

  return MILESTONES[eventType].map(({ task, daysBefore }) => {
    const due = new Date(event.getTime() - daysBefore * MS_PER_DAY)
    return { task, dueDate: due.toISOString().slice(0, 10), overdue: due < now }
  })
}
