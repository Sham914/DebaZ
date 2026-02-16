# Premium AI Voice System - ElevenLabs Integration

## Overview

The debate app now uses **ElevenLabs AI Text-to-Speech** for professional-grade voice synthesis. This provides dramatically better voice quality, natural expression, and distinct character personalities compared to browser-based Web Speech API.

## Character Voices

### ALEX (PRO Debater)
- **Voice ID**: EXAVITQu4EsNXjluf0ak
- **Personality**: Confident, authoritative, forward-thinking
- **Tone Variants**:
  - Opening: Engaging, energetic, confident
  - Rebuttal: Sharp, logical, dismissive
  - Evidence: Analytical, fast-paced, data-driven
  - Emotional: Passionate, inspiring, hopeful
  - Closing: Powerful, commanding, memorable

### SOPHIA (CON Debater)
- **Voice ID**: nPczCjzI2devNBz1zQrH
- **Personality**: Thoughtful, analytical, measured
- **Tone Variants**:
  - Opening: Thoughtful, cautious, wise
  - Rebuttal: Skeptical, probing, critical
  - Evidence: Precise, technical, careful
  - Emotional: Compassionate, concerned, protective
  - Closing: Serious, resolute, responsible

## Setup Instructions

### 1. Get ElevenLabs API Key

1. Go to [ElevenLabs.io](https://elevenlabs.io)
2. Sign up for a free account (includes free credits)
3. Navigate to **Account** → **API Keys**
4. Copy your API key

### 2. Configure Environment Variables

Add your API key to `.env`:

```bash
VITE_ELEVENLABS_API_KEY=sk_your_api_key_here
```

⚠️ **Important**: Keep your API key SECRET. Never commit it to git.

### 3. Start Using Premium Voices

Run the app normally:

```bash
npm run dev
```

When you play a debate, you'll hear high-quality AI voices with natural expression.

## How It Works

### Voice Synthesis Flow

```
Debate Argument
    ↓
Extract Metrics (logic_score, emotion_score, round)
    ↓
Determine Voice Character (ALEX or SOPHIA)
    ↓
Set Voice Parameters (stability, style boost)
    ↓
ElevenLabs API Call
    ↓
Generate Audio (MP3)
    ↓
Play with Web Audio API
    ↓
User hears expressive debate
```

### Voice Parameter Mapping

**Stability** (0.2 - 1.0):
- Emotional arguments (emotion > 80): Lower stability (0.2-0.3) = more dynamic
- Logical arguments (logic > 80): Higher stability (0.7-0.9) = more consistent

**Style Boost** (30 - 100):
- Based on emotion score: 30 + (emotion_score × 0.7)
- Higher emotion = more pronounced character personality

## Features

✅ **Professional Quality**: Studio-grade voice synthesis  
✅ **Character Consistency**: Each speaker maintains distinct personality  
✅ **Expression Adaptation**: Voice adapts to debate metrics  
✅ **Fast Generation**: ~1-2 seconds per argument  
✅ **Natural Playback**: Seamless integration with text animation  
✅ **Graceful Fallback**: Continues without voice if API fails  

## Pricing

ElevenLabs offers:
- **Free Tier**: 10,000 characters/month ($0)
- **Starter**: 100,000 characters/month ($5)
- **Pro**: 1,000,000 characters/month ($99)

*A typical 5-round debate uses ~3,000 characters*

## API Details

### ElevenLabs Voice API

**Endpoint**: `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`

**Request Body**:
```json
{
  "text": "Your argument text here",
  "model_id": "eleven_monolingual_v1",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 75
  }
}
```

**Response**: MP3 audio (ArrayBuffer)

### Supported Models

- `eleven_monolingual_v1`: Single language (recommended)
- `eleven_multilingual_v2`: Multiple languages

## Configuration

Edit `src/engine/elevenlabsVoiceService.ts` to customize:

### Change Speaker Voice
```typescript
const VOICE_CONFIG = {
  PRO: {
    voiceId: 'your_new_voice_id', // Get from ElevenLabs
  },
  CON: {
    voiceId: 'another_voice_id',
  },
};
```

### Adjust Voice Styles
```typescript
const VOICE_STYLES = {
  PRO: {
    opening: 'Your custom style description',
    rebuttal: 'Custom rebuttal style',
    // ... customize other rounds
  },
};
```

## Testing

### Test Individual Voices
```typescript
import { testVoice } from '@/engine/elevenlabsVoiceService';

// Test ALEX voice
testVoice('PRO');

// Test SOPHIA voice
testVoice('CON');
```

### Check API Status
Open browser console and check:
- ✅ If voice loads and plays = API working
- ❌ If error shows = Check API key and quota

## Troubleshooting

### "API key not configured"
**Solution**: Add `VITE_ELEVENLABS_API_KEY` to `.env`

### "Quota exceeded"
**Solution**: Check ElevenLabs dashboard for usage. Upgrade plan if needed.

### "Network error"
**Solution**: Check internet connection. Review browser console for details.

### "Audio won't play"
**Solution**: 
1. Check browser permissions (microphone/audio)
2. Try disabling adblockers
3. Test on different browser

## Best Practices

✅ Keep API key in `.env` (never in code)  
✅ Monitor usage in ElevenLabs dashboard  
✅ Set reasonable quotas to avoid surprise charges  
✅ Cache audio if doing repeated debates  
✅ Log errors for debugging  

## Future Enhancements

- [ ] Voice cloning for custom speakers
- [ ] Emotion-based voice mixing
- [ ] Audio caching for repeated arguments
- [ ] Multi-language support
- [ ] Premium voice options for special debates

## Support

For issues with:
- **ElevenLabs API**: See https://elevenlabs.io/docs
- **Character voices**: Check voice IDs in ElevenLabs dashboard
- **Integration**: Review `src/engine/elevenlabsVoiceService.ts`
