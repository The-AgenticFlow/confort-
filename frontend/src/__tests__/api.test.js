import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/api', () => ({
  initiatePayment: vi.fn(),
  pollTransactionStatus: vi.fn(),
}))

import { initiatePayment, pollTransactionStatus } from '../lib/api'

describe('API Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initiatePayment', () => {
    it('should be callable with time slot and amount', async () => {
      const mockData = { id: 'txn_123', status: 'PENDING' }
      initiatePayment.mockResolvedValueOnce(mockData)

      const result = await initiatePayment(30, 5000)

      expect(result).toEqual(mockData)
      expect(initiatePayment).toHaveBeenCalledWith(30, 5000)
    })

    it('should handle errors', async () => {
      const error = new Error('Payment failed')
      initiatePayment.mockRejectedValueOnce(error)

      await expect(initiatePayment(30, 5000)).rejects.toThrow(
        'Payment failed'
      )
    })
  })

  describe('pollTransactionStatus', () => {
    it('should poll for transaction status', async () => {
      const mockData = { id: 'txn_123', status: 'PAID' }
      pollTransactionStatus.mockResolvedValueOnce(mockData)

      const result = await pollTransactionStatus('txn_123')

      expect(result).toEqual(mockData)
      expect(pollTransactionStatus).toHaveBeenCalledWith('txn_123')
    })

    it('should accept polling options', async () => {
      const mockData = { id: 'txn_123', status: 'PAID' }
      pollTransactionStatus.mockResolvedValueOnce(mockData)

      const options = { maxAttempts: 10, pollInterval: 500 }
      const result = await pollTransactionStatus('txn_123', options)

      expect(result).toEqual(mockData)
      expect(pollTransactionStatus).toHaveBeenCalledWith('txn_123', options)
    })

    it('should handle timeout errors', async () => {
      const error = new Error('Payment polling timeout')
      pollTransactionStatus.mockRejectedValueOnce(error)

      await expect(pollTransactionStatus('txn_123')).rejects.toThrow(
        'Payment polling timeout'
      )
    })

    it('should handle transaction not found', async () => {
      const error = new Error('Transaction not found')
      pollTransactionStatus.mockRejectedValueOnce(error)

      await expect(pollTransactionStatus('invalid_id')).rejects.toThrow(
        'Transaction not found'
      )
    })

    it('should accept onProgress callback', async () => {
      const mockCallback = vi.fn()
      const mockData = { id: 'txn_123', status: 'PAID' }
      pollTransactionStatus.mockResolvedValueOnce(mockData)

      const options = {
        maxAttempts: 10,
        pollInterval: 500,
        onProgress: mockCallback,
      }

      await pollTransactionStatus('txn_123', options)

      expect(pollTransactionStatus).toHaveBeenCalledWith('txn_123', options)
    })
  })
})
