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

/**
 * Returns event ideas. Offline for now; the AI call will be added here later
 * without changing the shape of the result.
 */
export async function getIdeas({ eventType, theme = '' }) {
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
