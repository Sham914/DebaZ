import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDebateStore } from '../state/debateState';
import Avatar from './Avatar';
import SpeechBubble from './SpeechBubble';
import ScoreMeter from './ScoreMeter';
import VotePanel from './VotePanel';
import EvidenceChart from './EvidenceChart';
import { playDebateVoice, stopVoice } from '../engine/elevenlabsVoiceService';

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
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isVoiceLoading, setIsVoiceLoading] = useState(false);
  const voiceTaskRef = useRef<Promise<void> | null>(null);

  const currentRound = rounds[currentRoundIndex];

  // Find evidence round data for chart
  const proEvidenceRound = rounds.find(r => r.round === 3 && r.speaker === 'PRO');
  const conEvidenceRound = rounds.find(r => r.round === 3 && r.speaker === 'CON');
  const showChart = currentRound?.round === 3;

  const typeText = useCallback((text: string, round: typeof currentRound) => {
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

    // Play voice synthesis with ElevenLabs
    if (isVoiceEnabled && round) {
      setIsVoiceLoading(true);
      const voicePromise = playDebateVoice(text, {
        speaker: round.speaker,
        round: round.round,
        logicScore: round.logic_score,
        emotionScore: round.emotion_score,
        argument: text,
      })
        .catch(err => {
          console.error('Voice synthesis error:', err);
          // Continue without voice if API fails
        })
        .finally(() => {
          setIsVoiceLoading(false);
        });
      
      voiceTaskRef.current = voicePromise;
    }

    return () => clearInterval(interval);
  }, [setAnimating, isVoiceEnabled]);

  useEffect(() => {
    if (currentRound) {
      const cleanup = typeText(currentRound.argument, currentRound);
      return cleanup;
    }
  }, [currentRoundIndex, currentRound, typeText]);

  // Cleanup voice on unmount
  useEffect(() => {
    return () => {
      stopVoice();
      if (voiceTaskRef.current) {
        voiceTaskRef.current = null;
      }
    };
  }, []);

  if (!currentRound) return null;

  const isPro = currentRound.speaker === 'PRO';
  const roundNum = Math.ceil((currentRoundIndex + 1) / 2);

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8 relative z-10">
      {/* Voice Toggle Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => {
          stopVoice();
          setIsVoiceEnabled(!isVoiceEnabled);
        }}
        disabled={isVoiceLoading}
        className={`absolute top-6 right-6 py-2 px-4 rounded-lg font-display font-bold text-sm uppercase tracking-widest
          transition-all ${
          isVoiceLoading
            ? 'bg-arena-accent/10 text-arena-accent/50 border border-arena-accent/25 cursor-wait'
            : isVoiceEnabled
            ? 'bg-arena-accent/20 text-arena-accent border border-arena-accent/50 hover:bg-arena-accent/30'
            : 'bg-gray-700/20 text-gray-400 border border-gray-700/50 hover:bg-gray-700/30'
        }`}
      >
        {isVoiceLoading ? '⏳ Generating...' : isVoiceEnabled ? '🎙️ Voice ON' : '🔇 Voice OFF'}
      </motion.button>

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
