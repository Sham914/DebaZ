import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDebateStore } from '../state/debateState';
import Avatar from './Avatar';
import SpeechBubble from './SpeechBubble';
import ScoreMeter from './ScoreMeter';
import VotePanel from './VotePanel';
import EvidenceChart from './EvidenceChart';

export default function DebateStage() {
  const {
    rounds,
    currentRoundIndex,
    proScore,
    conScore,
    advanceRound,
    isAnimating,
    setAnimating,
  } = useDebateStore();

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const currentRound = rounds[currentRoundIndex];

  // Find evidence round data for chart
  const proEvidenceRound = rounds.find(r => r.round === 3 && r.speaker === 'PRO');
  const conEvidenceRound = rounds.find(r => r.round === 3 && r.speaker === 'CON');
  const showChart = currentRound?.round === 3;

  const typeText = useCallback((text: string) => {
    setIsTyping(true);
    setAnimating(true);
    setDisplayedText('');

    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setAnimating(false);
      }
    }, 18);

    return () => clearInterval(interval);
  }, [setAnimating]);

  useEffect(() => {
    if (currentRound) {
      const cleanup = typeText(currentRound.argument);
      return cleanup;
    }
  }, [currentRoundIndex, currentRound, typeText]);

  if (!currentRound) return null;

  const isPro = currentRound.speaker === 'PRO';
  const roundNum = Math.ceil((currentRoundIndex + 1) / 2);

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8 relative z-10">
      {/* Round indicator */}
      <motion.div
        key={currentRoundIndex}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <p className="font-display text-arena-accent text-sm md:text-base uppercase tracking-widest text-center">
          Round {roundNum} of 5 — {currentRound.speaker === 'PRO' ? 'ALEX' : 'SOPHIA'} Speaking
        </p>
      </motion.div>

      {/* Score Meter */}
      <div className="w-full mb-8">
        <ScoreMeter proScore={proScore} conScore={conScore} />
      </div>

      {/* Stage area */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full max-w-6xl mb-8">
          {/* Alex */}
          <Avatar name="ALEX" side="PRO" isSpeaking={isPro && isTyping} />

          {/* Speech Bubble */}
          <SpeechBubble
            text={displayedText}
            side={currentRound.speaker}
            headline={currentRound.headline}
          />

          {/* Sophia */}
          <Avatar name="SOPHIA" side="CON" isSpeaking={!isPro && isTyping} />
      </div>

      {/* Evidence Chart */}
      {showChart && proEvidenceRound && conEvidenceRound && (
        <div className="w-full mb-8">
          <EvidenceChart
            proPoints={proEvidenceRound.data_points}
            conPoints={conEvidenceRound.data_points}
          />
        </div>
      )}

      {/* Round stats */}
      <motion.div
        key={`stats-${currentRoundIndex}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-6 md:gap-8 mb-6"
      >
        <div className="text-center">
          <p className="text-gray-500 text-xs uppercase tracking-wider">Logic</p>
          <p className="text-white font-display font-bold text-lg">{currentRound.logic_score}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-xs uppercase tracking-wider">Emotion</p>
          <p className="text-white font-display font-bold text-lg">{currentRound.emotion_score}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-xs uppercase tracking-wider">Rebuttal</p>
          <p className="text-white font-display font-bold text-lg">{currentRound.rebuttal_strength}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-xs uppercase tracking-wider">Total</p>
          <p className="text-arena-accent font-display font-bold text-lg">{currentRound.total_score}</p>
        </div>
      </motion.div>

      {/* Vote Panel */}
      <div className="mb-8">
        <VotePanel />
      </div>

      {/* Next Round Button */}
      {!isAnimating && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={advanceRound}
          className="mb-24 py-3 px-10 rounded-xl font-display font-bold text-base uppercase tracking-widest
            bg-gradient-to-r from-arena-accent/80 to-arena-accent text-black
            shadow-lg shadow-arena-accent/20 hover:shadow-arena-accent/40 transition-shadow"
        >
          {currentRoundIndex >= rounds.length - 1 ? '🏆 See Results' : '➡️ Next'}
        </motion.button>
        )}
      </div>
    );
  }
