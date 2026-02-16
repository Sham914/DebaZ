import { motion } from 'framer-motion';

interface AvatarProps {
  name: string;
  side: 'PRO' | 'CON';
  isSpeaking: boolean;
}

export default function Avatar({ name, side, isSpeaking }: AvatarProps) {
  const isPro = side === 'PRO';
  const color = isPro ? '#FF3B4F' : '#00D4FF';
  const initial = name[0];

  return (
    <motion.div
      className="flex flex-col items-center"
      animate={isSpeaking ? { y: [0, -5, 0] } : {}}
      transition={{ repeat: isSpeaking ? Infinity : 0, duration: 1.5 }}
    >
      {/* Aura */}
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: color, opacity: isSpeaking ? 0.4 : 0.15 }}
          animate={isSpeaking ? { scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        />

        {/* Avatar Body */}
        <div
          className="relative w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${color}33, ${color}11)`,
            border: `2px solid ${color}66`,
            boxShadow: isSpeaking ? `0 0 30px ${color}44, 0 0 60px ${color}22` : `0 0 15px ${color}22`,
          }}
        >
          {/* Head */}
          <div className="flex flex-col items-center">
            <div
              className="w-14 h-14 md:w-18 md:h-18 rounded-full flex items-center justify-center text-3xl md:text-4xl font-display font-black"
              style={{ color, textShadow: `0 0 20px ${color}` }}
            >
              {initial}
            </div>

            {/* Mouth animation */}
            <motion.div
              className="w-4 h-1 rounded-full mt-1"
              style={{ background: color }}
              animate={isSpeaking ? { scaleY: [1, 2.5, 1, 3, 1], scaleX: [1, 0.8, 1, 0.7, 1] } : { scaleY: 1 }}
              transition={{ repeat: isSpeaking ? Infinity : 0, duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Name */}
      <motion.p
        className="mt-4 font-display font-bold text-sm md:text-base uppercase tracking-widest"
        style={{ color }}
      >
        {name}
      </motion.p>
      <p className="text-gray-500 text-xs uppercase tracking-wider">
        {isPro ? 'PRO' : 'CON'}
      </p>
    </motion.div>
  );
}
