import { render, screen } from '@testing-library/react'
import ResultCard from './ResultCard'

describe('ResultCard', () => {
  it('is a region named by its heading', () => {
    render(
      <ResultCard id="demo" title="Demo title">
        <p>Body</p>
      </ResultCard>,
    )
    expect(
      screen.getByRole('region', { name: 'Demo title' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Demo title' })).toHaveAttribute(
      'id',
      'demo-heading',
    )
    expect(screen.getByText('Body')).toBeInTheDocument()
  })
})
