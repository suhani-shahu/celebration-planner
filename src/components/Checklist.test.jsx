import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Checklist from './Checklist'

const VENDORS = [
  { vendor: 'Venue', items: ['Confirm date', 'Get the contract'] },
  { vendor: 'Caterer', items: ['Book a tasting'] },
]

describe('Checklist', () => {
  it('groups items by vendor with a legend each', () => {
    render(<Checklist vendors={VENDORS} />)
    expect(screen.getByRole('group', { name: 'Venue' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Caterer' })).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toHaveLength(3)
  })

  it('links each checkbox to its label', () => {
    render(<Checklist vendors={VENDORS} />)
    expect(
      screen.getByRole('checkbox', { name: 'Book a tasting' }),
    ).not.toBeChecked()
  })

  it('updates the done counter as boxes are ticked and cleared', async () => {
    const user = userEvent.setup()
    render(<Checklist vendors={VENDORS} />)
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('0 of 3 tasks done')

    await user.click(screen.getByRole('checkbox', { name: 'Confirm date' }))
    expect(status).toHaveTextContent('1 of 3 tasks done')
    await user.click(screen.getByRole('checkbox', { name: 'Book a tasting' }))
    expect(status).toHaveTextContent('2 of 3 tasks done')
    await user.click(screen.getByRole('checkbox', { name: 'Confirm date' }))
    expect(status).toHaveTextContent('1 of 3 tasks done')
  })
})
