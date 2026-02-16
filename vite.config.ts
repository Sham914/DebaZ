import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage } from 'http'

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
      'Keep it concise and suitable for a fun debate stage.',
      'Output format:',
      '{"topic":"..."}'
    ].join('\n');
  }

  return [
    'You are generating structured debate content.',
    'Return JSON only with fields: topic, proHeadline, conHeadline, rounds.',
    'rounds must be an array of 10 items (5 rounds x 2 speakers).',
    'Each round item fields: round (1-5), speaker (PRO or CON), headline, argument, data_points (string array), emotion_score (0-100), logic_score (0-100), rebuttal_strength (0-100).',
    'Keep the content safe, non-violent, and not hateful.',
    `Topic: ${topic ?? ''}`
  ].join('\n');
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
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
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 1400,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Gemini error ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text || typeof text !== 'string') {
    throw new Error('Gemini response missing text');
  }
  return text;
}

function extractJson(text: string): unknown {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found');
  }

  const jsonText = text.slice(start, end + 1);
  return JSON.parse(jsonText);
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'gemini-proxy',
      configureServer(server) {
        server.middlewares.use('/api/ai', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
          }

          try {
            const body = await readBody(req);
            const payload = JSON.parse(body || '{}') as { action?: string; topic?: string };
            const action = payload.action || 'generate_debate';
            const prompt = buildPrompt(action, payload.topic);
            const text = await callGemini(prompt);
            const json = extractJson(text);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(json));
          } catch (error) {
            res.statusCode = 500;
            res.end((error as Error).message || 'AI proxy failed');
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
