import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'

function Demo() {
  return (
    <main>
      <h1>Planner</h1>
      <button type="button">Create plan</button>
    </main>
  )
}

describe('test toolchain', () => {
  it('renders and finds elements', () => {
    render(<Demo />)
    expect(
      screen.getByRole('button', { name: 'Create plan' }),
    ).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Demo />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
