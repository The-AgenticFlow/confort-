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
