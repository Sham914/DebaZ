import { create } from 'zustand';
import { RoundData, generateFullDebate } from '../engine/debateGenerator';
import { fetchAiDebate, fetchAiRandomTopic } from '../engine/aiClient';
import { frameTopic } from '../engine/framingEngine';
import { filterTopic, getRandomTopic } from '../engine/safetyFilter';
import { calculateTotalScores, getWinner } from '../engine/scoringEngine';

export type AppPhase = 'input' | 'framing' | 'debate' | 'victory';

interface DebateState {
  phase: AppPhase;
  topic: string;
  proHeadline: string;
  conHeadline: string;
  rounds: RoundData[];
  currentRoundIndex: number;
  isAnimating: boolean;
  proScore: number;
  conScore: number;
  voteProBonus: number;
  voteConBonus: number;
  winner: 'PRO' | 'CON' | 'TIE' | null;
  shakeScreen: boolean;
  isLoadingAI: boolean;
  aiGenerated: boolean;

  submitTopic: (raw: string) => Promise<void>;
  randomTopic: () => Promise<void>;
  startDebate: () => void;
  advanceRound: () => void;
  setAnimating: (v: boolean) => void;
  voteFor: (side: 'PRO' | 'CON', amount: number) => void;
  triggerShake: () => void;
  reset: () => void;
}

export const useDebateStore = create<DebateState>((set, get) => ({
  phase: 'input',
  topic: '',
  proHeadline: '',
  conHeadline: '',
  rounds: [],
  currentRoundIndex: 0,
  isAnimating: false,
  proScore: 0,
  conScore: 0,
  voteProBonus: 0,
  voteConBonus: 0,
  winner: null,
  shakeScreen: false,
  isLoadingAI: false,
  aiGenerated: false,

  submitTopic: async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    const tryAi = async (topicInput: string) => {
      const ai = await fetchAiDebate(topicInput);
      const safeTopic = filterTopic(ai.topic || topicInput).topic;
      set({
        topic: safeTopic,
        proHeadline: ai.proHeadline,
        conHeadline: ai.conHeadline,
        rounds: ai.rounds,
        aiGenerated: true,
        phase: 'framing',
      });
    };

    set({ isLoadingAI: true });
    try {
      await tryAi(trimmed);
    } catch {
      const { topic } = filterTopic(trimmed);
      const framed = frameTopic(topic);
      set({
        topic,
        proHeadline: framed.pro.headline,
        conHeadline: framed.con.headline,
        rounds: [],
        aiGenerated: false,
        phase: 'framing',
      });
    } finally {
      set({ isLoadingAI: false });
    }
  },

  randomTopic: async () => {
    set({ isLoadingAI: true });
    let topic = '';

    try {
      topic = await fetchAiRandomTopic();
    } catch {
      topic = getRandomTopic();
    }

    try {
      const ai = await fetchAiDebate(topic);
      const safeTopic = filterTopic(ai.topic || topic).topic;
      set({
        topic: safeTopic,
        proHeadline: ai.proHeadline,
        conHeadline: ai.conHeadline,
        rounds: ai.rounds,
        aiGenerated: true,
        phase: 'framing',
      });
    } catch {
      const safe = filterTopic(topic).topic;
      const framed = frameTopic(safe);
      set({
        topic: safe,
        proHeadline: framed.pro.headline,
        conHeadline: framed.con.headline,
        rounds: [],
        aiGenerated: false,
        phase: 'framing',
      });
    } finally {
      set({ isLoadingAI: false });
    }
  },

  startDebate: () => {
    const { topic, proHeadline, conHeadline, rounds } = get();
    const resolvedRounds = rounds.length ? rounds : generateFullDebate(topic, proHeadline, conHeadline);
    set({
      rounds: resolvedRounds,
      currentRoundIndex: 0,
      phase: 'debate',
      proScore: 0,
      conScore: 0,
    });
  },

  advanceRound: () => {
    const { currentRoundIndex, rounds, voteProBonus, voteConBonus } = get();
    const next = currentRoundIndex + 1;
    if (next >= rounds.length) {
      const scores = calculateTotalScores(rounds);
      const winner = getWinner(rounds);
      set({
        proScore: scores.pro + voteProBonus,
        conScore: scores.con + voteConBonus,
        winner,
        phase: 'victory',
      });
    } else {
      const playedRounds = rounds.slice(0, next);
      const scores = calculateTotalScores(playedRounds);
      set({
        currentRoundIndex: next,
        proScore: scores.pro + voteProBonus,
        conScore: scores.con + voteConBonus,
      });
    }
  },

  setAnimating: (v: boolean) => set({ isAnimating: v }),

  voteFor: (side: 'PRO' | 'CON', amount: number) => {
    if (side === 'PRO') {
      set(s => ({ voteProBonus: s.voteProBonus + amount, proScore: s.proScore + amount }));
    } else {
      set(s => ({ voteConBonus: s.voteConBonus + amount, conScore: s.conScore + amount }));
    }
  },

  triggerShake: () => {
    set({ shakeScreen: true });
    setTimeout(() => set({ shakeScreen: false }), 500);
  },

  reset: () => set({
    phase: 'input',
    topic: '',
    proHeadline: '',
    conHeadline: '',
    rounds: [],
    currentRoundIndex: 0,
    isAnimating: false,
    proScore: 0,
    conScore: 0,
    voteProBonus: 0,
    voteConBonus: 0,
    winner: null,
    shakeScreen: false,
    isLoadingAI: false,
    aiGenerated: false,
  }),
}));
