import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Layout } from './components/Layout'
import { TimeSelection } from './components/TimeSelection'
import { Payment } from './components/Payment'
import { SuccessScreen } from './components/SuccessScreen'

function App() {
  const { t } = useTranslation()
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [step, setStep] = useState('welcome')
  const [transactionId, setTransactionId] = useState(null)
  const [code, setCode] = useState(null)

  return (
    <Layout>
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full pb-24 md:pb-32 px-4"
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
            className="w-full pb-24 md:pb-32 px-4"
          >
            <Payment
              selectedSlot={selectedSlot}
              onPaymentComplete={(id, paymentCode) => {
                setTransactionId(id)
                setCode(paymentCode)
                setStep('success')
              }}
              onBack={() => setStep('welcome')}
            />
          </motion.div>
        )}

        {step === 'success' && (
          <SuccessScreen
            selectedSlot={selectedSlot}
            transactionId={transactionId}
            code={code}
            onRestart={() => {
              setStep('welcome')
              setSelectedSlot(null)
              setTransactionId(null)
              setCode(null)
            }}
          />
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
          className="fixed bottom-0 left-0 right-0 py-3 md:py-4 px-4 md:px-6 font-semibold text-arcade-black bg-neon-cyan neon-btn disabled:opacity-40 disabled:cursor-not-allowed m-3 md:m-4 rounded-xl will-change-shadow text-sm md:text-base min-h-touch"
        >
          {t('proceedToPay')}
        </motion.button>
      )}
    </Layout>
  )
}

export default App
