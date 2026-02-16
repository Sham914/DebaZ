import { RoundData } from './debateGenerator';

export interface VoiceConfig {
  speaker: 'PRO' | 'CON';
  round: number;
  logicScore: number;
  emotionScore: number;
}

// Map debate metrics to voice characteristics
function getVoiceParams(config: VoiceConfig): {
  pitch: number;
  rate: number;
  volume: number;
} {
  const { speaker, logicScore, emotionScore } = config;

  // PRO is ALEX (male-ish), CON is SOPHIA (female-ish)
  const basePitch = speaker === 'PRO' ? 0.8 : 1.3;
  const baseRate = 1.0;

  // Higher emotion = more dramatic pitch variation and slower delivery
  const emotionPitchBoost = (emotionScore / 100) * 0.4;
  const emotionRateAdjust = emotionScore > 70 ? 0.85 : 1.0;

  // Higher logic = faster, more measured delivery
  const logicRateBoost = (logicScore / 100) * 0.3;
  const logicRate = emotionRateAdjust * (baseRate + logicRateBoost);

  // Volume adjustment based on intensity (logic + emotion)
  const intensity = (logicScore + emotionScore) / 200;
  const volume = 0.7 + intensity * 0.3;

  return {
    pitch: basePitch + emotionPitchBoost,
    rate: Math.min(logicRate, 1.5), // Cap at 1.5x speed
    volume,
  };
}

let currentUtterance: SpeechSynthesisUtterance | null = null;
let isPlaying = false;

export function isVoicePlaying(): boolean {
  return isPlaying;
}

export function stopVoice(): void {
  window.speechSynthesis.cancel();
  isPlaying = false;
  currentUtterance = null;
}

export async function playDebateVoice(
  text: string,
  config: VoiceConfig,
  onComplete?: () => void
): Promise<void> {
  // Stop any currently playing voice
  stopVoice();

  const params = getVoiceParams(config);
  const utterance = new SpeechSynthesisUtterance(text);

  // Configure voice characteristics
  utterance.pitch = params.pitch;
  utterance.rate = params.rate;
  utterance.volume = params.volume;
  utterance.lang = 'en-US';

  // Set speaker name for voice selection
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    // Try to select appropriate voice based on speaker
    const voiceIndex = config.speaker === 'PRO' ? 0 : Math.min(1, voices.length - 1);
    utterance.voice = voices[voiceIndex];
  }

  isPlaying = true;
  currentUtterance = utterance;

  utterance.onend = () => {
    isPlaying = false;
    onComplete?.();
  };

  utterance.onerror = () => {
    isPlaying = false;
    console.error('Speech synthesis error');
  };

  window.speechSynthesis.speak(utterance);
}

// Helper to ensure voices are loaded before use
export function ensureVoicesLoaded(): Promise<void> {
  return new Promise(resolve => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        resolve();
      };
    }
  });
}
