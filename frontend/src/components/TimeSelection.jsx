import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { timeSlots } from '../constants/timeSlots'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 100 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

export function TimeSelection({ selectedSlot, onSelectSlot }) {
  const formatTime = (minutes) => {
    if (minutes >= 60) {
      const hours = minutes / 60
      return `${hours} Hour${hours > 1 ? 's' : ''}`
    }
    return `${minutes} Mins`
  }

  return (
    <div className="w-full space-y-10">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-white neon-glow">
          WELCOME TO CONFORT+
        </h1>
        <h2 className="text-2xl font-semibold text-neon-cyan neon-glow">
          SELECT PLAY TIME
        </h2>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {timeSlots.map((slot) => (
          <motion.button
            key={slot.minutes}
            variants={itemVariants}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectSlot(slot)}
            className={`glass-card rounded-full p-6 transition-all duration-200 ${
              selectedSlot?.minutes === slot.minutes
                ? 'bg-neon-cyan text-arcade-black border-neon-cyan shadow-neon-lg'
                : 'text-white hover:border-neon-cyan/60 hover:bg-white/10'
            }`}
          >
            <div className="space-y-2">
              <div className="font-bold text-lg">
                {formatTime(slot.minutes)}
              </div>
              <div className="text-sm font-semibold">
                {slot.price} FCFA
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}

TimeSelection.propTypes = {
  selectedSlot: PropTypes.shape({
    minutes: PropTypes.number,
    price: PropTypes.number,
  }),
  onSelectSlot: PropTypes.func.isRequired,
}
