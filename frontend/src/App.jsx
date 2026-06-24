import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout } from './components/Layout'
import { TimeSelection } from './components/TimeSelection'

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
            className="w-full pb-24"
          >
            <TimeSelection
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
            />
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
              onClick={() => setStep('welcome')}
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

      {step === 'welcome' && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          disabled={!selectedSlot}
          onClick={() => setStep('payment')}
          animate={
            selectedSlot
              ? {
                  boxShadow: [
                    '0 0 15px rgba(0, 255, 204, 0.4)',
                    '0 0 30px rgba(0, 255, 204, 0.8)',
                    '0 0 15px rgba(0, 255, 204, 0.4)',
                  ],
                }
              : {}
          }
          transition={
            selectedSlot
              ? {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : {}
          }
          className="fixed bottom-0 left-0 right-0 py-4 px-4 font-semibold text-arcade-black bg-neon-cyan neon-btn disabled:opacity-40 disabled:cursor-not-allowed m-4 rounded-xl will-change-shadow"
        >
          Proceed to Pay
        </motion.button>
      )}
    </Layout>
  )
}

export default App
