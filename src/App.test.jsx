import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import App from './App'

const AI_IDEAS = {
  source: 'ai',
  ideas: [
    { title: 'Lantern walk', description: 'Guests walk a lantern-lit path.' },
    { title: 'Live music', description: 'A small acoustic band.' },
    { title: 'Photo wall', description: 'A wall of flowers.' },
  ],
}

// A YYYY-MM-DD date a given number of days from now, so the tests never go stale.
function futureDate(days) {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)
}

function mockFetch(impl) {
  const fn = vi.fn(impl)
  vi.stubGlobal('fetch', fn)
  return fn
}

const respond = (data, ok = true) =>
  Promise.resolve({ ok, status: ok ? 200 : 502, json: async () => data })

async function fillAndSubmit(
  user,
  {
    type = 'wedding',
    date = futureDate(200),
    guests = '150',
    budget = '500000',
    theme = '',
  } = {},
) {
  await user.selectOptions(screen.getByLabelText('Event type'), type)
  fireEvent.change(screen.getByLabelText('Event date'), {
    target: { value: date },
  })
  await user.clear(screen.getByLabelText('Number of guests'))
  await user.type(screen.getByLabelText('Number of guests'), guests)
  await user.clear(screen.getByLabelText('Total budget in rupees'))
  await user.type(screen.getByLabelText('Total budget in rupees'), budget)
  if (theme) await user.type(screen.getByLabelText(/Theme/), theme)
  await user.click(screen.getByRole('button', { name: 'Create my plan' }))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App form validation', () => {
  it('shows an error summary and focuses the first invalid field', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Create my plan' }))

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('There are problems with your submission')
    expect(
      within(alert).getByRole('link', { name: 'Choose an event type' }),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByLabelText('Event type')).toHaveFocus(),
    )
    expect(screen.getByLabelText('Event type')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(screen.queryByText('Your plan is ready')).not.toBeInTheDocument()
  })

  it('rejects an out-of-range guest count with a linked message', async () => {
    const user = userEvent.setup()
    render(<App />)
    await fillAndSubmit(user, { guests: '20000' })

    const field = screen.getByLabelText('Number of guests')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    const message = document.getElementById(
      field.getAttribute('aria-describedby'),
    )
    expect(message).toHaveTextContent('Enter a whole number from 1 to 10,000')
  })

  it('does not call the server when the form is invalid', async () => {
    const fetchFn = mockFetch(() => respond(AI_IDEAS))
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Create my plan' }))
    expect(fetchFn).not.toHaveBeenCalled()
  })
})

describe('App with a valid plan', () => {
  it('shows budget, timeline, checklist and AI ideas', async () => {
    const fetchFn = mockFetch(() => respond(AI_IDEAS))
    const user = userEvent.setup()
    render(<App />)
    await fillAndSubmit(user, { theme: 'Garden' })

    expect(
      await screen.findByRole('heading', { name: 'Your plan is ready' }),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Your plan is ready' }),
      ).toHaveFocus(),
    )

    const budget = screen.getByRole('table', { name: 'Budget breakdown' })
    expect(within(budget).getByText('Venue')).toBeInTheDocument()
    expect(within(budget).getByText('Total')).toBeInTheDocument()
    expect(
      within(budget)
        .getAllByText(/₹/)
        .some((c) => /5,00,000/.test(c.textContent)),
    ).toBe(true)

    expect(
      screen.getByRole('heading', { name: 'Timeline' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Send invitations')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Vendor checklist' }),
    ).toBeInTheDocument()

    expect(await screen.findByText('Lantern walk')).toBeInTheDocument()
    expect(screen.getByText(/AI-generated ideas/)).toBeInTheDocument()
    expect(screen.queryByText('Showing built-in ideas')).not.toBeInTheDocument()

    const [url, options] = fetchFn.mock.calls[0]
    expect(url).toBe('/api/ideas')
    expect(JSON.parse(options.body)).toMatchObject({
      eventType: 'wedding',
      guestCount: 150,
      budget: 500000,
      theme: 'Garden',
    })
  })

  it('falls back to built-in ideas when the server fails', async () => {
    mockFetch(() => respond({}, false))
    const user = userEvent.setup()
    render(<App />)
    await fillAndSubmit(user, { theme: 'Garden' })

    expect(
      await screen.findByText('Showing built-in ideas'),
    ).toBeInTheDocument()
    expect(screen.getByText('Theme: Garden')).toBeInTheDocument()
  })

  it('flags overdue milestones when the event is soon', async () => {
    mockFetch(() => respond(AI_IDEAS))
    const user = userEvent.setup()
    render(<App />)
    await fillAndSubmit(user, { date: futureDate(5) })

    await screen.findByText('Lantern walk')
    expect(screen.getAllByText('Overdue').length).toBeGreaterThan(0)
  })

  it('counts ticked checklist items in a polite status message', async () => {
    mockFetch(() => respond(AI_IDEAS))
    const user = userEvent.setup()
    render(<App />)
    await fillAndSubmit(user)
    await screen.findByText('Lantern walk')

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(/^0 of \d+ tasks done/)
    await user.click(screen.getAllByRole('checkbox')[0])
    expect(status).toHaveTextContent(/^1 of \d+ tasks done/)
  })

  it('switching event type resets the checklist and does not crash', async () => {
    mockFetch(() => respond(AI_IDEAS))
    const user = userEvent.setup()
    render(<App />)

    await fillAndSubmit(user, {
      type: 'birthday',
      guests: '30',
      budget: '30000',
    })
    await screen.findByText('Lantern walk')
    await user.click(screen.getAllByRole('checkbox')[0])
    expect(screen.getByRole('status')).toHaveTextContent(/^1 of \d+ tasks done/)

    await fillAndSubmit(user, { type: 'wedding' })
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        /^0 of \d+ tasks done/,
      ),
    )
    expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0)
  })

  it('ignores a slow reply from an earlier request', async () => {
    const pending = []
    mockFetch(
      () =>
        new Promise((resolve) => {
          pending.push(resolve)
        }),
    )
    const user = userEvent.setup()
    render(<App />)

    await fillAndSubmit(user, { theme: 'First' })
    await fillAndSubmit(user, { theme: 'Second' })
    await waitFor(() => expect(pending).toHaveLength(2))

    const ok = (title) => ({
      ok: true,
      json: async () => ({
        ideas: [1, 2, 3].map((n) => ({
          title: `${title} ${n}`,
          description: 'Description',
        })),
      }),
    })
    pending[1](ok('Newer'))
    expect(await screen.findByText('Newer 1')).toBeInTheDocument()
    pending[0](ok('Older'))
    await new Promise((r) => setTimeout(r, 0))
    expect(screen.queryByText('Older 1')).not.toBeInTheDocument()
    expect(screen.getByText('Newer 1')).toBeInTheDocument()
  })

  it('prints the plan from the print button', async () => {
    mockFetch(() => respond(AI_IDEAS))
    const print = vi.fn()
    vi.stubGlobal('print', print)
    const user = userEvent.setup()
    render(<App />)
    await fillAndSubmit(user)
    await screen.findByText('Lantern walk')

    await user.click(screen.getByRole('button', { name: 'Print plan' }))
    expect(print).toHaveBeenCalledTimes(1)
  })
})

describe('App accessibility (axe)', () => {
  it('has no violations on the empty form', async () => {
    const { container } = render(<App />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no violations with form errors showing', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    await user.click(screen.getByRole('button', { name: 'Create my plan' }))
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no violations with a full plan on screen', async () => {
    mockFetch(() => respond(AI_IDEAS))
    const user = userEvent.setup()
    const { container } = render(<App />)
    await fillAndSubmit(user, { theme: 'Garden' })
    await screen.findByText('Lantern walk')
    expect(await axe(container)).toHaveNoViolations()
  })
})
