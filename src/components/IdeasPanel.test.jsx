import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IdeasPanel from './IdeasPanel'

const IDEAS = [
  { title: 'Idea one', description: 'First.' },
  { title: 'Idea two', description: 'Second.' },
]

describe('IdeasPanel', () => {
  it('announces loading politely', () => {
    render(<IdeasPanel status="loading" ideas={[]} onRetry={() => {}} />)
    expect(screen.getByText(/Finding ideas/)).toHaveAttribute(
      'aria-live',
      'polite',
    )
  })

  it('shows an error with a working retry button', async () => {
    const onRetry = vi.fn()
    render(<IdeasPanel status="error" ideas={[]} onRetry={onRetry} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load ideas')
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('labels AI ideas as AI-generated', () => {
    render(
      <IdeasPanel status="done" ideas={IDEAS} source="ai" onRetry={() => {}} />,
    )
    expect(screen.getByText(/AI-generated ideas/)).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('labels built-in ideas', () => {
    render(
      <IdeasPanel
        status="done"
        ideas={IDEAS}
        source="offline"
        onRetry={() => {}}
      />,
    )
    expect(screen.getByText('Showing built-in ideas')).toBeInTheDocument()
    expect(screen.queryByText(/AI-generated/)).not.toBeInTheDocument()
  })

  it('renders no list when there are no ideas', () => {
    render(
      <IdeasPanel status="done" ideas={[]} source="ai" onRetry={() => {}} />,
    )
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
