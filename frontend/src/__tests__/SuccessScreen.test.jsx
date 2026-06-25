import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SuccessScreen } from '../components/SuccessScreen'

describe('SuccessScreen', () => {
  const mockSlot = {
    minutes: 30,
  }

  it('should render success message', () => {
    render(
      <SuccessScreen
        selectedSlot={mockSlot}
        transactionId="txn_123"
        onRestart={() => {}}
      />
    )

    expect(screen.getByText('Payment Confirmed!')).toBeInTheDocument()
    expect(screen.getByText(/30-minute session/)).toBeInTheDocument()
  })

  it('should display transaction ID', () => {
    render(
      <SuccessScreen
        selectedSlot={mockSlot}
        transactionId="txn_abc123"
        onRestart={() => {}}
      />
    )

    expect(screen.getByText(/ID: txn_abc123/)).toBeInTheDocument()
  })

  it('should call onRestart when button clicked', async () => {
    const mockRestart = vi.fn()
    const user = userEvent.setup()

    render(
      <SuccessScreen
        selectedSlot={mockSlot}
        transactionId="txn_123"
        onRestart={mockRestart}
      />
    )

    const button = screen.getByText('Play Another Session')
    await user.click(button)

    expect(mockRestart).toHaveBeenCalled()
  })

  it('should render celebration emoji', () => {
    const { container } = render(
      <SuccessScreen
        selectedSlot={mockSlot}
        transactionId="txn_123"
        onRestart={() => {}}
      />
    )

    expect(container.textContent).toMatch(/🎉/)
  })
})
