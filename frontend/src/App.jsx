import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const timeSlots = [
  { minutes: 30, price: 500 },
  { minutes: 60, price: 900 },
  { minutes: 120, price: 1500 },
]

const paymentMethods = ['MOMO', 'ORANGE', 'CRYPTO']

function App() {
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [step, setStep] = useState('welcome')

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center max-w-md w-full"
          >
            <h1 className="text-4xl font-bold mb-2">Confort Lounge</h1>
            <p className="text-gray-400 mb-8">Purchase Wi-Fi time quickly</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep('select')}
              className="btn-primary w-full"
            >
              Get Started
            </motion.button>
          </motion.div>
        )}

        {step === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md w-full space-y-6"
          >
            <h2 className="text-2xl font-bold text-center">Choose a Time Slot</h2>
            <div className="space-y-3">
              {timeSlots.map((slot) => (
                <motion.button
                  key={slot.minutes}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedSlot(slot)
                    setStep('payment')
                  }}
                  className={`card w-full text-left flex items-center justify-between transition-colors ${
                    selectedSlot?.minutes === slot.minutes
                      ? 'border-blue-500 bg-gray-700'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <span className="font-semibold">{slot.minutes} minutes</span>
                  <span className="text-blue-400 font-bold">{slot.price} FCFA</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md w-full space-y-6"
          >
            <h2 className="text-2xl font-bold text-center">
              {selectedSlot.minutes} min — {selectedSlot.price} FCFA
            </h2>
            <p className="text-gray-400 text-center">Select a payment method</p>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <motion.button
                  key={method}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMethod(method)}
                  className={`card w-full text-center font-semibold transition-colors ${
                    selectedMethod === method
                      ? 'border-blue-500 bg-gray-700'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  {method}
                </motion.button>
              ))}
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={!selectedMethod}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setStep('done')}
            >
              Pay Now
            </motion.button>
            <button
              className="text-gray-400 text-sm w-full text-center mt-2"
              onClick={() => setStep('select')}
            >
              Back
            </button>
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center space-y-6"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold">Payment Initiated</h2>
            <p className="text-gray-400">
              You selected {selectedSlot.minutes} minutes via {selectedMethod}.
            </p>
            <button
              className="btn-primary w-full"
              onClick={() => {
                setStep('welcome')
                setSelectedSlot(null)
                setSelectedMethod(null)
              }}
            >
              Back to Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
