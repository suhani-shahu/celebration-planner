import { render, screen } from '@testing-library/react'
import Timeline from './Timeline'

const ITEMS = [
  { task: 'Book venue', dueDate: '2027-01-05', overdue: true },
  { task: 'Send invitations', dueDate: '2027-03-01', overdue: false },
]

describe('Timeline', () => {
  it('lists milestones in order with formatted due dates', () => {
    render(<Timeline items={ITEMS} />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Book venue')
    expect(items[0]).toHaveTextContent('Due: 5 Jan 2027')
    expect(items[1]).toHaveTextContent('Due: 1 Mar 2027')
  })

  it('shows an Overdue badge only for overdue items', () => {
    render(<Timeline items={ITEMS} />)
    const [first, second] = screen.getAllByRole('listitem')
    expect(first).toHaveTextContent('Overdue')
    expect(second).not.toHaveTextContent('Overdue')
  })
})
