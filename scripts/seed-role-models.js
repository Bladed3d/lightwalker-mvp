const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Core role models to populate initially
const roleModelsData = [
  {
    fullName: "Steven Paul Jobs",
    commonName: "Steve Jobs",
    lifeSpan: "1955-2011 (56 years)",
    culturalContext: "American technology industry, middle-class adoption background",
    historicalPeriod: "Digital revolution, personal computer era, mobile technology transformation",
    primaryDomain: "Innovation and technology leadership",
    lifeMission: "Create technology products that are intuitive, beautiful, and transform how people live",
    coreValues: [
      "Perfectionism in design and user experience",
      "Simplicity over complexity", 
      "Revolutionary thinking over incremental improvement",
      "User needs over technical specifications",
      "Aesthetic beauty as functional necessity",
      "Focus over feature proliferation",
      "Control over distribution and experience"
    ],
    valueHierarchy: [
      "User experience",
      "Design beauty", 
      "Technical innovation",
      "Market success",
      "Personal recognition"
    ],
    worldview: "Technology should serve humanity by being invisible and intuitive; great products require obsessive attention to details others ignore",
    personalPhilosophy: "Stay hungry, stay foolish - continuous learning and risk-taking; perfection through iteration and elimination",
    dominantTraits: [
      "Perfectionist - obsessed with details others missed",
      "Visionary - seeing future products before markets knew they wanted them",
      "Demanding - high standards for self and others",
      "Intuitive - making decisions based on feel rather than data alone",
      "Focused - saying no to 99% of ideas to perfect the 1%",
      "Magnetic - inspiring others to achieve beyond their perceived limits",
      "Impatient - wanting rapid iteration and improvement"
    ],
    communicationStyle: "Direct, passionate, storytelling through demonstrations, using metaphors and analogies",
    emotionalPatterns: "Intense enthusiasm for great work, frustration with mediocrity, binary thinking (brilliant or shit)",
    socialInteractionStyle: "Charismatic leadership through vision-sharing, demanding but inspiring, creating reality distortion field",
    learningApproach: "Hands-on experimentation, studying great design across industries, learning from customer observation",
    decisionProcess: {
      annualRetreat: "What are the 10 things we should be doing next?",
      elimination: "Ruthless elimination: Slash 7 items, focus on only 3 priorities",
      philosophy: "Deciding what not to do is as important as deciding what to do"
    },
    informationGathering: "Customer observation, market sensing, technology trend analysis, competitive intelligence",
    evaluationCriteria: "User experience impact, design elegance, technical feasibility, market disruption potential",
    riskAssessment: "Calculated risks on breakthrough technologies, betting company on revolutionary products",
    implementationStyle: "Rapid prototyping, iterative perfection, hands-on involvement in every detail",
    morningPractices: "Early rising (6 AM), meditation, reviewing overnight emails, strategic thinking time",
    workPatterns: "12-16 hour workdays, deep focus sessions, walking meetings for creative thinking",
    physicalPractices: "Regular walking, minimal but consistent exercise, attention to diet during health crisis",
    mentalSpiritualPractices: "Zen meditation, calligraphy study, contemplation of Eastern philosophy",
    eveningRoutines: "Family time, reading, reflection on daily progress, planning next day priorities",
    weeklyMonthlyRhythms: "Monday strategy sessions, Friday product reviews, monthly innovation retreats",
    stressManagement: "Meditation, walking, intense focus on solutions rather than problems",
    conflictResolution: "Direct confrontation of issues, clear expectations, performance-based decisions",
    failureResponse: "Rapid learning from failure, immediate course correction, treating setbacks as iteration",
    crisisLeadership: "Calm determination, clear vision communication, making hard decisions quickly",
    adaptationStrategies: "Continuous market sensing, willingness to cannibalize own products, embracing disruption",
    coreTeachings: "Focus on user experience above all; simplicity is the ultimate sophistication; perfection through subtraction",
    famousQuotes: [
      "Stay hungry, stay foolish",
      "Design is not just what it looks like - design is how it works",
      "Innovation distinguishes between a leader and a follower",
      "Simplicity is the ultimate sophistication",
      "Think different"
    ],
    teachingMethods: "Demonstration over explanation, learning through product creation, mentoring through challenging standards",
    keyPrinciples: "User-first design, elegant simplicity, controlled ecosystem, iterative perfection",
    practicalApplications: "Product development methodology, design thinking, strategic focus, team inspiration",
    familyRelationships: "Devoted to children, learning to balance work and family, expressing love through shared experiences",
    friendshipPatterns: "Few but deep relationships, loyalty to those who shared vision, challenging friends to excellence",
    mentorshipStyle: "High expectations, direct feedback, inspiring through possibility, developing design sensibility",
    leadershipApproach: "Vision-driven, demanding excellence, creating possibility for others, leading by example",
    conflictHandling: "Direct address of issues, performance-based decisions, clear expectations and accountability",
    contemporaryRelevance: "Product development, design thinking, strategic focus, innovation leadership in digital age",
    dailyLifeApplications: "Simplifying daily routines, focusing on essential priorities, iterative improvement of personal systems",
    decisionTemplates: [
      "What would create the best user experience?",
      "How can this be simplified?",
      "What are we saying no to?",
      "Does this advance our core mission?"
    ],
    characterDevelopment: "Developing design sensibility, focus and elimination skills, perfectionist standards with iteration mindset",
    commonMisinterpretations: "Perfectionism as never shipping; focus as rigidity; demanding standards as personal cruelty",
    personalitySynthesis: "Combine Jobs' perfectionism with user empathy, his focus with flexibility for personal growth",
    decisionConsultation: "Frame decisions around user experience and elegant simplicity; ask what would create most impact",
    situationalApplications: "Product development, career decisions, creative projects, leadership challenges",
    potentialConflicts: "May conflict with collaborative styles, could override emotional intelligence needs",
    userImplementation: "Daily prioritization practice, design thinking application, perfectionist iteration approach",
    primarySources: "Walter Isaacson biography, Apple keynote speeches, internal memos and emails",
    historicalSources: "Contemporary business press coverage, colleague interviews, Apple product development records",
    academicSources: "Business school case studies, innovation research, design thinking methodology papers",
    culturalSources: "Technology industry oral histories, Silicon Valley cultural documentation",
    sourceQualityAssessment: "High reliability from authorized biography and direct documentation; some mythology in popular culture",
    historicalAccuracy: "Well-documented life with verified timeline and decisions; some personality interpretations vary",
    quoteAuthentication: "Famous quotes verified through video/audio records and written documentation",
    culturalSensitivity: "Represents Silicon Valley innovation culture; respectful of Eastern philosophical influences",
    balancedPerspective: "Acknowledges both visionary leadership and demanding interpersonal style",
    scholarlyConsensus: "Widely recognized as transformative leader; debates continue on management style effectiveness"
  }
]

async function seedRoleModels() {
  console.log('🌱 Starting role model seeding...')

  try {
    // Clear existing role models if any
    await prisma.roleModel.deleteMany({})
    console.log('🧹 Cleared existing role models')

    // Insert each role model
    for (const roleModel of roleModelsData) {
      const created = await prisma.roleModel.create({
        data: {
          fullName: roleModel.fullName,
          commonName: roleModel.commonName,
          lifeSpan: roleModel.lifeSpan,
          culturalContext: roleModel.culturalContext,
          historicalPeriod: roleModel.historicalPeriod,
          primaryDomain: roleModel.primaryDomain,
          lifeMission: roleModel.lifeMission,
          coreValues: JSON.stringify(roleModel.coreValues),
          valueHierarchy: JSON.stringify(roleModel.valueHierarchy),
          worldview: roleModel.worldview,
          personalPhilosophy: roleModel.personalPhilosophy,
          dominantTraits: JSON.stringify(roleModel.dominantTraits),
          communicationStyle: roleModel.communicationStyle,
          emotionalPatterns: roleModel.emotionalPatterns,
          socialInteractionStyle: roleModel.socialInteractionStyle,
          learningApproach: roleModel.learningApproach,
          decisionProcess: JSON.stringify(roleModel.decisionProcess),
          informationGathering: roleModel.informationGathering,
          evaluationCriteria: roleModel.evaluationCriteria,
          riskAssessment: roleModel.riskAssessment,
          implementationStyle: roleModel.implementationStyle,
          morningPractices: roleModel.morningPractices,
          workPatterns: roleModel.workPatterns,
          physicalPractices: roleModel.physicalPractices,
          mentalSpiritualPractices: roleModel.mentalSpiritualPractices,
          eveningRoutines: roleModel.eveningRoutines,
          weeklyMonthlyRhythms: roleModel.weeklyMonthlyRhythms,
          stressManagement: roleModel.stressManagement,
          conflictResolution: roleModel.conflictResolution,
          failureResponse: roleModel.failureResponse,
          crisisLeadership: roleModel.crisisLeadership,
          adaptationStrategies: roleModel.adaptationStrategies,
          coreTeachings: roleModel.coreTeachings,
          famousQuotes: JSON.stringify(roleModel.famousQuotes),
          teachingMethods: roleModel.teachingMethods,
          keyPrinciples: roleModel.keyPrinciples,
          practicalApplications: roleModel.practicalApplications,
          familyRelationships: roleModel.familyRelationships,
          friendshipPatterns: roleModel.friendshipPatterns,
          mentorshipStyle: roleModel.mentorshipStyle,
          leadershipApproach: roleModel.leadershipApproach,
          conflictHandling: roleModel.conflictHandling,
          contemporaryRelevance: roleModel.contemporaryRelevance,
          dailyLifeApplications: roleModel.dailyLifeApplications,
          decisionTemplates: JSON.stringify(roleModel.decisionTemplates),
          characterDevelopment: roleModel.characterDevelopment,
          commonMisinterpretations: roleModel.commonMisinterpretations,
          personalitySynthesis: roleModel.personalitySynthesis,
          decisionConsultation: roleModel.decisionConsultation,
          situationalApplications: roleModel.situationalApplications,
          potentialConflicts: roleModel.potentialConflicts,
          userImplementation: roleModel.userImplementation,
          primarySources: roleModel.primarySources,
          historicalSources: roleModel.historicalSources,
          academicSources: roleModel.academicSources,
          culturalSources: roleModel.culturalSources,
          sourceQualityAssessment: roleModel.sourceQualityAssessment,
          historicalAccuracy: roleModel.historicalAccuracy,
          quoteAuthentication: roleModel.quoteAuthentication,
          culturalSensitivity: roleModel.culturalSensitivity,
          balancedPerspective: roleModel.balancedPerspective,
          scholarlyConsensus: roleModel.scholarlyConsensus,
        }
      })
      
      console.log(`✅ Created role model: ${created.commonName}`)
    }

    console.log(`🎉 Successfully seeded ${roleModelsData.length} role models!`)

  } catch (error) {
    console.error('❌ Error seeding role models:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedRoleModels()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })