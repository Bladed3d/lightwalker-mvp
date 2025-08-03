// Theme Configuration for Lightwalker Daily Actions
// Classic = Light Theme, Gamified = Dark Theme

export type ThemeMode = 'classic' | 'gamified';

export interface ThemeConfig {
  // Page background
  pageBackground: string;
  
  // Header
  headerBackground: string;
  headerBorder: string;
  headerText: string;
  headerSubtext: string;
  
  // Navigation/Menu
  menuBackground: string;
  menuBorder: string;
  menuText: string;
  menuTextHover: string;
  menuActiveBackground: string;
  menuActiveText: string;
  
  // Cards/Panels
  cardBackground: string;
  cardBorder: string;
  cardText: string;
  cardSubtext: string;
  cardHover: string;
  
  // Buttons
  buttonPrimary: string;
  buttonPrimaryHover: string;
  buttonSecondary: string;
  buttonSecondaryHover: string;
  
  // Stats/Metrics
  statsBackground: string;
  statsBorder: string;
  statsText: string;
  statsAccent: string;
  
  // Activity Grid
  gridBackground: string;
  gridBorder: string;
  gridSlotEmpty: string;
  gridSlotEmptyHover: string;
  gridSlotEmptyBorder: string;
  gridTimeText: string;
  
  // Timeline
  timelineBackground: string;
  timelineBorder: string;
  timelineText: string;
  
  // Activity Library
  libraryBackground: string;
  libraryBorder: string;
  libraryText: string;
  libraryCategoryButton: string;
  libraryCategoryButtonActive: string;
}

export const themes: Record<ThemeMode, ThemeConfig> = {
  classic: {
    // Light theme for Classic view
    pageBackground: 'bg-white',
    
    headerBackground: 'bg-white/80 backdrop-blur-sm',
    headerBorder: 'border-indigo-100',
    headerText: 'text-gray-900',
    headerSubtext: 'text-gray-600',
    
    menuBackground: 'bg-white',
    menuBorder: 'border-indigo-100',
    menuText: 'text-gray-700',
    menuTextHover: 'hover:text-indigo-700 hover:bg-indigo-50',
    menuActiveBackground: 'bg-indigo-100',
    menuActiveText: 'text-indigo-700',
    
    cardBackground: 'bg-white',
    cardBorder: 'border-indigo-100',
    cardText: 'text-gray-900',
    cardSubtext: 'text-gray-600',
    cardHover: 'hover:bg-gray-50',
    
    buttonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    buttonPrimaryHover: 'hover:bg-indigo-700',
    buttonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
    buttonSecondaryHover: 'hover:bg-gray-200',
    
    statsBackground: 'bg-indigo-50',
    statsBorder: 'border-indigo-200',
    statsText: 'text-gray-900',
    statsAccent: 'text-indigo-600',
    
    gridBackground: 'bg-white',
    gridBorder: 'border-gray-200',
    gridSlotEmpty: 'bg-gray-50',
    gridSlotEmptyHover: 'hover:bg-gray-100',
    gridSlotEmptyBorder: 'border-gray-300',
    gridTimeText: 'text-gray-500',
    
    timelineBackground: 'bg-white',
    timelineBorder: 'border-gray-200',
    timelineText: 'text-gray-900',
    
    libraryBackground: 'bg-white',
    libraryBorder: 'border-gray-200',
    libraryText: 'text-gray-900',
    libraryCategoryButton: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    libraryCategoryButtonActive: 'bg-indigo-600 text-white'
  },
  
  gamified: {
    // Dark theme for Gamified view
    pageBackground: 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900',
    
    headerBackground: 'bg-slate-800/50 backdrop-blur-sm',
    headerBorder: 'border-slate-700',
    headerText: 'text-white',
    headerSubtext: 'text-slate-400',
    
    menuBackground: 'bg-slate-800/30',
    menuBorder: 'border-slate-700',
    menuText: 'text-slate-300',
    menuTextHover: 'hover:text-white hover:bg-slate-700',
    menuActiveBackground: 'bg-slate-700',
    menuActiveText: 'text-blue-400',
    
    cardBackground: 'bg-slate-800/30',
    cardBorder: 'border-slate-700',
    cardText: 'text-white',
    cardSubtext: 'text-slate-400',
    cardHover: 'hover:bg-slate-700/50',
    
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonPrimaryHover: 'hover:bg-blue-700',
    buttonSecondary: 'bg-slate-700 hover:bg-slate-600 text-white',
    buttonSecondaryHover: 'hover:bg-slate-600',
    
    statsBackground: 'bg-black/20',
    statsBorder: 'border-slate-600',
    statsText: 'text-white',
    statsAccent: 'text-blue-400',
    
    gridBackground: 'bg-gray-900',
    gridBorder: 'border-gray-700',
    gridSlotEmpty: 'bg-gray-800',
    gridSlotEmptyHover: 'hover:bg-gray-700',
    gridSlotEmptyBorder: 'border-gray-600',
    gridTimeText: 'text-gray-400',
    
    timelineBackground: 'bg-slate-800',
    timelineBorder: 'border-slate-700',
    timelineText: 'text-white',
    
    libraryBackground: 'bg-slate-800',
    libraryBorder: 'border-slate-600',
    libraryText: 'text-white',
    libraryCategoryButton: 'bg-slate-700 text-slate-300 hover:bg-slate-600',
    libraryCategoryButtonActive: 'bg-blue-600 text-white'
  }
};

export const getTheme = (mode: ThemeMode): ThemeConfig => {
  return themes[mode];
};