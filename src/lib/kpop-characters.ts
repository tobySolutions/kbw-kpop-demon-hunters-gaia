// KPop Demon Hunter character data
export interface KPopCharacter {
  id: string;
  name: string;
  gender: 'male' | 'female';
  category: 'huntrx' | 'saja_boys' | 'ally' | 'demon_king';
  description: string;
  powers: string[];
  weapon?: string;
  personality: string;
  specialAbility: string;
  imageUrl: string;
}

export const KPOP_CHARACTERS: KPopCharacter[] = [
  // Huntr/x - The Protagonist Trio
  {
    id: 'rumi',
    name: 'Rumi',
    gender: 'female',
    category: 'huntrx',
    description: 'Lead vocalist and leader of Huntr/x. Half-demon on her father\'s side, she hides her demonic heritage while leading the fight against Gwi-Ma. Raised by former demon hunter Celine.',
    powers: ['Vocal Magic', 'Demonic Power', 'Leadership', 'Dual Nature Magic'],
    weapon: 'Legendary Geom',
    personality: 'confident, conflicted, protective',
    specialAbility: 'Can embrace her dual identity to break demonic influence and create powerful Honmoon barriers',
    imageUrl: '/Rumi.webp'
  },
  {
    id: 'mira',
    name: 'Mira',
    gender: 'female',
    category: 'huntrx',
    description: 'Main dancer and visual of Huntr/x. The rebellious black sheep from a wealthy family, she\'s skeptical but fiercely loyal to her bandmates.',
    powers: ['Dance Combat', 'Weapon Mastery', 'Precision Strikes'],
    weapon: 'Mystical Gok-do',
    personality: 'rebellious, loyal, skeptical',
    specialAbility: 'Performs ritual dance strikes that can create rifts to banish demons back to their realm',
    imageUrl: '/Mira.webp'
  },
  {
    id: 'zoey',
    name: 'Zoey',
    gender: 'female',
    category: 'huntrx',
    description: 'Youngest member, rapper, and lyricist of Huntr/x. Korean American from Burbank who\'s eager to please but fiercely protective of her friends.',
    powers: ['Lyrical Magic', 'Rap Combat', 'Protective Barriers'],
    personality: 'young, eager, protective',
    specialAbility: 'Weaves powerful protective spells through her rap verses that strengthen the Honmoon',
    imageUrl: '/Zoey.webp'
  },

  // The Saja Boys - Antagonist Boy Band
  {
    id: 'jinu',
    name: 'Jinu',
    gender: 'male',
    category: 'saja_boys',
    description: 'Leader of the Saja Boys who traded his soul to Gwi-Ma for fame. Conflicted character haunted by his human past and drawn to Rumi.',
    powers: ['Soul Manipulation', 'Fame Magic', 'Demonic Influence'],
    weapon: 'Soul Blade',
    personality: 'conflicted, charismatic, haunted',
    specialAbility: 'Can influence crowds and weaken the Honmoon through stolen fame and souls',
    imageUrl: '/Jinu.webp'
  },
  {
    id: 'abby-saja',
    name: 'Abby Saja',
    gender: 'male',
    category: 'saja_boys',
    description: 'Elder member of the Saja Boys with deep knowledge of ancient dark magic. Serves as strategist for Gwi-Ma\'s plans.',
    powers: ['Dark Magic', 'Ancient Knowledge', 'Strategic Planning'],
    personality: 'wise, manipulative, calculating',
    specialAbility: 'Can weave ancient dark spells that corrupt the Honmoon from within',
    imageUrl: '/Abby.webp'
  },
  {
    id: 'baby-saja',
    name: 'Baby Saja',
    gender: 'male',
    category: 'saja_boys',
    description: 'Youngest of the Saja Boys with raw, unpredictable demonic energy. His innocence makes his corruption particularly tragic.',
    powers: ['Raw Demonic Energy', 'Chaos Magic', 'Emotional Manipulation'],
    personality: 'innocent, corrupted, unpredictable',
    specialAbility: 'Channels pure chaotic energy that can shatter Honmoon barriers through emotional manipulation',
    imageUrl: '/Baby.webp'
  },
  {
    id: 'mystery-saja',
    name: 'Mystery Saja',
    gender: 'male',
    category: 'saja_boys',
    description: 'Enigmatic member of the Saja Boys whose true powers remain hidden until crucial moments in battle.',
    powers: ['Hidden Powers', 'Stealth Magic', 'Surprise Attacks'],
    personality: 'enigmatic, secretive, unpredictable',
    specialAbility: 'Powers remain concealed until revealed at critical moments to devastating effect',
    imageUrl: '/Mystery.webp'
  },
  {
    id: 'romance-saja',
    name: 'Romance Saja',
    gender: 'male',
    category: 'saja_boys',
    description: 'Charming member who uses false love and corrupted emotions to weaken the hunters\' resolve.',
    powers: ['Corrupted Love Magic', 'Emotional Manipulation', 'False Bonds'],
    personality: 'charming, deceptive, manipulative',
    specialAbility: 'Creates false romantic connections that drain spiritual energy and weaken the Honmoon',
    imageUrl: '/Romance.webp'
  },

  // Allies and Supporting Characters
  {
    id: 'celine',
    name: 'Celine',
    gender: 'female',
    category: 'ally',
    description: 'Former demon hunter who raised Rumi. Master of vocal magic and mentor to the current generation of hunters.',
    powers: ['Master Vocal Magic', 'Mentorship', 'Ancient Knowledge'],
    personality: 'wise, nurturing, experienced',
    specialAbility: 'Can teach advanced vocal techniques that enhance the Honmoon\'s power',
    imageUrl: '/Celine.webp'
  },
  {
    id: 'gwi-ma',
    name: 'Gwi-Ma',
    gender: 'male',
    category: 'demon_king',
    description: 'The demon king trapped in the demon world who seeks to break the Honmoon and consume human souls once again.',
    powers: ['Demon King Magic', 'Soul Consumption', 'Corruption'],
    personality: 'evil, manipulative, powerful',
    specialAbility: 'Can corrupt others and break through dimensional barriers to reach the human world',
    imageUrl: '/Gwima.webp'
  },
  {
    id: 'healer-han',
    name: 'Healer Han',
    gender: 'male',
    category: 'ally',
    description: 'Spiritual healer who supports the demon hunters with restoration magic and protective barriers.',
    powers: ['Healing Magic', 'Protective Barriers', 'Spirit Restoration'],
    personality: 'caring, gentle, supportive',
    specialAbility: 'Can restore damaged Honmoon barriers and heal spiritual wounds inflicted by demons',
    imageUrl: '/Healer_Han.webp'
  },
  {
    id: 'ryu-mi-yeong',
    name: 'Ryu Mi-yeong',
    gender: 'female',
    category: 'ally',
    description: 'Traditional Korean warrior who preserves ancient demon-fighting techniques and trains new hunters.',
    powers: ['Traditional Martial Arts', 'Ancient Techniques', 'Weapon Mastery'],
    weapon: 'Ancient Spirit Gok-do',
    personality: 'traditional, honorable, disciplined',
    specialAbility: 'Masters ancient Korean demon-fighting techniques passed down through generations',
    imageUrl: '/Ryu_Mi-Yeong.webp'
  },
  {
    id: 'bobby',
    name: 'Bobby',
    gender: 'male',
    category: 'ally',
    description: 'Charismatic performer and ally who uses his stage presence to amplify the hunters\' magical power during performances.',
    powers: ['Performance Magic', 'Crowd Empowerment', 'Energy Amplification'],
    personality: 'charismatic, supportive, energetic',
    specialAbility: 'Can amplify the Honmoon\'s power by channeling audience energy during live performances',
    imageUrl: '/bobby.webp'
  }
];

// Character selection utilities
export function getRandomCharacter(): KPopCharacter {
  const randomIndex = Math.floor(Math.random() * KPOP_CHARACTERS.length);
  return KPOP_CHARACTERS[randomIndex];
}

export function getCharacterById(id: string): KPopCharacter | null {
  return KPOP_CHARACTERS.find(char => char.id === id) || null;
}

export function getCharactersByGender(gender: 'male' | 'female'): KPopCharacter[] {
  return KPOP_CHARACTERS.filter(char => char.gender === gender);
}

export function getCharactersByCategory(category: 'huntrx' | 'saja_boys' | 'ally' | 'demon_king'): KPopCharacter[] {
  return KPOP_CHARACTERS.filter(char => char.category === category);
}

// Generate a consistent character for a user based on their userId
export function getCharacterForUser(userId: string): KPopCharacter {
  // Use a simple hash of the userId to ensure consistency
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const index = Math.abs(hash) % KPOP_CHARACTERS.length;
  return KPOP_CHARACTERS[index];
}

// Action mappings for KPop Demon Hunter powers
export const KPOP_ACTIONS = {
  feed: {
    name: 'Channel Energy',
    icon: '⚡',
    description: 'Channel spiritual energy to restore power',
    power: 'Spiritual Energy Channeling'
  },
  play: {
    name: 'Sonic Training',
    icon: '🎵',
    description: 'Practice sonic magic and vocal techniques',
    power: 'Sonic Magic'
  },
  pet: {
    name: 'Bond Strengthen', 
    icon: '🤝',
    description: 'Strengthen the spiritual bond between hunter and fan',
    power: 'Spiritual Bonding'
  },
  sleep: {
    name: 'Meditate',
    icon: '🧘‍♀️',
    description: 'Enter deep meditation to restore spiritual energy',
    power: 'Spirit Restoration'
  },
  status: {
    name: 'Assess Power',
    icon: '🔍', 
    description: 'Check current spiritual energy and Honmoon strength',
    power: 'Power Assessment'
  },
  chat: {
    name: 'Spiritual Commune',
    icon: '💭',
    description: 'Communicate through spiritual connection',
    power: 'Mediumship'
  }
};