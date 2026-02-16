/**
 * Hybrid Voice Service
 * Primary: Web Speech API (built-in, no setup, no billing)
 * Fallback: Same Web Speech API with enhanced configuration
 * 
 * TRUE 100% FREE - No API keys, no billing, no premium needed
 */

export interface VoiceConfig {
  speaker: 'PRO' | 'CON';
  round: number;
  logicScore: number;
  emotionScore: number;
  argument: string;
}

// Voice configuration for character personalities
const VOICE_CONFIG = {
  PRO: {
    name: 'ALEX',
    pitch: 0.85, // Slightly lower, more authoritative
    volume: 0.85,
  },
  CON: {
    name: 'SOPHIA',
    pitch: 1.2, // Slightly higher, more thoughtful
    volume: 0.85,
  },
};

let currentUtterance: SpeechSynthesisUtterance | null = null;
let isPlaying = false;
let suppressInterruptError = false;

export function isVoicePlaying(): boolean {
  return isPlaying;
}

export function stopVoice(): void {
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    suppressInterruptError = true;
    window.speechSynthesis.cancel();
  }
  isPlaying = false;
  currentUtterance = null;
}

function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length) return Promise.resolve(voices);

  return new Promise((resolve) => {
    const handleVoicesChanged = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    }, 300);
  });
}

/**
 * Calculate speech rate based on debate metrics
 * Logic-heavy = faster, Emotion-heavy = slower
 */
function calculateSpeechRate(config: VoiceConfig): number {
  const { logicScore, emotionScore } = config;

  if (logicScore > 80) {
    return 1.15; // 15% faster for data-driven arguments
  }

  if (emotionScore > 80) {
    return 0.85; // 15% slower for emotional impact
  }

  if (logicScore > 75 && emotionScore > 75) {
    return 1.0; // Normal for balanced arguments
  }

  return 1.0; // Default
}

/**
 * Play debate using Web Speech API with enhanced voice config
 * No API keys, no billing, 100% free
 */
export async function playDebateVoice(
  text: string,
  config: VoiceConfig,
  onComplete?: () => void
): Promise<void> {
  // Stop any current playback
  stopVoice();

  return new Promise((resolve) => {
    try {
      const voiceConfig = VOICE_CONFIG[config.speaker];
      const utterance = new SpeechSynthesisUtterance(text);

      // Get available voices
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = voices[0];

      if (!voices.length) {
        getVoicesAsync().then((loadedVoices) => {
          if (loadedVoices.length) {
            selectedVoice = loadedVoices[0];
          }
        });
      }

      // Try to find the best voice available
      for (const voice of voices) {
        // Prefer Google, Microsoft, or natural-sounding voices
        if (voice.name.includes('Google US English')) {
          selectedVoice = voice;
          break;
        }
        if (config.speaker === 'PRO' && voice.name.toLowerCase().includes('male')) {
          selectedVoice = voice;
        }
        if (config.speaker === 'CON' && voice.name.toLowerCase().includes('female')) {
          selectedVoice = voice;
        }
      }

      utterance.voice = selectedVoice;
      utterance.pitch = voiceConfig.pitch;
      utterance.rate = calculateSpeechRate(config);
      utterance.volume = voiceConfig.volume;
      utterance.lang = 'en-US';

      isPlaying = true;
      currentUtterance = utterance;

      utterance.onend = () => {
        isPlaying = false;
        onComplete?.();
        resolve();
      };

      utterance.onerror = (event) => {
        if (!(event.error === 'interrupted' && suppressInterruptError)) {
          console.error('Speech error:', event);
        }
        suppressInterruptError = false;
        isPlaying = false;
        onComplete?.();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Voice synthesis error:', error);
      isPlaying = false;
      onComplete?.();
      resolve();
    }
  });
}

/**
 * Get character info
 */
export function getCharacterInfo(speaker: 'PRO' | 'CON') {
  return {
    name: VOICE_CONFIG[speaker].name,
  };
}

/**
 * Test voice synthesis (for debugging)
 */
export async function testVoice(speaker: 'PRO' | 'CON'): Promise<void> {
  const testText = speaker === 'PRO'
    ? 'Hello, I am Alex, and I believe we should embrace this opportunity for progress.'
    : 'I am Sophia, and I believe we must approach this with caution and wisdom.';

  await playDebateVoice(testText, {
    speaker,
    round: 1,
    logicScore: 70,
    emotionScore: 60,
    argument: testText,
  });
}
