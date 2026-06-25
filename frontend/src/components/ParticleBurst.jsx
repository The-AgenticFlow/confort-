import { motion } from 'framer-motion'
import PropTypes from 'prop-types'
import { useMemo } from 'react'

const generateBurstParticles = (count = 30) => {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2
    const velocity = 4 + Math.random() * 3
    const distance = 200 + Math.random() * 100
    const x = Math.cos(angle) * distance * velocity
    const y = Math.sin(angle) * distance * velocity
    const size = 4 + Math.random() * 8
    const duration = 0.8 + Math.random() * 0.6
    const colors = ['#00FFCC', '#FF00FF', '#0099FF', '#00FF88', '#FF0088']
    const color = colors[Math.floor(Math.random() * colors.length)]

    return {
      id: i,
      x,
      y,
      size,
      duration,
      color,
      rotation: Math.random() * 360,
      delay: Math.random() * 0.1,
    }
  })
}

export function ParticleBurst({ isActive = true, intensity = 1, direction = 'all' }) {
  const particles = useMemo(() => {
    const baseCount = Math.floor(30 * intensity)
    return generateBurstParticles(baseCount)
  }, [intensity])

  const getDirectionMultiplier = (particle) => {
    if (direction === 'all') return 1
    if (direction === 'up') return particle.y < 0 ? 1 : 0.2
    if (direction === 'down') return particle.y > 0 ? 1 : 0.2
    return 1
  }

  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          initial={{
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: particle.x * getDirectionMultiplier(particle),
            y: particle.y * getDirectionMultiplier(particle),
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: particle.duration,
            ease: 'easeOut',
            delay: particle.delay,
          }}
          style={{
            left: '50%',
            top: '50%',
            width: particle.size,
            height: particle.size,
            marginLeft: -particle.size / 2,
            marginTop: -particle.size / 2,
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: particle.duration,
              ease: 'linear',
            }}
            className="w-full h-full rounded-full"
            style={{
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}

ParticleBurst.propTypes = {
  isActive: PropTypes.bool,
  intensity: PropTypes.number,
  direction: PropTypes.oneOf(['all', 'up', 'down']),
}
