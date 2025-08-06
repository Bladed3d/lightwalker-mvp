/**
 * Grid Layout Utility
 * 
 * Implements Tetris-style optimal packing algorithm for dynamic grid layouts.
 * Handles automatic reorganization when item sizes change.
 */

export interface GridItem {
  id: string;
  title?: string; // Activity title for alphabetical sorting
  w: number;  // Width in grid units
  h: number;  // Height in grid units
  x?: number; // X position (will be calculated)
  y?: number; // Y position (will be calculated)
}

export interface GridPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GridLayout {
  items: Map<string, GridPosition>;
  totalHeight: number;
  gridWidth: number;
}

/**
 * Optimal grid packing algorithm using a "skyline" approach
 * This efficiently finds the best position for each item to minimize empty space
 */
export class GridLayoutEngine {
  private gridWidth: number;
  private occupied: boolean[][];
  
  constructor(gridWidth: number = 10) {
    this.gridWidth = gridWidth;
    this.occupied = [];
  }

  /**
   * Calculate optimal layout for all items
   */
  calculateLayout(items: GridItem[]): GridLayout {
    // Safety check: limit number of items to prevent memory issues
    if (items.length > 50) {
      console.warn('Too many items for grid layout, truncating to 50');
      items = items.slice(0, 50);
    }
    
    // Reset grid
    this.occupied = [];
    const layout = new Map<string, GridPosition>();
    
    // Sort items alphabetically by title for more interesting mixed layouts
    const sortedItems = [...items].sort((a, b) => {
      const titleA = a.title || a.id;
      const titleB = b.title || b.id;
      return titleA.localeCompare(titleB);
    });
    
    for (const item of sortedItems) {
      // Validate item dimensions
      const safeW = Math.min(Math.max(1, item.w), this.gridWidth);
      const safeH = Math.min(Math.max(1, item.h), 10); // Max height of 10
      
      const position = this.findOptimalPosition(safeW, safeH);
      
      if (position) {
        // Mark cells as occupied
        this.markOccupied(position.x, position.y, safeW, safeH);
        
        // Store position
        layout.set(item.id, {
          x: position.x,
          y: position.y,
          w: safeW,
          h: safeH
        });
      } else {
        console.warn(`Could not place item ${item.id} (${safeW}x${safeH})`);
        // Place at bottom as fallback
        const fallbackY = Math.min(this.getCurrentHeight(), 40);
        layout.set(item.id, {
          x: 0,
          y: fallbackY,
          w: safeW,
          h: safeH
        });
      }
    }
    
    const totalHeight = Math.min(this.getCurrentHeight(), 50); // Cap total height
    
    return {
      items: layout,
      totalHeight,
      gridWidth: this.gridWidth
    };
  }

  /**
   * Find the optimal position for an item using skyline algorithm
   */
  private findOptimalPosition(width: number, height: number): { x: number; y: number } | null {
    let bestPosition: { x: number; y: number } | null = null;
    let lowestY = Infinity;
    
    // Safety limit to prevent infinite loops and memory issues
    const maxGridHeight = Math.max(20, this.getCurrentHeight() + height);
    const maxSearchY = Math.min(maxGridHeight, 50); // Cap at reasonable height
    
    // Try every possible position, starting from top-left
    for (let y = 0; y < maxSearchY; y++) {
      for (let x = 0; x <= this.gridWidth - width; x++) {
        if (this.canPlaceAt(x, y, width, height)) {
          // Prefer positions with lower Y (higher on screen)
          // and then leftmost positions for ties
          if (y < lowestY || (y === lowestY && (!bestPosition || x < bestPosition.x))) {
            bestPosition = { x, y };
            lowestY = y;
          }
        }
      }
      
      // Early exit if we found a position in the first few rows
      if (bestPosition && y >= 5) {
        break;
      }
    }
    
    return bestPosition;
  }

  /**
   * Check if an item can be placed at a specific position
   */
  private canPlaceAt(x: number, y: number, width: number, height: number): boolean {
    // Check bounds
    if (x + width > this.gridWidth || x < 0 || y < 0) {
      return false;
    }
    
    // Ensure grid is large enough
    this.ensureGridSize(y + height);
    
    // Check for collisions
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        if (this.occupied[y + dy] && this.occupied[y + dy][x + dx]) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Mark grid cells as occupied
   */
  private markOccupied(x: number, y: number, width: number, height: number): void {
    this.ensureGridSize(y + height);
    
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        if (!this.occupied[y + dy]) {
          this.occupied[y + dy] = [];
        }
        this.occupied[y + dy][x + dx] = true;
      }
    }
  }

  /**
   * Ensure grid array is large enough
   */
  private ensureGridSize(minHeight: number): void {
    // Safety limit to prevent memory issues
    const safeMinHeight = Math.min(minHeight, 100); // Cap at 100 rows max
    
    while (this.occupied.length < safeMinHeight) {
      this.occupied.push(new Array(this.gridWidth).fill(false));
    }
  }

  /**
   * Get current grid height
   */
  private getCurrentHeight(): number {
    return this.occupied.length;
  }
}

/**
 * Apply custom grid sizes from preferences to items
 */
export function applyCustomGridSizes(
  items: GridItem[], 
  preferences: { activityId: string; customGridSize?: { w: number; h: number } }[]
): GridItem[] {
  const preferenceMap = new Map(
    preferences
      .filter(p => p.customGridSize)
      .map(p => [p.activityId, p.customGridSize!])
  );
  
  return items.map(item => ({
    ...item,
    ...(preferenceMap.get(item.id) || { w: item.w, h: item.h })
  }));
}

/**
 * Detect layout changes that require reorganization
 */
export function shouldReorganizeLayout(
  oldItems: GridItem[],
  newItems: GridItem[]
): boolean {
  if (oldItems.length !== newItems.length) {
    return true;
  }
  
  // Check if any item sizes changed
  for (let i = 0; i < oldItems.length; i++) {
    const oldItem = oldItems[i];
    const newItem = newItems.find(item => item.id === oldItem.id);
    
    if (!newItem || oldItem.w !== newItem.w || oldItem.h !== newItem.h) {
      return true;
    }
  }
  
  return false;
}

/**
 * Convert grid layout to CSS Grid styles
 */
export function generateGridStyles(layout: GridLayout, cellSize: number = 100): {
  containerStyle: React.CSSProperties;
  itemStyles: Map<string, React.CSSProperties>;
} {
  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${layout.gridWidth}, ${cellSize}px)`,
    gridAutoRows: `${cellSize}px`, // Use auto-sizing rows instead of fixed template
    gap: '1px', // Small gap for visual separation
    gridAutoFlow: 'row dense'
  };
  
  const itemStyles = new Map<string, React.CSSProperties>();
  
  for (const [itemId, position] of layout.items) {
    itemStyles.set(itemId, {
      gridColumn: `${position.x + 1} / span ${position.w}`,
      gridRow: `${position.y + 1} / span ${position.h}`,
    });
  }
  
  return {
    containerStyle,
    itemStyles
  };
}

/**
 * Animation utilities for smooth transitions
 */
export function calculateLayoutTransitions(
  oldLayout: GridLayout | null,
  newLayout: GridLayout,
  cellSize: number = 100
): Map<string, { from: { x: number; y: number }; to: { x: number; y: number } }> {
  const transitions = new Map();
  
  if (!oldLayout) return transitions;
  
  for (const [itemId, newPos] of newLayout.items) {
    const oldPos = oldLayout.items.get(itemId);
    
    if (oldPos && (oldPos.x !== newPos.x || oldPos.y !== newPos.y)) {
      transitions.set(itemId, {
        from: { x: oldPos.x * cellSize, y: oldPos.y * cellSize },
        to: { x: newPos.x * cellSize, y: newPos.y * cellSize }
      });
    }
  }
  
  return transitions;
}

/**
 * Utility to create GridItem from activity template
 */
export function createGridItemFromActivity(
  activity: { id: string; title?: string; gridSize?: { w: number; h: number } }
): GridItem {
  return {
    id: activity.id,
    title: activity.title,
    w: activity.gridSize?.w || 1,
    h: activity.gridSize?.h || 1
  };
}

/**
 * Debug utility to visualize grid layout
 */
export function visualizeGrid(layout: GridLayout): string {
  const grid: string[][] = [];
  
  // Initialize empty grid
  for (let y = 0; y < layout.totalHeight; y++) {
    grid[y] = new Array(layout.gridWidth).fill('.');
  }
  
  // Fill with item IDs
  for (const [itemId, pos] of layout.items) {
    const symbol = itemId.charAt(0).toUpperCase();
    for (let dy = 0; dy < pos.h; dy++) {
      for (let dx = 0; dx < pos.w; dx++) {
        if (grid[pos.y + dy]) {
          grid[pos.y + dy][pos.x + dx] = symbol;
        }
      }
    }
  }
  
  return grid.map(row => row.join(' ')).join('\n');
}