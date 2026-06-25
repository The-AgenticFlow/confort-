import PropTypes from 'prop-types'
import { motion } from 'framer-motion'

export function SuccessScreen({ selectedSlot, transactionId, onRestart }) {
  return (
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
        onClick={onRestart}
      >
        Play Another Session
      </motion.button>
    </motion.div>
  )
}

SuccessScreen.propTypes = {
  selectedSlot: PropTypes.shape({
    minutes: PropTypes.number.isRequired,
  }).isRequired,
  transactionId: PropTypes.string.isRequired,
  onRestart: PropTypes.func.isRequired,
}
