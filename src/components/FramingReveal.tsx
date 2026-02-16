import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDebateStore } from '../state/debateState';

function TypewriterText({ text, delay = 0, speed = 30, className = '' }: { text: string; delay?: number; speed?: number; className?: string }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay, speed]);

  return <span className={className}>{displayed}<span className="animate-pulse">|</span></span>;
}

export default function FramingReveal() {
  const { proHeadline, conHeadline, topic, startDebate } = useDebateStore();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen px-4 relative z-10"
    >
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-gray-400 text-sm uppercase tracking-widest mb-4"
      >
        Topic: {topic}
      </motion.p>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="font-display text-3xl md:text-5xl font-black text-arena-accent mb-12 tracking-wider text-center"
      >
        AI FRAMING COMPLETE
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* PRO */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="glass neon-border-pro rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-arena-pro/20 flex items-center justify-center">
              <span className="text-arena-pro font-bold text-xl">A</span>
            </div>
            <div>
              <p className="text-arena-pro font-bold text-lg">ALEX</p>
              <p className="text-gray-500 text-xs uppercase tracking-wider">Pro Agent</p>
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black text-white leading-tight min-h-[80px]">
            <TypewriterText text={proHeadline} delay={800} speed={25} />
          </div>
        </motion.div>

        {/* CON */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="glass neon-border-con rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-arena-con/20 flex items-center justify-center">
              <span className="text-arena-con font-bold text-xl">S</span>
            </div>
            <div>
              <p className="text-arena-con font-bold text-lg">SOPHIA</p>
              <p className="text-gray-500 text-xs uppercase tracking-wider">Con Agent</p>
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black text-white leading-tight min-h-[80px]">
            <TypewriterText text={conHeadline} delay={1800} speed={25} />
          </div>
        </motion.div>
      </div>

      {/* Start Debate */}
      {showButton && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: [1, 1.05, 1] }}
          transition={{ duration: 0.5, scale: { repeat: Infinity, duration: 1.5 } }}
          onClick={startDebate}
          className="mt-12 py-5 px-16 rounded-2xl font-display font-bold text-xl uppercase tracking-widest
            bg-gradient-to-r from-arena-pro via-arena-accent to-arena-con text-black
            shadow-2xl hover:shadow-arena-accent/40 transition-shadow"
        >
          ⚔️ Begin The Clash
        </motion.button>
      )}
    </motion.div>
  );
}
