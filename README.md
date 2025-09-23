# KPop Demon Hunters 🎤⚡

## Overview

Experience the mystical world of KPop Demon Hunters! Train and bond with powerful demon hunters who fight evil forces using the power of music and magic. Each hunter has unique abilities, weapons, and personalities in an epic battle to maintain the Honmoon barrier and protect humanity from Gwi-Ma, the demon king.

## Features

### 🎭 Hunter Characters
- **12 Unique Characters**: Random character selection from the full roster
- **3 Categories**: Huntr/x heroes, Saja Boys antagonists, and wise allies
- **Authentic Personalities**: Each hunter has distinct traits, weapons, and powers
- **Dynamic Interactions**: Character-specific responses based on lore and abilities
- **Character Switching**: Navigate through all hunters with arrow buttons

### 📊 Hunter Stats System
- **Spiritual Energy (⚡)**: Channel energy to restore power levels
- **Connection Strength (�)**: Bond with your hunter through interactions
- **Battle Readiness (🗡️)**: Train to maintain combat effectiveness
- **Hunter Rank (🏆)**: Overall performance ranking from 1-10
- **Mood**: Current spiritual state affecting abilities

### 🎮 Mystical Actions
- **Channel Energy (⚡)**: Restore spiritual power for demon fighting
- **Train (�)**: Practice sonic magic and vocal techniques
- **Bond (💜)**: Strengthen spiritual connection with your hunter
- **Meditate (🧘)**: Enter deep meditation to restore battle readiness
- **Status Check (�)**: Assess current power levels and Honmoon strength

### 🔮 Honmoon Barrier System
- Stats naturally decay over time as demons test the barriers
- Spiritual Energy decreases by ~5 points per hour
- Battle Readiness decreases by ~2 points per hour  
- Connection Strength decreases by ~3 points per hour
- Regular interaction maintains barrier strength

## API Endpoints

### `/api/hunter-ai`

Main API endpoint for KPop Demon Hunter interactions.

#### GET Request
```
GET /api/hunter-ai?userId=USER_ID&character=CHARACTER_JSON
```
Returns current hunter status and a mystical greeting message.

#### POST Request
```javascript
{
  "action": "feed|play|pet|sleep|status|chat",
  "userId": "unique_user_id",
  "character": {
    "id": "rumi",
    "name": "Rumi", 
    "category": "huntrx",
    "personality": "confident, conflicted, protective",
    "specialAbility": "Can embrace her dual identity to break demonic influence",
    "weapon": "Legendary Geom",
    "powers": ["Vocal Magic", "Demonic Power", "Leadership"]
  }
}
```

**Response Format:**
```javascript
{
  "message": "⚡✨ Rumi channels spiritual energy! My power grows stronger! The Honmoon barrier pulses with renewed strength! 🌟💫",
  "stats": {
    "hunger": 80,
    "happiness": 75,
    "energy": 65,
    "mood": "empowered",
    "hunterRank": 7,
    "lastInteraction": 1672531200000,
    "characterId": "rumi"
  },
  "character": {
    "id": "rumi",
    "name": "Rumi",
    "category": "huntrx",
    // ... character details
  },
  "action": "feed"
}
```

## Character Roster

### Huntr/x - The Heroes
- **Rumi**: Lead vocalist with dual demon-human heritage and legendary geom
- **Mira**: Main dancer wielding mystical gok-do with precision strikes  
- **Zoey**: Rapper creating protective barriers through lyrical magic

### Saja Boys - The Antagonists  
- **Jinu**: Conflicted leader who traded his soul for fame
- **Abby Saja**: Ancient dark magic strategist  
- **Baby Saja**: Innocent but corrupted chaos magic wielder
- **Mystery Saja**: Enigmatic member with hidden devastating powers
- **Romance Saja**: Charming manipulator using corrupted love magic

### Allies - The Wise Supporters
- **Celine**: Former demon hunter and master of vocal magic
- **Healer Han**: Spiritual healer who restores Honmoon barriers
- **Ryu Mi-yeong**: Traditional Korean warrior preserving ancient techniques  
- **Bobby**: Charismatic performer amplifying magical power

### The Demon King
- **Gwi-Ma**: Evil demon king seeking to break the Honmoon barrier

## React Component Usage

### KPopHunter Component

```tsx
import KPopHunter from '@/components/ui/KPopHunter';

function MyApp() {
  const userId = user?.fid?.toString() || 'demo-user';
  
  return (
    <div>
      <KPopHunter userId={userId} />
    </div>
  );
}
```

### Integration in Existing App

The integration is already added to the HomeTab component:

```tsx
// src/components/ui/tabs/HomeTab.tsx
export function HomeTab() {
  const { context } = useMiniApp();
  const userId = context?.user?.fid?.toString() || 'demo-user';

  return (
    <div>
      <PudgyPet userId={userId} />
    </div>
  );
}
```

## Data Storage

### Redis/KV Storage
- Uses Upstash Redis if `KV_REST_API_URL` and `KV_REST_API_TOKEN` are available
- Falls back to in-memory storage for development
- Data is stored with keys like `pudgy:USER_ID`

### Default Stats
```javascript
{
  hunger: 50,
  happiness: 70,
  energy: 80,
  mood: 'content',
  lastInteraction: Date.now()
}
```

## Environment Variables

Required for AI functionality:
```
GAIA_API_KEY=your_gaia_ai_api_key
```

Optional for persistent storage:
```
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token
NEXT_PUBLIC_URL=your_app_url (for frames)
```

## Sample Pet Responses

### Feeding Response
> "Om nom nom! 🍎✨ My hunger went up to 80! You're the best owner ever! *happy wiggle*"

### Play Response  
> "Wheee! 🎾😄 So much fun! Happiness +20 but energy -15! *bounces excitedly* Let's play more!"

### Petting Response
> "Purrrr~ 🥰 *snuggles deep* I love you SO much! *melts into your arms* You give the best cuddles! ✨💕"

### Sleep Response
> "Zzz... 😴💤 *stretches and yawns* Ahh! Energy recharged to 85! Ready for adventures! ✨⚡"

### Hungry State
> "Grumble grumble... 🍽️😋 My tummy needs food! Hunger: 25/100 😤💢"

### Low Energy State  
> "Zzz... 😴💤 Too sleepy to play right now! Let me rest first, then we can have mega fun! *yawns*"

## UI Features

### Stats Display
- Color-coded spiritual energy bars (green/yellow/orange/red)
- Mystical emoji indicators for each power type
- Real-time updates after demon hunter interactions
- Animated progress bars with magical effects

### Action Buttons  
- Themed demon hunter action buttons
- Disabled states during spiritual channeling
- Responsive grid layout optimized for mobile
- Clear magical emoji indicators (⚡🎵💜🧘)

### Character Navigation
- Arrow buttons to browse all 12 hunters
- Random character selection with dice button
- Character portraits with mystical borders
- Category badges (Huntr/x, Saja Boys, Allies, Demon King)

### Chat System
- Real-time spiritual communication with hunters
- Character-specific personality responses
- Auto-clearing chat when switching characters
- Markdown message support for enhanced formatting

### Share Functionality
- One-click sharing to X (Twitter) with hunter stats
- Automatic @Gaianet_ai mention
- Includes current website URL for viral growth
- No hashtag spam for cleaner sharing

## Farcaster Integration

The KPop Demon Hunter experience works seamlessly in Farcaster frames:

### Frame Features
- Dynamic character selection for each user
- Interactive mystical action buttons
- Persistent hunter bonding across sessions  
- Beautiful gradient backgrounds with demon hunter themes
- Real-time stat visualization in frame format

### Mystical Actions
- ⚡ Channel Energy - Restore spiritual power for demon fighting
- � Train - Practice sonic magic and combat techniques
- 💜 Bond - Strengthen connection between hunter and fan
- 🧘 Meditate - Deep spiritual restoration

## Getting Started

1. The KPop Demon Hunter experience is integrated in your Farcaster app
2. Each user gets a random character assignment for unique experiences
3. Users can switch between all 12 hunters at any time
4. Stats decay over time as demons test the Honmoon barrier
5. Regular interaction maintains barrier strength and hunter power

## Lore & World Building

### The Honmoon Barrier
A mystical shield powered by music and fan emotion that keeps demons trapped in their realm. The barrier weakens without regular spiritual energy from hunter-fan bonds.

### Powers & Magic System
- **Vocal Magic**: Singing that carries spiritual energy
- **Sonic Combat**: Using music as a weapon against demons  
- **Spiritual Bonding**: Connection between hunters and their supporters
- **Barrier Magic**: Maintaining the protective Honmoon shield

### The Eternal Struggle
KPop Demon Hunters fight an ongoing battle against Gwi-Ma and his corrupted Saja Boys, using the power of music, fan support, and spiritual connection to protect humanity.

This KPop Demon Hunter experience creates an immersive mystical world where users become part of an epic battle between good and evil, powered by music and spiritual bonds! 🎤⚡�️
