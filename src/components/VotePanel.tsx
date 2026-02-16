import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebateStore } from '../state/debateState';

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
}

export default function VotePanel() {
  const { voteFor, triggerShake } = useDebateStore();
  const [emojis, setEmojis] = useState<FloatingEmoji[]>([]);
  let emojiCounter = 0;

  const spawnEmoji = useCallback((emoji: string) => {
    const id = Date.now() + emojiCounter++;
    const x = Math.random() * 80 + 10;
    setEmojis(prev => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setEmojis(prev => prev.filter(e => e.id !== id));
    }, 1500);
  }, []);

  const handleVote = (side: 'PRO' | 'CON', amount: number, emoji: string) => {
    voteFor(side, amount);
    spawnEmoji(emoji);
    if (Math.abs(amount) >= 25) {
      triggerShake();
    }

    // BroadcastChannel for multi-device sync
    try {
      const bc = new BroadcastChannel('debaz-votes');
      bc.postMessage({ side, amount });
      bc.close();
    } catch {
      // BroadcastChannel not supported
    }
  };

  return (
    <div className="relative">
      {/* Floating emojis */}
      <AnimatePresence>
        {emojis.map(e => (
          <motion.div
            key={e.id}
            initial={{ opacity: 1, y: 0, x: `${e.x}%` }}
            animate={{ opacity: 0, y: -120 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="fixed bottom-32 text-3xl pointer-events-none z-50"
            style={{ left: `${e.x}%` }}
          >
            {e.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleVote('PRO', 10, '🔥')}
          className="py-3 px-5 md:px-6 rounded-xl font-bold text-sm md:text-base
            bg-arena-pro/20 border border-arena-pro/40 text-arena-pro
            hover:bg-arena-pro/30 transition-all active:shadow-lg active:shadow-arena-pro/30"
        >
          🔥 PRO +10
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleVote('PRO', 25, '💥')}
          className="py-3 px-5 md:px-6 rounded-xl font-bold text-sm md:text-base
            bg-arena-pro/30 border border-arena-pro/60 text-arena-pro
            hover:bg-arena-pro/40 transition-all active:shadow-lg active:shadow-arena-pro/40"
        >
          💥 PRO +25
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleVote('CON', 10, '❄️')}
          className="py-3 px-5 md:px-6 rounded-xl font-bold text-sm md:text-base
            bg-arena-con/20 border border-arena-con/40 text-arena-con
            hover:bg-arena-con/30 transition-all active:shadow-lg active:shadow-arena-con/30"
        >
          ❄️ CON +10
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleVote('CON', -10, '⛔')}
          className="py-3 px-5 md:px-6 rounded-xl font-bold text-sm md:text-base
            bg-red-900/30 border border-red-500/40 text-red-400
            hover:bg-red-900/40 transition-all active:shadow-lg active:shadow-red-500/30"
        >
          ⛔ CON -10
        </motion.button>
      </div>
    </div>
  );
}
