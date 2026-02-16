const OFFENSIVE_WORDS = [
  'kill', 'murder', 'terrorist', 'racism', 'nazi', 'hate', 'slur',
  'genocide', 'supremacy', 'violence against',
];

const TRENDING_TOPICS = [
  'Artificial Intelligence in Education',
  'Remote Work vs Office Work',
  'Space Exploration Funding',
  'Social Media Impact on Youth',
  'Electric Vehicles vs Gasoline Cars',
  'Universal Basic Income',
  'Renewable Energy Transition',
  'Genetic Engineering Ethics',
  'Cryptocurrency as Currency',
  'Nuclear Energy Future',
];

const VAGUE_EXPANSIONS: Record<string, string> = {
  'ai': 'Artificial Intelligence Should Replace Human Decision-Making',
  'money': 'Wealth Inequality Is the Biggest Global Threat',
  'school': 'Traditional Schooling Is Outdated',
  'war': 'Military Intervention Can Be Justified',
  'food': 'Plant-Based Diets Should Be the Global Standard',
  'tech': 'Technology Does More Harm Than Good',
  'health': 'Universal Healthcare Is a Fundamental Right',
  'space': 'Space Colonization Should Be Humanity\'s Priority',
  'climate': 'Climate Change Requires Radical Economic Reform',
  'games': 'Video Games Are a Net Positive for Society',
  'robots': 'Robots Should Replace Humans in Dangerous Jobs',
  'internet': 'The Internet Should Be Regulated Like a Public Utility',
};

export function filterTopic(input: string): { safe: boolean; topic: string; suggestion?: string } {
  const trimmed = input.trim();

  if (!trimmed) {
    const random = TRENDING_TOPICS[Math.floor(Math.random() * TRENDING_TOPICS.length)];
    return { safe: true, topic: random, suggestion: random };
  }

  const lower = trimmed.toLowerCase();

  for (const word of OFFENSIVE_WORDS) {
    if (lower.includes(word)) {
      return { safe: true, topic: 'Technology in Education' };
    }
  }

  const words = trimmed.split(/\s+/);
  if (words.length <= 1) {
    const expanded = VAGUE_EXPANSIONS[lower];
    if (expanded) return { safe: true, topic: expanded };
    return { safe: true, topic: `The Impact of ${trimmed.charAt(0).toUpperCase() + trimmed.slice(1)} on Modern Society` };
  }

  return { safe: true, topic: trimmed };
}

export function getRandomTopic(): string {
  return TRENDING_TOPICS[Math.floor(Math.random() * TRENDING_TOPICS.length)];
}
