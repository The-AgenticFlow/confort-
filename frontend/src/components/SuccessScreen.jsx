import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ParticleBurst } from './ParticleBurst'

const CheckmarkSVG = () => {
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 0.8, ease: 'easeInOut', delay: 0.2 },
    },
  }

  return (
    <motion.svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      className="mx-auto mb-8"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <circle cx="60" cy="60" r="55" fill="none" stroke="rgba(0, 255, 204, 0.3)" strokeWidth="2" />
      <motion.path
        d="M 35 60 L 50 75 L 85 40"
        stroke="currentColor"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-neon-cyan"
        variants={pathVariants}
        initial="hidden"
        animate="visible"
      />
    </motion.svg>
  )
}

export function SuccessScreen({ selectedSlot, transactionId, code, onRestart }) {
  const { t } = useTranslation()
  const [displayCode, setDisplayCode] = useState(code)

  useEffect(() => {
    setDisplayCode(code)
  }, [code])

  return (
    <>
      <ParticleBurst isActive={true} intensity={1} direction="all" />

      {/* Cyan Flash Animation */}
      <motion.div
        className="fixed inset-0 bg-neon-cyan pointer-events-none"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />

      <motion.div
        key="success"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full text-center space-y-8 pb-24"
      >
        {/* Checkmark Animation */}
        <CheckmarkSVG />

        <h2 className="text-3xl font-bold text-neon-cyan">{t('paymentConfirmed')}</h2>

        <div className="space-y-4">
          {displayCode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="relative py-8"
            >
              {/* Hologram Background Gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-30"
                animate={{ y: [-40, 40] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                style={{ height: '120px' }}
              />

              {/* Code Text with Opacity Oscillation */}
              <motion.div
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="relative text-center"
              >
                <div className="text-7xl font-black tracking-widest text-neon-cyan font-mono">
                  {displayCode}
                </div>
              </motion.div>
            </motion.div>
          )}

          <p className="text-white/60">
            {t('sessionReady', { minutes: selectedSlot.minutes })}
          </p>

          <p className="text-base font-semibold text-neon-cyan">
            {t('showCodeToManager')}
          </p>

          {transactionId && (
            <p className="text-xs text-white/40">
              {t('transactionId')}: {transactionId}
            </p>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-full py-4 rounded-xl font-semibold text-arcade-black bg-neon-cyan neon-btn"
          onClick={onRestart}
        >
          {t('playAnother')}
        </motion.button>
      </motion.div>
    </>
  )
}

SuccessScreen.propTypes = {
  selectedSlot: PropTypes.shape({
    minutes: PropTypes.number.isRequired,
  }).isRequired,
  transactionId: PropTypes.string.isRequired,
  code: PropTypes.string,
  onRestart: PropTypes.func.isRequired,
}
