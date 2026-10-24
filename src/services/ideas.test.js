import { EVENT_TYPES } from '../planner/budget.js'
import { getIdeas, getOfflineIdeas } from './ideas.js'

const INPUT = {
  eventType: 'wedding',
  eventDate: '2099-06-01',
  guestCount: 150,
  budget: 500000,
  theme: 'Garden',
}

const AI_REPLY = {
  source: 'ai',
  ideas: [
    { title: 'Idea one', description: 'First.' },
    { title: 'Idea two', description: 'Second.' },
    { title: 'Idea three', description: 'Third.' },
  ],
}

const okResponse = (data) => ({ ok: true, json: async () => data })

describe('getOfflineIdeas', () => {
  it.each(EVENT_TYPES)(
    '%s returns ideas with titles and descriptions',
    (eventType) => {
      const { source, ideas } = getOfflineIdeas({ eventType })
      expect(source).toBe('offline')
      expect(ideas.length).toBeGreaterThanOrEqual(3)
      for (const idea of ideas) {
        expect(idea.title).toBeTruthy()
        expect(idea.description).toBeTruthy()
      }
    },
  )

  it('adds a theme idea first when a theme is given', () => {
    const { ideas } = getOfflineIdeas({
      eventType: 'birthday',
      theme: ' Space ',
    })
    expect(ideas[0].title).toBe('Theme: Space')
  })

  it('rejects an unknown event type', () => {
    expect(() => getOfflineIdeas({ eventType: 'party' })).toThrow(RangeError)
  })
})

describe('getIdeas', () => {
  it('returns AI ideas and sends only the form fields', async () => {
    const fetchFn = vi.fn().mockResolvedValue(okResponse(AI_REPLY))
    const result = await getIdeas({ ...INPUT, extra: 'not sent' }, { fetchFn })

    expect(result.source).toBe('ai')
    expect(result.ideas).toEqual(AI_REPLY.ideas)

    const [url, options] = fetchFn.mock.calls[0]
    expect(url).toBe('/api/ideas')
    expect(options.method).toBe('POST')
    expect(options.headers['Content-Type']).toBe('application/json')
    expect(JSON.parse(options.body)).toEqual({
      eventType: 'wedding',
      eventDate: '2099-06-01',
      guestCount: 150,
      budget: 500000,
      theme: 'Garden',
    })
  })

  it('keeps only title and description from each AI idea', async () => {
    const reply = {
      ideas: [{ title: 'A', description: 'B', html: '<script>x</script>' }],
    }
    const fetchFn = vi.fn().mockResolvedValue(okResponse(reply))
    const { ideas } = await getIdeas(INPUT, { fetchFn })
    expect(ideas).toEqual([{ title: 'A', description: 'B' }])
  })

  it.each([
    ['a server error', { ok: false, status: 502, json: async () => ({}) }],
    ['a rate limit', { ok: false, status: 429, json: async () => ({}) }],
    [
      'a reply that is not JSON',
      {
        ok: true,
        json: async () => {
          throw new SyntaxError('bad')
        },
      },
    ],
    ['an empty ideas list', okResponse({ ideas: [] })],
    [
      'ideas of the wrong type',
      okResponse({ ideas: [{ title: 1, description: 2 }] }),
    ],
    ['a missing ideas field', okResponse({})],
    ['a null reply', okResponse(null)],
  ])('falls back to built-in ideas after %s', async (_name, response) => {
    const fetchFn = vi.fn().mockResolvedValue(response)
    const result = await getIdeas(INPUT, { fetchFn })
    expect(result.source).toBe('offline')
    expect(result.ideas[0].title).toBe('Theme: Garden')
  })

  it('falls back when the network fails', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    const result = await getIdeas(INPUT, { fetchFn })
    expect(result.source).toBe('offline')
  })

  it('gives up on a request that hangs', async () => {
    vi.useFakeTimers()
    try {
      const fetchFn = vi.fn(
        (_url, { signal }) =>
          new Promise((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(new Error('aborted')))
          }),
      )
      const pending = getIdeas(INPUT, { fetchFn })
      await vi.advanceTimersByTimeAsync(25001)
      expect((await pending).source).toBe('offline')
    } finally {
      vi.useRealTimers()
    }
  })

  it('rejects an unknown event type without calling the server', async () => {
    const fetchFn = vi.fn()
    await expect(
      getIdeas({ ...INPUT, eventType: 'party' }, { fetchFn }),
    ).rejects.toThrow(RangeError)
    expect(fetchFn).not.toHaveBeenCalled()
  })
})
