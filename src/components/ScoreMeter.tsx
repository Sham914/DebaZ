import { motion } from 'framer-motion';

interface ScoreMeterProps {
  proScore: number;
  conScore: number;
}

export default function ScoreMeter({ proScore, conScore }: ScoreMeterProps) {
  const total = proScore + conScore || 1;
  const proPercent = (proScore / total) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Score numbers */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <span className="text-arena-pro font-display font-black text-2xl md:text-4xl">
            {proScore}
          </span>
          <span className="text-gray-500 text-xs uppercase tracking-wider">ALEX</span>
        </div>

        <motion.div
          className="font-display text-arena-accent font-bold text-sm uppercase tracking-widest"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          VS
        </motion.div>

        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-xs uppercase tracking-wider">SOPHIA</span>
          <span className="text-arena-con font-display font-black text-2xl md:text-4xl">
            {conScore}
          </span>
        </div>
      </div>

      {/* Bar */}
      <div className="h-4 md:h-6 rounded-full overflow-hidden bg-gray-800 relative">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #FF3B4F, #FF6B7F)',
            boxShadow: '0 0 20px #FF3B4F44',
          }}
          animate={{ width: `${proPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute right-0 top-0 h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #00A4CF, #00D4FF)',
            boxShadow: '0 0 20px #00D4FF44',
          }}
          animate={{ width: `${100 - proPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
