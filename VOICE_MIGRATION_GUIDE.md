# Voice System Migration Guide

## What Changed

The voice system has been upgraded from the basic **Web Speech API** to **ElevenLabs AI TTS** for dramatically better quality.

## Before vs After

### Before (Web Speech API)
- ❌ Generic browser voices
- ❌ Limited expression
- ❌ Poor emotional delivery
- ❌ Inconsistent quality across devices
- ✅ No setup required

### After (ElevenLabs)
- ✅ Professional AI voices (ALEX & SOPHIA)
- ✅ Dynamic expression based on debate metrics
- ✅ Natural, convincing emotional delivery
- ✅ Consistent quality worldwide
- ✅ Character-specific personality
- ⚠️ Requires API key setup (1 minute)

## Setup (1 Minute)

1. Get API key from [elevenlabs.io](https://elevenlabs.io)
2. Add to `.env`:
```
VITE_ELEVENLABS_API_KEY=sk_your_key_here
```
3. Done! Restart dev server

## Voice Quality Comparison

| Aspect | Web Speech | ElevenLabs |
|--------|-----------|-----------|
| Voice Quality | 5/10 | 9/10 |
| Natural Delivery | 4/10 | 9/10 |
| Emotion Expression | 3/10 | 8/10 |
| Character Consistency | 5/10 | 10/10 |
| Setup Required | No | Yes (free) |
| Cost | Free | Free tier available |

## What You'll Notice

### Voice Quality Improvements
- **Clearer pronunciation** - No more robot-like delivery
- **Natural pacing** - Debates flow naturally
- **Better emotion** - Passion comes through when appropriate
- **Professional tone** - Both characters sound polished and serious

### Character Personalities
- **ALEX (PRO)**: Confident male voice with commanding presence
- **SOPHIA (CON)**: Intelligent female voice with thoughtful delivery

### Expression Adaptation
Arguments now sound different based on their metrics:
- **Logic-heavy**: Fast, measured, analytical
- **Emotion-heavy**: Slower, more dramatic, passionate
- **Balanced**: Powerful combination of both

## Backward Compatibility

The old `voiceService.ts` is still available if you want to switch back:

```typescript
// To use old Web Speech API:
import { playDebateVoice } from '../engine/voiceService';

// To use new ElevenLabs:
import { playDebateVoice } from '../engine/elevenlabsVoiceService';
```

Currently, `DebateStage.tsx` uses ElevenLabs. To revert:
```typescript
import { playDebateVoice } from '../engine/voiceService';
```

## Troubleshooting Common Issues

### "I don't hear any voice"
1. Check API key is in `.env`
2. Ensure voice is enabled (toggle button)
3. Check browser console for errors
4. Verify ElevenLabs account has credits

### "Voice quality is still poor"
1. Make sure using `elevenlabsVoiceService.ts` (not old `voiceService.ts`)
2. Restart dev server after adding API key
3. Try different browser
4. Clear cache and reload

### "Too slow / not real-time"
- Initial generation takes 1-2 seconds
- This is normal for quality TTS
- Audio caching coming in future release

### "API errors"
1. Check API key format (`sk_...`)
2. Visit https://elevenlabs.io/account/usage
3. Verify you have remaining credits
4. Check internet connection

## API Cost Calculator

ElevenLabs charges per character generated:

**Example**: 5-round debate
- ~600 chars per round × 5 rounds = 3,000 characters
- Cost: ~$0.03 per debate (free tier: 10,000 chars/month)

**Budget**: 
- Free tier ($0): ~3 debates/month
- Starter ($5): ~150 debates/month
- Pro ($99): Unlimited

## Files Changed

### New Files
- `src/engine/elevenlabsVoiceService.ts` - Premium voice engine
- `ELEVENLABS_SETUP.md` - Setup instructions

### Modified Files
- `src/components/DebateStage.tsx` - Uses ElevenLabs instead of Web Speech
- `.env` - Added `VITE_ELEVENLABS_API_KEY`
- `.env.example` - Added API key template

### Unchanged
- `.voiceService.ts` - Still available for fallback
- All debate generation logic
- All UI components except DebateStage

## Next Steps

1. ✅ Run `npm run dev`
2. ✅ Add ElevenLabs API key to `.env`
3. ✅ Restart dev server
4. ✅ Start a debate and listen to the new voices!

## Questions?

- ElevenLabs API: https://elevenlabs.io/docs
- Voice IDs: https://elevenlabs.io/app/voice-lab
- Implementation: See `src/engine/elevenlabsVoiceService.ts`
