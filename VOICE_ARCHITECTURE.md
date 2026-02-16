# Voice Synthesis Architecture

```mermaid
flowchart TD
    A["Debate Round Data<br/>(logic_score, emotion_score)"] --> B["Voice Service<br/>getVoiceParams()"]
    
    B --> C["Calculate Voice Characteristics"]
    C --> D1["Pitch<br/>Base: PRO=0.8, CON=1.3<br/>+Emotion Boost"]
    C --> D2["Rate<br/>Base: 1.0<br/>+Logic Boost (0.3x max)<br/>Emotion Adjust: 0.85"]
    C --> D3["Volume<br/>Base: 0.7<br/>+Intensity 0.3x"]
    
    D1 & D2 & D3 --> E["Web Speech API<br/>SpeechSynthesisUtterance"]
    
    E --> F["Speaker Voice Selection<br/>ALEX: Voice[0]<br/>SOPHIA: Voice[1]"]
    
    F --> G["Play debate argument<br/>with expression"]
    
    H["DebateStage Component"] --> I["typeText() function"]
    I --> J["Text animation + Voice playback<br/>synchronized"]
    J --> K["User sees text + hears voice<br/>with emotional expression"]
    
    L["Voice Toggle Button"] --> M{Voice Enabled?}
    M -->|Yes| G
    M -->|No| N["Text only, no voice"]
```

## Voice Parameter Mapping

### Logic Score Impact
- **Low (< 50)**: Slower delivery, flexible rate
- **Medium (50-75)**: Standard rate
- **High (> 75)**: Faster, measured delivery

### Emotion Score Impact
- **Low (< 50)**: Standard pitch, normal speed
- **Medium (50-75)**: Slight pitch increase, normal speed
- **High (> 75)**: Dramatic pitch, slower delivery (0.85x rate)

### Combined Effect Examples

| Logic | Emotion | Delivery | Pitch | Use Case |
|-------|---------|----------|-------|----------|
| 90 | 40 | Fast & measured | Low | Logical rebuttal |
| 50 | 90 | Slow & dramatic | High | Emotional appeal |
| 85 | 85 | Fast & dramatic | Med-High | Powerful closing |
| 60 | 60 | Standard | Normal | Opening statement |

## Data Flow

```
RoundData (from AI or local generation)
    ↓
DebateStage mounts
    ↓
ensureVoicesLoaded() initializes Web Speech API
    ↓
User clicks "Next" or round changes
    ↓
typeText() called with round data
    ↓
playDebateVoice() extracts metrics
    ↓
getVoiceParams() calculates pitch/rate/volume
    ↓
Text animates + voice plays simultaneously
    ↓
User hears expressive AI debate
```

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome/Edge | ✅ Full | Best voice quality |
| Safari | ✅ Full | iOS 14.5+ required |
| Firefox | ✅ Limited | Fewer voice options |
| Opera | ✅ Full | Based on Chromium |

## Future Enhancements

1. **Premium TTS Services**
   - Google Cloud Text-to-Speech
   - ElevenLabs (custom voices)
   - AWS Polly

2. **Voice Customization**
   - User selects speaker personality
   - Custom pitch/rate ranges
   - Accent selection

3. **Audio Features**
   - Audio visualization
   - Volume control
   - Playback speed slider
   - Record/replay debates

4. **Advanced Expression**
   - SSML markup for emphasis
   - Pause simulation
   - Laughter/emotion effects
