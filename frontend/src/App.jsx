import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout } from './components/Layout'
import { TimeSelection } from './components/TimeSelection'
import { Payment } from './components/Payment'

function App() {
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [step, setStep] = useState('welcome')
  const [transactionId, setTransactionId] = useState(null)

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
            className="w-full pb-24"
          >
            <Payment
              selectedSlot={selectedSlot}
              onPaymentComplete={(id) => {
                setTransactionId(id)
                setStep('success')
              }}
              onBack={() => setStep('welcome')}
            />
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full text-center space-y-6 pb-24"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <h2 className="text-3xl font-bold text-neon-cyan">Payment Confirmed!</h2>
            <p className="text-white/60">
              Your {selectedSlot.minutes}-minute session is ready.
            </p>
            {transactionId && (
              <p className="text-xs text-white/40">ID: {transactionId}</p>
            )}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-full py-4 rounded-xl font-semibold text-arcade-black bg-neon-cyan neon-btn"
              onClick={() => {
                setStep('welcome')
                setSelectedSlot(null)
                setTransactionId(null)
              }}
            >
              Play Another Session
            </motion.button>
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
