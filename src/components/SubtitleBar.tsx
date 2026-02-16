import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SubtitleBarProps {
  text: string;
  speaker: 'PRO' | 'CON';
  emotionIntense?: boolean;
}

export default function SubtitleBar({ text, speaker, emotionIntense = false }: SubtitleBarProps) {
  const [displayed, setDisplayed] = useState('');
  const isPro = speaker === 'PRO';
  const accentColor = isPro ? '#FF3B4F' : '#00D4FF';

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [text]);

  const glowIntensity = emotionIntense ? '0 0 30px' : '0 0 15px';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={text}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[80%] max-w-4xl z-50"
      >
        <div
          className="relative rounded-2xl px-6 py-4 md:px-10 md:py-6"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${accentColor}33`,
            boxShadow: `${glowIntensity} ${accentColor}22, inset 0 1px 0 rgba(255,255,255,0.05)`,
          }}
        >
          {/* Speaker accent bar */}
          <div
            className="absolute left-0 top-3 bottom-3 w-1 rounded-full"
            style={{ background: accentColor, boxShadow: `0 0 10px ${accentColor}` }}
          />

          {/* Speaker label */}
          <p
            className="text-xs font-display font-bold uppercase tracking-widest mb-2"
            style={{ color: accentColor }}
          >
            {isPro ? 'ALEX — PRO' : 'SOPHIA — CON'}
          </p>

          {/* Subtitle text */}
          <p
            className="text-white text-lg md:text-2xl font-bold leading-relaxed"
            style={{
              textShadow: `0 0 10px rgba(255,255,255,0.15)`,
              maxHeight: '3.6em',
              overflow: 'hidden',
              lineHeight: '1.4em',
            }}
          >
            {displayed}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
