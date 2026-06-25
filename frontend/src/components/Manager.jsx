import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import './Manager.css'

export function Manager() {
  const { t } = useTranslation()
  const [pinEntry, setPinEntry] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [codeEntry, setCodeEntry] = useState('')
  const [verificationState, setVerificationState] = useState(null) // 'success', 'error', or null
  const [errorMessage, setErrorMessage] = useState('')
  const [isShaking, setIsShaking] = useState(false)
  const [isFlashing, setIsFlashing] = useState(false)

  const handlePinInput = (e) => {
    const value = e.target.value.slice(0, 4)
    setPinEntry(value)
  }

  const handlePinSubmit = () => {
    const managerPin = import.meta.env.VITE_MANAGER_PIN || '1234'
    if (pinEntry === managerPin) {
      setIsAuthenticated(true)
      setPinEntry('')
    } else {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
    }
  }

  const handleCodeInput = (e) => {
    const value = e.target.value.slice(0, 4).toUpperCase()
    setCodeEntry(value)
  }

  const handleVerifyCode = async () => {
    if (codeEntry.length !== 4) {
      setErrorMessage(t('codeLength'))
      setVerificationState('error')
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
      return
    }

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBase}/api/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeEntry }),
      })

      const data = await response.json()

      if (data.success) {
        setVerificationState('success')
        setIsFlashing(true)
        setTimeout(() => setIsFlashing(false), 1000)
        setTimeout(() => {
          setCodeEntry('')
          setVerificationState(null)
        }, 2000)
      } else {
        setErrorMessage(data.message || t('verificationFailed'))
        setVerificationState('error')
        setIsFlashing(true)
        setTimeout(() => setIsFlashing(false), 500)
        setIsShaking(true)
        setTimeout(() => setIsShaking(false), 500)
      }
    } catch (error) {
      setErrorMessage(t('networkError'))
      setVerificationState('error')
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
    }
  }

  const handleVerifyNext = () => {
    setCodeEntry('')
    setVerificationState(null)
    setErrorMessage('')
  }

  if (!isAuthenticated) {
    return (
      <motion.div
        className={`pin-screen ${isShaking ? 'shake-red' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="pin-container">
          <h1 className="pin-title">{t('managerPortal')}</h1>
          <p className="pin-label">{t('enterPin')}</p>
          <motion.input
            type="password"
            value={pinEntry}
            onChange={handlePinInput}
            placeholder="••••"
            maxLength={4}
            className="pin-input"
            animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.3 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handlePinSubmit()
            }}
          />
          <button onClick={handlePinSubmit} className="verify-button">
            {t('submit')}
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`manager-screen ${isFlashing && verificationState === 'success' ? 'flash-green' : ''} ${isFlashing && verificationState === 'error' ? 'flash-red' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {verificationState === 'success' ? (
        <motion.div
          className="success-container"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <motion.svg
            className="success-checkmark"
            viewBox="0 0 52 52"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: 2 }}
          >
            <motion.path
              d="M6 26 L21 41 L46 11"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8 }}
            />
          </motion.svg>
          <p className="success-message">{t('codeVerified')}</p>
          <button onClick={handleVerifyNext} className="verify-next-button">
            {t('verifyNext')}
          </button>
        </motion.div>
      ) : (
        <div className="manager-container">
          <h1 className="manager-title">{t('codeVerification')}</h1>
          <motion.input
            type="text"
            value={codeEntry}
            onChange={handleCodeInput}
            placeholder={t('enterCode')}
            maxLength={4}
            className={`code-input ${isShaking ? 'shake' : ''}`}
            animate={isShaking ? { x: [-8, 8, -8, 8, 0] } : {}}
            transition={{ duration: 0.3 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleVerifyCode()
            }}
          />
          {verificationState === 'error' && (
            <motion.p
              className="error-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {errorMessage}
            </motion.p>
          )}
          <button
            onClick={handleVerifyCode}
            className="verify-button"
            disabled={codeEntry.length !== 4}
          >
            {t('verify')}
          </button>
        </div>
      )}
    </motion.div>
  )
}
