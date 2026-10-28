import { render, screen, within } from '@testing-library/react'
import BudgetTable from './BudgetTable'

const ROWS = [
  { category: 'venue', percent: 60, amount: 60000 },
  { category: 'miscellaneous', percent: 40, amount: 40000 },
]

describe('BudgetTable', () => {
  it('is a captioned table with column and row headers', () => {
    render(<BudgetTable rows={ROWS} total={100000} />)
    const table = screen.getByRole('table', { name: 'Budget breakdown' })
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((h) => h.textContent),
    ).toEqual(['Category', 'Share (%)', 'Amount'])
    expect(
      within(table).getByRole('rowheader', { name: 'Venue' }),
    ).toBeInTheDocument()
  })

  it('shows each share and the formatted total', () => {
    render(<BudgetTable rows={ROWS} total={100000} />)
    expect(screen.getByText('60%')).toBeInTheDocument()
    const totalRow = screen.getByRole('row', { name: /Total/ })
    expect(totalRow.textContent.replace(/\s/g, '')).toContain('₹1,00,000')
  })
})
