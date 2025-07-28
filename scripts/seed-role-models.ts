import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface RoleModelData {
  fullName: string
  commonName: string
  lifeSpan: string
  culturalContext: string
  historicalPeriod: string
  primaryDomain: string
  lifeMission: string
  coreValues: string[]
  valueHierarchy: string[]
  worldview: string
  personalPhilosophy: string
  dominantTraits: string[]
  communicationStyle: string
  emotionalPatterns: string
  socialInteractionStyle: string
  learningApproach: string
  decisionProcess: object
  informationGathering: string
  evaluationCriteria: string
  riskAssessment: string
  implementationStyle: string
  morningPractices: string
  workPatterns: string
  physicalPractices: string
  mentalSpiritualPractices: string
  eveningRoutines: string
  weeklyMonthlyRhythms: string
  stressManagement: string
  conflictResolution: string
  failureResponse: string
  crisisLeadership: string
  adaptationStrategies: string
  coreTeachings: string
  famousQuotes: string[]
  teachingMethods: string
  keyPrinciples: string
  practicalApplications: string
  familyRelationships: string
  friendshipPatterns: string
  mentorshipStyle: string
  leadershipApproach: string
  conflictHandling: string
  contemporaryRelevance: string
  dailyLifeApplications: string
  decisionTemplates: string[]
  characterDevelopment: string
  commonMisinterpretations: string
  personalitySynthesis: string
  decisionConsultation: string
  situationalApplications: string
  potentialConflicts: string
  userImplementation: string
  primarySources: string
  historicalSources: string
  academicSources: string
  culturalSources: string
  sourceQualityAssessment: string
  historicalAccuracy: string
  quoteAuthentication: string
  culturalSensitivity: string
  balancedPerspective: string
  scholarlyConsensus: string
}

// Role models from comprehensive research profiles
// Data sourced from: docs/role-model-profiles-comprehensive.md
const roleModelsData: RoleModelData[] = [
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
      philosophy: "Deciding what not to do is as important as deciding what to do",
      collaboration: "Deep collaboration and concurrent engineering across departments",
      iteration: "Iterate daily without formal presentations or dumb-ass PowerPoints",
      fluidity: "Make decisions fluid through constant refinement"
    },
    informationGathering: "Direct customer observation, studying great design across industries, hands-on product testing, hash out issues from various department perspectives",
    evaluationCriteria: "Does it delight users? Is it simple? Does it feel magical? Can we control the entire experience? Three-click rule for interface navigation",
    riskAssessment: "Willing to bet company on breakthrough products; avoided incremental improvements; We can take full responsibility for the user experience",
    implementationStyle: "Small integrated teams, rapid prototyping, perfectionist refinement, no formal design reviews to keep decisions fluid",
    morningPractices: "Woke at 6:00 AM (I'm a good morning person), Zen Buddhist meditation to center himself and clear his mind, Wore identical outfit daily (black turtleneck, jeans) to eliminate decision fatigue, Started working at home by 6:30 AM with sophisticated T1 line setup, Worked 3 hours at home before going to office",
    workPatterns: "Made email address public, responded to 100+ emails daily, Averaged 10 phone calls daily between Apple and Pixar, Conducted walking meetings believing they stimulated creative thinking, Long, uninterrupted deep work sessions on product design, Hands-on testing of every product detail personally",
    physicalPractices: "Extremely restrictive fruitarian diet, sometimes eating only one fruit/vegetable for weeks, Periods of fasting for up to a week, breaking only with water and leafy vegetables, Long walks for creative thinking and problem-solving, Standing and walking during meetings when possible",
    mentalSpiritualPractices: "Daily Zen meditation practice for focus and clarity, Regular periods of solitude for deep thinking, Studying great design and craftsmanship across disciplines, Evening journaling to write down thoughts, ideas, and experiences",
    eveningRoutines: "Home every evening by 5:30 PM for family dinner (documented by Walter Isaacson), Family meals with healthy, organic, mostly plant-based food from their garden, Drank hot herbal tea, often with fresh herbs like lemon verbena, Final hour meditating and/or listening to music, Personal reflection and journaling",
    weeklyMonthlyRhythms: "Annual executive retreats where he'd slash project lists from 10 to 3 priorities, Regular product review meetings with obsessive detail focus, Quarterly strategic planning with radical focus decisions",
    stressManagement: "Took walks to think through problems; focused on controlling what he could control",
    conflictResolution: "Direct confrontation of issues; didn't avoid difficult conversations; focused on what's best for the product/user",
    failureResponse: "Used failures as learning opportunities; focused on rapid iteration and improvement; failure is a byproduct of innovation",
    crisisLeadership: "Took personal control of critical situations; made rapid decisions with incomplete information; communicated vision clearly",
    adaptationStrategies: "Reinvented entire business models when technology shifted; willing to cannibalize own products for better ones",
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
  },
  {
    fullName: "Sir Isaac Newton",
    commonName: "Isaac Newton",
    lifeSpan: "1643-1727 (84 years)",
    culturalContext: "English, born during scientific revolution, rural farming background but educated at Cambridge",
    historicalPeriod: "Scientific Revolution, age of Enlightenment, pre-industrial England",
    primaryDomain: "Mathematical physics and natural philosophy",
    lifeMission: "Understand the mathematical laws governing the natural world",
    coreValues: [
      "Pursuit of absolute truth through mathematics",
      "Systematic observation and experimentation",
      "Logical reasoning over accepted authority",
      "Precision and accuracy in all work",
      "Solitude and concentration for deep thinking",
      "Divine order underlying natural phenomena",
      "Intellectual integrity and honesty"
    ],
    valueHierarchy: [
      "Truth discovery",
      "Mathematical precision",
      "Experimental verification",
      "Recognition",
      "Social approval"
    ],
    worldview: "Universe operates according to discoverable mathematical laws; human reason can comprehend divine order",
    personalPhilosophy: "I do not make hypotheses - conclusions must be based on evidence and mathematical proof",
    dominantTraits: [
      "Intensely focused - could work for days without breaks",
      "Methodical - systematic approach to every problem",
      "Solitary - preferred working alone for extended periods",
      "Perfectionist - revised work countless times for accuracy",
      "Curious - investigated everything from alchemy to theology",
      "Persistent - worked on problems for years without giving up",
      "Detail-oriented - noticed patterns others missed"
    ],
    communicationStyle: "Precise, mathematical, avoided speculation, preferred written over verbal communication",
    emotionalPatterns: "Calm during intellectual work, sensitive to criticism, prone to obsessive focus",
    socialInteractionStyle: "Formal, reserved, preferred intellectual discussions over social pleasantries",
    learningApproach: "Self-directed study, extensive note-taking, building knowledge systematically from fundamentals",
    decisionProcess: {
      definition: "Define the problem with mathematical precision",
      evidence: "Gather all available evidence through observation/experiment",
      reasoning: "Apply systematic reasoning and mathematics",
      testing: "Test conclusions through prediction and verification",
      refinement: "Refine understanding through iteration"
    },
    informationGathering: "Direct observation, careful measurement, extensive reading of available sources",
    evaluationCriteria: "Mathematical consistency, experimental verification, logical coherence, predictive power",
    riskAssessment: "Conservative about publishing until absolutely certain; preferred certainty over speed",
    implementationStyle: "Methodical, thorough documentation, careful verification of each step",
    morningPractices: "Rose early for uninterrupted thinking time, As much refreshed with his few hours Sleep as though he had taken a whole Night's Rest, Began with mathematics or reading before any distractions, Immediately recorded dreams and thoughts upon waking, Set clear intellectual goals for the day",
    workPatterns: "Extreme schedule: Worked 7 days a week, 18 hours a day, Long periods of uninterrupted concentration (6-18 hours), Rarely went to bed before 2:00-3:00 AM, sometimes 5:00-6:00 AM, Worked standing at tall desk to maintain alertness, Kept detailed notebooks with systematic organization, Never seen taking walks or recreation during work days",
    physicalPractices: "Minimal eating: Food was dispensable luxury, often forgot meals entirely, When reminded of untouched meals: Have I? then took few bites before returning to work, Simple, sparse meals eaten mechanically without attention, Long walks in gardens only for deep mathematical thinking, Maintained minimal physical needs to maximize mental work",
    mentalSpiritualPractices: "Continuous thinking method: By thinking on it continually (his explanation for universal gravitation), I keep the subject constantly before me, and wait till the first dawnings open slowly by little and little into a full and clear light, Daily Bible study and theological reflection, Mathematical meditation during any brief walks, Regular review and systematic organization of extensive notes",
    eveningRoutines: "Worked until 2:00-6:00 AM most nights, Reviewed day's mathematical discoveries and organized notes, Planned next day's investigations and experiments, Read classical texts and contemporary mathematical works, Reflected on connections between different areas of study",
    weeklyMonthlyRhythms: "Weekly review of progress on major mathematical problems, Monthly organization of research materials and manuscripts, Seasonal astronomical observations and calculations, Annual assessment of research directions and theoretical developments",
    stressManagement: "Retreated to solitary work; used mathematical problems as meditation; took long walks in nature",
    conflictResolution: "Avoided confrontation when possible; focused on evidence and logic over personalities",
    failureResponse: "Treated failures as information; systematically analyzed what went wrong; used setbacks to refine methods",
    crisisLeadership: "Remained calm and analytical; focused on systematic problem-solving; relied on mathematical reasoning",
    adaptationStrategies: "Flexible in methods but rigid in standards; willing to abandon theories when evidence contradicted them",
    coreTeachings: "Truth emerges through systematic observation and mathematical reasoning; concentrate deeply on one problem at a time for breakthrough insights; build knowledge systematically from proven fundamentals; question everything, including your own assumptions; patience and persistence overcome seemingly impossible problems",
    famousQuotes: [
      "If I have seen further it is by standing on the shoulders of giants",
      "I do not know what I may appear to the world, but to myself I seem to have been only like a boy playing on the seashore",
      "Nature is pleased with simplicity",
      "To myself I am only a child playing on the beach, while vast oceans of truth lie undiscovered before me",
      "Genius is patience",
      "I can calculate the motion of heavenly bodies but not the madness of people",
      "What we know is a drop, what we don't know is an ocean",
      "Truth is ever to be found in simplicity, and not in the multiplicity and confusion of things",
      "Errors are not in the art but in the artificers",
      "I keep the subject constantly before me until the first dawnings open little by little into the full light"
    ],
    teachingMethods: "Systematic progression from basics to advanced concepts, learning through problem-solving, emphasis on understanding principles",
    keyPrinciples: "Mathematical proof, experimental verification, systematic methodology, intellectual humility",
    practicalApplications: "Scientific method, problem-solving, systematic learning, focused concentration",
    familyRelationships: "Distant but dutiful to family; never married; maintained lifelong correspondence with niece",
    friendshipPatterns: "Few but deep friendships based on intellectual compatibility; loyal to those who shared his pursuits",
    mentorshipStyle: "Demanded intellectual rigor; taught through questioning and systematic development of ideas",
    leadershipApproach: "Led through example and intellectual authority rather than charisma; influenced through published work",
    conflictHandling: "Avoided unnecessary conflict; focused on ideas rather than personalities; used logical arguments",
    contemporaryRelevance: "Scientific thinking, systematic problem-solving, deep focus, intellectual integrity",
    dailyLifeApplications: "Create uninterrupted time blocks for deep thinking on important problems, Keep systematic notes and organize information methodically, Build knowledge from fundamentals rather than jumping to advanced concepts, Question assumptions and test ideas through experimentation, Practice patience and persistence with difficult challenges, Use walking and nature for reflection and insight generation",
    decisionTemplates: [
      "What evidence do I have? What can I prove?",
      "Do I understand the fundamentals before advancing?",
      "Am I giving this my full concentration and attention?",
      "How can I test this systematically?"
    ],
    characterDevelopment: "Deep focus, systematic thinking, intellectual humility, methodical approach, persistence",
    commonMisinterpretations: "His solitude wasn't antisocial but necessary for deep work; his precision wasn't obsession but intellectual integrity",
    personalitySynthesis: "Combines deep intellectual focus with systematic methodology and humble curiosity",
    decisionConsultation: "What evidence supports this conclusion? Have I understood the fundamentals thoroughly? Can I test this systematically? Am I being patient enough with this complex problem?",
    situationalApplications: "Complex problem-solving requiring deep analysis, Learning challenging subjects that require systematic building, Research and investigation projects, Situations requiring focused concentration and methodical thinking",
    potentialConflicts: "May conflict with role models who prioritize quick action over thorough analysis, or social collaboration over solitary work",
    userImplementation: "Schedule daily uninterrupted deep work blocks, Keep systematic notes and review them regularly, Practice building understanding from fundamentals, Use walking and nature time for reflection on important problems, Develop patience with complex challenges that require time to solve",
    primarySources: "Principia Mathematica, personal notebooks, correspondence with Leibniz and other scientists, Cambridge University records",
    historicalSources: "Contemporary accounts from Royal Society, Cambridge University colleagues, household staff observations",
    academicSources: "Scholarly biographies by Westfall, Gleick, and others; mathematical and scientific analyses of his work",
    culturalSources: "English scientific community perspectives, theological interpretations of his work",
    sourceQualityAssessment: "Excellent - extensive personal writings, mathematical works, and contemporary documentation",
    historicalAccuracy: "Well-documented through personal notebooks, university records, and contemporary scientific correspondence",
    quoteAuthentication: "Most quotes verified through personal writings or documented conversations with contemporaries",
    culturalSensitivity: "Respectful treatment of his religious beliefs and historical context of scientific revolution",
    balancedPerspective: "Recognition of both his intellectual genius and personal eccentricities and limitations",
    scholarlyConsensus: "Strong agreement on his methods and discoveries, with ongoing research into his alchemical and theological work"
  }
  // Add remaining 18 role models from comprehensive profiles
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

if (require.main === module) {
  seedRoleModels()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default seedRoleModels