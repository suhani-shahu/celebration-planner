// Vercel Function: POST /api/ideas. All logic lives in server/ so it can be tested.
import { createGenerator } from '../server/gemini.js'
import {
  RATE_LIMIT,
  createRateLimiter,
  handleIdeasRequest,
} from '../server/ideas.js'

const allow = createRateLimiter(RATE_LIMIT)
const generate = createGenerator(process.env)

export default {
  async fetch(request) {
    return handleIdeasRequest(request, { generate, allow })
  },
}
