# Flexible Trait ID System Design

## Discovery Pathway Requirements

### 1. **Role Model Mode** (Top-Down)
- User picks Buddha → sees his traits → picks "Compassionately Wise" → sees Attribute/Problem/Action tabs
- **Flow**: `RoleModel → Trait → SubTrait`
- **Lookup**: `BD.01.ATT`, `BD.01.PRB`, `BD.01.ACT`

### 2. **Problem-First Mode** (Middle-Out)
- User describes problem "I get angry easily" → system shows traits that solve this → links to role models
- **Flow**: `Problem → Trait → RoleModel`
- **Lookup**: Search `problem_tags` → find trait → get `BD.01`

### 3. **Values-First Mode** (Value-Out)
- User picks "Compassion" value → system shows traits+methods that embody this → links to role models  
- **Flow**: `Value → Trait+Method → RoleModel`
- **Lookup**: Search `value_tags` → find trait+method → get `BD.01.ATT`

### 4. **Perfect Day Mode** (Action-Back)
- User describes ideal action "I meditate every morning" → system shows which role models did this → traits that enable it
- **Flow**: `Action → Method → Trait → RoleModel`  
- **Lookup**: Search `action_tags` → find method → get `BD.01.ACT` → trace to `BD.01`

## Proposed ID System

### **Format: `{RM}.{TT}.{ST}`**
- **RM** = Role Model (2-3 chars)
- **TT** = Trait Number (01-99) 
- **ST** = Sub-Trait Type (ATT/PRB/ACT)

### **Role Model Codes**
```
BD = Buddha
SJ = Steve Jobs  
EI = Einstein
BF = Benjamin Franklin
ML = Martin Luther King Jr.
JA = Joan of Arc
GW = Gandhi
DA = Da Vinci
MN = Marcus Aurelius
CO = Confucius
```

### **Examples**
```
BD.01.ATT = Buddha's 1st trait (Compassionately Wise) - Attribute tab
BD.01.PRB = Buddha's 1st trait (Compassionately Wise) - Problem tab  
BD.01.ACT = Buddha's 1st trait (Compassionately Wise) - Action tab

SJ.03.ATT = Steve Jobs' 3rd trait (Obsessively Excellent) - Attribute tab
SJ.03.PRB = Steve Jobs' 3rd trait (Obsessively Excellent) - Problem tab
SJ.03.ACT = Steve Jobs' 3rd trait (Obsessively Excellent) - Action tab
```

## Database Schema

### **RoleModel Table**
```sql
RoleModel {
  id: string (cuid) -- Internal database ID
  code: string -- "BD", "SJ", "EI" (unique, indexed)
  commonName: string -- "Buddha", "Steve Jobs"
  // ... existing fields
}
```

### **Trait Table** 
```sql
Trait {
  id: string (cuid) -- Internal database ID
  traitCode: string -- "BD.01", "SJ.03" (unique, indexed)
  roleModelCode: string -- "BD", "SJ" (foreign key to RoleModel.code)
  traitNumber: int -- 1, 2, 3... (order within role model)
  name: string -- "Compassionately Wise"
  slug: string -- "compassionately-wise"
  
  // Indexable search fields
  problemTags: string[] -- ["anger", "judgment", "conflict"]
  valueTags: string[] -- ["compassion", "empathy", "understanding"]  
  actionTags: string[] -- ["meditation", "pause", "breathe"]
  
  isActive: boolean
  createdAt: DateTime
}
```

### **SubTrait Table** (Attribute/Problem/Action tabs)
```sql
SubTrait {
  id: string (cuid) -- Internal database ID
  subTraitCode: string -- "BD.01.ATT", "BD.01.PRB", "BD.01.ACT"
  traitCode: string -- "BD.01" (foreign key to Trait.traitCode)
  type: enum -- "ATTRIBUTE", "PROBLEM", "ACTION" 
  
  title: string -- "Compassionate Wisdom", "Getting Angry", "Daily Meditation"
  description: string -- Full content for this tab
  method: string -- How the role model practices this
  benefit: string -- What user gains from this
  oppositeOf: string -- What this replaces
  
  // Search optimization
  searchTerms: string[] -- All searchable keywords for this subtrait
  
  isActive: boolean
  createdAt: DateTime
}
```

### **UserCharacterTrait Table** (User selections)
```sql
UserCharacterTrait {
  id: string (cuid)
  characterId: string (foreign key)
  subTraitCode: string -- "BD.01.ATT" (what user actually selected)
  addedAt: DateTime
  order: int
}
```

## Search & Discovery Implementation

### **1. Role Model Mode Query**
```sql
-- Get all traits for Buddha
SELECT t.*, st.* FROM Trait t
JOIN SubTrait st ON t.traitCode = st.traitCode  
WHERE t.roleModelCode = 'BD'
ORDER BY t.traitNumber, st.type
```

### **2. Problem-First Mode Query**
```sql
-- Find traits that solve "anger" problems
SELECT DISTINCT t.roleModelCode, t.traitCode, t.name, rm.commonName
FROM Trait t
JOIN RoleModel rm ON t.roleModelCode = rm.code
WHERE 'anger' = ANY(t.problemTags)
```

### **3. Values-First Mode Query**  
```sql
-- Find traits that embody "compassion" value
SELECT DISTINCT t.*, st.*, rm.commonName
FROM Trait t  
JOIN SubTrait st ON t.traitCode = st.traitCode
JOIN RoleModel rm ON t.roleModelCode = rm.code
WHERE 'compassion' = ANY(t.valueTags)
```

### **4. Perfect Day Mode Query**
```sql
-- Find role models who practiced "meditation" 
SELECT DISTINCT t.*, st.*, rm.commonName
FROM Trait t
JOIN SubTrait st ON t.traitCode = st.traitCode AND st.type = 'ACTION'
JOIN RoleModel rm ON t.roleModelCode = rm.code  
WHERE 'meditation' = ANY(t.actionTags)
```

## ID Benefits

### **✅ Bi-directional Lookup**
- `BD.01.ATT` → Buddha's 1st trait, Attribute tab
- Search "anger" → find `BD.01.PRB` → trace back to Buddha
- Search "meditation" → find `BD.01.ACT` → trace back to Buddha

### **✅ Human Readable**
- Developers can understand `BD.01.ATT` immediately
- URLs can use these: `/trait/BD.01.ATT`
- Easy debugging and logging

### **✅ Scalable**
- Support 99 traits per role model (`01-99`)
- Easy to add new role models with new codes
- Consistent 3-part structure

### **✅ Multi-Pathway Support**
```typescript
// Any discovery mode can find and reference the same trait
const traitRef = "BD.01.ATT"

// All pathways lead to same character building
userCharacter.addTrait(traitRef)

// Display shows Buddha's circle + trait count
const roleModel = traitRef.split('.')[0] // "BD" 
const traitNum = traitRef.split('.')[1]  // "01"
const subType = traitRef.split('.')[2]   // "ATT"
```

## Implementation Priority

### **Phase 1**: Core Structure
1. Create RoleModel codes (`BD`, `SJ`, etc.)
2. Create Trait table with `traitCode` field  
3. Create SubTrait table with `subTraitCode` field

### **Phase 2**: Search Optimization
1. Add `problemTags`, `valueTags`, `actionTags` arrays
2. Build search indexes
3. Create discovery pathway queries

### **Phase 3**: User Integration  
1. Update UserCharacterTrait to use `subTraitCode`
2. Update character synthesis
3. Add role model circle display logic

This system gives you maximum flexibility for all discovery modes while maintaining clean, readable IDs that work both forwards and backwards!