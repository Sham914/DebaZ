# Voice Synthesis Implementation for DebaZ

## Overview
AI voice synthesis has been integrated into the debate application to provide expressive, tone-aware narration of debate arguments. Each speaker has a unique voice personality that adapts based on their debate metrics.

## How It Works

### Voice Service (`src/engine/voiceService.ts`)
The voice system maps debate metrics to speech characteristics:

#### Voice Characteristics by Speaker
- **ALEX (PRO)**: Lower pitch (0.8), masculine tone
- **SOPHIA (CON)**: Higher pitch (1.3), feminine tone

#### Dynamic Voice Adjustment
Voice parameters are calculated based on debate round scores:

| Metric | Effect |
|--------|--------|
| **Logic Score** | Higher = faster delivery, more measured |
| **Emotion Score** | Higher = more dramatic pitch, slower delivery |
| **Combined** | Creates nuanced expression matching argument tone |

### Example Adaptations
- **Logical argument (90 logic, 40 emotion)**: Fast, measured, professional
- **Emotional appeal (50 logic, 90 emotion)**: Slower, higher pitched, dramatic
- **Balanced (75 logic, 75 emotion)**: Standard speed, expressive tone

## UI Integration

### DebateStage Component
- **Voice Toggle Button**: Top-right corner allows users to enable/disable voice (🔊 Voice ON/OFF)
- **Auto-Play**: Voice starts as text types, synchronized with text animation
- **Stop on Round Change**: Voice stops when advancing to next round

### Features
✅ Voice plays simultaneously with text typing animation  
✅ Expressions adapt to logic/emotion scores  
✅ Toggle on/off without reloading  
✅ Graceful cleanup on component unmount  
✅ Cross-browser compatible (Web Speech API)

## Browser Support
Works on all modern browsers with Web Speech API support:
- ✅ Chrome/Chromium
- ✅ Edge
- ✅ Safari (iOS 14.5+)
- ✅ Firefox (limited voice selection)

## Technical Details

### Voice Parameters
```typescript
interface VoiceConfig {
  speaker: 'PRO' | 'CON';      // ALEX or SOPHIA
  round: number;                // 1-5
  logicScore: number;           // 0-100
  emotionScore: number;         // 0-100
}
```

### Key Functions
- `playDebateVoice()`: Start voice synthesis with config
- `stopVoice()`: Stop current playback
- `isVoicePlaying()`: Check if voice is active
- `ensureVoicesLoaded()`: Initialize voices on mount

## Future Enhancements
- [ ] Add AI-powered TTS (Google Cloud TTS, ElevenLabs) for higher quality
- [ ] Support for custom voice selection
- [ ] Playback speed control
- [ ] Volume control per speaker
- [ ] Audio visualization during playback
- [ ] Record/replay debate audio
