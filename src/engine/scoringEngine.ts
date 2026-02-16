import { RoundData } from './debateGenerator';

export function calculateScore(round: RoundData): number {
  const wordCount = round.argument.split(/\s+/).length;
  let base = wordCount * 0.5 + round.logic_score + round.emotion_score;
  base += round.rebuttal_strength;
  if (round.logic_score > 75 && round.emotion_score > 75) {
    base += 50;
  }
  return Math.round(base);
}

export function calculateTotalScores(rounds: RoundData[]): { pro: number; con: number } {
  let pro = 0;
  let con = 0;
  for (const r of rounds) {
    if (r.speaker === 'PRO') pro += r.total_score;
    else con += r.total_score;
  }
  return { pro, con };
}

export function getWinner(rounds: RoundData[]): 'PRO' | 'CON' | 'TIE' {
  const { pro, con } = calculateTotalScores(rounds);
  if (pro > con) return 'PRO';
  if (con > pro) return 'CON';
  return 'TIE';
}
