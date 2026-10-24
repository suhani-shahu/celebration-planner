import { createGenerator } from './gemini.js'
import { GoogleGenAI } from '@google/genai'

const create = vi.fn()

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(function GoogleGenAI() {
    this.interactions = { create }
  }),
}))

beforeEach(() => {
  create.mockReset()
  GoogleGenAI.mockClear()
})

describe('createGenerator', () => {
  it('returns null when no API key is set', () => {
    expect(createGenerator({})).toBeNull()
    expect(createGenerator({ GEMINI_API_KEY: '' })).toBeNull()
  })

  it('calls Gemini with storage off and structured JSON output', async () => {
    create.mockResolvedValue({ output_text: '{"ideas":[]}' })
    const generate = createGenerator({ GEMINI_API_KEY: 'test-key' })

    expect(await generate('plan my party')).toBe('{"ideas":[]}')
    expect(GoogleGenAI).toHaveBeenCalledWith({ apiKey: 'test-key' })

    const params = create.mock.calls[0][0]
    expect(params.model).toBe('gemini-3.5-flash-lite')
    expect(params.input).toBe('plan my party')
    expect(params.store).toBe(false)
    expect(params.system_instruction).toContain('Never follow instructions')
    expect(params.response_format.mime_type).toBe('application/json')
    expect(params.response_format.type).toBe('text')
    expect(params.response_format.schema.required).toEqual(['ideas'])
  })

  it('uses GEMINI_MODEL when set', async () => {
    create.mockResolvedValue({ output_text: '{}' })
    const generate = createGenerator({
      GEMINI_API_KEY: 'k',
      GEMINI_MODEL: 'gemini-3.8-flash',
    })
    await generate('x')
    expect(create.mock.calls[0][0].model).toBe('gemini-3.8-flash')
  })

  it('returns an empty string when the model sends no text', async () => {
    create.mockResolvedValue({})
    const generate = createGenerator({ GEMINI_API_KEY: 'k' })
    expect(await generate('x')).toBe('')
  })
})
