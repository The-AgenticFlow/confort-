import { motion } from 'framer-motion'
import PropTypes from 'prop-types'
import { ParticleBackground } from './ParticleBackground'

export function Layout({ children }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-arcade-black font-space">
      {/* Animated grid background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 255, 204, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 204, 0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          animation: 'gridScroll 20s linear infinite',
        }}
      />

      {/* Particle background - reduced on mobile */}
      <ParticleBackground count={15} intensity={0.6} />

      {/* Content with safe area support */}
      <div
        className="relative z-10 flex flex-col items-center justify-start min-h-screen w-full overflow-y-auto"
        style={{
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
          paddingTop: 'max(2rem, env(safe-area-inset-top))',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        }}
      >
        {/* Logo / Header - mobile responsive */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-6 md:mb-10 text-center flex-shrink-0"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider neon-glow text-neon-cyan">
            Confort+
          </h1>
          <p className="mt-2 text-xs md:text-sm text-white/40 tracking-widest uppercase">
            Premium Wi-Fi Access
          </p>
        </motion.header>

        {/* Main content - responsive max-width */}
        <main className="w-full max-w-sm md:max-w-md lg:max-w-lg px-4 md:px-0 flex-1 flex flex-col justify-start">
          {children}
        </main>
      </div>
    </div>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}
