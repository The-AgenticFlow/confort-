import { useMemo } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'

export function ParticleBackground({ count = 30, intensity = 1 }) {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      startX: Math.random() * 100,
      startY: -10,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 2,
      color: ['neon-cyan', 'neon-pink', 'neon-blue'][
        Math.floor(Math.random() * 3)
      ],
      shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)],
      opacity: Math.random() * 0.5 + 0.3,
    }))
  }, [count])

  const colorMap = {
    'neon-cyan': 'rgba(0, 255, 204, ',
    'neon-pink': 'rgba(255, 0, 255, ',
    'neon-blue': 'rgba(0, 153, 255, ',
  }

  const renderShape = (particle) => {
    const color = colorMap[particle.color] + particle.opacity + ')'
    const baseClasses = 'absolute pointer-events-none will-change-transform'

    if (particle.shape === 'circle') {
      return (
        <div
          key={particle.id}
          className={baseClasses}
          style={{
            left: `${particle.startX}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            borderRadius: '50%',
            backgroundColor: color,
            boxShadow: `0 0 ${particle.size}px ${color}`,
          }}
        />
      )
    } else if (particle.shape === 'square') {
      return (
        <div
          key={particle.id}
          className={baseClasses}
          style={{
            left: `${particle.startX}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: color,
            boxShadow: `0 0 ${particle.size}px ${color}`,
          }}
        />
      )
    } else {
      return (
        <div
          key={particle.id}
          className={baseClasses}
          style={{
            left: `${particle.startX}%`,
            width: 0,
            height: 0,
            borderLeft: `${particle.size / 2}px solid transparent`,
            borderRight: `${particle.size / 2}px solid transparent`,
            borderBottom: `${particle.size}px solid ${color}`,
            filter: `drop-shadow(0 0 ${particle.size}px ${color})`,
          }}
        />
      )
    }
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-5 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ y: -10, opacity: 0 }}
          animate={{
            y: 110,
            opacity: [0, particle.opacity, particle.opacity * 0.5, 0],
            x: Math.sin(particle.id) * 20,
          }}
          transition={{
            duration: particle.duration * intensity,
            delay: particle.delay,
            ease: 'linear',
            repeat: Infinity,
            opacity: {
              duration: particle.duration * intensity,
            },
          }}
          className="absolute will-change-transform"
          style={{
            left: `${particle.startX}%`,
          }}
        >
          {renderShape(particle)}
        </motion.div>
      ))}
    </div>
  )
}

ParticleBackground.propTypes = {
  count: PropTypes.number,
  intensity: PropTypes.number,
}
