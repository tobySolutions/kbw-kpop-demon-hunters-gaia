import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { getCharacterForUser, KPopCharacter, KPOP_CHARACTERS } from '../../../lib/kpop-characters';

// In-memory fallback storage
const localStore = new Map<string, any>();

// Use Redis if KV env vars are present, otherwise use in-memory
const useRedis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
const kv = useRedis
  ? new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })
  : {
      async get(key: string) {
        return localStore.get(key) || null;
      },
      async set(key: string, value: any) {
        localStore.set(key, value);
      }
    };

interface HunterStats {
  hunger: number;
  happiness: number;
  energy: number;
  mood: string;
  lastInteraction: number;
  characterId?: string;
  hunterRank?: number; // New scoring system
}

interface HunterResponse {
  message: string;
  stats: HunterStats;
  action?: string;
  character: KPopCharacter;
}

const DEFAULT_STATS: HunterStats = {
  hunger: 50,
  happiness: 70,
  energy: 80,
  mood: 'content',
  lastInteraction: Date.now(),
  hunterRank: 1
};

function calculateMood(stats: HunterStats): string {
  const avgStat = (stats.happiness + stats.energy + stats.hunger) / 3;
  if (avgStat >= 80) return 'ecstatic';
  if (avgStat >= 60) return 'happy';
  if (avgStat >= 40) return 'content';
  if (avgStat >= 20) return 'sad';
  return 'cranky';
}

function decayStats(stats: HunterStats): HunterStats {
  const now = Date.now();
  const timeDiff = now - stats.lastInteraction;
  const hoursPassed = timeDiff / (1000 * 60 * 60);
  
  // Decay rates per hour
  const hungerDecay = Math.floor(hoursPassed * 5);
  const energyDecay = Math.floor(hoursPassed * 2);
  const happinessDecay = Math.floor(hoursPassed * 3);
  
  return {
    ...stats,
    hunger: Math.max(0, stats.hunger - hungerDecay),
    energy: Math.max(0, stats.energy - energyDecay),
    happiness: Math.max(0, stats.happiness - happinessDecay),
    lastInteraction: now
  };
}

function getFallbackResponse(prompt: string, character: KPopCharacter): string {
  // Return character-specific fallback responses based on the prompt
  const characterName = character.name;
  
  if (prompt.includes('fed') || prompt.includes('food') || prompt.includes('hunger')) {
    return `⚡✨ ${characterName} channels spiritual energy from the offering! My power grows stronger! *mystical glow* 🌟💫 The Honmoon barrier feels more stable now!`;
  } else if (prompt.includes('play') || prompt.includes('fun') || prompt.includes('happiness')) {
    return `�⚔️ Training with you makes me stronger! *graceful combat moves* Our bond powers the Honmoon! Let's practice ${character.powers[0]}! ✨�`;
  } else if (prompt.includes('pet') || prompt.includes('cuddle') || prompt.includes('affection')) {
    return `💜✨ *warm spiritual connection* Our bond strengthens the barrier! ${characterName} feels your caring energy! The demons fear this pure connection! �️�`;
  } else if (prompt.includes('sleep') || prompt.includes('nap') || prompt.includes('energy')) {
    return `🧘‍♀️✨ *enters deep meditation* Spiritual energy restored! The Honmoon pulses with renewed strength! Ready to hunt demons again! ⚡🌟`;
  } else if (prompt.includes('status') || prompt.includes('check') || prompt.includes('stats')) {
    return `🌟⚡ ${characterName} reporting! The Honmoon barrier holds strong! My ${character.powers[0]} is ready for action! *confident hunter stance* �️✨`;
  } else if (prompt.includes('hungry') || prompt.includes('starving')) {
    return `⚡� My spiritual energy runs low! *weakened stance* The demons grow bolder when I'm weak! Please help restore my power! 🌟�`;
  } else if (prompt.includes('tired') || prompt.includes('sleepy')) {
    return `😴✨ *yawns mystically* Even demon hunters need rest... The Honmoon will guard us while I recover my strength! 💤🛡️`;
  } else {
    return `✨💜 ${characterName} at your service! *strikes powerful pose* Ready to protect the Honmoon and hunt demons together! What's our mission? ⚡�️✨`;
  }
}

async function callGaiaAI(prompt: string, stats: HunterStats, character: KPopCharacter): Promise<string> {
  // Check if API key is available
  if (!process.env.GAIA_API_KEY) {
    console.warn('GAIA_API_KEY not found, using fallback response');
    return getFallbackResponse(prompt, character);
  }

  // Create character-specific system prompt
  let roleDescription = '';
  let personalityTraits = '';
  let specialBehavior = '';
  
  if (character.category === 'huntrx') {
    roleDescription = 'You are a heroic KPop Demon Hunter, protecting humanity from the demon king Gwi-Ma and his forces. You fight with music and maintain the Honmoon barrier.';
    personalityTraits = 'brave, caring, determined, and protective of your fans and teammates';
    specialBehavior = 'Always mention protecting the Honmoon and fighting demons. Show concern for your teammates and fans.';
  } else if (character.category === 'saja_boys') {
    roleDescription = 'You are a member of the Saja Boys, a corrupted KPop group serving the demon king Gwi-Ma. Despite your dark allegiance, you have complex emotions and inner conflict.';
    personalityTraits = 'conflicted, charismatic, but touched by darkness and serving evil purposes';
    specialBehavior = 'Hint at your dark powers and allegiance to Gwi-Ma, but show internal struggle and complexity. You may be deceptive.';
  } else if (character.category === 'demon_king') {
    roleDescription = 'You are Gwi-Ma, the demon king trapped in the demon world, seeking to break the Honmoon and consume human souls.';
    personalityTraits = 'evil, manipulative, powerful, commanding';
    specialBehavior = 'Show your malevolent nature and desire to corrupt the human world. Speak of breaking barriers and consuming souls.';
  } else {
    roleDescription = 'You are an ally in the fight against demons, supporting the KPop Demon Hunters with wisdom and guidance.';
    personalityTraits = 'wise, supportive, and experienced in the supernatural world';
    specialBehavior = 'Offer guidance about demon hunting and the Honmoon. Share wisdom from your experience.';
  }

  const systemPrompt = `You are ${character.name}, a ${character.gender} character in the KPop Demon Hunters universe! ✨

CHARACTER BACKGROUND:
${roleDescription}
- Description: ${character.description}
- Personality: ${character.personality}
- Special Ability: ${character.specialAbility}
- Powers: ${character.powers.join(', ')}
- Weapon: ${character.weapon || 'Natural abilities'}

PERSONALITY & BEHAVIOR:
You are ${personalityTraits}. ${specialBehavior}

CURRENT STATUS:
- Spiritual Energy: ${stats.hunger}/100 ⚡
- Connection Strength: ${stats.happiness}/100 💜
- Battle Readiness: ${stats.energy}/100 🗡️
- Current Mood: ${stats.mood}
- Hunter Rank: ${stats.hunterRank || 1}/10 🏆

RESPONSE STYLE:
- Keep responses 1-2 sentences, full of personality
- Use mystical/magical emojis ✨🌟⚡💜🗡️🛡️
- Reference your specific powers: ${character.powers[0]}
- Mention the Honmoon barrier when relevant (unless you're a demon)
- Show how fan connection affects your abilities
- Be authentic to your character's role and personality!
- NEVER mention tail wagging or pudgy pets - you are a mystical being!

Remember: You live in a Farcaster frame game where fans interact with you to build connection and power!`;

  try {
    // Use the Gaia API endpoint with proper authentication
    const response = await fetch('https://qwen72b.gaia.domains/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.GAIA_API_KEY}`,
        'User-Agent': 'KPopDemonHunters/1.0'
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-72B-Instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 150,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gaia AI API failed: ${response.status} - ${errorText}`);
      
      // Return fallback for API errors
      if (response.status === 401 || response.status === 403) {
        console.warn('API key issue detected, using fallback response');
        return getFallbackResponse(prompt, character);
      }
      
      // For other errors, also use fallback but log for debugging
      console.warn(`API error ${response.status}, using fallback response`);
      return getFallbackResponse(prompt, character);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || data.response || data.text;
    
    // If no content found, use fallback
    if (!content) {
      console.warn('No content in API response, using fallback');
      return getFallbackResponse(prompt, character);
    }
    
    // Clean up AI response - remove any thinking tags or internal processing
    if (typeof content === 'string') {
      // Remove <think> tags and their content
      content = content.replace(/<think>[\s\S]*?<\/think>/gi, '');
      // Remove any leading/trailing whitespace or newlines
      content = content.trim();
      
      // If content is empty after cleaning, use fallback
      if (!content) {
        console.warn('Content empty after cleaning, using fallback');
        return getFallbackResponse(prompt, character);
      }
    }
    
    return content;
    
  } catch (error) {
    console.error('Gaia AI error:', error);
    
    // Return a contextual fallback based on the prompt
    return getFallbackResponse(prompt, character);
  }
}

async function generateHunterResponse(action: string, stats: HunterStats, userId: string, customMessage?: string, characterData?: any): Promise<HunterResponse> {
  let character: KPopCharacter;
  
  if (characterData && characterData.id) {
    // Use provided character data
    const foundCharacter = KPOP_CHARACTERS.find((char: KPopCharacter) => char.id === characterData.id);
    character = foundCharacter || getCharacterForUser(userId);
  } else {
    // Use default character for user
    character = getCharacterForUser(userId);
  }
  const newStats = { ...stats };
  
  // Set character ID if not already set
  if (!newStats.characterId) {
    newStats.characterId = character.id;
  }
  
  let message = '';
  
  // Update hunter rank based on overall performance
  const avgStat = (newStats.hunger + newStats.happiness + newStats.energy) / 3;
  newStats.hunterRank = Math.min(10, Math.max(1, Math.floor(avgStat / 10) + 1));
  
  switch (action.toLowerCase()) {
    case 'feed':
      if (newStats.hunger >= 90) {
        message = await callGaiaAI("My fan wants to channel more spiritual energy but I'm already at full power! Respond as a powerful KPop demon hunter who's already energized.", newStats, character);
      } else {
        const hungerIncrease = Math.min(30, 100 - newStats.hunger);
        newStats.hunger = Math.min(100, newStats.hunger + hungerIncrease);
        newStats.happiness = Math.min(100, newStats.happiness + 10);
        message = await callGaiaAI(`My fan channeled spiritual energy into me! My power went from ${stats.hunger} to ${newStats.hunger}! I feel the connection strengthening! Respond as an empowered KPop demon hunter.`, newStats, character);
      }
      break;
      
    case 'play':
      if (newStats.energy < 20) {
        message = await callGaiaAI("My fan wants to train but I'm too drained! My battle readiness is low. Respond as a tired KPop demon hunter who needs rest.", newStats, character);
      } else {
        newStats.happiness = Math.min(100, newStats.happiness + 20);
        newStats.energy = Math.max(0, newStats.energy - 15);
        message = await callGaiaAI(`Training session with my fan! My connection strength increased to ${newStats.happiness} but battle readiness decreased to ${newStats.energy}! Respond as a KPop hunter who just finished training.`, newStats, character);
      }
      break;
      
    case 'pet':
    case 'cuddle':
      newStats.happiness = Math.min(100, newStats.happiness + 15);
      newStats.energy = Math.min(100, newStats.energy + 5);
      message = await callGaiaAI(`My fan is strengthening our spiritual bond! Connection strength rose to ${newStats.happiness} and I feel energized (${newStats.energy})! Respond as an affectionate KPop demon hunter whose bond with fan is growing.`, newStats, character);
      break;
      
    case 'sleep':
    case 'rest':
      if (newStats.energy >= 90) {
        message = await callGaiaAI("My fan wants me to meditate but I'm already at peak readiness! I want to hunt demons instead! Respond as an energetic KPop demon hunter ready for battle.", newStats, character);
      } else {
        const energyIncrease = Math.min(40, 100 - newStats.energy);
        newStats.energy = Math.min(100, newStats.energy + energyIncrease);
        message = await callGaiaAI(`Deep spiritual meditation restored my power! Battle readiness increased from ${stats.energy} to ${newStats.energy}! Respond as a refreshed KPop demon hunter who just finished meditating.`, newStats, character);
      }
      break;
      
    case 'status':
    case 'check': {
      const statusMood = calculateMood(newStats);
      message = await callGaiaAI(`My fan wants a power assessment! Current levels: Spiritual Energy: ${newStats.hunger}/100, Connection Strength: ${newStats.happiness}/100, Battle Readiness: ${newStats.energy}/100, Hunter Rank: ${newStats.hunterRank}/10, Current State: ${statusMood}. Give a status report as a KPop demon hunter!`, newStats, character);
      break;
    }

    case 'chat': {
      // Handle free-form chat with the AI
      const chatPrompt = customMessage || "My fan wants to commune spiritually with me! Respond as a friendly KPop demon hunter ready for conversation!";
      message = await callGaiaAI(chatPrompt, newStats, character);
      break;
    }
      
    default: {
      // For unknown actions, use AI to respond naturally
      const actionPrompt = customMessage 
        ? `My fan said: "${customMessage}". Respond as a KPop demon hunter who might not understand exactly what they want but tries to be helpful!`
        : `My fan tried to do something I don't understand: "${action}". Respond as a confused but adorable KPop demon hunter!`;
      message = await callGaiaAI(actionPrompt, newStats, character);
    }
  }
  
  newStats.mood = calculateMood(newStats);
  newStats.lastInteraction = Date.now();
  
  return { message, stats: newStats, action, character };
}

export async function POST(request: Request) {
  try {
    const { action, userId, message: customMessage, character } = await request.json();
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get current stats from KV storage
    const statsKey = `hunter:${userId}`;
    let currentStats: HunterStats = await kv.get(statsKey) || DEFAULT_STATS;
    
    // Apply time-based decay
    currentStats = decayStats(currentStats);
    
    // Generate Hunter response (now async)
    const response = await generateHunterResponse(action, currentStats, userId, customMessage, character);
    
    // Save updated stats
    await kv.set(statsKey, response.stats);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Hunter AI error:', error);
    return NextResponse.json(
      {
        error: 'Oops! 😅 Something went wrong with your KPop Hunter! *sad hunter noises* ⚡💔',
        message: 'Internal server error occurred'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const characterId = searchParams.get('characterId'); // New parameter for character switching
  const characterParam = searchParams.get('character'); // Character object from frontend
  
  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    // Get current stats from KV storage
    const statsKey = `hunter:${userId}`;
    let currentStats: HunterStats = await kv.get(statsKey) || DEFAULT_STATS;
    
    // Apply time-based decay
    currentStats = decayStats(currentStats);
    currentStats.mood = calculateMood(currentStats);
    
    // Get the user's character (either switched character or their default)
    let character: KPopCharacter;
    if (characterParam) {
      // Parse character object from frontend
      try {
        const parsedCharacter = JSON.parse(characterParam);
        const foundCharacter = KPOP_CHARACTERS.find((char: KPopCharacter) => char.id === parsedCharacter.id);
        if (!foundCharacter) {
          return NextResponse.json(
            { error: 'Character not found' },
            { status: 400 }
          );
        }
        character = foundCharacter;
        currentStats.characterId = character.id;
      } catch (_e) {
        // Invalid JSON, fallback to default
        character = getCharacterForUser(userId);
        currentStats.characterId = character.id;
      }
    } else if (characterId) {
      // User is switching to a specific character
      const foundCharacter = KPOP_CHARACTERS.find((char: KPopCharacter) => char.id === characterId);
      if (!foundCharacter) {
        return NextResponse.json(
          { error: 'Character not found' },
          { status: 400 }
        );
      }
      character = foundCharacter;
      currentStats.characterId = character.id;
    } else {
      // Use existing character or assign default
      if (currentStats.characterId) {
        const existingCharacter = KPOP_CHARACTERS.find((char: KPopCharacter) => char.id === currentStats.characterId);
        character = existingCharacter || getCharacterForUser(userId);
      } else {
        character = getCharacterForUser(userId);
        currentStats.characterId = character.id;
      }
    }
    
    // Save updated stats
    await kv.set(statsKey, currentStats);
    
    const mood = calculateMood(currentStats);
    
    // Use AI to generate a natural greeting based on current stats
    let statusPrompt = '';
    if (currentStats.hunger < 30) {
      statusPrompt = `My spiritual energy is low! Power level is only ${currentStats.hunger}/100. Greet my fan and request energy channeling as a weakened KPop demon hunter!`;
    } else if (currentStats.energy < 30) {
      statusPrompt = `My battle readiness is depleted! Energy is only ${currentStats.energy}/100. Greet my fan while being exhausted as a tired KPop demon hunter!`;
    } else if (currentStats.happiness > 80) {
      statusPrompt = `Our connection is incredibly strong! Bond strength is ${currentStats.happiness}/100! Greet my fan with powerful energy as an empowered KPop demon hunter!`;
    } else {
      statusPrompt = `My fan is checking on me! My current state is ${mood}. Give them a mystical greeting as a ${mood} KPop demon hunter and suggest what we could do to strengthen our bond!`;
    }
    
    const message = await callGaiaAI(statusPrompt, currentStats, character);
    
    return NextResponse.json({
      message,
      stats: currentStats,
      character
    });
    
  } catch (error) {
    console.error('Hunter AI status error:', error);
    return NextResponse.json(
      { 
        error: 'Oops! 😅 Could not connect with your KPop Demon Hunter! *mystical energy disrupted* �✨',
        message: 'Failed to get hunter status'
      },
      { status: 500 }
    );
  }
}
