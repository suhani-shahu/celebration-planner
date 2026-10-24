import { GoogleGenAI } from '@google/genai'
import { SYSTEM_INSTRUCTION, ideasJsonSchema } from './ideas.js'

const DEFAULT_MODEL = 'gemini-3.5-flash-lite'

/**
 * Returns a function that sends a prompt to Gemini and returns the reply text,
 * or null when no API key is configured. The key stays on the server.
 * Set GEMINI_MODEL to change the model without changing code.
 */
export function createGenerator(env) {
  const apiKey = env.GEMINI_API_KEY
  if (!apiKey) return null

  const client = new GoogleGenAI({ apiKey })
  const model = env.GEMINI_MODEL || DEFAULT_MODEL

  return async function generate(prompt) {
    const interaction = await client.interactions.create({
      model,
      system_instruction: SYSTEM_INSTRUCTION,
      input: prompt,
      // Do not keep a copy of the user's request on Google's side.
      store: false,
      generation_config: { max_output_tokens: 4096 },
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: ideasJsonSchema,
      },
    })
    return interaction.output_text ?? ''
  }
}
