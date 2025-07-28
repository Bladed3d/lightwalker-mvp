/**
 * Migration Script: Convert from JSON-based traits to relational schema
 * 
 * This script:
 * 1. Adds role model codes to existing role models
 * 2. Extracts traits from enhancedAttributes JSON and creates Trait records
 * 3. Creates SubTrait records for each trait (ATTRIBUTE, PROBLEM, ACTION tabs)
 * 4. Migrates existing SavedCharacter.selectedTraits to UserCharacterTrait records
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Role model codes mapping
const ROLE_MODEL_CODES: Record<string, string> = {
  'Buddha': 'BD',
  'Steve Jobs': 'SJ', 
  'Albert Einstein': 'EI',
  'Benjamin Franklin': 'BF',
  'Martin Luther King Jr.': 'ML',
  'Joan of Arc': 'JA',
  'Mahatma Gandhi': 'GH',
  'Leonardo da Vinci': 'DV',
  'Marcus Aurelius': 'MA',
  'Confucius': 'CO',
  'Nelson Mandela': 'NM',
  'Eleanor Roosevelt': 'ER',
  'Winston Churchill': 'WC',
  'Marie Curie': 'MC',
  'Frida Kahlo': 'FK',
  'Frederick Douglass': 'FD',
  'Ralph Waldo Emerson': 'RE',
  'Maya Angelou': 'MY',
  'Socrates': 'SC',
  'Lao Tzu': 'LT',
  'Rumi': 'RM',
  'Viktor Frankl': 'VF'
}

async function migrateSchema() {
  console.log('🚀 Starting migration to relational schema...')

  try {
    // Step 1: Add codes to existing role models
    console.log('\n📝 Step 1: Adding codes to role models...')
    const roleModels = await prisma.roleModel.findMany({
      where: { isActive: true }
    })
    
    for (const roleModel of roleModels) {
      const code = ROLE_MODEL_CODES[roleModel.commonName]
      if (code) {
        await prisma.roleModel.update({
          where: { id: roleModel.id },
          data: { code }
        })
        console.log(`✅ ${roleModel.commonName} → ${code}`)
      } else {
        console.log(`⚠️  No code found for: ${roleModel.commonName}`)
      }
    }

    // Step 2: Extract traits from enhancedAttributes and create Trait/SubTrait records
    console.log('\n📝 Step 2: Extracting traits from enhancedAttributes...')
    
    const roleModelsWithAttributes = await prisma.roleModel.findMany({
      where: { 
        isActive: true,
        enhancedAttributes: { not: null }
      }
    })

    for (const roleModel of roleModelsWithAttributes) {
      if (!roleModel.enhancedAttributes || !roleModel.code) continue
      
      try {
        const enhancedAttributes = JSON.parse(roleModel.enhancedAttributes)
        console.log(`\n🔍 Processing ${roleModel.commonName} (${roleModel.code}) - ${enhancedAttributes.length} traits`)
        
        for (let i = 0; i < enhancedAttributes.length; i++) {
          const attr = enhancedAttributes[i]
          const traitNumber = i + 1
          const traitCode = `${roleModel.code}.${traitNumber.toString().padStart(2, '0')}`
          
          // Create slug from name
          const slug = attr.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          
          // Create Trait record
          const trait = await prisma.trait.create({
            data: {
              traitCode,
              roleModelCode: roleModel.code,
              traitNumber,
              name: attr.name,
              slug,
              // TODO: Add proper tag extraction logic based on attribute content
              problemTags: extractProblemTags(attr),
              valueTags: extractValueTags(attr),
              actionTags: extractActionTags(attr),
              isActive: true
            }
          })
          
          // Create SubTrait records for each tab type
          const subTraitTypes = [
            {
              type: 'ATTRIBUTE',
              title: attr.name,
              description: attr.description || '',
              method: attr.method || `${roleModel.commonName}'s approach to ${attr.name.toLowerCase()}`,
              benefit: attr.benefit || `Develops ${attr.name.toLowerCase()}`,
              oppositeOf: attr.oppositeOf || null
            },
            {
              type: 'PROBLEM', 
              title: `Struggling with ${attr.oppositeOf || 'challenges'}`,
              description: `When you find yourself ${attr.oppositeOf?.toLowerCase() || 'struggling'}, this trait helps you respond differently.`,
              method: `${roleModel.commonName} would pause and apply ${attr.name.toLowerCase()}`,
              benefit: `Transforms ${attr.oppositeOf?.toLowerCase() || 'difficulties'} into growth opportunities`,
              oppositeOf: attr.oppositeOf || null
            },
            {
              type: 'ACTION',
              title: `Daily ${attr.name} Practice`,
              description: `Specific daily actions to develop ${attr.name.toLowerCase()}.`,
              method: attr.method || `Practice ${attr.name.toLowerCase()} through mindful daily actions`,
              benefit: `Builds consistent ${attr.name.toLowerCase()} habits`,
              oppositeOf: attr.oppositeOf || null
            }
          ]
          
          for (const subTraitData of subTraitTypes) {
            const subTraitCode = `${traitCode}.${subTraitData.type.substring(0, 3)}`
            
            await prisma.subTrait.create({
              data: {
                subTraitCode,
                traitCode: trait.traitCode,
                type: subTraitData.type,
                title: subTraitData.title,
                description: subTraitData.description,
                method: subTraitData.method,
                benefit: subTraitData.benefit,
                oppositeOf: subTraitData.oppositeOf,
                searchTerms: generateSearchTerms(subTraitData.title, subTraitData.description),
                isActive: true
              }
            })
          }
          
          console.log(`  ✅ Created trait: ${traitCode} - ${attr.name}`)
        }
      } catch (error) {
        console.error(`❌ Error processing ${roleModel.commonName}:`, error)
      }
    }

    // Step 3: Migrate existing character data
    console.log('\n📝 Step 3: Migrating existing character data...')
    
    const existingCharacters = await prisma.savedCharacter.findMany({
      where: { isActive: true }
    })
    
    for (const character of existingCharacters) {
      if (!character.selectedTraits) continue
      
      try {
        const selectedTraits = JSON.parse(character.selectedTraits)
        console.log(`\n👤 Migrating character ${character.id} with ${selectedTraits.length} traits`)
        
        for (let i = 0; i < selectedTraits.length; i++) {
          const selectedTrait = selectedTraits[i]
          
          // Try to find matching SubTrait by converting the old naming convention
          const titleCaseTraitName = selectedTrait.traitId
            .split('-')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          
          // Find the role model code
          const roleModel = await prisma.roleModel.findUnique({
            where: { id: selectedTrait.roleModelId }
          })
          
          if (!roleModel?.code) {
            console.log(`  ⚠️  Could not find role model for ID: ${selectedTrait.roleModelId}`)
            continue
          }
          
          // Find matching trait by name and role model
          const trait = await prisma.trait.findFirst({
            where: {
              name: titleCaseTraitName,
              roleModelCode: roleModel.code
            }
          })
          
          if (!trait) {
            console.log(`  ⚠️  Could not find trait: ${titleCaseTraitName} for ${roleModel.commonName}`)
            continue
          }
          
          // Default to ATTRIBUTE tab for migrated data
          const subTraitCode = `${trait.traitCode}.ATT`
          
          // Create UserCharacterTrait record
          await prisma.userCharacterTrait.create({
            data: {
              characterId: character.id,
              subTraitCode,
              order: i + 1
            }
          })
          
          console.log(`  ✅ Migrated: ${selectedTrait.traitName} → ${subTraitCode}`)
        }
      } catch (error) {
        console.error(`❌ Error migrating character ${character.id}:`, error)
      }
    }

    console.log('\n🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Helper functions for tag extraction
function extractProblemTags(attr: any): string[] {
  const tags: string[] = []
  if (attr.oppositeOf) {
    tags.push(attr.oppositeOf.toLowerCase())
  }
  // Add more intelligent tag extraction logic here
  return tags
}

function extractValueTags(attr: any): string[] {
  const tags: string[] = []
  // Extract value-related keywords from description
  const valueLike = ['compassion', 'wisdom', 'creativity', 'excellence', 'innovation', 'peace']
  const text = (attr.description || '').toLowerCase()
  valueLike.forEach(value => {
    if (text.includes(value)) tags.push(value)
  })
  return Array.from(new Set(tags))
}

function extractActionTags(attr: any): string[] {
  const tags: string[] = []
  // Extract action-related keywords
  const actionLike = ['meditation', 'practice', 'exercise', 'study', 'create', 'build']
  const text = (attr.method || attr.description || '').toLowerCase()
  actionLike.forEach(action => {
    if (text.includes(action)) tags.push(action)
  })
  return Array.from(new Set(tags))
}

function generateSearchTerms(title: string, description: string): string[] {
  const terms = [
    ...title.toLowerCase().split(/\s+/),
    ...description.toLowerCase().split(/\s+/)
  ]
  // Filter out common words and duplicates
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
  return Array.from(new Set(terms.filter(term => term.length > 2 && !stopWords.includes(term))))
}

// Run migration if called directly
if (require.main === module) {
  migrateSchema()
    .then(() => {
      console.log('Migration completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration failed:', error)
      process.exit(1)
    })
}

module.exports = { migrateSchema }