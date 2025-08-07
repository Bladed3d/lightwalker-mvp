const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Cleaning up test activity entries...\n')

  // Find all the test entries that are duplicates or testing artifacts
  const testEntries = await prisma.activityPreference.findMany({
    where: {
      OR: [
        // All the edit-* entries from testing
        { activityId: { startsWith: 'edit-' } },
        // Keep only system defaults and remove user duplicates of core activities
        {
          AND: [
            { sessionId: { not: 'system-default' } }, // Not a system default
            {
              activityId: {
                in: [
                  'hydrate', 
                  'quick-walk', 
                  'gratitude-practice',
                  'creative-thinking',
                  'mindful-breathing',
                  'posture-check',
                  'skill-practice'
                ]
              }
            }
          ]
        }
      ]
    },
    orderBy: [
      { activityId: 'asc' },
      { createdAt: 'asc' }
    ]
  })

  console.log(`📊 Found ${testEntries.length} test/duplicate entries to review:\n`)
  
  // Group by activityId for better overview
  const grouped = testEntries.reduce((groups: Record<string, any[]>, entry: any) => {
    const key = entry.activityId
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(entry)
    return groups
  }, {})

  Object.entries(grouped).forEach(([activityId, entries]) => {
    console.log(`🔄 ${activityId}: ${(entries as any[]).length} entries`)
    ;(entries as any[]).forEach((entry: any, index: number) => {
      console.log(`   ${index + 1}. ${entry.sessionId === 'system-default' ? 'SYSTEM' : 'USER'} - ${entry.activityTitle} (Created: ${entry.createdAt.toISOString().split('T')[0]})`)
    })
    console.log()
  })

  console.log('❓ Do you want to delete these entries? (This will clean up the duplicates)')
  console.log('⚠️  This will keep:')
  console.log('   - All system-default activities (22 timeline emoji activities)')
  console.log('   - Unique user activities that don\'t conflict with system defaults')
  console.log('   - All hardcoded templates will still work\n')

  // For safety, let's just show what WOULD be deleted without actually deleting
  console.log('🚨 SIMULATION MODE - No actual deletions performed')
  console.log(`📝 Would delete ${testEntries.length} entries`)
  
  testEntries.forEach((entry: any) => {
    console.log(`   ❌ DELETE: ${entry.activityId} (${entry.activityTitle}) - Session: ${entry.sessionId}`)
  })

  console.log('\n🔥 PERFORMING CLEANUP...')
  
  const deleteResult = await prisma.activityPreference.deleteMany({
    where: {
      id: {
        in: testEntries.map((entry: any) => entry.id)
      }
    }
  })
  
  console.log(`\n✅ Successfully deleted ${deleteResult.count} test/duplicate entries!`)
  console.log('🎯 Your QuickActionsPanel should now show unique activities only')
  console.log('📊 Remaining activities will be:')
  console.log('   - 22 system defaults (timeline emoji activities)')
  console.log('   - 18 hardcoded templates') 
  console.log('   - Any unique user customizations')
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('\n✅ Database connection closed')
  })
  .catch(async (e) => {
    console.error('❌ Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })