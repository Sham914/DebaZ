import { RoundData } from './debateGenerator';

export interface AiDebateResponse {
  topic: string;
  proHeadline: string;
  conHeadline: string;
  rounds: RoundData[];
}

interface AiRequestPayload {
  action: 'generate_debate' | 'random_topic';
  topic?: string;
}

interface AiRawRound {
  round?: number;
  speaker?: string;
  headline?: string;
  argument?: string;
  data_points?: string[];
  emotion_score?: number;
  logic_score?: number;
  rebuttal_strength?: number;
}

interface AiRawDebateResponse {
  topic?: string;
  proHeadline?: string;
  conHeadline?: string;
  rounds?: AiRawRound[];
}

function clampScore(value: number, min = 0, max = 100): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function calcTotal(r: Omit<RoundData, 'total_score'>): number {
  const wordCount = r.argument.split(/\s+/).length;
  let score = wordCount * 0.5 + r.logic_score + r.emotion_score + r.rebuttal_strength;
  if (r.logic_score > 75 && r.emotion_score > 75) score += 50;
  return Math.round(score);
}

function normalizeRound(raw: AiRawRound, index: number): RoundData {
  const speaker = raw.speaker === 'CON' ? 'CON' : 'PRO';
  const round = typeof raw.round === 'number' && raw.round >= 1 && raw.round <= 5
    ? raw.round
    : Math.floor(index / 2) + 1;

  const argument = typeof raw.argument === 'string' ? raw.argument : 'No argument provided.';
  const headline = typeof raw.headline === 'string'
    ? raw.headline
    : `ROUND ${round}: ${speaker === 'PRO' ? 'PRO' : 'CON'} STATEMENT`;

  const data_points = Array.isArray(raw.data_points)
    ? raw.data_points.filter(p => typeof p === 'string')
    : [];

  const logic_score = clampScore(Number(raw.logic_score ?? 60));
  const emotion_score = clampScore(Number(raw.emotion_score ?? 60));
  const rebuttal_strength = clampScore(Number(raw.rebuttal_strength ?? 60));

  const base = {
    round,
    speaker,
    headline,
    argument,
    data_points,
    emotion_score,
    logic_score,
    rebuttal_strength,
  };

  return {
    ...base,
    total_score: calcTotal(base),
  };
}

async function postAi(payload: AiRequestPayload): Promise<unknown> {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `AI request failed with ${response.status}`);
  }

  return response.json();
}

function ensureDebateResponse(raw: unknown): AiDebateResponse {
  const data = raw as AiRawDebateResponse;
  if (!data || !data.proHeadline || !data.conHeadline || !Array.isArray(data.rounds)) {
    throw new Error('AI response missing debate data.');
  }

  const rounds = data.rounds.map((round, index) => normalizeRound(round, index));
  if (rounds.length < 4) {
    throw new Error('AI response did not provide enough rounds.');
  }

  return {
    topic: data.topic ?? '',
    proHeadline: data.proHeadline,
    conHeadline: data.conHeadline,
    rounds,
  };
}

export async function fetchAiDebate(topic: string): Promise<AiDebateResponse> {
  const raw = await postAi({ action: 'generate_debate', topic });
  return ensureDebateResponse(raw);
}

export async function fetchAiRandomTopic(): Promise<string> {
  const raw = await postAi({ action: 'random_topic' });
  const data = raw as { topic?: string };
  if (!data?.topic || typeof data.topic !== 'string') {
    throw new Error('AI response missing topic.');
  }
  return data.topic;
}
