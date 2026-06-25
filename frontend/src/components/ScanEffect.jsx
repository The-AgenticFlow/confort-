import { motion } from 'framer-motion'
import PropTypes from 'prop-types'

export function ScanEffect({ isActive = true, color = '#00FFCC' }) {
  if (!isActive) return null

  return (
    <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-white/5 border border-white/20">
      {/* QR Code Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 border-2 border-white/20 rounded-lg mx-auto mb-4 grid grid-cols-4 gap-1 p-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/10 rounded"
                style={{
                  opacity: Math.random() > 0.3 ? 1 : 0.3,
                }}
              />
            ))}
          </div>
          <p className="text-white/60 text-sm">QR Code</p>
        </div>
      </div>

      {/* Scanning Beam */}
      <motion.div
        className="absolute left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          boxShadow: `0 0 20px ${color}`,
        }}
        animate={{ top: ['0%', '100%'] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Corner Brackets */}
      <div className="absolute inset-4 pointer-events-none">
        {/* Top Left */}
        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-neon-cyan" />
        {/* Top Right */}
        <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-neon-cyan" />
        {/* Bottom Left */}
        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-neon-cyan" />
        {/* Bottom Right */}
        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-neon-cyan" />
      </div>

      {/* Color Shift Overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            `linear-gradient(45deg, rgba(0, 255, 204, 0), rgba(0, 255, 204, 0.1))`,
            `linear-gradient(45deg, rgba(0, 153, 255, 0), rgba(0, 153, 255, 0.1))`,
            `linear-gradient(45deg, rgba(255, 0, 255, 0), rgba(255, 0, 255, 0.1))`,
            `linear-gradient(45deg, rgba(0, 255, 204, 0), rgba(0, 255, 204, 0.1))`,
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}

ScanEffect.propTypes = {
  isActive: PropTypes.bool,
  color: PropTypes.string,
}
