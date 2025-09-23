# Building KPop Demon Hunters for Farcaster Mini Apps 🎤⚡

This guide will walk you through building your own mystical KPop Demon Hunter experience with character interactions, spiritual bonding, and demon fighting mechanics for Farcaster mini apps.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Core Architecture](#core-architecture)
4. [Building the Hunter System](#building-the-hunter-system)
5. [Character Data & Lore](#character-data--lore)
6. [AI Integration](#ai-integration)
7. [UI Components](#ui-components)
8. [Farcaster Integration](#farcaster-integration)
9. [Deployment](#deployment)
10. [Customization Ideas](#customization-ideas)

## Prerequisites

Before starting, ensure you have:

- **Node.js** (v18 or later)
- **Next.js** knowledge (React framework)
- **TypeScript** familiarity
- **Farcaster** account and basic understanding
- **API access** to an AI service (we'll use Gaia AI)
- **Optional**: Upstash Redis for persistent storage

### Required Accounts & Keys

1. **Neynar API Key** - For Farcaster integration
2. **Gaia AI API Key** - For AI personality
3. **Upstash Redis** (optional) - For data persistence

## Project Setup

### 1. Initialize Next.js Project

```bash
npx create-next-app@latest ai-pet-companion --typescript --tailwind --eslint
cd ai-pet-companion
```

### 2. Install Required Dependencies

```bash
npm install @neynar/react @upstash/redis lucide-react react-icons
```

### 3. Environment Configuration

Create `.env.local`:

```bash
# Farcaster Integration
NEYNAR_API_KEY="your_neynar_api_key"
NEYNAR_CLIENT_ID="your_neynar_client_id"

# AI Service
GAIA_API_KEY="your_gaia_ai_api_key"

# Optional: Persistent Storage
KV_REST_API_URL="your_upstash_redis_url"
KV_REST_API_TOKEN="your_upstash_redis_token"

# App URLs
NEXT_PUBLIC_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
USE_TUNNEL="true"
```

## Core Architecture

### Pet Stats System

Every AI pet needs core stats that change over time:

```typescript
interface PetStats {
  hunger: number;      // 0-100, decreases over time
  happiness: number;   // 0-100, affected by interactions
  energy: number;      // 0-100, used for activities
  mood: string;        // calculated from other stats
  lastInteraction: number; // timestamp
}
```

### Actions System

Define what users can do with their pet:

```typescript
type PetAction = 
  | 'feed'    // Increases hunger & happiness
  | 'play'    // Increases happiness, decreases energy
  | 'pet'     // Increases happiness & energy slightly
  | 'sleep'   // Increases energy significantly
  | 'chat';   // Free-form AI conversation
```

## Building the Hunter System

### 1. Create the Core Hunter Logic

The KPop Demon Hunter system uses a sophisticated character selection and interaction system:

```typescript
// lib/kpop-characters.ts
export const generateRandomCharacter = (): KPopCharacter => {
  return characters[Math.floor(Math.random() * characters.length)];
};

// Calculate hunter power based on interactions
export const calculateHunterPower = (character: KPopCharacter, interactions: number): number => {
  const basePower = character.rarity === 'mythic' ? 100 : 
                   character.rarity === 'legendary' ? 80 :
                   character.rarity === 'rare' ? 60 : 40;
  return Math.min(basePower + interactions * 2, 150);
};
    const hoursPassed = (now - stats.lastInteraction) / (1000 * 60 * 60);
    
    return {
      ...stats,
      hunger: Math.max(0, stats.hunger - Math.floor(hoursPassed * 5)),
      energy: Math.max(0, stats.energy - Math.floor(hoursPassed * 2)),
      happiness: Math.max(0, stats.happiness - Math.floor(hoursPassed * 3)),
      lastInteraction: now
    };
  }

  // Process user actions
  static processAction(action: string, stats: PetStats): PetStats {
    const newStats = { ...stats };
    
    switch (action) {
      case 'feed':
        newStats.hunger = Math.min(100, newStats.hunger + 30);
        newStats.happiness = Math.min(100, newStats.happiness + 10);
        break;
      case 'play':
        if (newStats.energy >= 20) {
          newStats.happiness = Math.min(100, newStats.happiness + 20);
          newStats.energy = Math.max(0, newStats.energy - 15);
        }
        break;
      case 'pet':
        newStats.happiness = Math.min(100, newStats.happiness + 15);
        newStats.energy = Math.min(100, newStats.energy + 5);
        break;
      case 'sleep':
        newStats.energy = Math.min(100, newStats.energy + 40);
        break;
    }
    
    newStats.mood = this.calculateMood(newStats);
    newStats.lastInteraction = Date.now();
    return newStats;
  }
}
```

### 2. Set Up Data Storage

Create a storage abstraction that works with or without Redis:

```typescript
// lib/storage.ts
import { Redis } from '@upstash/redis';

const localStore = new Map<string, any>();
const useRedis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

export const storage = useRedis
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
```

## Character Data & Lore

The application features 12 unique KPop Demon Hunters, each with detailed backstories, powers, and personalities:

### Character Categories
- **Main Heroes**: Abby, Bobby, Celine - The primary demon hunters
- **Support Heroes**: Gwima, Healer Han, Jinu, Mira - Specialized support roles  
- **Mysterious/Antagonist**: Mystery, Romance, Rumi, Ryu Mi-Yeong, Zoey - Complex characters with hidden agendas

### Character Properties
Each character includes:
- Unique powers and abilities
- Detailed backstory and personality
- Rarity level (common, rare, legendary, mythic)
- Character image and visual representation
- Role-specific dialogue patterns

## AI Integration

### 1. Create AI Service

```typescript
// lib/aiService.ts
export class AIService {
  static async generateResponse(prompt: string, character: KPopCharacter): Promise<string> {
    if (!process.env.GAIA_API_KEY) {
      return this.getFallbackResponse(prompt, character);
    }

    const systemPrompt = `You are ${character.name}, a KPop Demon Hunter! ⚔️
    
Your personality:
- Super cute and expressive ✨
- Love using emojis
- Sometimes mischievous but loveable 😈
- Remember how users treat you

Current Stats:
- Hunger: ${stats.hunger}/100 🍎
- Happiness: ${stats.happiness}/100 😊 
- Energy: ${stats.energy}/100 ⚡
- Mood: ${stats.mood}

Respond with 1-2 sentences full of personality!`;

    try {
      const response = await fetch('https://qwen72b.gaia.domains/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GAIA_API_KEY}`
        },
        body: JSON.stringify({
          model: 'Qwen/Qwen2.5-72B-Instruct',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 200
        })
      });

      const data = await response.json();
      return data.choices?.[0]?.message?.content || this.getFallbackResponse(prompt);
    } catch (error) {
      return this.getFallbackResponse(prompt);
    }
  }

  static getFallbackResponse(prompt: string, character: KPopCharacter): string {
    // Character-specific fallback responses
    const responses = [
      `As ${character.name}, I'm ready for our next demon hunting mission! ⚔️`,
      `${character.name} here! My ${character.power} is at your service! 🔥`,
      `Let's hunt some demons together! I'm ${character.name}! 👹⚡`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}
```

### 2. Create API Endpoints

```typescript
// app/api/hunter-ai/route.ts
import { NextResponse } from 'next/server';
import { KPopCharacter } from '@/lib/kpop-characters';

export async function POST(request: Request) {
  try {
    const { message, character } = await request.json();

    const systemPrompt = `You are ${character.name}, a KPop Demon Hunter.
    
Character Details:
- Power: ${character.power}
- Abilities: ${character.abilities.join(', ')}
- Personality: ${character.personality}
- Backstory: ${character.backstory}

Respond as this character would, staying true to their personality and background. Keep responses engaging and under 150 words.`;

    const response = await fetch('https://llama.us.gaianet.network/v1/chat/completions', {
  mood: 'content',
  lastInteraction: Date.now()
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    let stats = await storage.get(`pet:${userId}`) || DEFAULT_STATS;
    stats = PetSystem.decayStats(stats);
    
    const message = await AIService.generateResponse(
      `Greet your owner! Current mood: ${stats.mood}`, 
      stats
    );

    await storage.set(`pet:${userId}`, stats);

    return NextResponse.json({ message, stats });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get pet status' }, { status: 500 });
  }
}

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 
      `As ${character.name}, I'm ready for our next mission! ⚔️`;

    return NextResponse.json({ 
      message: aiResponse,
      character: character.name,
      power: character.power
    });

  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json({ 
      message: `As ${character.name}, I'm ready to hunt demons with you! 🔥`,
      character: character.name,
      power: character.power
    });
  }
}
```

## UI Components

### 1. Main Hunter Component

The core UI component is `KPopHunter.tsx`, which handles:

```typescript
// components/ui/KPopHunter.tsx
export default function KPopHunter() {
  const [character, setCharacter] = useState<KPopCharacter | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Generate random character on mount
  useEffect(() => {
    const newCharacter = generateRandomCharacter();
    setCharacter(newCharacter);
    setMessages([]); // Clear chat when character changes
'use client';

import { useState, useEffect } from 'react';
import { PetStats } from '@/lib/types';

interface PetProps {
  userId: string;
}

export default function Pet({ userId }: PetProps) {
  const [petData, setPetData] = useState<{message: string, stats: PetStats} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load pet data
  useEffect(() => {
    loadPet();
  }, [userId]);

  const loadPet = async () => {
    try {
      const response = await fetch(`/api/pet?userId=${userId}`);
      const data = await response.json();
      setPetData(data);
    } catch (error) {
      console.error('Failed to load pet:', error);
    }
  };

  const performAction = async (action: string, message?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId, message })
      });
      const data = await response.json();
      setPetData(data);
    } catch (error) {
  }, []);

  const sendMessage = async (message: string) => {
    if (!character || !message.trim()) return;

    setIsLoading(true);
    const userMessage: Message = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const response = await fetch('/api/hunter-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, character }),
      });

      const data = await response.json();
      const aiMessage: Message = { role: 'assistant', content: data.message };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl p-6 text-white">
      {/* Character Display */}
      <div className="text-center mb-6">
        <div className="relative mx-auto w-32 h-32 mb-4">
          <Image
            src={character?.image || '/Mystery.webp'}
            alt={character?.name || 'Hunter'}
            fill
            className="rounded-full object-cover border-4 border-yellow-400 shadow-lg"
          />
        </div>
        <h2 className="text-2xl font-bold mb-2">{character?.name}</h2>
        <p className="text-yellow-300 text-sm mb-2">Power: {character?.power}</p>
        <p className="text-gray-300 text-xs">{character?.personality}</p>
      </div>
        </button>
        <button
          onClick={() => performAction('play')}
          disabled={isLoading}
          className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          🎾 Play
        </button>
        <button
          onClick={() => performAction('pet')}
          disabled={isLoading}
          className="bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 disabled:opacity-50"
        >
          🥰 Pet
        </button>
        <button
          onClick={() => performAction('sleep')}
          disabled={isLoading}
          className="bg-purple-500 text-white p-3 rounded-lg hover:bg-purple-600 disabled:opacity-50"
        >
          😴 Sleep
        </button>
      </div>
    </div>
  );
}
```

### 2. Chat Interface (Optional)

```typescript
// components/PetChat.tsx
'use client';

import { useState } from 'react';

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => generateNewCharacter()}
          className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 px-6 rounded-xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 shadow-lg"
        >
          ⚡ New Hunter
        </button>
        <button
          onClick={() => shareOnX()}
          className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-400 hover:to-cyan-400 transition-all duration-200 shadow-lg"
        >
          📢 Share
        </button>
      </div>

      {/* Chat Interface */}
      <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 mb-4 max-h-96 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-100'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-center">
            <div className="inline-block p-3 rounded-lg bg-gray-700 text-gray-100">
              Thinking... 🤔
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputMessage); }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask your hunter anything..."
        className="flex-1 p-3 border rounded-lg"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !message.trim()}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}
```

## Farcaster Integration

The app integrates with Farcaster for social sharing and community features:

### 1. Share Functionality

```typescript
// Share to X (Twitter) integration in KPopHunter component
const shareOnX = () => {
  if (!character) return;
  
  const shareText = `Just met ${character.name}, a ${character.category} hunter with ${character.power}! Join me in hunting demons! @Gaianet_ai`;
  const shareUrl = `${window.location.origin}/share/${fid || 'demo'}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  
  window.open(twitterUrl, '_blank');
};
```

### 2. Neynar Integration

```typescript
// hooks/useNeynarUser.ts - Farcaster user data integration
import { useEffect, useState } from 'react';

export function useNeynarUser(fid?: string) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fid) {
      setLoading(false);
      return;
    }
    
    // Fetch user data from Neynar API
    // Implementation depends on specific Neynar endpoints
  }, [fid]);

  return { user, loading };
}
```

### 2. Frame Image Generation

```typescript
// app/api/frame/image/route.ts
import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'demo-user';
  
  // Get pet stats and generate image
  
  return new ImageResponse(
    (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ fontSize: '120px' }}>🐾</div>
        <div style={{ fontSize: '48px', color: 'white', fontWeight: 'bold' }}>
          AI Pet Companion
        </div>
        {/* Add stats display */}
      </div>
    ),
    {
      width: 800,
      height: 600,
    }
  );
}
```

## Deployment

### 1. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Set up custom domain (optional)
```

### 2. Environment Variables Setup

In your Vercel dashboard, add:
- `GAIA_API_KEY`
- `NEYNAR_API_KEY` 
- `NEYNAR_CLIENT_ID`
- `KV_REST_API_URL` (if using Upstash)
- `KV_REST_API_TOKEN` (if using Upstash)
- `NEXT_PUBLIC_URL` (your deployed URL)

## Customization Ideas

### 1. Character Expansions
- **New Characters**: Add more hunters with unique powers and backstories
- **Character Evolution**: Hunters that grow stronger with interactions  
- **Team Formation**: Multiple hunters working together
- **Character Relationships**: Hunters that remember each other

### 2. Advanced AI Features
- **Voice Chat**: Add speech-to-text for voice commands to hunters
- **Image Recognition**: Hunters react to demon photos or battle scenes
- **Mission Memory**: Long-term memory of demon hunting missions
- **Multi-language**: Support for Korean, Japanese, English, and more

### 3. Game Mechanics
- **Battle System**: Turn-based combat against demons
- **Equipment System**: Weapons and armor for hunters
- **Achievement System**: Unlock new abilities and characters  
- **Leaderboards**: Compete with other demon hunters

### 4. Social Features
- **Guild System**: Join hunter guilds for group missions
- **Trading**: Exchange characters and equipment
- **Tournaments**: Competitive demon hunting events
- **Shared Universe**: Characters that exist across multiple apps

## Best Practices

1. **Performance**: Cache AI responses and character data when possible
2. **Error Handling**: Always provide fallback responses for AI failures
3. **User Experience**: Keep character interactions fast and responsive
4. **Character Consistency**: Maintain personality traits across conversations
5. **Scalability**: Design character system for easy expansion

## Troubleshooting

### Common Issues

1. **AI API Failures**: Always implement character-specific fallback responses
2. **Rate Limiting**: Add delays between AI chat requests
3. **Character Loading**: Ensure character images are properly loaded
4. **Share Functionality**: Test X (Twitter) sharing with proper URL encoding

### Debugging Tips

- Log AI API responses and character selections for debugging
- Test with different characters and message types
- Monitor chat clearing when switching characters
- Use browser dev tools for share button testing

## Next Steps

After building your KPop Demon Hunter app:

1. **User Testing**: Get feedback from real users on character interactions
2. **Character Expansion**: Add more unique hunters with different abilities
3. **Battle System**: Implement demon combat mechanics
4. **Community Features**: Add guilds, tournaments, and leaderboards
5. **Mobile Optimization**: Ensure smooth performance on mobile devices

## Conclusion

This guide shows how to build a comprehensive KPop Demon Hunter application with AI-powered character interactions, social sharing, and Farcaster integration. The modular architecture allows for easy expansion and customization to create unique gaming experiences.
2. **Feature Iteration**: Add requested features
3. **Performance Optimization**: Monitor and improve speed
4. **Community Building**: Engage with your users
5. **Scaling**: Plan for growth and new features

## Resources

- [Neynar Documentation](https://docs.neynar.com/)
- [Farcaster Frame Spec](https://docs.farcaster.xyz/reference/frames/spec)
- [Gaia AI Documentation](https://gaia.domains/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Upstash Redis](https://upstash.com/)

---

Happy building! 🚀 Your AI pet companion awaits! 🐾✨
