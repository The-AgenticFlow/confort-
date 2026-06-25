/* eslint-disable no-undef */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Manager } from '../components/Manager'

describe('Manager Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('VITE_MANAGER_PIN', '1234')
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000')
  })

  describe('PIN Authentication', () => {
    it('renders PIN entry screen on mount', () => {
      render(<Manager />)
      expect(screen.getByText('Portail du gestionnaire')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('••••')).toBeInTheDocument()
    })

    it('accepts PIN input', async () => {
      render(<Manager />)
      const pinInput = screen.getByPlaceholderText('••••')
      await userEvent.type(pinInput, '1234')
      expect(pinInput.value).toBe('1234')
    })

    it('transitions to manager screen with correct PIN', async () => {
      render(<Manager />)
      const pinInput = screen.getByPlaceholderText('••••')
      const submitButton = screen.getByRole('button', { name: 'Soumettre' })

      await userEvent.type(pinInput, '1234')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Vérification du code')).toBeInTheDocument()
      })
    })

    it('keeps PIN screen with incorrect PIN', async () => {
      render(<Manager />)
      const pinInput = screen.getByPlaceholderText('••••')
      const submitButton = screen.getByRole('button', { name: 'Soumettre' })

      await userEvent.type(pinInput, '0000')
      fireEvent.click(submitButton)

      expect(screen.queryByText('Vérification du code')).not.toBeInTheDocument()
      expect(screen.getByText('Portail du gestionnaire')).toBeInTheDocument()
    })
  })

  describe('Code Verification', () => {
    beforeEach(async () => {
      render(<Manager />)
      const pinInput = screen.getByPlaceholderText('••••')
      const submitButton = screen.getByRole('button', { name: 'Soumettre' })
      await userEvent.type(pinInput, '1234')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Vérification du code')).toBeInTheDocument()
      })
    })

    it('renders code input field', async () => {
      const codeInput = screen.getByPlaceholderText('Entrer le code')
      expect(codeInput).toBeInTheDocument()
      expect(codeInput).toHaveAttribute('type', 'text')
      expect(codeInput).toHaveAttribute('maxlength', '4')
    })

    it('converts code input to uppercase', async () => {
      const codeInput = screen.getByPlaceholderText('Entrer le code')
      await userEvent.type(codeInput, 'abc2')
      expect(codeInput.value).toBe('ABC2')
    })

    it('disables verify button when code is not 4 characters', async () => {
      const verifyButton = screen.getByRole('button', { name: 'Vérifier' })
      expect(verifyButton).toBeDisabled()

      const codeInput = screen.getByPlaceholderText('Entrer le code')
      await userEvent.type(codeInput, 'AB')
      expect(verifyButton).toBeDisabled()
    })

    it('enables verify button when code is 4 characters', async () => {
      const codeInput = screen.getByPlaceholderText('Entrer le code')
      const verifyButton = screen.getByRole('button', { name: 'Vérifier' })

      await userEvent.type(codeInput, 'ABC2')
      expect(verifyButton).not.toBeDisabled()
    })

    it('shows success message on valid code', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true }),
        })
      )

      const codeInput = screen.getByPlaceholderText('Entrer le code')
      const verifyButton = screen.getByRole('button', { name: 'Vérifier' })

      await userEvent.type(codeInput, 'ABC2')
      fireEvent.click(verifyButton)

      await waitFor(() => {
        expect(screen.getByText('Code vérifié!')).toBeInTheDocument()
      })
    })

    it('shows error message on invalid code', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: false, message: 'Invalid code' }),
        })
      )

      const codeInput = screen.getByPlaceholderText('Entrer le code')
      const verifyButton = screen.getByRole('button', { name: 'Vérifier' })

      await userEvent.type(codeInput, 'XXXX')
      fireEvent.click(verifyButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid code')).toBeInTheDocument()
      })
    })

    it('shows error message for already used code', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: false, message: 'Code already used' }),
        })
      )

      const codeInput = screen.getByPlaceholderText('Entrer le code')
      const verifyButton = screen.getByRole('button', { name: 'Vérifier' })

      await userEvent.type(codeInput, 'USED')
      fireEvent.click(verifyButton)

      await waitFor(() => {
        expect(screen.getByText('Code already used')).toBeInTheDocument()
      })
    })

    it('resets form after successful verification', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true }),
        })
      )

      const codeInput = screen.getByPlaceholderText('Entrer le code')
      const verifyButton = screen.getByRole('button', { name: 'Vérifier' })

      await userEvent.type(codeInput, 'ABC2')
      fireEvent.click(verifyButton)

      await waitFor(() => {
        expect(screen.getByText('Code vérifié!')).toBeInTheDocument()
      })

      const verifyNextButton = screen.getByRole('button', { name: 'Vérifier le suivant' })
      fireEvent.click(verifyNextButton)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Entrer le code')).toHaveValue('')
        expect(screen.getByText('Vérification du code')).toBeInTheDocument()
      })
    })
  })
})
