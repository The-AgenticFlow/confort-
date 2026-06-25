import PropTypes from 'prop-types'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { initiatePayment, pollTransactionStatus } from '../lib/api'
import { ScanEffect } from './ScanEffect'

export function Payment({ selectedSlot, onPaymentComplete, onBack }) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('momo')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [transactionId, setTransactionId] = useState(null)

  const handleMomoPayment = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await initiatePayment(
        selectedSlot.minutes,
        selectedSlot.price
      )
      setTransactionId(response.id)

      const transactionData = await pollTransactionStatus(response.id, {
        maxAttempts: 120,
        pollInterval: 500,
        onProgress: (progress) => {
          // Can update UI with progress if needed
          console.log('Poll progress:', progress)
        },
      })

      onPaymentComplete(response.id, transactionData.code)
    } catch (err) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full space-y-4 md:space-y-6 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 md:w-16 md:h-16 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full mx-auto"
        />
        <p className="text-base md:text-lg font-semibold text-white">
          {t('waitingForPayment')}
        </p>
        {transactionId && (
          <p className="text-xs md:text-sm text-white/60">
            {t('transactionId')}: {transactionId}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="w-full space-y-4 md:space-y-6">
      <div className="bg-gradient-to-r from-neon-cyan/20 to-neon-cyan/10 rounded-xl p-4 md:p-6 text-center border border-neon-cyan/30">
        <p className="text-white/60 text-xs md:text-sm mb-2">{t('amountDue')}</p>
        <h2 className="text-3xl md:text-4xl font-bold text-neon-cyan">
          {selectedSlot.price} {t('fcfa')}
        </h2>
        <p className="text-white/60 text-xs md:text-sm mt-2">
          {t('playTime', { minutes: selectedSlot.minutes })}
        </p>
      </div>

      <div className="flex gap-2 md:gap-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('momo')}
          className={`flex-1 py-2.5 md:py-3 px-2 md:px-4 rounded-lg font-semibold transition-all text-sm md:text-base min-h-touch ${
            activeTab === 'momo'
              ? 'bg-neon-cyan text-arcade-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {t('mobileMoneyTab')}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('crypto')}
          className={`flex-1 py-2.5 md:py-3 px-2 md:px-4 rounded-lg font-semibold transition-all text-sm md:text-base min-h-touch ${
            activeTab === 'crypto'
              ? 'bg-neon-cyan text-arcade-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {t('cryptoTab')}
        </motion.button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 md:p-4 text-red-200 text-xs md:text-sm">
          {error}
        </div>
      )}

      {activeTab === 'momo' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 md:space-y-4"
        >
          <p className="text-white/70 text-center text-xs md:text-sm">
            {t('completePayment')}
          </p>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0, 255, 204, 0.8)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMomoPayment}
            className="w-full py-3 md:py-4 rounded-xl font-semibold text-arcade-black bg-neon-cyan neon-btn beat min-h-touch"
          >
            {t('payButton')}
          </motion.button>
        </motion.div>
      )}

      {activeTab === 'crypto' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 md:space-y-4"
        >
          <ScanEffect isActive={activeTab === 'crypto'} color="#00FFCC" />
          <p className="text-white/70 text-center text-xs md:text-sm">
            {t('scanWithWallet')}
          </p>
        </motion.div>
      )}

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onBack}
        className="w-full py-2.5 md:py-3 rounded-lg font-semibold text-white/60 hover:text-white transition-colors text-sm md:text-base min-h-touch"
      >
        {t('back')}
      </motion.button>
    </div>
  )
}

Payment.propTypes = {
  selectedSlot: PropTypes.shape({
    minutes: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
  onPaymentComplete: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
}
