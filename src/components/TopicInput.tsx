import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDebateStore } from '../state/debateState';

export default function TopicInput() {
  const [input, setInput] = useState('');
  const submitTopic = useDebateStore(s => s.submitTopic);
  const randomTopic = useDebateStore(s => s.randomTopic);
  const isLoadingAI = useDebateStore(s => s.isLoadingAI);

  const handleSubmit = async () => {
    if (isLoadingAI) return;
    await submitTopic(input);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-screen px-4 relative z-10"
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="mb-2"
      >
        <h1 className="font-display text-6xl md:text-8xl font-black tracking-wider">
          <span className="text-arena-pro">Deba</span>
          <span className="text-arena-accent">Z</span>
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-gray-400 text-lg md:text-xl mb-12 font-light tracking-widest uppercase"
      >
        Where Ideas Clash
      </motion.p>

      {/* Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="glass rounded-2xl p-8 md:p-12 w-full max-w-xl"
        style={{ animation: 'pulse-glow 3s infinite' }}
      >
        <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
          Enter Any Topic
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={isLoadingAI}
          placeholder="e.g. Video Games, AI, Space Travel..."
          className="w-full bg-transparent border-b-2 border-gray-600 focus:border-arena-accent 
            text-white text-xl md:text-2xl py-3 outline-none transition-colors duration-300
            placeholder-gray-600 disabled:opacity-60"
        />

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={isLoadingAI}
            className="flex-1 py-4 px-8 rounded-xl font-bold text-lg uppercase tracking-wider
              bg-gradient-to-r from-arena-pro to-pink-600 text-white
              shadow-lg shadow-arena-pro/30 hover:shadow-arena-pro/50 transition-shadow
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoadingAI ? '⚡ Generating...' : '🚀 Start Debate'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={randomTopic}
            disabled={isLoadingAI}
            className="flex-1 py-4 px-8 rounded-xl font-bold text-lg uppercase tracking-wider
              bg-gradient-to-r from-gray-700 to-gray-600 text-white
              hover:from-gray-600 hover:to-gray-500 transition-all
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoadingAI ? '🔮 Thinking...' : '🎲 Random Topic'}
          </motion.button>
        </div>

        {isLoadingAI && (
          <p className="mt-6 text-xs text-gray-500 uppercase tracking-widest">
            AI crafting the debate lineup
          </p>
        )}
      </motion.div>

      {/* Powered by tag */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1.5 }}
        className="mt-8 text-xs text-gray-500 uppercase tracking-widest"
      >
        Built for Google Antigravity
      </motion.p>
    </motion.div>
  );
}
