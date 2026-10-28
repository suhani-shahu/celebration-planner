// The Vercel entry point is thin wiring, so these tests check that it is hooked up correctly.
describe('api/ideas entry point', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('rejects anything but POST', async () => {
    vi.stubEnv('GEMINI_API_KEY', '')
    const { default: handler } = await import('./ideas.js')
    const response = await handler.fetch(
      new Request('http://localhost/api/ideas', { method: 'GET' }),
    )
    expect(response.status).toBe(405)
  })

  it('reports 503 when no API key is configured', async () => {
    vi.stubEnv('GEMINI_API_KEY', '')
    const { default: handler } = await import('./ideas.js')
    const response = await handler.fetch(
      new Request('http://localhost/api/ideas', {
        method: 'POST',
        body: JSON.stringify({ eventType: 'wedding' }),
      }),
    )
    expect(response.status).toBe(503)
  })
})
