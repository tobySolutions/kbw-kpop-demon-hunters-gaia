import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './Button';
import MarkdownMessage from './MarkdownMessage';
import { 
  FaHeart, 
  FaGamepad, 
  FaBed, 
  FaUtensils,
  FaCommentDots,
  FaEye,
  FaTimes,
  FaPaperPlane,
  FaTrash,
  FaBatteryFull,
  FaBatteryHalf,
  FaBatteryQuarter,
  FaBatteryEmpty,
  FaSmile,
  FaMeh,
  FaSadTear,
  FaChevronLeft,
  FaChevronRight,
  FaRandom,
  FaTwitter
} from 'react-icons/fa';
import { KPOP_CHARACTERS } from '../../lib/kpop-characters';

interface HunterStats {
  hunger: number;
  happiness: number;
  energy: number;
  mood: string;
  lastInteraction: number;
  characterId?: string;
  hunterRank?: number;
}

interface HunterResponse {
  message: string;
  stats: HunterStats;
  action?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'pet';
  timestamp: Date;
}

interface KPopHunterProps {
  userId: string;
}

export default function KPopHunter({ userId }: KPopHunterProps) {
  const [hunterData, setHunterData] = useState<HunterResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [selectedCharacterIndex, setSelectedCharacterIndex] = useState(() => {
    // Generate a random character for each user session
    return Math.floor(Math.random() * KPOP_CHARACTERS.length);
  });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Get current character
  const currentCharacter = KPOP_CHARACTERS[selectedCharacterIndex];

  // Character switching functions
  const switchToNextCharacter = () => {
    setSelectedCharacterIndex((prev) => (prev + 1) % KPOP_CHARACTERS.length);
    setChatHistory([]); // Clear chat when switching characters
    setShowChat(false); // Hide chat panel
  };

  const switchToPrevCharacter = () => {
    setSelectedCharacterIndex((prev) => (prev - 1 + KPOP_CHARACTERS.length) % KPOP_CHARACTERS.length);
    setChatHistory([]); // Clear chat when switching characters
    setShowChat(false); // Hide chat panel
  };

  const switchToRandomCharacter = () => {
    const randomIndex = Math.floor(Math.random() * KPOP_CHARACTERS.length);
    setSelectedCharacterIndex(randomIndex);
    setChatHistory([]); // Clear chat when switching characters
    setShowChat(false); // Hide chat panel
  };

  const loadPetStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const characterParam = encodeURIComponent(JSON.stringify({
        id: currentCharacter.id,
        name: currentCharacter.name,
        category: currentCharacter.category,
        personality: currentCharacter.personality,
        specialAbility: currentCharacter.specialAbility,
        weapon: currentCharacter.weapon,
        powers: currentCharacter.powers
      }));
      
      const response = await fetch(`/api/hunter-ai?userId=${encodeURIComponent(userId)}&character=${characterParam}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load pet status');
      }
      
      setHunterData(data);
      
      // Add pet's initial message to chat history if it's a new load
      if (data.message && chatHistory.length === 0) {
        const initialMessage: ChatMessage = {
          id: `pet-${Date.now()}`,
          text: data.message,
          sender: 'pet',
          timestamp: new Date()
        };
        setChatHistory([initialMessage]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [userId, chatHistory.length, currentCharacter]);

  // Load initial pet status
  useEffect(() => {
    loadPetStatus();
  }, [loadPetStatus]);

    // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current && showChat) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, showChat]);

  const performAction = async (action: string, message?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const requestBody: any = { 
        action, 
        userId,
        character: {
          id: currentCharacter.id,
          name: currentCharacter.name,
          category: currentCharacter.category,
          personality: currentCharacter.personality,
          specialAbility: currentCharacter.specialAbility,
          weapon: currentCharacter.weapon,
          powers: currentCharacter.powers
        }
      };
      if (message) {
        requestBody.message = message;
      }
      
      const response = await fetch('/api/hunter-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Action failed');
      }
      
      setHunterData(data);
      
      // Add pet response to chat history if this was a chat action
      if (action === 'chat' && data.message) {
        const petMessage: ChatMessage = {
          id: `pet-${Date.now()}`,
          text: data.message,
          sender: 'pet',
          timestamp: new Date()
        };
        setChatHistory(prev => [...prev, petMessage]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    // Add user message to chat history
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: chatMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    setChatHistory(prev => [...prev, userMessage]);
    
    const messageToSend = chatMessage.trim();
    setChatMessage('');
    
    await performAction('chat', messageToSend);
  };

  const getStatColor = (value: number) => {
    if (value >= 80) return 'text-green-400';
    if (value >= 60) return 'text-yellow-400';
    if (value >= 40) return 'text-orange-400';
    return 'text-red-500';
  };

  const getStatIcon = (statName: string, value: number) => {
    switch (statName) {
      case 'hunger':
        return <FaUtensils className={`text-lg ${getStatColor(value)}`} />;
      case 'happiness':
        if (value >= 80) return <FaSmile className="text-lg text-green-400" />;
        if (value >= 60) return <FaSmile className="text-lg text-yellow-400" />;
        if (value >= 40) return <FaMeh className="text-lg text-orange-400" />;
        return <FaSadTear className="text-lg text-red-500" />;
      case 'energy':
        if (value >= 80) return <FaBatteryFull className="text-lg text-green-400" />;
        if (value >= 60) return <FaBatteryHalf className="text-lg text-yellow-400" />;
        if (value >= 40) return <FaBatteryQuarter className="text-lg text-orange-400" />;
        return <FaBatteryEmpty className="text-lg text-red-500" />;
      default:
        return null;
    }
  };

  const getStatGradient = (value: number) => {
    if (value >= 80) return 'from-green-400 to-green-400';
    if (value >= 60) return 'from-yellow-400 to-yellow-400';
    if (value >= 40) return 'from-orange-400 to-orange-400';
    return 'from-red-400 to-red-500';
  };

  const shareOnX = () => {
    const character = currentCharacter;
    const stats = hunterData?.stats;
    
    if (!stats) return;
    
    const websiteUrl = window.location.origin;
    const shareText = `🎤⚡ I'm training with ${character.name}, a ${character.category.replace('_', ' ')} in KPop Demon Hunter!

✨ Hunter Rank: ${stats.hunterRank || 1}/10
⚡ Spiritual Energy: ${stats.hunger}/100
💜 Connection: ${stats.happiness}/100  
🗡️ Battle Ready: ${stats.energy}/100

Fighting demons with the power of music! 🎵🛡️

Play now: ${websiteUrl}

@Gaianet_ai`;

    const encodedText = encodeURIComponent(shareText);
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
    
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  if (isLoading && !hunterData) {
    return (
      <div className="flex items-center justify-center p-8 bg-gradient-to-br from-red-900/20 via-pink-900/20 to-purple-900/20 rounded-2xl border-2 border-red-500/40 shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 mb-4 animate-pulse filter drop-shadow-lg mx-auto">
            <img 
              src="/k-pop-demon-main.jpeg" 
              alt="KPop Demon Hunter Loading" 
              className="w-full h-full rounded-full object-cover border-2 border-red-500"
            />
          </div>
          <div className="text-base text-red-300 font-kvant tracking-wide">Awakening your KPop Demon Hunter...</div>
          <div className="mt-3">
            <div className="flex justify-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce shadow-sm"></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gradient-to-br from-red-900/20 via-pink-900/20 to-purple-900/20 border-2 border-red-500/40 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="text-4xl mb-3 filter drop-shadow-sm">�✨</div>
          <div className="font-trailers mb-2 text-red-300 text-lg">Oops! Your KPop Demon Hunter needs help!</div>
          <div className="text-sm text-red-300/70 mb-4 leading-relaxed bg-black/20 p-3 rounded-lg border border-red-500/20">{error}</div>
          <Button
            onClick={loadPetStatus}
            variant="secondary"
            size="sm"
            className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-purple-600 hover:to-red-600 text-white font-kvant py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <span className="flex items-center gap-2">
              🔄 Try Again
            </span>
          </Button>
        </div>
      </div>
    );
  }

  if (!hunterData) {
    return null;
  }

  return (
    <div className="w-full mx-auto bg-gradient-to-br from-gray-900 via-red-900/80 to-purple-900/80 border border-red-500 rounded-2xl p-4 shadow-xl">
      {/* Hunter Avatar with Character Switching */}
      <div className="text-center mb-4">
        {/* Character Navigation */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <Button
            onClick={switchToPrevCharacter}
            variant="outline"
            size="sm"
            className="!p-2 !min-w-0 bg-red-700 hover:bg-red-600 border-red-400 text-white hover:text-yellow-100 transition-all duration-200"
          >
            <FaChevronLeft className="text-sm" />
          </Button>
          
          <div className="relative">
            <div className="w-24 h-24 mb-2 hover:animate-pulse transition-all duration-300 cursor-pointer filter drop-shadow-lg">
              <img 
                src={currentCharacter.imageUrl} 
                alt={currentCharacter.name} 
                className="w-full h-full rounded-full object-cover border-3 border-red-500 shadow-lg"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full border-2 border-black shadow-lg flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <Button
            onClick={switchToNextCharacter}
            variant="outline"
            size="sm"
            className="!p-2 !min-w-0 bg-red-700 hover:bg-red-600 border-red-400 text-white hover:text-yellow-100 transition-all duration-200"
          >
            <FaChevronRight className="text-sm" />
          </Button>
        </div>
        
        <div className="text-xl font-trailers text-white mb-1 tracking-wide drop-shadow-sm">
          {currentCharacter.name}
        </div>
        <div className="text-sm text-pink-200 mb-2 capitalize font-medium">
          {currentCharacter.category.replace('_', ' ')} • {currentCharacter.gender}
        </div>
        <div className="text-sm font-kvant text-white capitalize bg-gradient-to-r from-red-700 to-purple-700 px-3 py-1 rounded-full inline-block border border-red-400 shadow-sm mb-2">
          Mood: <span className="text-yellow-200">{hunterData.stats.mood}</span> ✨
        </div>
        
        {/* Random Character Button */}
        <div>
          <Button
            onClick={switchToRandomCharacter}
            variant="outline"
            size="sm"
            className="!flex !items-center !justify-center !gap-1 !px-3 !py-1 text-xs bg-purple-700 hover:bg-purple-600 border-purple-400 text-white hover:text-yellow-100 transition-all duration-200"
          >
            <FaRandom className="text-xs" />
            <span>🎲 Random</span>
          </Button>
        </div>
      </div>

      {/* Hunter Message - Only show if chat is closed */}
      {!showChat && (
        <div className="bg-gradient-to-r from-gray-800 via-red-800 to-purple-800 rounded-xl p-4 mb-4 border border-red-400 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 flex-shrink-0">
              <img 
                src={currentCharacter.imageUrl} 
                alt={currentCharacter.name} 
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <MarkdownMessage 
                content={hunterData.message} 
                className="text-white text-base leading-relaxed font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {showChat && (
        <div className="bg-gray-800 rounded-xl mb-4 border border-red-400 shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-red-700 to-purple-700 px-4 py-3 border-b border-red-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaCommentDots className="text-white text-lg" />
                <div className="text-base font-kvant text-white tracking-wide font-bold">
                  Chat with your Hunter
                </div>
              </div>
              <Button
                type="button"
                onClick={() => setShowChat(false)}
                variant="outline"
                size="sm"
                className="!flex !items-center !justify-center text-xs px-3 py-2 h-auto border-red-500/30 text-pink-300 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 !max-w-none"
              >
                <FaTimes className="text-sm" />
              </Button>
            </div>
          </div>

          {/* Chat Messages Container */}
          <div 
            ref={chatContainerRef}
            className="max-h-48 min-h-24 overflow-y-auto p-3 space-y-3 bg-gray-900"
          >
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white rounded-br-md shadow-lg'
                      : 'bg-gray-700 text-gray-100 rounded-bl-md border border-red-400 shadow-lg'
                  }`}
                >
                  <div className="break-words">
                    {msg.sender === 'pet' ? (
                      <MarkdownMessage 
                        content={msg.text} 
                        className="text-gray-100"
                      />
                    ) : (
                      <div className="font-fobble text-white">{msg.text}</div>
                    )}
                  </div>
                  <div
                    className={`text-xs mt-2 opacity-75 ${
                      msg.sender === 'user' ? 'text-white/80' : 'text-red-300/60'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator for pet response */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-red-900/20 to-purple-900/20 text-red-300 rounded-2xl rounded-bl-md px-4 py-3 text-sm font-medium shadow-md border border-red-500/20">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-pink-300 font-kvant ml-2">🐧 typing...</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Empty state */}
            {chatHistory.length === 0 && !isLoading && (
              <div className="text-center text-red-300/60 text-sm py-8">
                <div className="text-3xl mb-3 filter drop-shadow-sm">🐧💭</div>
                <div className="font-bold mb-1">Start chatting with your Demon Hunter!</div>
                <div className="text-xs mt-2 bg-gradient-to-r from-red-900/20 to-purple-900/20/30 px-3 py-2 rounded-lg inline-block border border-red-500/20">
                  Try saying &quot;Hello&quot; or ask how they&apos;re feeling
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-red-400 bg-gradient-to-r from-red-700 to-purple-700">
            <form onSubmit={handleChatSubmit} className="flex gap-3">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your message to your Hunter..."
                className="flex-1 px-4 py-3 text-sm border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-gray-800 font-medium placeholder-gray-400 text-white"
                disabled={isLoading}
                autoFocus
              />
              <Button
                type="submit"
                disabled={isLoading || !chatMessage.trim()}
                variant="primary"
                size="sm"
                className="!flex !items-center !justify-center bg-gradient-to-r from-red-600 to-purple-600 hover:from-purple-600 hover:to-red-600 px-5 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 !max-w-none"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <FaPaperPlane className="text-sm" />
                )}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Stats Display */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {(['hunger', 'happiness', 'energy'] as const).map((stat) => (
          <div key={stat} className="bg-gray-800 rounded-xl p-3 border border-red-400 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <div className="text-lg mb-1 flex justify-center">
                {getStatIcon(stat, hunterData.stats[stat])}
              </div>
              <div className="text-xs font-kvant text-white capitalize mb-1 tracking-wider font-bold">{stat}</div>
              <div className={`text-sm font-trailers mb-2 ${getStatColor(hunterData.stats[stat])}`}>
                {hunterData.stats[stat]}/100
              </div>
              <div className="w-full bg-gray-600 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${getStatGradient(hunterData.stats[stat])} shadow-sm`}
                  style={{ width: `${Math.max(hunterData.stats[stat], 0)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => performAction('feed')}
          disabled={isLoading}
          variant="primary"
          size="sm"
          className="!flex !items-center !justify-center !gap-1 bg-green-500 hover:bg-green-400 text-white font-kvant py-3 px-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 border border-green-400 !w-full !max-w-none font-bold"
        >
          <FaUtensils className="text-xs" />
          <span className="text-xs">⚡ Energy</span>
        </Button>
        <Button
          onClick={() => performAction('play')}
          disabled={isLoading}
          variant="primary"
          size="sm"
          className="!flex !items-center !justify-center !gap-1 bg-red-500 hover:bg-red-400 text-white font-kvant py-3 px-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 border border-red-400 !w-full !max-w-none font-bold"
        >
          <FaGamepad className="text-xs" />
          <span className="text-xs">🎵 Train</span>
        </Button>
        <Button
          onClick={() => performAction('pet')}
          disabled={isLoading}
          variant="primary"
          size="sm"
          className="!flex !items-center !justify-center !gap-1 bg-purple-500 hover:bg-purple-400 text-white font-kvant py-3 px-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 border border-purple-400 !w-full !max-w-none font-bold"
        >
          <FaHeart className="text-xs" />
          <span className="text-xs">💜 Bond</span>
        </Button>
        <Button
          onClick={() => performAction('sleep')}
          disabled={isLoading}
          variant="primary"
          size="sm"
          className="!flex !items-center !justify-center !gap-1 bg-blue-500 hover:bg-blue-400 text-white font-kvant py-3 px-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 border border-blue-400 !w-full !max-w-none font-bold"
        >
          <FaBed className="text-xs" />
          <span className="text-xs">🧘 Meditate</span>
        </Button>
      </div>

      {/* Chat and Status Buttons */}
      <div className="mt-3 space-y-2">
        <div className="flex gap-2">
          <Button
            onClick={() => setShowChat(!showChat)}
            disabled={isLoading}
            variant="secondary"
            size="sm"
            className="!flex !items-center !justify-center !gap-1 flex-1 bg-gradient-to-r from-red-600 to-purple-600 hover:from-purple-700 hover:to-red-700 text-white font-kvant py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 !max-w-none font-bold border border-red-400"
          >
            <FaCommentDots className="text-xs" />
            <span className="text-xs">{showChat ? 'Hide Chat' : 'Chat'}</span>
          </Button>
          
          {showChat && chatHistory.length > 0 && (
            <Button
              onClick={() => setChatHistory([])}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="!flex !items-center !justify-center text-white bg-orange-500 hover:bg-orange-400 border border-orange-400 py-3 px-4 rounded-xl font-kvant transition-all duration-300 transform hover:scale-105 shadow-lg !max-w-none font-bold"
              title="Clear chat history"
            >
              <FaTrash className="text-xs" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => performAction('status')}
            disabled={isLoading}
            variant="outline"
            size="sm"
            isLoading={isLoading}
            className="!flex !items-center !justify-center !gap-1 flex-1 bg-gray-700 hover:bg-gray-600 border border-gray-500 text-white hover:text-yellow-200 py-3 rounded-xl font-kvant transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 !max-w-none font-bold"
          >
            {!isLoading && (
              <>
                <FaEye className="text-xs" />
                <span className="text-xs">Status</span>
              </>
            )}
          </Button>
          
          <Button
            onClick={shareOnX}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="!flex !items-center !justify-center !gap-1 flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-cyan-700 hover:to-blue-700 border border-blue-400 text-white hover:text-yellow-100 py-3 rounded-xl font-kvant transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 !max-w-none font-bold"
            title="Share your KPop Demon Hunter on X"
          >
            <FaTwitter className="text-xs" />
            <span className="text-xs">📱 Share</span>
          </Button>
        </div>
      </div>

      {/* Last Interaction Time */}
      <div className="mt-6 text-xs text-gray-300 text-center bg-gray-800 px-4 py-3 rounded-xl border border-gray-600 shadow-sm">
        <div className="font-medium text-white">Last interaction</div>
        <div className="text-yellow-200 font-bold mt-1">
          {new Date(hunterData.stats.lastInteraction).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
