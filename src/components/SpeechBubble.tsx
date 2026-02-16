import { motion } from 'framer-motion';

interface SpeechBubbleProps {
  text: string;
  side: 'PRO' | 'CON';
  headline: string;
}

export default function SpeechBubble({ text, side, headline }: SpeechBubbleProps) {
  const isPro = side === 'PRO';
  const borderClass = isPro ? 'neon-border-pro' : 'neon-border-con';
  const color = isPro ? 'text-arena-pro' : 'text-arena-con';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className={`glass ${borderClass} rounded-2xl p-6 md:p-8 max-w-2xl w-full`}
    >
      <p className={`${color} font-display font-bold text-xs md:text-sm uppercase tracking-widest mb-3`}>
        {headline}
      </p>
      <p className="text-white text-base md:text-lg leading-relaxed whitespace-pre-line">
        {text}
      </p>
    </motion.div>
  );
}
