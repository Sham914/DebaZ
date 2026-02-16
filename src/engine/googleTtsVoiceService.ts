/**
 * Google Cloud Text-to-Speech Voice Service
 * Free tier: 1 million characters per month (way more than needed)
 * 100% free, no premium required
 */

import { RoundData } from './debateGenerator';

export interface VoiceConfig {
  speaker: 'PRO' | 'CON';
  round: number;
  logicScore: number;
  emotionScore: number;
  argument: string;
}

// Google Cloud voices for our characters
const VOICE_CONFIG = {
  PRO: {
    name: 'ALEX',
    languageCode: 'en-US',
    voiceName: 'en-US-Neural2-C', // Professional male voice
    ssmlGender: 'MALE',
  },
  CON: {
    name: 'SOPHIA',
    languageCode: 'en-US',
    voiceName: 'en-US-Neural2-F', // Intelligent female voice
    ssmlGender: 'FEMALE',
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
 * Add SSML emphasis based on debate metrics
 */
function addEmphasis(text: string, config: VoiceConfig): string {
  // For high-emotion content, add emphasis tags
  if (config.emotionScore > 75) {
    // Add breaks and emphasis for dramatic effect
    return text
      .split('. ')
      .map((sentence, i) => {
        if (i > 0) return `<break time="200ms"/>${sentence}`;
        return sentence;
      })
      .join('. ');
  }

  // For high-logic content, speak faster
  if (config.logicScore > 80) {
    return `<prosody rate="1.1">${text}</prosody>`;
  }

  return text;
}

/**
 * Fetch audio from Google Cloud Text-to-Speech API
 */
async function fetchGoogleTTSAudio(text: string, speaker: 'PRO' | 'CON'): Promise<string> {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Google API key not configured. Use VITE_GOOGLE_API_KEY or VITE_GEMINI_API_KEY in .env');
  }

  const voiceConfig = VOICE_CONFIG[speaker];
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: voiceConfig.languageCode,
        name: voiceConfig.voiceName,
        ssmlGender: voiceConfig.ssmlGender,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: speaker === 'PRO' ? -2 : 2, // ALEX lower, SOPHIA higher
        speakingRate: 1.0,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Google TTS API error:', error);
    throw new Error(`Google TTS API error: ${response.status}`);
  }

  const data = await response.json() as { audioContent?: string };
  if (!data.audioContent) {
    throw new Error('No audio content in response');
  }

  return data.audioContent;
}

/**
 * Play debate with Google Cloud AI voice
 */
export async function playDebateVoice(
  text: string,
  config: VoiceConfig,
  onComplete?: () => void
): Promise<void> {
  // Stop any current playback
  stopVoice();

  try {
    // Add SSML emphasis based on metrics
    const emphasizedText = addEmphasis(text, config);

    // Fetch audio from Google Cloud TTS
    const audioBase64 = await fetchGoogleTTSAudio(emphasizedText, config.speaker);

    // Convert base64 to blob and play
    const binaryString = atob(audioBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
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
  return {
    name: VOICE_CONFIG[speaker].name,
    voiceName: VOICE_CONFIG[speaker].voiceName,
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
