import PropTypes from 'prop-types'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { initiatePayment, pollTransactionStatus } from '../lib/api'

export function Payment({ selectedSlot, onPaymentComplete, onBack }) {
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

      await pollTransactionStatus(response.id, {
        maxAttempts: 120,
        pollInterval: 500,
        onProgress: (progress) => {
          // Can update UI with progress if needed
          console.log('Poll progress:', progress)
        },
      })

      onPaymentComplete(response.id)
    } catch (err) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full space-y-6 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full mx-auto"
        />
        <p className="text-lg font-semibold text-white">
          Waiting for payment confirmation...
        </p>
        {transactionId && (
          <p className="text-sm text-white/60">Transaction ID: {transactionId}</p>
        )}
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="bg-gradient-to-r from-neon-cyan/20 to-neon-cyan/10 rounded-xl p-6 text-center border border-neon-cyan/30">
        <p className="text-white/60 text-sm mb-2">Amount Due</p>
        <h2 className="text-4xl font-bold text-neon-cyan">
          {selectedSlot.price} FCFA
        </h2>
        <p className="text-white/60 text-sm mt-2">
          {selectedSlot.minutes} min play time
        </p>
      </div>

      <div className="flex gap-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('momo')}
          className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'momo'
              ? 'bg-neon-cyan text-arcade-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          Mobile Money
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('crypto')}
          className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'crypto'
              ? 'bg-neon-cyan text-arcade-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          Crypto
        </motion.button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200 text-sm">
          {error}
        </div>
      )}

      {activeTab === 'momo' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <p className="text-white/70 text-center text-sm">
            Complete your payment via MTN or Orange USSD
          </p>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleMomoPayment}
            className="w-full py-4 rounded-xl font-semibold text-arcade-black bg-neon-cyan neon-btn"
          >
            Pay with MTN/Orange
          </motion.button>
        </motion.div>
      )}

      {activeTab === 'crypto' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-white/5 border border-white/20 rounded-lg aspect-square flex items-center justify-center">
            <div className="text-center">
              <p className="text-white/60 text-sm mb-2">Scan QR Code</p>
              <p className="text-white/40 text-xs">Binance Pay QR</p>
            </div>
          </div>
          <p className="text-white/70 text-center text-sm">
            Scan the QR code with your wallet to complete payment
          </p>
        </motion.div>
      )}

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onBack}
        className="w-full py-3 rounded-lg font-semibold text-white/60 hover:text-white transition-colors"
      >
        Back
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
