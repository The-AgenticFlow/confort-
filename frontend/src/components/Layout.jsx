import { motion } from 'framer-motion'

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

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen p-4 pt-8">
        {/* Logo / Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-10 text-center"
        >
          <h1 className="text-4xl font-bold tracking-wider neon-glow text-neon-cyan">
            Confort+
          </h1>
          <p className="mt-2 text-sm text-white/40 tracking-widest uppercase">
            Premium Wi-Fi Access
          </p>
        </motion.header>

        {/* Main content */}
        <main className="w-full max-w-md">{children}</main>
      </div>
    </div>
  )
}
