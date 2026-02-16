# Voice Feature - Developer Guide

## Quick Start

The voice system is automatically integrated and requires no additional setup. Just run the app normally:

```bash
npm run dev
```

## How to Use (End User)

1. **Enable/Disable Voice**: Click the 🔊/🔇 button in the top-right during debates
2. **Voice plays automatically** when text types out
3. **Voice stops** when you advance to the next round
4. **Expression changes** based on the debate metrics of each round

## For Developers

### Adding Voice to a New Component

```typescript
import { playDebateVoice, stopVoice, ensureVoicesLoaded } from '../engine/voiceService';

// In your component:
useEffect(() => {
  ensureVoicesLoaded(); // Initialize on mount
}, []);

// When you want to play voice:
playDebateVoice(
  'Your text here',
  {
    speaker: 'PRO', // or 'CON'
    round: 1,
    logicScore: 75,
    emotionScore: 60,
  },
  () => console.log('Done playing') // Optional callback
);

// To stop:
stopVoice();
```

### Voice Service API

#### `playDebateVoice(text, config, callback?)`
Plays debate text with voice synthesis.

**Parameters:**
- `text` (string): The argument text to speak
- `config` (VoiceConfig): Voice configuration
- `callback?` (function): Called when speech finishes

**Returns:** Promise<void>

#### `stopVoice()`
Stops current voice playback.

#### `isVoicePlaying()`
Checks if voice is currently playing.

**Returns:** boolean

#### `ensureVoicesLoaded()`
Initializes Web Speech API voices (call once on mount).

**Returns:** Promise<void>

### VoiceConfig Interface

```typescript
interface VoiceConfig {
  speaker: 'PRO' | 'CON';    // Determines pitch and voice selection
  round: number;              // 1-5
  logicScore: number;         // 0-100
  emotionScore: number;       // 0-100
}
```

### Customizing Voice Behavior

Edit `src/engine/voiceService.ts` to modify:

**Base pitch values:**
```typescript
const basePitch = speaker === 'PRO' ? 0.8 : 1.3;
```

**Pitch boost range:**
```typescript
const emotionPitchBoost = (emotionScore / 100) * 0.4; // Increase 0.4 to 0.6 for more variation
```

**Rate adjustments:**
```typescript
const emotionRateAdjust = emotionScore > 70 ? 0.85 : 1.0; // Lower = slower
const logicRateBoost = (logicScore / 100) * 0.3; // Increase 0.3 to 0.5 for more speed variation
```

**Volume range:**
```typescript
const volume = 0.7 + intensity * 0.3; // Adjust 0.7 (min) or 0.3 (max boost)
```

## Debugging

### Check if voices are available:
```javascript
console.log(window.speechSynthesis.getVoices());
```

### Check current playback status:
```javascript
console.log(window.speechSynthesis.speaking);
```

### Listen for voice errors:
The `playDebateVoice` function logs errors to console:
```
Voice playback error: [error details]
```

## Performance Notes

- Web Speech API is hardware-accelerated on most devices
- Voices are cached after first load
- No network latency (uses device voices)
- ~50ms latency for voice start

## Accessibility

✅ Voice can be toggled off  
✅ Text is always visible while voice plays  
✅ No visual-only features dependent on voice  
✅ Works with screen readers independently  

## Testing

To test voice locally:

```bash
# 1. Start dev server
npm run dev

# 2. Open in browser
# http://localhost:5173

# 3. Enter a debate topic
# 4. Click Voice ON/OFF button to toggle
# 5. Listen to the AI voices debate with different expressions
```

## Known Issues & Limitations

⚠️ **Browser Voices Vary**: Different OS/browser combinations have different quality voices
⚠️ **No Network TTS**: Uses device voices only (no remote API calls)
⚠️ **Language Limited**: Currently set to en-US
⚠️ **No Emphasis**: Standard TTS (no SSML support in Web Speech API)

## Future Improvements

- [ ] Upgrade to premium TTS (ElevenLabs, Google Cloud)
- [ ] Add voice personality selection UI
- [ ] Implement audio visualization
- [ ] Add playback speed control
- [ ] Record and replay debates
- [ ] SSML support for emphasis
