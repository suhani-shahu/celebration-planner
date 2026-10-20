import { EVENT_TYPES } from '../planner/budget'
import { getIdeas } from './ideas'

describe('getIdeas (offline)', () => {
  it.each(EVENT_TYPES)(
    '%s returns ideas with titles and descriptions',
    async (eventType) => {
      const { source, ideas } = await getIdeas({ eventType })
      expect(source).toBe('offline')
      expect(ideas.length).toBeGreaterThanOrEqual(3)
      for (const idea of ideas) {
        expect(idea.title).toBeTruthy()
        expect(idea.description).toBeTruthy()
      }
    },
  )

  it('adds a theme idea first when a theme is given', async () => {
    const { ideas } = await getIdeas({
      eventType: 'birthday',
      theme: ' Space ',
    })
    expect(ideas[0].title).toBe('Theme: Space')
  })

  it('rejects an unknown event type', async () => {
    await expect(getIdeas({ eventType: 'party' })).rejects.toThrow(RangeError)
  })
})
