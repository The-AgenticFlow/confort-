import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout } from './components/Layout'

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
    <Layout>
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center w-full"
          >
            <p className="text-white/60 mb-10 text-lg">
              Purchase Wi-Fi time quickly and securely.
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep('select')}
              className="w-full py-4 rounded-xl font-semibold text-arcade-black bg-neon-cyan neon-btn"
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
            className="w-full space-y-6"
          >
            <h2 className="text-2xl font-bold text-center text-white mb-2">
              Choose a Time Slot
            </h2>
            <div className="space-y-4">
              {timeSlots.map((slot) => (
                <motion.button
                  key={slot.minutes}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedSlot(slot)
                    setStep('payment')
                  }}
                  className={`glass-card w-full text-left flex items-center justify-between p-5 transition-all ${
                    selectedSlot?.minutes === slot.minutes
                      ? 'border-neon-cyan/80 bg-white/10'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <span className="font-semibold text-white">{slot.minutes} minutes</span>
                  <span className="text-neon-cyan font-bold">{slot.price} FCFA</span>
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
            className="w-full space-y-6"
          >
            <h2 className="text-2xl font-bold text-center text-white">
              {selectedSlot.minutes} min — {selectedSlot.price} FCFA
            </h2>
            <p className="text-white/60 text-center">Select a payment method</p>
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <motion.button
                  key={method}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMethod(method)}
                  className={`glass-card w-full text-center font-semibold py-4 transition-all ${
                    selectedMethod === method
                      ? 'border-neon-cyan/80 bg-white/10'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {method}
                </motion.button>
              ))}
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={!selectedMethod}
              className="w-full py-4 rounded-xl font-semibold text-arcade-black bg-neon-cyan neon-btn disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => setStep('done')}
            >
              Pay Now
            </motion.button>
            <button
              className="text-white/50 text-sm w-full text-center mt-2 hover:text-white/80 transition-colors"
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
            className="w-full text-center space-y-6"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white">Payment Initiated</h2>
            <p className="text-white/60">
              You selected {selectedSlot.minutes} minutes via {selectedMethod}.
            </p>
            <button
              className="w-full py-4 rounded-xl font-semibold text-arcade-black bg-neon-cyan neon-btn"
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
    </Layout>
  )
}

export default App
