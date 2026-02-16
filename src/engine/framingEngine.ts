export interface FramedPosition {
  headline: string;
  stance: 'PRO' | 'CON';
}

const PRO_TEMPLATES = [
  (t: string) => `${t.toUpperCase()} IS THE KEY TO HUMAN PROGRESS!`,
  (t: string) => `${t.toUpperCase()} BUILDS A BETTER FUTURE FOR EVERYONE!`,
  (t: string) => `${t.toUpperCase()} EMPOWERS INNOVATION AND GROWTH!`,
  (t: string) => `${t.toUpperCase()} TRANSFORMS LIVES FOR THE BETTER!`,
  (t: string) => `EMBRACING ${t.toUpperCase()} LEADS TO BREAKTHROUGHS!`,
  (t: string) => `${t.toUpperCase()} IS ESSENTIAL FOR HUMAN FLOURISHING!`,
  (t: string) => `${t.toUpperCase()} UNLOCKS UNLIMITED POTENTIAL!`,
  (t: string) => `THE FUTURE BELONGS TO ${t.toUpperCase()} CHAMPIONS!`,
  (t: string) => `${t.toUpperCase()} CREATES OPPORTUNITY FOR MILLIONS!`,
  (t: string) => `SUPPORTING ${t.toUpperCase()} IS SUPPORTING PROGRESS!`,
];

const CON_TEMPLATES = [
  (t: string) => `${t.toUpperCase()} CREATES MORE PROBLEMS THAN SOLUTIONS!`,
  (t: string) => `${t.toUpperCase()} THREATENS OUR CORE VALUES!`,
  (t: string) => `${t.toUpperCase()} IS A DANGEROUS ILLUSION!`,
  (t: string) => `THE HIDDEN COSTS OF ${t.toUpperCase()} ARE DEVASTATING!`,
  (t: string) => `${t.toUpperCase()} FUELS INEQUALITY AND DIVISION!`,
  (t: string) => `${t.toUpperCase()} PUTS PROFIT OVER PEOPLE!`,
  (t: string) => `WE MUST RESIST RECKLESS ${t.toUpperCase()} ADOPTION!`,
  (t: string) => `${t.toUpperCase()} SACRIFICES SUSTAINABILITY FOR SPEED!`,
  (t: string) => `THE REAL COST OF ${t.toUpperCase()} IS TOO HIGH!`,
  (t: string) => `${t.toUpperCase()} UNDERMINES HUMAN DIGNITY!`,
];

export function frameTopic(topic: string): { pro: FramedPosition; con: FramedPosition } {
  const words = topic.split(/\s+/);
  const core = words.length > 3 ? words.slice(0, 4).join(' ') : topic;
  const idx = Math.floor(Math.random() * PRO_TEMPLATES.length);

  return {
    pro: {
      headline: PRO_TEMPLATES[idx](core),
      stance: 'PRO',
    },
    con: {
      headline: CON_TEMPLATES[idx](core),
      stance: 'CON',
    },
  };
}
