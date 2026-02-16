import { RoundData } from './debateGenerator';

export function analyzeRebuttal(current: RoundData, opponent: RoundData): string[] {
  const insights: string[] = [];
  const oppWords = opponent.argument.toLowerCase().split(/\s+/);
  const keywords = oppWords.filter(w => w.length > 6);

  if (opponent.logic_score > 75) {
    insights.push('Opponent relies heavily on logical framing — consider questioning their data context');
  }
  if (opponent.emotion_score > 75) {
    insights.push('Opponent uses strong emotional appeal — counter with hard evidence');
  }
  if (keywords.length > 3) {
    insights.push(`Key terms detected: ${keywords.slice(0, 3).join(', ')}`);
  }
  if (opponent.data_points.length > 0) {
    insights.push('Opponent cites data — challenge methodology or sample size');
  }

  return insights;
}
