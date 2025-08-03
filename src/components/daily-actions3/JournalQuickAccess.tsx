'use client'

import { useState } from 'react';
import { 
  BookOpen, 
  Save,
  Smile,
  Meh,
  Frown,
  Star,
  Lightbulb,
  Tag,
  Calendar,
  Check,
  X
} from 'lucide-react';
import { Activity } from '@/types/daily-use';

interface JournalQuickAccessProps {
  currentActivity?: Activity | null;
}

type MoodType = 'great' | 'good' | 'okay' | 'challenging' | 'difficult';

const MOOD_OPTIONS: Array<{ value: MoodType; label: string; icon: React.ComponentType<any>; color: string }> = [
  { value: 'great', label: 'Great', icon: Star, color: 'text-green-500' },
  { value: 'good', label: 'Good', icon: Smile, color: 'text-blue-500' },
  { value: 'okay', label: 'Okay', icon: Meh, color: 'text-yellow-500' },
  { value: 'challenging', label: 'Challenging', icon: Frown, color: 'text-orange-500' },
  { value: 'difficult', label: 'Difficult', icon: X, color: 'text-red-500' }
];

const QUICK_PROMPTS = [
  "What did I learn from this activity?",
  "How did this make me feel?",
  "What would I do differently next time?",
  "What insights did I gain?",
  "How does this connect to my values?",
  "What am I grateful for right now?",
  "What challenges did I face?",
  "How did I grow today?"
];

const COMMON_TAGS = [
  'growth', 'challenge', 'insight', 'gratitude', 'reflection', 
  'breakthrough', 'struggle', 'victory', 'learning', 'mindfulness',
  'courage', 'wisdom', 'progress', 'setback', 'inspiration'
];

export default function JournalQuickAccess({ currentActivity }: JournalQuickAccessProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodType>('good');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Auto-generate title based on context
  const generateTitle = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (currentActivity) {
      return `${currentActivity.title} - ${timeStr}`;
    }
    
    return `Daily Reflection - ${now.toLocaleDateString()}`;
  };

  const insertPrompt = (prompt: string) => {
    const newContent = content + (content ? '\n\n' : '') + prompt + '\n';
    setContent(newContent);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Simulate save - in real app this would make an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const entry = {
        title: title || generateTitle(),
        content,
        mood,
        tags: selectedTags,
        activityId: currentActivity?.id,
        createdAt: new Date().toISOString()
      };
      
      console.log('Saving journal entry:', entry);
      
      setSaved(true);
      setTimeout(() => {
        // Reset form
        setTitle('');
        setContent('');
        setMood('good');
        setSelectedTags([]);
        setSaved(false);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to save journal entry:', error);
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = content.trim().length > 0;

  if (saved) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Entry Saved!</h3>
        <p className="text-gray-600">Your reflection has been captured.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Context Header */}
      {currentActivity && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">Reflecting on Activity</span>
          </div>
          <p className="text-sm text-indigo-700">{currentActivity.title}</p>
          <p className="text-xs text-indigo-600">{currentActivity.roleModel} • {currentActivity.attribute}</p>
        </div>
      )}

      {/* Title Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Entry Title (Optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={generateTitle()}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
      </div>

      {/* Quick Prompts */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Writing Prompts
        </label>
        <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
          {QUICK_PROMPTS.map((prompt, index) => (
            <button
              key={index}
              onClick={() => insertPrompt(prompt)}
              className="text-left p-2 text-sm text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
            >
              <Lightbulb className="w-3 h-3 inline mr-2 text-yellow-500" />
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Reflection
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? How did the activity go? Any insights or observations..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          rows={6}
        />
        <div className="mt-1 text-xs text-gray-500">
          {content.length} characters
        </div>
      </div>

      {/* Mood Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How are you feeling?
        </label>
        <div className="flex space-x-2">
          {MOOD_OPTIONS.map(({ value, label, icon: Icon, color }) => (
            <button
              key={value}
              onClick={() => setMood(value)}
              className={`flex-1 p-2 rounded-lg border-2 transition-all text-sm ${
                mood === value
                  ? 'border-indigo-300 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
                <span className="text-xs text-gray-700">{label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        
        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
                <button
                  onClick={() => toggleTag(tag)}
                  className="ml-1 hover:text-indigo-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Common Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {COMMON_TAGS.filter(tag => !selectedTags.includes(tag)).slice(0, 8).map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Custom Tag Input */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
            placeholder="Add custom tag..."
            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={addCustomTag}
            disabled={!customTag.trim()}
            className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={!isFormValid || saving}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
            isFormValid && !saving
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Entry'}</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
        <Calendar className="w-3 h-3 inline mr-1" />
        {new Date().toLocaleDateString()} • Private reflection
      </div>
    </div>
  );
}