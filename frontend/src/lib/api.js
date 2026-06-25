import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function initiatePayment(timeSlot, amount) {
  try {
    const response = await apiClient.post('/api/initiate', {
      time_slot: timeSlot,
      amount,
    })
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || 'Failed to initiate payment'
    )
  }
}

export async function pollTransactionStatus(transactionId, options = {}) {
  const {
    maxAttempts = 120,
    pollInterval = 500,
    onProgress = null,
  } = options

  let attempts = 0
  const startTime = Date.now()

  const poll = async () => {
    attempts++
    try {
      const response = await apiClient.get(`/api/transaction/${transactionId}`)
      const { status } = response.data

      if (onProgress) {
        onProgress({
          attempts,
          maxAttempts,
          elapsed: Date.now() - startTime,
          status,
        })
      }

      if (status === 'PAID') {
        return response.data
      }

      if (attempts >= maxAttempts) {
        throw new Error('Payment polling timeout')
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval))
      return poll()
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Transaction not found')
      }
      if (attempts >= maxAttempts) {
        throw new Error(
          error.message || 'Failed to verify payment status'
        )
      }
      await new Promise((resolve) => setTimeout(resolve, pollInterval))
      return poll()
    }
  }

  return poll()
}
