'use client'

import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Sparkles, 
  User, 
  Bot,
  Smile,
  Heart,
  Target,
  Zap,
  Clock,
  Lightbulb
} from 'lucide-react';
import { LightwalkerState, Activity } from '@/types/daily-use';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'lightwalker';
  timestamp: Date;
}

interface LightwalkerChatProps {
  lightwalkerState: LightwalkerState;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentActivity?: Activity | null;
}

export default function LightwalkerChat({
  lightwalkerState,
  messages,
  onSendMessage,
  currentActivity
}: LightwalkerChatProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show typing indicator for AI responses
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.sender === 'user') {
      setIsTyping(true);
      // Simulate typing delay
      const timer = setTimeout(() => setIsTyping(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Handle message sending
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  // Quick response suggestions
  const getQuickSuggestions = () => {
    if (currentActivity) {
      return [
        `How do I practice ${currentActivity.attribute}?`,
        `Tell me about ${currentActivity.roleModel}`,
        `What's the best way to do this activity?`,
        'I completed this activity!'
      ];
    }
    
    return [
      "What should I focus on today?",
      "How am I doing with my growth?",
      "Give me motivation",
      "What would you recommend?"
    ];
  };

  const quickSuggestions = getQuickSuggestions();

  // Get Lightwalker mood emoji
  const getMoodEmoji = (mood: LightwalkerState['currentMood']) => {
    const moodEmojis: Record<string, string> = {
      'energetic': '⚡',
      'focused': '🎯',
      'calm': '😌',
      'reflective': '🤔',
      'determined': '💪'
    };
    return moodEmojis[mood] || '😊';
  };

  // Format timestamp
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Lightwalker™ Chat</h3>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span>{getMoodEmoji(lightwalkerState.currentMood)}</span>
              <span className="capitalize">{lightwalkerState.currentMood}</span>
              <span>•</span>
              <span>Level {lightwalkerState.level}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-green-400">Online</span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2" style={{ scrollbarWidth: 'thin' }}>
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-slate-400 text-sm mb-2">Start a conversation with your Lightwalker</p>
            <p className="text-slate-500 text-xs">
              Ask questions, get guidance, or share your progress
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.sender === 'user'
                ? 'bg-blue-600'
                : 'bg-gradient-to-br from-purple-500 to-pink-600'
            }`}>
              {message.sender === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <span className="text-sm">{getMoodEmoji(lightwalkerState.currentMood)}</span>
              )}
            </div>

            {/* Message Bubble */}
            <div className={`flex-1 max-w-[80%] ${message.sender === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block p-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-slate-700 text-slate-100 rounded-bl-md'
              }`}>
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-sm">{getMoodEmoji(lightwalkerState.currentMood)}</span>
            </div>
            <div className="bg-slate-700 p-3 rounded-2xl rounded-bl-md">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length === 0 && (
        <div className="mb-4">
          <p className="text-xs text-slate-500 mb-2">Quick suggestions:</p>
          <div className="grid grid-cols-1 gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSendMessage(suggestion)}
                className="text-left p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-colors border border-slate-600 hover:border-slate-500"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask your Lightwalker anything..."
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
          />
          
          {/* Mic Button (placeholder for future voice input) */}
          <button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-300"
          >
            <Lightbulb className="w-4 h-4" />
          </button>
        </div>

        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg transition-colors"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>

      {/* Current Activity Context */}
      {currentActivity && (
        <div className="mt-3 p-2 bg-slate-700/30 rounded-lg border border-slate-600">
          <div className="flex items-center space-x-2 text-xs">
            <Target className="w-3 h-3 text-blue-400" />
            <span className="text-slate-400">Currently practicing:</span>
            <span className="text-white font-medium">{currentActivity.title}</span>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-3">
          <span>Streak: {lightwalkerState.currentStreakDays} days</span>
          <span>Level: {lightwalkerState.level}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Heart className="w-3 h-3 text-red-400" />
          <span>AI-powered guidance</span>
        </div>
      </div>
    </div>
  );
}