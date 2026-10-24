const REQUEST_TIMEOUT_MS = 25000

const OFFLINE_IDEAS = {
  wedding: [
    {
      title: 'Golden-hour ceremony',
      description:
        'Schedule the ceremony an hour before sunset for soft light in photos and a cooler experience for guests.',
    },
    {
      title: 'Live food counters',
      description:
        'Add two or three live counters, such as chaat or dosa, to keep queues short and get guests mingling.',
    },
    {
      title: 'Memory wall',
      description:
        'Set up a wall where guests pin photos and short notes for the couple.',
    },
  ],
  birthday: [
    {
      title: 'Photo booth corner',
      description:
        'A simple backdrop with props gives guests something to do and gives you photos to share.',
    },
    {
      title: 'Game rounds',
      description:
        'Plan two short group games with small prizes so quieter guests join in too.',
    },
    {
      title: 'Cake-cutting moment',
      description:
        'Pick a fixed time, dim the lights and prepare a short playlist so the moment feels special.',
    },
  ],
  community: [
    {
      title: 'Welcome desk',
      description:
        'Place a desk at the entrance with a schedule, a map and volunteers who can answer questions.',
    },
    {
      title: 'Local vendors stalls',
      description:
        'Invite neighbourhood vendors to run stalls, which supports local business and adds variety.',
    },
    {
      title: 'Feedback box',
      description:
        'Collect suggestions on paper or by QR code to plan an even better event next time.',
    },
  ],
}

/** Built-in ideas that work without a network. Throws for an unknown event type. */
export function getOfflineIdeas({ eventType, theme = '' }) {
  if (!Object.hasOwn(OFFLINE_IDEAS, eventType)) {
    throw new RangeError(`Unknown event type: ${eventType}`)
  }
  const ideas = OFFLINE_IDEAS[eventType].map((idea) => ({ ...idea }))
  const cleanTheme = String(theme).trim()
  if (cleanTheme) {
    ideas.unshift({
      title: `Theme: ${cleanTheme}`,
      description:
        'Carry the theme through invitations, decor, food names and music so the event feels cohesive.',
    })
  }
  return { source: 'offline', ideas }
}

// Accepts only the expected shape. Anything else is treated as a failed request.
function isValidIdeas(data) {
  return (
    data !== null &&
    typeof data === 'object' &&
    Array.isArray(data.ideas) &&
    data.ideas.length > 0 &&
    data.ideas.every(
      (idea) =>
        idea !== null &&
        typeof idea === 'object' &&
        typeof idea.title === 'string' &&
        typeof idea.description === 'string',
    )
  )
}

/**
 * Asks the server for AI ideas. If the request fails for any reason (no
 * server, rate limit, timeout, bad reply) it returns the built-in ideas, so
 * the plan always has ideas. Rejects only for an unknown event type.
 */
export async function getIdeas(
  input,
  {
    fetchFn = (...args) => globalThis.fetch(...args),
    endpoint = '/api/ideas',
  } = {},
) {
  const offline = getOfflineIdeas(input)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetchFn(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: input.eventType,
        eventDate: input.eventDate,
        guestCount: input.guestCount,
        budget: input.budget,
        theme: input.theme,
      }),
      signal: controller.signal,
    })
    if (!response.ok) return offline

    const data = await response.json()
    if (!isValidIdeas(data)) return offline

    return {
      source: 'ai',
      ideas: data.ideas.map(({ title, description }) => ({
        title,
        description,
      })),
    }
  } catch {
    return offline
  } finally {
    clearTimeout(timer)
  }
}
