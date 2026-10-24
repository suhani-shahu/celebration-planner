# Celebration Planner

An accessible planning assistant for **weddings, birthdays and community events**. Enter the event type, date, guest count and budget, and get a budget split, a dated timeline, a vendor checklist and AI-generated ideas.

**Live demo:** https://celebration-planner-six.vercel.app

## What it does

| Feature          | How it works                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Budget           | Splits the total across categories by event type and shows the amount and share for each                                              |
| Timeline         | Works backwards from the event date and gives each task a due date. Tasks that are already past due are flagged as overdue            |
| Vendor checklist | Groups vendors by category (venue, caterer, photographer, decorator, entertainment and more) with checkboxes                          |
| Ideas            | Gemini suggests ideas that fit the event type, guest count, budget and theme. If the AI is unavailable, built-in ideas appear instead |
| Print            | One click prints the plan                                                                                                             |

The plan itself (budget, timeline, checklist) is calculated by plain, tested JavaScript and never depends on the AI. Only the ideas section does.

## Chosen vertical

**Celebration & Event Planner** for three event types: weddings, birthdays and community events. The user is an individual or a small organising committee who needs a clear plan without a paid planner.

## Approach and assumptions

The assistant makes its decisions from the user's context: the event type decides the budget split, the milestones and the vendor checklist; the date decides which tasks are already overdue; the guest count and budget are validated and passed on to the ideas request.

Assumptions made:

- Budget splits are fixed percentages per event type, for example 30% venue and 30% catering for a wedding. They are sensible defaults, not quotes from real vendors.
- Timeline milestones are fixed "days before the event" offsets per event type, for example booking the venue 150 days before a wedding.
- The event date must be today or later. Guests must be a whole number from 1 to 10,000, and the budget a whole amount from 1,000 to 1,000,000,000 rupees.
- Theme text is optional and limited to 60 characters.
- All amounts are in Indian rupees, and one user plans one event at a time.
- The ideas are suggestions from an AI model and have not been checked by a human. The rest of the plan does not depend on them.

## Tech stack

- **Frontend:** Vite, React 19, plain CSS with light and dark themes
- **Backend:** one Vercel Function (`api/ideas.js`) that calls Gemini through `@google/genai`
- **Validation:** Zod for everything the model returns
- **Quality tools:** Vitest, React Testing Library, vitest-axe, ESLint with `jsx-a11y`, Prettier

## Architecture

```
Browser (React)
  |  form values
  v
src/planner/*        pure functions: budget, timeline, checklist, buildPlan (validated, tested)
  |
  |  POST /api/ideas   (form fields only)
  v
api/ideas.js  ->  server/ideas.js   validate input, rate limit, build prompt, validate output
                  server/gemini.js  Gemini call (key read from the environment)
```

Design choices:

- **Plan logic is separate from the UI.** The same `buildPlan` validation runs in the browser and on the server, so the two cannot disagree.
- **The app always works.** If the API fails, times out, is rate limited or returns something unexpected, the client shows built-in ideas and says so.
- **The API key never reaches the browser.** It is a server-side environment variable.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

`npm run dev` serves only the front end, so the ideas section shows the built-in ideas. To run the AI endpoint locally as well, use the Vercel CLI (`vercel dev`) with a `GEMINI_API_KEY` set in a local `.env.local` file (git-ignored).

### Environment variables (set on the server, never in the repo)

| Name             | Required     | Purpose                                           |
| ---------------- | ------------ | ------------------------------------------------- |
| `GEMINI_API_KEY` | For AI ideas | Google AI Studio key                              |
| `GEMINI_MODEL`   | No           | Overrides the default model without a code change |

### Scripts

| Command                           | What it does                          |
| --------------------------------- | ------------------------------------- |
| `npm run lint`                    | ESLint, including accessibility rules |
| `npm test`                        | Runs the Vitest suite                 |
| `npm run build`                   | Production build                      |
| `npm run format` / `format:check` | Prettier                              |

## Testing

124 tests in 8 files, all passing:

- Budget, timeline, checklist and plan logic, including boundary dates and invalid input
- The API handler: valid and invalid input, wrong types, oversized bodies, rate limiting, bad or hostile model output, timeouts, and error responses that must not leak details
- The client service: fallback to built-in ideas on every kind of failure
- A toolchain smoke test (a placeholder component checked with axe). Tests of the real UI components are not written yet.

## Accessibility

- Every field has a visible label, hint text and a linked error message
- Submitting an invalid form shows an error summary and moves focus to the first invalid field
- A skip link, semantic landmarks and a visible focus indicator
- Light and dark themes that follow the system setting, with button and text colors chosen to meet WCAG AA contrast (4.5:1)
- `eslint-plugin-jsx-a11y` runs on every lint.

**Lighthouse results** (desktop, run on the live site in a clean browser profile):

| Check                                          | Result                                                  |
| ---------------------------------------------- | ------------------------------------------------------- |
| Performance                                    | 100                                                     |
| Best Practices                                 | 100                                                     |
| Accessibility, with a generated plan on screen | 100                                                     |
| Accessibility, empty form                      | 95 before a contrast fix, since fixed                   |
| SEO                                            | 90 before a page description was added; not re-measured |

Automated tools catch only part of the problems. Screen-reader testing has not been done.

## Security

- The Gemini key lives only in a server environment variable
- Input is type-checked and size-limited (2 KB) and validated with the same rules as the form
- The model's output is untrusted: it must pass a strict schema (lengths and counts) or it is discarded
- The user's theme text is sent as quoted data and the system instruction tells the model not to follow instructions inside it
- Rate limiting per client (10 requests per 10 minutes), a 20 second model timeout, and `store: false` so requests are not kept on the model side
- Error responses never include model output or internal messages
- Responses are sent with `Cache-Control: no-store` and `X-Content-Type-Options: nosniff`
- `.env*` files are git-ignored

## Known limitations

- The rate limiter keeps its counts in memory, so each warm server instance counts separately. This is a best-effort limit, not a hard one. A shared store would be the next step.
- Budget percentages and timeline offsets are sensible defaults, not advice tuned to a city or a culture
- Currency is Indian rupees only
- Plans are not saved. Refreshing the page clears them
- Ideas depend on a free-tier Gemini quota, and the built-in ideas appear when it is exhausted

## How it was built

Built with AI assistance: Claude helped design and write the planning logic, the server code and the tests, and Google Antigravity generated the first version of the UI components. The code was run, linted and tested by the author.
