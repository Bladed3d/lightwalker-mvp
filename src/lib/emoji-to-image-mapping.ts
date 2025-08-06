/**
 * Emoji to Custom Image Mapping System
 * 
 * This system allows you to replace timeline emojis with custom graphics you've created.
 * When an activity has an emoji icon, it will check if there's a custom image available.
 * 
 * Usage: Update the mapping below to connect emojis to your custom images.
 */

export interface EmojiMapping {
  emoji: string;
  customImagePath: string;
  activityName: string;
  description?: string;
}

/**
 * Map timeline emojis to custom images
 * Add your custom graphics here to replace emojis in both timeline and Activity Grid
 */
export const EMOJI_TO_IMAGE_MAPPINGS: EmojiMapping[] = [
  // Physical Activities
  {
    emoji: '🚿',
    customImagePath: '/activity-icons/bath.jpg', // Your custom bath image
    activityName: 'Bath',
    description: 'Custom bath/shower graphic'
  },
  {
    emoji: '🏃',
    customImagePath: '/activity-icons/running.jpg', // Already exists
    activityName: 'Run',
    description: 'Running/exercise graphic'
  },
  {
    emoji: '🚶',
    customImagePath: '/activity-icons/walking.jpg', // If you have a custom walking image
    activityName: 'Walk',
    description: 'Walking graphic'
  },
  {
    emoji: '💪',
    customImagePath: '/activity-icons/training.jpg', // If you have a custom training image
    activityName: 'Train',
    description: 'Training/workout graphic'
  },
  
  // Mental/Spiritual Activities
  {
    emoji: '🧘',
    customImagePath: '/activity-icons/meditation.jpg', // Already exists
    activityName: 'Meditate',
    description: 'Meditation graphic'
  },
  {
    emoji: '✍️',
    customImagePath: '/activity-icons/reflection.jpg', // If you have a custom reflection image
    activityName: 'Reflect',
    description: 'Reflection/journaling graphic'
  },
  
  // Creative Activities
  {
    emoji: '🎨',
    customImagePath: '/activity-icons/create.jpg', // If you have a custom create image
    activityName: 'Create',
    description: 'Creative work graphic'
  },
  {
    emoji: '💡',
    customImagePath: '/activity-icons/innovation-session.jpg', // Already exists
    activityName: 'Innovate',
    description: 'Innovation/ideation graphic'
  },
  
  // Learning Activities
  {
    emoji: '📖',
    customImagePath: '/activity-icons/reading.jpg', // If you have a custom reading image
    activityName: 'Read',
    description: 'Reading graphic'
  },
  {
    emoji: '📚',
    customImagePath: '/activity-icons/learn.jpg', // Already exists
    activityName: 'Learn',
    description: 'Learning graphic'
  },
  
  // Social Activities
  {
    emoji: '👥',
    customImagePath: '/activity-icons/connect.jpg', // If you have a custom connect image
    activityName: 'Connect',
    description: 'Social connection graphic'
  },
  {
    emoji: '👨‍👩‍👧',
    customImagePath: '/activity-icons/family.jpg', // If you have a custom family image
    activityName: 'Bond',
    description: 'Family bonding graphic'
  },
  
  // Work Activities
  {
    emoji: '💻',
    customImagePath: '/activity-icons/deep-work.jpg', // If you have a custom work image
    activityName: 'Deep Work',
    description: 'Deep work/focus graphic'
  },
  
  // Add more mappings as you create custom graphics...
];

/**
 * Get custom image for an emoji, fallback to emoji if no mapping exists
 */
export function getImageForEmoji(emoji: string, activityName?: string): string {
  // Debug logging for Read activity
  if (activityName?.toLowerCase().includes('read')) {
    console.warn('🔍 EMOJI MAPPING DEBUG - Read Activity:', {
      inputEmoji: emoji,
      inputActivityName: activityName,
      isAlreadyCustomImage: emoji.startsWith('/') || emoji.startsWith('data:')
    });
  }
  
  // If it's already a custom image (starts with / or data:), don't override it
  if (emoji.startsWith('/') || emoji.startsWith('data:')) {
    if (activityName?.toLowerCase().includes('read')) {
      console.warn('🔍 EMOJI MAPPING - Keeping existing custom image for Read');
    }
    return emoji;
  }
  
  // First try to match by emoji
  const emojiMapping = EMOJI_TO_IMAGE_MAPPINGS.find(mapping => mapping.emoji === emoji);
  if (emojiMapping) {
    if (activityName?.toLowerCase().includes('read')) {
      console.warn('🔍 EMOJI MAPPING - Found emoji mapping for Read:', emojiMapping);
    }
    return emojiMapping.customImagePath;
  }
  
  // If no emoji match, try to match by activity name
  if (activityName) {
    const nameMapping = EMOJI_TO_IMAGE_MAPPINGS.find(mapping => 
      mapping.activityName.toLowerCase() === activityName.toLowerCase()
    );
    if (nameMapping) {
      if (activityName?.toLowerCase().includes('read')) {
        console.warn('🔍 EMOJI MAPPING - Found name mapping for Read:', nameMapping);
      }
      return nameMapping.customImagePath;
    }
  }
  
  // Fallback to original emoji
  if (activityName?.toLowerCase().includes('read')) {
    console.warn('🔍 EMOJI MAPPING - No mapping found, returning original:', emoji);
  }
  return emoji;
}

/**
 * Check if an emoji has a custom image replacement
 */
export function hasCustomImage(emoji: string): boolean {
  return EMOJI_TO_IMAGE_MAPPINGS.some(mapping => mapping.emoji === emoji);
}

/**
 * Get all available custom image mappings (for UI display)
 */
export function getAllCustomMappings(): EmojiMapping[] {
  return EMOJI_TO_IMAGE_MAPPINGS;
}