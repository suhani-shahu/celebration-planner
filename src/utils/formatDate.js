/** Formats a YYYY-MM-DD string as "12 Mar 2027". Dates are read in UTC to avoid timezone drift. */
export function formatDisplayDate(isoDate) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
