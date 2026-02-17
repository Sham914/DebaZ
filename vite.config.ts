import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage } from 'http'
import dotenv from 'dotenv'

// Load .env file explicitly
dotenv.config()

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: Buffer | string) => {
      data += chunk.toString();
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function buildPrompt(action: string, topic?: string): string {
  if (action === 'random_topic') {
    return [
      'Return JSON only with one field: topic.',
      'Provide a single debate topic that is safe, non-violent, and not hateful.',
      'Make it quick and relevant to current global events or trending public issues.',
      'Keep it concise and suitable for a fun debate stage.',
      'Output format:',
      '{"topic":"..."}'
    ].join('\n');
  }

  if (action === 'generate_framing') {
    return [
      'You are generating debate framing headlines.',
      'Return JSON only with fields: topic, proHeadline, conHeadline.',
      'Each headline must be a clear, logically coherent claim specific to the topic.',
      'Avoid generic slogans and avoid ALL CAPS.',
      'Aim for 8-14 words per headline in sentence case.',
      'Keep the content safe, non-violent, and not hateful.',
      `Topic: ${topic ?? ''}`
    ].join('\n');
  }

  return [
    'You must return ONLY valid JSON. No markdown, no explanations, no extra text.',
    'Generate structured debate content with these exact fields:',
    '{',
    '  "topic": "string",',
    '  "proHeadline": "string (8-14 words, sentence case, specific claim)",',
    '  "conHeadline": "string (8-14 words, sentence case, specific claim)",',
    '  "rounds": [',
    '    {',
    '      "round": number (1-3),',
    '      "speaker": "PRO" or "CON",',
    '      "headline": "string",',
    '      "argument": "string (1-2 sentences, concise)",',
    '      "data_points": ["string", "string"],',
    '      "emotion_score": number (0-100),',
    '      "logic_score": number (0-100),',
    '      "rebuttal_strength": number (0-100)',
    '    }',
    '  ]',
    '}',
    'Generate 6 rounds total (3 rounds, 2 speakers each, alternating PRO/CON starting with PRO).',
    'Keep arguments concise (1-2 sentences), safe, and non-violent.',
    `Topic: ${topic ?? ''}`,
    'Return ONLY the JSON object, nothing else.'
  ].join('\n');
}

async function callGemini(prompt: string, apiKey: string, model: string): Promise<string> {
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.5,
        topP: 0.9,
        maxOutputTokens: 4000,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text || typeof text !== 'string') {
    throw new Error('Gemini response missing text');
  }
  return text;
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callGeminiWithRetry(prompt: string, apiKey: string, model: string, attempts = 3): Promise<string> {
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await callGemini(prompt, apiKey, model);
    } catch (error) {
      lastError = error;
      console.warn(`[Gemini] Attempt ${attempt}/${attempts} failed:`, error instanceof Error ? error.message : error);
      if (attempt < attempts) {
        const delay = 1000 * attempt; // Exponential backoff for rate limits
        await wait(delay);
      }
    }
  }

  throw lastError ?? new Error('Gemini API error after retries');
}

function extractJson(text: string): unknown {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    console.error('[extractJson] Raw response:', text.substring(0, 500));
    throw new Error('No JSON object found');
  }

  const jsonText = text.slice(start, end + 1);
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('[extractJson] Failed to parse JSON:', jsonText.substring(0, 500));
    throw error;
  }
}

// Local debate generation (fallback when API fails)
const DEBATE_TOPICS = [
  'Is artificial intelligence beneficial to society?',
  'Should college education be free for everyone?',
  'Is climate change primarily caused by human activity?',
  'Should social media platforms regulate political content?',
  'Is remote work better than office work?',
  'Should fast fashion be banned?',
  'Is space exploration worth the investment?',
  'Should healthcare be a government responsibility?',
  'Is technology making us more or less connected?',
  'Should public transportation be free?',
  'Does virtual reality benefit society?',
  'Should autonomous vehicles be widely adopted?',
  'Is cryptocurrency the future of money?',
  'Should internet companies face stricter regulation?',
  'Do video games improve cognitive abilities?',
  'Is automation destroying or creating jobs?',
  'Should governments invest more in renewable energy?',
  'Is gene therapy ethical and necessary?',
  'Does social media benefit or harm democracy?',
  'Should privacy be protected above innovation?',
  'Is biotechnology a solution or a risk?',
  'Should mental health tech replace traditional therapy?',
  'Do smart cities improve quality of life?',
  'Is blockchain technology revolutionary?',
  'Should we pursue human enhancement technology?',
  'Does AI threaten or improve education?',
  'Is quantum computing worth pursuing?',
  'Should vertical farming replace traditional agriculture?',
  'Do brain-computer interfaces benefit humanity?',
  'Is lab-grown meat the sustainable future?',
];

function generateRandomLocalTopic(): string {
  return DEBATE_TOPICS[Math.floor(Math.random() * DEBATE_TOPICS.length)];
}

function generateScore(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'of', 'to', 'and', 'or', 'is', 'are', 'was', 'were', 'be', 'for', 'in', 'on', 'with', 'as', 'by',
  'at', 'from', 'do', 'does', 'did', 'should', 'could', 'can', 'will', 'would', 'must', 'may', 'might', 'we', 'our',
]);

function normalizeTopicCore(topic: string, maxWords = 4): string {
  const cleaned = topic.replace(/[?!.]+$/g, '').trim();
  const rawWords = cleaned.split(/\s+/);
  const filtered = rawWords
    .map(word => word.replace(/^[^a-zA-Z0-9-]+|[^a-zA-Z0-9-]+$/g, ''))
    .filter(word => word && !STOP_WORDS.has(word.toLowerCase()));

  const coreWords = (filtered.length ? filtered : rawWords).slice(0, maxWords);
  return coreWords.join(' ');
}

function generateLocalDebateContent(topic: string): unknown {
  const rounds: unknown[] = [];
  const speakers = ['PRO', 'CON'];
  
  // Pro/Con framing
  const core = normalizeTopicCore(topic, 4);
  const proTemplates = [
    (t: string) => `${t.toUpperCase()} IS THE KEY TO HUMAN PROGRESS!`,
    (t: string) => `${t.toUpperCase()} BUILDS A BETTER FUTURE!`,
    (t: string) => `EMBRACING ${t.toUpperCase()} LEADS TO BREAKTHROUGHS!`,
  ];
  const conTemplates = [
    (t: string) => `${t.toUpperCase()} CREATES MORE PROBLEMS THAN SOLUTIONS!`,
    (t: string) => `THE HIDDEN COSTS OF ${t.toUpperCase()} ARE DEVASTATING!`,
    (t: string) => `${t.toUpperCase()} THREATENS OUR CORE VALUES!`,
  ];
  const headlineIdx = Math.floor(Math.random() * 3);
  const proHeadline = proTemplates[headlineIdx](core);
  const conHeadline = conTemplates[headlineIdx](core);
  
  // Diverse argument templates
  const proOpenings = [
    `The evidence is overwhelming. ${topic.toLowerCase()} represents a pivotal opportunity. Research shows ${generateScore(55, 95)}% adoption success rate. This is our generation's defining moment.`,
    `Studies confirm what we already know: ${topic.toLowerCase()} delivers measurable results. The data supports immediate action. We cannot afford to delay progress.`,
    `History shows us that embracing ${topic.toLowerCase()} transforms societies. The benefits are scientifically proven and universally documented across multiple sectors.`,
  ];
  
  const conOpenings = [
    `While proponents celebrate ${topic.toLowerCase()}, they ignore critical concerns. The unintended consequences are serious and well-documented. Caution is wisdom, not cowardice.`,
    `We must ask uncomfortable questions about ${topic.toLowerCase()}. The costs are real, the risks are documented, and the safeguards are insufficient.`,
    `Enthusiasm for ${topic.toLowerCase()} blinds us to systemic risks. History shows rapid adoption often leads to unforeseen harm. We must proceed carefully.`,
  ];
  
  const proRebuttals = [
    `My opponent ignores the overwhelming data supporting ${topic.toLowerCase()}. The science is clear. Skepticism without evidence is not wisdom.`,
    `The concerns raised about ${topic.toLowerCase()} are theoretical while the benefits are tangible. We cannot build the future on fear.`,
    `Every major innovation faced resistance. The real danger isn't progress—it's stagnation.`,
  ];
  
  const conRebuttals = [
    `My opponent cherry-picks data while ignoring systemic risks to vulnerable populations. Good intentions don't eliminate real harms.`,
    `Ignoring documented problems with ${topic.toLowerCase()} is reckless. We must address root causes before scaling solutions.`,
    `Speed without responsibility is chaos. The history of technology is littered with solutions that created new problems.`,
  ];
  
  const proEvidence = [
    `Productivity increases by ${generateScore(25, 60)}%","${generateScore(70, 95)}% of early adopters report satisfaction","Economic output grows by $${generateScore(2, 15)}B annually`,
    `Academic performance improves by ${generateScore(20, 45)}%","${generateScore(60, 88)}% reduction in resource waste","Innovation patents increased ${generateScore(3, 8)}x since 2020`,
    `Quality of life index rises ${generateScore(15, 40)} points","Healthcare costs drop by ${generateScore(10, 35)}%","${generateScore(80, 97)}% of leaders advocate adoption`,
  ];
  
  const conEvidence = [
    `${generateScore(30, 55)}% of workers report negative impacts","Mental health concerns increased ${generateScore(2, 5)}x","$${generateScore(5, 20)}B annual damages documented`,
    `${generateScore(40, 65)}% of regulators flag concerns","Privacy violations increased ${generateScore(200, 500)}%","${generateScore(3, 7)} major incidents last 12 months`,
    `Income inequality widened by ${generateScore(15, 35)}%","${generateScore(25, 50)}% of small businesses threatened","Environmental cost: ${generateScore(1, 10)}M tons CO2`,
  ];
  
  const emotionalScenarios = [
    `Imagine a child discovering their potential because of ${topic.toLowerCase()}. That's what's possible.`,
    `Picture a family whose life was transformed by this opportunity. Can we deny them?`,
    `Think of the single parent who finally found a path forward through ${topic.toLowerCase()}.`,
  ];
  
  const cautionaryScenarios = [
    `Imagine a community torn apart by unintended consequences. That's the reality we face.`,
    `Picture families struggling as safety nets disappear. The human cost is real.`,
    `Think of workers and communities left behind. Who pays the price of reckless progress?`,
  ];
  
  const proClosings = [
    `History remembers the builders. ${topic} is humanity's next great leap. Choose progress.`,
    `The future belongs to the bold. This is our moment. Choose ${topic.toLowerCase()}. Choose tomorrow.`,
    `Speed and courage define progress. Embrace this moment. The best is yet to come.`,
  ];
  
  const conClosings = [
    `Wisdom means knowing when to say no. ${topic} demands responsibility, not cheerleading.`,
    `Some prices are too high. Protect what matters before moving forward recklessly.`,
    `The measure of society is who gets left behind. Let's make sure it's not us.`,
  ];
  
  for (let round = 1; round <= 5; round++) {
    for (let speakerIdx = 0; speakerIdx < 2; speakerIdx++) {
      const speaker = speakers[speakerIdx];
      const isPro = speaker === 'PRO';
      
      let argument: string;
      let headline: string;
      let logic: number;
      let emotion: number;
      let dataPoints: string[];
      
      if (round === 1) {
        argument = isPro 
          ? proOpenings[Math.floor(Math.random() * proOpenings.length)]
          : conOpenings[Math.floor(Math.random() * conOpenings.length)];
        headline = `ROUND 1: OPENING STATEMENT`;
        logic = generateScore(60, 85);
        emotion = generateScore(40, 65);
        dataPoints = ['Research shows significant correlation', 'Multiple studies confirm', 'Data from diverse sectors aligns'];
      } else if (round === 2) {
        argument = isPro
          ? proRebuttals[Math.floor(Math.random() * proRebuttals.length)]
          : conRebuttals[Math.floor(Math.random() * conRebuttals.length)];
        headline = `ROUND 2: REBUTTAL AND RESPONSE`;
        logic = generateScore(65, 90);
        emotion = generateScore(45, 70);
        dataPoints = ['Addressing opponent claims', 'Evidence contradicts opposition'];
      } else if (round === 3) {
        const evidence = isPro ? proEvidence : conEvidence;
        const points = evidence[Math.floor(Math.random() * evidence.length)].split('","');
        dataPoints = points;
        argument = `The data is undeniable:\n\n• ${points.join('\n• ')}\n\nThese are verified facts that ${isPro ? 'prove the opportunity' : 'expose the risks'}.`;
        headline = `ROUND 3: EVIDENCE AND DATA`;
        logic = generateScore(75, 95);
        emotion = generateScore(30, 55);
      } else if (round === 4) {
        const scenario = isPro
          ? emotionalScenarios[Math.floor(Math.random() * emotionalScenarios.length)]
          : cautionaryScenarios[Math.floor(Math.random() * cautionaryScenarios.length)];
        argument = `${scenario} This is about real human lives, real consequences. We cannot ignore the humanity behind this decision.`;
        headline = `ROUND 4: EMOTIONAL APPEAL`;
        logic = generateScore(35, 60);
        emotion = generateScore(80, 98);
        dataPoints = ['Real-world human impact', 'Stories from affected communities'];
      } else {
        argument = isPro
          ? proClosings[Math.floor(Math.random() * proClosings.length)]
          : conClosings[Math.floor(Math.random() * conClosings.length)];
        headline = `ROUND 5: CLOSING ARGUMENT`;
        logic = generateScore(70, 90);
        emotion = generateScore(70, 90);
        dataPoints = ['Final thoughts', 'The path forward'];
      }
      
      const rebuttal = generateScore(round === 1 ? 0 : 50, 80);
      const wordCount = argument.split(/\s+/).length;
      const baseScore = wordCount * 0.5 + logic + emotion + rebuttal;
      const bonusScore = logic > 75 && emotion > 75 ? 50 : 0;
      const totalScore = Math.round(baseScore + bonusScore);
      
      rounds.push({
        round,
        speaker,
        headline,
        argument,
        data_points: dataPoints,
        logic_score: logic,
        emotion_score: emotion,
        rebuttal_strength: rebuttal,
        total_score: totalScore
      });
    }
  }
  
  return {
    topic,
    proHeadline,
    conHeadline,
    rounds
  };
}

function generateLocalFraming(topic: string): { topic: string; proHeadline: string; conHeadline: string } {
  const core = normalizeTopicCore(topic, 4);
  const proTemplates = [
    (t: string) => `${t} can drive measurable progress when guided by evidence.`,
    (t: string) => `${t} offers real opportunities for innovation and public benefit.`,
    (t: string) => `${t} deserves support as a practical path to better outcomes.`,
  ];
  const conTemplates = [
    (t: string) => `${t} carries risks that society is not prepared to manage.`,
    (t: string) => `${t} can backfire without strict safeguards and accountability.`,
    (t: string) => `${t} is overpromised and underprepared for real-world harm.`,
  ];
  const idx = Math.floor(Math.random() * proTemplates.length);

  return {
    topic,
    proHeadline: proTemplates[idx](core),
    conHeadline: conTemplates[idx](core),
  };
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'gemini-proxy',
      configureServer(server) {
        const apiKey = process.env.GEMINI_API_KEY || '';
        const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

        server.middlewares.use('/api/test-models', async (req, res) => {
          if (!apiKey) {
            res.statusCode = 500;
            res.end('Missing GEMINI_API_KEY');
            return;
          }

          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
              res.statusCode = response.status;
              res.end(`Failed to fetch models: ${response.status}`);
              return;
            }

            const data = await response.json();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data, null, 2));
          } catch (error) {
            console.error('[Test] Failed to fetch models:', error);
            res.statusCode = 500;
            res.end('Failed to fetch models');
          }
        });

        server.middlewares.use('/api/ai', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
          }

          let payload: { action?: string; topic?: string } = {};
          try {
            const body = await readBody(req);
            payload = JSON.parse(body || '{}') as { action?: string; topic?: string };
            const action = payload.action || 'generate_debate';
            const prompt = buildPrompt(action, payload.topic);
            const text = await callGeminiWithRetry(prompt, apiKey, model, 2);
            const json = extractJson(text);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(json));
          } catch (error) {
            const action = payload.action || 'generate_debate';
            console.error(`[AI] Gemini proxy failed for action: ${action}`, error);
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'AI request failed. Please try again.' }));
          }
        });
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
