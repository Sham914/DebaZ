/**
 * Premium Voice Service using ElevenLabs API
 * Provides high-quality, expressive character voices with AI-driven delivery
 */

import { RoundData } from './debateGenerator';

export interface VoiceConfig {
  speaker: 'PRO' | 'CON';
  round: number;
  logicScore: number;
  emotionScore: number;
  argument: string;
}

// ElevenLabs voice IDs for our characters
const VOICE_CONFIG = {
  PRO: {
    name: 'ALEX',
    voiceId: 'EXAVITQu4EsNXjluf0ak', // Professional male voice
    description: 'Confident debater with authoritative tone',
  },
  CON: {
    name: 'SOPHIA',
    voiceId: 'nPczCjzI2devNBz1zQrH', // Intelligent female voice
    description: 'Analytical debater with balanced delivery',
  },
};

// Character voice descriptions for better AI generation
const VOICE_STYLES = {
  PRO: {
    opening: 'Confident, engaging, forward-thinking, energetic',
    rebuttal: 'Sharp, logical, dismissive of opposition, quick-paced',
    evidence: 'Data-driven, analytical, fast-paced, authoritative',
    emotional: 'Passionate, inspiring, hopeful, motivating',
    closing: 'Powerful, memorable, confident, commanding',
  },
  CON: {
    opening: 'Thoughtful, measured, cautious, wise',
    rebuttal: 'Skeptical, probing, critical, methodical',
    evidence: 'Precise, technical, detail-oriented, careful',
    emotional: 'Compassionate, concerned, protective, grounded',
    closing: 'Serious, resolute, cautious, responsible',
  },
};

let currentAudio: HTMLAudioElement | null = null;
let isPlaying = false;

export function isVoicePlaying(): boolean {
  return isPlaying;
}

export function stopVoice(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  isPlaying = false;
}

/**
 * Generate voice request with optimized prompt for emotional delivery
 */
function generateVoicePrompt(config: VoiceConfig): string {
  const speaker = config.speaker === 'PRO' ? 'ALEX' : 'SOPHIA';
  const styleKey = getRoundStyle(config.round);
  const style = VOICE_STYLES[config.speaker][styleKey as keyof typeof VOICE_STYLES['PRO']];
  
  // Create delivery instructions based on debate metrics
  let deliveryInstructions = '';
  
  if (config.logicScore > 80) {
    deliveryInstructions += 'Speak with conviction and authority. ';
  }
  if (config.emotionScore > 80) {
    deliveryInstructions += 'Convey strong emotion and passion. ';
  }
  if (config.logicScore > 75 && config.emotionScore > 75) {
    deliveryInstructions += 'Balance powerful reasoning with emotional resonance. ';
  }
  if (config.emotionScore < 50 && config.logicScore > 80) {
    deliveryInstructions += 'Maintain cool, measured delivery focused on facts. ';
  }

  return `[Speaker: ${speaker}] [Tone: ${style}] [Delivery: ${deliveryInstructions}] Speak this debate argument naturally and expressively.`;
}

function getRoundStyle(round: number): string {
  if (round === 1) return 'opening';
  if (round === 2) return 'rebuttal';
  if (round === 3) return 'evidence';
  if (round === 4) return 'emotional';
  return 'closing';
}

/**
 * Fetch audio from ElevenLabs API with character voice
 */
async function fetchElevenLabsAudio(
  text: string,
  speaker: 'PRO' | 'CON',
  stability: number = 0.5,
  styleBoost: number = 50
): Promise<ArrayBuffer> {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured. Set VITE_ELEVENLABS_API_KEY in .env');
  }

  const voiceId = VOICE_CONFIG[speaker].voiceId;
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability,
        similarity_boost: styleBoost,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('ElevenLabs API error:', error);
    throw new Error(`ElevenLabs API error: ${response.status}`);
  }

  return response.arrayBuffer();
}

/**
 * Play debate with premium AI voice
 */
export async function playDebateVoice(
  text: string,
  config: VoiceConfig,
  onComplete?: () => void
): Promise<void> {
  // Stop any current playback
  stopVoice();

  try {
    // Determine voice parameters based on debate metrics
    const stability = Math.max(0.2, 1 - config.emotionScore / 100); // Lower emotion = higher stability
    const styleBoost = Math.min(100, 30 + config.emotionScore * 0.7); // Higher emotion = more style

    // Fetch audio from ElevenLabs
    const audioBuffer = await fetchElevenLabsAudio(
      text,
      config.speaker,
      stability,
      styleBoost
    );

    // Create audio element and play
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);

    currentAudio = new Audio(audioUrl);
    isPlaying = true;

    currentAudio.onended = () => {
      isPlaying = false;
      URL.revokeObjectURL(audioUrl);
      onComplete?.();
    };

    currentAudio.onerror = (error) => {
      console.error('Audio playback error:', error);
      isPlaying = false;
      onComplete?.();
    };

    currentAudio.play().catch(err => {
      console.error('Failed to play audio:', err);
      isPlaying = false;
      onComplete?.();
    });
  } catch (error) {
    console.error('Voice synthesis failed:', error);
    isPlaying = false;
    throw error;
  }
}

/**
 * Get character info
 */
export function getCharacterInfo(speaker: 'PRO' | 'CON') {
  return VOICE_CONFIG[speaker];
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
