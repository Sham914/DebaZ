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
  'Metaverse and Virtual Reality',
  'Automation in Workforce',
  'Cybersecurity Privacy Laws',
  'Food Technology and Lab-Grown Meat',
  'Quantum Computing Applications',
  'Bioethics and Human Cloning',
  'Smart City Infrastructure',
  'Blockchain and Web3',
  'Mental Health Tech Solutions',
  'Sustainable Fashion Innovation',
  'Gene Therapy Accessibility',
  'AI-Generated Content Rights',
  'Mars Colonization Viability',
  'Ocean Conservation Tech',
  'Brain-Computer Interfaces',
  'Drone Delivery Systems',
  'Vertical Farming Solutions',
  'Autonomous Vehicle Safety',
  'Digital Currencies and CBDCs',
  'Extended Reality in Medicine',
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
  'vr': 'Virtual Reality Will Replace Physical Experiences',
  'drones': 'Autonomous Drones Should Be Widely Available',
  'crypto': 'Cryptocurrency Is Better Than Traditional Currency',
  'social': 'Social Media Does More Harm Than Good',
  'privacy': 'Data Privacy Should Be a Constitutional Right',
  'energy': 'Renewable Energy Should 100% Replace Fossil Fuels',
  'ethics': 'Technology Should Be Regulated by Government',
  'innovation': 'Rapid Innovation Is Better Than Caution',
  'work': 'Remote Work Is the Future of Employment',
  'education': 'AI Will Revolutionize Learning',
  'environment': 'Environmental Protection Should Outweigh Economics',
  'rights': 'Digital Rights Are as Important as Physical Rights',
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
