# Lightwalker Database Schema Redesign

## Current Problems
- Traits stored as JSON strings in `selectedTraits` field
- No proper foreign key relationships
- Can't query by role model efficiently
- Hard to show role model avatars for each trait
- Complex trait ID naming convention mismatches

## Proposed Relational Schema

### 1. RoleModel Table (Keep existing)
```sql
RoleModel {
  id: string (cuid)
  commonName: string  
  fullName: string
  enhancedAttributes: string (JSON) -- REMOVE this field
  // ... all existing fields
}
```

### 2. NEW: Trait Table
```sql
Trait {
  id: string (cuid) -- e.g., "cln1_trait_001" 
  roleModelId: string (foreign key to RoleModel.id)
  name: string -- "Compassionately Wise"
  slug: string -- "compassionately-wise" (for URLs/IDs)
  description: string
  category: string -- "Personal Development"
  benefit: string -- "Helps you respond with empathy..."
  oppositeOf: string -- "Judgmental"
  method: string -- "Buddha's approach: pause, breathe, consider..."
  order: int -- Display order for this role model
  isActive: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 3. NEW: UserCharacterTrait Table (Many-to-Many)
```sql
UserCharacterTrait {
  id: string (cuid)
  characterId: string (foreign key to SavedCharacter.id)
  traitId: string (foreign key to Trait.id)
  addedAt: DateTime
  order: int -- User's ordering of their selected traits
}
```

### 4. Updated SavedCharacter Table
```sql
SavedCharacter {
  id: string (cuid)
  sessionId: string?
  userId: string?
  characterName: string?
  discoveryPoints: int
  level: int
  // REMOVE: selectedTraits field
  isActive: boolean
  lastViewedAt: DateTime
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relations
  userTraits: UserCharacterTrait[]
}
```

## Benefits of New Design

### 1. **Proper Relationships**
```sql
-- Get all traits for a character with role model info
SELECT t.name, t.description, rm.commonName, rm.primaryColor
FROM UserCharacterTrait uct
JOIN Trait t ON uct.traitId = t.id  
JOIN RoleModel rm ON t.roleModelId = rm.id
WHERE uct.characterId = 'character123'
ORDER BY uct.order
```

### 2. **Easy Role Model Circles Display**
```sql
-- Get unique role models for character's trait display
SELECT DISTINCT rm.id, rm.commonName, rm.primaryColor, COUNT(uct.id) as traitCount
FROM UserCharacterTrait uct
JOIN Trait t ON uct.traitId = t.id
JOIN RoleModel rm ON t.roleModelId = rm.id  
WHERE uct.characterId = 'character123'
GROUP BY rm.id, rm.commonName, rm.primaryColor
```

### 3. **Analytics Queries**
```sql
-- Most popular traits across all users
SELECT t.name, rm.commonName, COUNT(uct.id) as usageCount
FROM UserCharacterTrait uct
JOIN Trait t ON uct.traitId = t.id
JOIN RoleModel rm ON t.roleModelId = rm.id
GROUP BY t.id, t.name, rm.commonName
ORDER BY usageCount DESC

-- Users who share similar traits  
SELECT DISTINCT c1.userId, c2.userId
FROM UserCharacterTrait uct1
JOIN SavedCharacter c1 ON uct1.characterId = c1.id
JOIN UserCharacterTrait uct2 ON uct1.traitId = uct2.traitId
JOIN SavedCharacter c2 ON uct2.characterId = c2.id
WHERE c1.userId != c2.userId
```

### 4. **Consistent Trait IDs**
- Database: `traitId: "cln1_trait_buddha_001"`  
- UI: `slug: "compassionately-wise"`
- Display: `name: "Compassionately Wise"`

## Migration Strategy

### Phase 1: Create New Tables
1. Add `Trait` table
2. Add `UserCharacterTrait` table  
3. Keep existing `SavedCharacter.selectedTraits` for now

### Phase 2: Migrate Data
1. Extract traits from each role model's `enhancedAttributes` JSON
2. Create `Trait` records for each trait
3. Parse existing `SavedCharacter.selectedTraits` JSON
4. Create `UserCharacterTrait` records for each user's selections

### Phase 3: Update Code
1. Update character creation to use new trait relations
2. Update character synthesis to use JOIN queries
3. Update discovery component to reference trait IDs
4. Remove `selectedTraits` JSON field

### Phase 4: Add Gamification
1. Role model circle avatars (easy with proper relations)
2. "Trait collection" achievements  
3. "Role model expertise" progression
4. Social features: "Others who chose this trait also chose..."

## Implementation Benefits

### For UI Components:
```typescript
// Easy role model circles
const roleModelSummary = character.userTraits.reduce((acc, userTrait) => {
  const roleModel = userTrait.trait.roleModel
  acc[roleModel.id] = {
    ...roleModel,
    traitCount: (acc[roleModel.id]?.traitCount || 0) + 1
  }
  return acc
}, {})

// Render circles
{Object.values(roleModelSummary).map(rm => 
  <RoleModelCircle 
    roleModel={rm} 
    traitCount={rm.traitCount}
    size={rm.traitCount > 2 ? 'large' : 'small'} 
  />
)}
```

### For Character Synthesis:
```typescript
const character = await prisma.savedCharacter.findUnique({
  where: { id: characterId },
  include: {
    userTraits: {
      include: {
        trait: {
          include: {
            roleModel: true
          }
        }
      },
      orderBy: { order: 'asc' }
    }
  }
})

// Clean, typed data - no JSON parsing needed!
const traits = character.userTraits.map(ut => ut.trait)
const roleModels = [...new Set(traits.map(t => t.roleModel))]
```

This design makes the database much more queryable, performant, and enables rich gamification features!