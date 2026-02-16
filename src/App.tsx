import { AnimatePresence, motion } from 'framer-motion';
import { useDebateStore } from './state/debateState';
import ParticleBackground from './components/ParticleBackground';
import TopicInput from './components/TopicInput';
import FramingReveal from './components/FramingReveal';
import DebateStage from './components/DebateStage';
import VictoryScreen from './components/VictoryScreen';

export default function App() {
  const { phase, shakeScreen } = useDebateStore();

  return (
    <div
      className={`relative min-h-screen bg-arena-bg overflow-hidden ${shakeScreen ? 'animate-shake' : ''}`}
    >
      <ParticleBackground />

      {/* Holographic ring decoration */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
        style={{
          width: '600px',
          height: '600px',
          border: '1px solid rgba(255, 215, 0, 0.06)',
          borderRadius: '50%',
          boxShadow: '0 0 60px rgba(255, 215, 0, 0.03), inset 0 0 60px rgba(255, 215, 0, 0.03)',
        }}
      />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
        style={{
          width: '800px',
          height: '800px',
          border: '1px solid rgba(0, 212, 255, 0.04)',
          borderRadius: '50%',
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {phase === 'input' && <TopicInput />}
          {phase === 'framing' && <FramingReveal />}
          {phase === 'debate' && <DebateStage />}
          {phase === 'victory' && <VictoryScreen />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
