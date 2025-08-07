const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking for duplicate activities...\n')

  // Get all activity preferences
  const allPreferences = await prisma.activityPreference.findMany({
    orderBy: [
      { activityId: 'asc' },
      { sessionId: 'asc' }
    ]
  })

  console.log(`📊 Total activity preferences: ${allPreferences.length}\n`)

  // Group by activityId to find duplicates
  const groupedByActivityId = allPreferences.reduce((groups: Record<string, any[]>, pref: any) => {
    const key = pref.activityId
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(pref)
    return groups
  }, {} as Record<string, any[]>)

  // Find duplicates
  const duplicates = Object.entries(groupedByActivityId).filter(([_, prefs]) => (prefs as any[]).length > 1)
  
  if (duplicates.length > 0) {
    console.log(`⚠️  Found ${duplicates.length} activities with multiple entries:\n`)
    
    duplicates.forEach(([activityId, prefs]) => {
      const prefsArray = prefs as any[]
      console.log(`🔄 Activity: ${activityId} (${prefsArray.length} entries)`)
      prefsArray.forEach((pref: any, index: number) => {
        console.log(`   ${index + 1}. Session: ${pref.sessionId || 'null'}, User: ${pref.userId || 'null'}, Title: ${pref.activityTitle}`)
      })
      console.log()
    })
  } else {
    console.log('✅ No duplicate activityIds found')
  }

  // Show system defaults
  const systemDefaults = allPreferences.filter((p: any) => p.sessionId === 'system-default')
  console.log(`\n🏛️  System defaults: ${systemDefaults.length}`)
  systemDefaults.forEach((pref: any) => {
    console.log(`   - ${pref.activityId}: ${pref.activityTitle}`)
  })

  // Show user preferences
  const userPrefs = allPreferences.filter((p: any) => p.sessionId !== 'system-default')
  console.log(`\n👤 User preferences: ${userPrefs.length}`)
  userPrefs.forEach((pref: any) => {
    console.log(`   - ${pref.activityId}: ${pref.activityTitle} (Session: ${pref.sessionId})`)
  })
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