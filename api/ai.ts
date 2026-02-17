import type { VercelRequest, VercelResponse } from '@vercel/node';

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
      `Topic: ${topic}`,
      'Return JSON only with three fields: topic, proHeadline, conHeadline.',
      'Create compelling, concise headlines for both PRO and CON positions.',
      'Headlines should be 5-10 words max.',
      'Output format:',
      '{"topic":"...","proHeadline":"...","conHeadline":"..."}'
    ].join('\n');
  }

  // generate_debate (default)
  return [
    `Topic: ${topic}`,
    'Return JSON only with these fields: topic, proHeadline, conHeadline, rounds.',
    'Rounds is an array of 6 debate round objects (alternate PRO/CON).',
    'Each round: {round, speaker, headline, argument, data_points, logic_score, emotion_score, rebuttal_strength}',
    'Scores: 0-100. data_points: list of 2-3 key points.',
    'Output format:',
    '{"topic":"...","proHeadline":"...","conHeadline":"...","rounds":[...]}'
  ].join('\n');
}

async function callGemini(prompt: string, apiKey: string, model: string): Promise<string> {
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }],
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
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
        const delay = 1000 * attempt;
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers to allow frontend requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY || '';
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  if (!apiKey) {
    console.error('[AI] GEMINI_API_KEY environment variable is not set');
    res.status(500).json({ error: 'Server configuration error: Missing API key' });
    return;
  }

  let payload: { action?: string; topic?: string } = {};
  try {
    // Vercel automatically parses JSON body for us
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const action = payload.action || 'generate_debate';
    console.log(`[AI] Processing action: ${action}, topic: ${payload.topic || 'random'}`);
    const prompt = buildPrompt(action, payload.topic);
    const text = await callGeminiWithRetry(prompt, apiKey, model, 2);
    const json = extractJson(text);

    res.status(200).json(json);
  } catch (error) {
    const action = payload.action || 'generate_debate';
    console.error(`[AI] Gemini proxy failed for action: ${action}`, error instanceof Error ? error.message : String(error));
    res.status(502).json({ error: 'AI request failed. Please try again.' });
  }
}
