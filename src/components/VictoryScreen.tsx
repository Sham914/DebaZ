import { motion } from 'framer-motion';
import { useDebateStore } from '../state/debateState';

export default function VictoryScreen() {
  const { winner, proScore, conScore, reset, proHeadline, conHeadline } = useDebateStore();

  const winnerName = winner === 'PRO' ? 'ALEX' : winner === 'CON' ? 'SOPHIA' : 'NOBODY';
  const winnerColor = winner === 'PRO' ? '#FF3B4F' : winner === 'CON' ? '#00D4FF' : '#FFD700';
  const winnerSide = winner === 'PRO' ? 'PRO' : winner === 'CON' ? 'CON' : 'TIE';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen px-4 relative z-10"
    >
      {/* Trophy */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-8xl md:text-9xl mb-6"
      >
        🏆
      </motion.div>

      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="font-display text-4xl md:text-6xl font-black uppercase tracking-wider mb-2"
        style={{ color: winnerColor, textShadow: `0 0 40px ${winnerColor}66` }}
      >
        {winnerName} WINS!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-gray-400 text-lg uppercase tracking-widest mb-8"
      >
        {winnerSide === 'TIE' ? 'A Perfect Tie!' : `${winnerSide} Takes the Arena`}
      </motion.p>

      {/* Final Scores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass rounded-2xl p-8 md:p-12 w-full max-w-lg mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="text-center">
            <p className="text-arena-pro font-display font-bold text-sm mb-1">ALEX</p>
            <p className="text-arena-pro font-display font-black text-4xl md:text-5xl">{proScore}</p>
          </div>
          <div className="text-gray-600 font-display text-2xl">VS</div>
          <div className="text-center">
            <p className="text-arena-con font-display font-bold text-sm mb-1">SOPHIA</p>
            <p className="text-arena-con font-display font-black text-4xl md:text-5xl">{conScore}</p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4 space-y-2">
          <p className="text-gray-500 text-xs uppercase tracking-wider">Headlines</p>
          <p className="text-arena-pro/70 text-sm">{proHeadline}</p>
          <p className="text-arena-con/70 text-sm">{conHeadline}</p>
        </div>
      </motion.div>

      {/* Restart */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={reset}
        className="py-4 px-12 rounded-2xl font-display font-bold text-lg uppercase tracking-widest
          bg-gradient-to-r from-arena-pro via-arena-accent to-arena-con text-black
          shadow-2xl hover:shadow-arena-accent/40 transition-shadow"
      >
        ⚡ New Debate
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1.5 }}
        className="mt-6 text-xs text-gray-600 uppercase tracking-widest"
      >
        DebaZ — Where Ideas Clash
      </motion.p>
    </motion.div>
  );
}
