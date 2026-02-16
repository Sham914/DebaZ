## DebaZ - AI-Powered Debate Arena
DebaZ is an interactive debate platform that pits AI-generated arguments against each other in an engaging, real-time debate experience.

# Features
*AI-Powered Debates:* Generate structured 5-round debates with AI-crafted arguments, evidence, and emotional appeals using Google Gemini API. Each debate features two opposing positions with dynamic scoring.

*Intelligent Fallback System:* Seamless local debate generation with 30+ pre-loaded topics if the API is unavailable. Fallback debates are fully featured with diverse arguments, realistic data points, and proper pro/con framing.

*Real-Time Voice Synthesis:* Native Web Speech API with customized voice profiles. PRO gets a lower-pitched authoritative voice, CON gets a higher-pitched thoughtful voice. Speech rate adapts based on argument type (logic vs emotion).

*Dynamic Evidence Visualization:* Round 3 features a live bar chart comparing debate points across evidence categories.

*Content Safety:* Built-in safety filters prevent offensive content. Single-word topic expansion (e.g., "ai" → "Artificial Intelligence Should Replace Human Decision-Making").


## System Flowchart

![System Flowchart](./flw.png)


5-Phase Gameplay Flow:

- Input phase: Enter debate topic or get random generation
- Framing phase: Reveals pro/con positions with animated headlines
- Debate phase: 5 rounds of back-and-forth arguments with voice playback
- Voting phase: Audience participation affects scoring
- Victory screen: Final results with winner determination

