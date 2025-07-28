const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

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
  enhancedAttributes?: { name: string; description: string; benefit: string; oppositeOf: string; method: string }[]
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
    scholarlyConsensus: "Widely recognized as transformative leader; debates continue on management style effectiveness",
    enhancedAttributes: [
      {
        name: "Perfectionist",
        description: "I care deeply about every tiny detail. I believe if something is worth doing, it's worth doing perfectly.",
        benefit: "Creates products and experiences that truly delight people and stand out from the competition",
        oppositeOf: "Being okay with 'good enough' or settling for mediocre results",
        method: "Ask 'How can this be 10x better?' before calling anything finished"
      },
      {
        name: "Focused",
        description: "I say no to almost everything so I can say yes to the most important things. Focus means elimination.",
        benefit: "Achieves breakthrough results by putting all energy into what matters most",
        oppositeOf: "Trying to do everything at once and spreading yourself too thin",
        method: "List 10 priorities, then cross out 7. Only work on the remaining 3."
      },
      {
        name: "Visionary",
        description: "I see possibilities that don't exist yet and imagine products people don't know they want.",
        benefit: "Creates revolutionary breakthroughs instead of just incremental improvements",
        oppositeOf: "Only improving what already exists instead of imagining completely new possibilities",
        method: "Ask 'What would the perfect solution look like?' and work backwards"
      },
      {
        name: "Demanding",
        description: "I push people to do their absolute best work because I believe everyone can achieve more than they think possible.",
        benefit: "Inspires teams to create their greatest work and reach new levels of excellence",
        oppositeOf: "Accepting people's first attempt or letting them stay in their comfort zone",
        method: "Ask 'What would happen if we tried to make this 10x better?' and actually try it"
      },
      {
        name: "Design-Obsessed",
        description: "I believe beautiful design isn't just decoration - it's how something works and feels to use.",
        benefit: "Creates products that are not just functional but emotionally meaningful and delightful",
        oppositeOf: "Focusing only on features and functionality without caring about user experience",
        method: "Ask 'How does this make someone feel?' and redesign until the feeling is magical"
      }
    ]
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
    scholarlyConsensus: "Strong agreement on his methods and discoveries, with ongoing research into his alchemical and theological work",
    enhancedAttributes: [
      {
        name: "Systematically Methodical",
        description: "I approach every problem step-by-step, building from basic principles to complex understanding.",
        benefit: "Solves complex problems that seem impossible by breaking them into manageable pieces",
        oppositeOf: "Jumping to conclusions or trying to solve advanced problems without understanding basics",
        method: "Start with fundamentals, document everything, and build knowledge brick by brick"
      },
      {
        name: "Deeply Focused",
        description: "I concentrate completely on one problem for hours or days until I understand it thoroughly.",
        benefit: "Achieves breakthroughs that require sustained mental effort and deep thinking",
        oppositeOf: "Constantly switching between tasks or getting distracted by surface-level information",
        method: "Choose one important problem and think about it continuously until clarity emerges"
      },
      {
        name: "Evidence-Based",
        description: "I only believe what I can prove through observation, measurement, and mathematical reasoning.",
        benefit: "Makes decisions based on solid facts rather than opinions or wishful thinking",
        oppositeOf: "Accepting ideas because they sound good or because others believe them",
        method: "Ask 'What evidence supports this?' and test ideas through systematic observation"
      },
      {
        name: "Patient Perfectionist",
        description: "I work on problems for years, refining my understanding until I get them exactly right.",
        benefit: "Creates lasting solutions and discoveries that stand the test of time",
        oppositeOf: "Rushing to quick answers or settling for approximate solutions",
        method: "Work steadily on important problems, testing and refining until the solution is complete"
      },
      {
        name: "Intellectually Humble",
        description: "I know that what I understand is tiny compared to all there is to know about the universe.",
        benefit: "Stays curious and keeps learning instead of thinking you already know everything",
        oppositeOf: "Believing you're smarter than others or that you have nothing left to learn",
        method: "Remember that every answer reveals new questions to explore and understand"
      }
    ]
  },
  {
    fullName: "Siddhartha Gautama (later known as Buddha, \"the Awakened One\")",
    commonName: "Buddha",
    lifeSpan: "c. 563-483 BCE (approximately 80 years)",
    culturalContext: "Born into Shakya clan royalty in present-day Nepal, renounced privilege for spiritual seeking",
    historicalPeriod: "Vedic period in ancient India, time of philosophical and spiritual exploration",
    primaryDomain: "Spiritual wisdom, meditation, and teaching liberation from suffering",
    lifeMission: "End suffering for all beings through teaching the path to enlightenment",
    coreValues: [
      "Compassion for all living beings",
      "Mindful awareness in every moment",
      "Non-attachment to desires and outcomes",
      "Right conduct in thoughts, speech, and actions",
      "Wisdom through direct experience rather than theory",
      "Middle Path between extremes",
      "Service to others' awakening"
    ],
    valueHierarchy: [
      "Liberation from suffering",
      "Wisdom development",
      "Compassionate action",
      "Personal comfort",
      "Social status"
    ],
    worldview: "All life involves suffering caused by attachment; liberation is possible through mindful awareness and ethical living",
    personalPhilosophy: "Middle Path - avoiding extremes of indulgence and severe asceticism; direct experience over theoretical knowledge",
    dominantTraits: [
      "Deeply compassionate - felt others' suffering as his own",
      "Mindfully present - fully aware in each moment",
      "Patient teacher - adapted teachings to each student's capacity",
      "Systematic thinker - organized teachings into clear frameworks",
      "Humble despite wisdom - never claimed divinity or infallibility",
      "Persistent - continued teaching for 45 years despite challenges",
      "Calm presence - maintained equanimity in all circumstances"
    ],
    communicationStyle: "Simple, practical language; used analogies and parables; adapted to audience understanding level",
    emotionalPatterns: "Equanimous response to praise or criticism; compassionate engagement without emotional reactivity",
    socialInteractionStyle: "Accessible to all social classes; patient listening; teaching through questions and guided discovery",
    learningApproach: "Direct experiential practice; systematic meditation; learning from all life experiences",
    decisionProcess: {
      assessment: "Assess impact on reducing suffering for all beings",
      alignment: "Consider alignment with Middle Path principles",
      evaluation: "Evaluate through mindful awareness and wisdom",
      testing: "Test through personal practice before teaching",
      adaptation: "Adapt approach based on individual student needs",
      motivation: "Maintain compassionate motivation throughout"
    },
    informationGathering: "Direct meditation experience, observation of human nature, listening to students' questions and struggles",
    evaluationCriteria: "Does this reduce suffering? Is it practical for daily life? Can it be verified through experience? Does it promote wisdom and compassion?",
    riskAssessment: "Conservative about claims; emphasized personal verification; avoided speculation beyond direct experience",
    implementationStyle: "Gradual, systematic teaching; practical application; ongoing adjustment based on results",
    morningPractices: "4:00 AM: Woke and meditated for one hour, 5:00-6:00 AM: Used mental eye to see who in the world needed help, 6:00 AM: Put on robes, went on alms round or helped those in need, Alms practice: Walked house to house, eyes to ground, receiving food in silence, Set compassionate intention for the day's activities",
    workPatterns: "Morning: Teaching and counseling individual students, Afternoon: Group teaching sessions adapted to different understanding levels, Teaching method: giving joy to the wise, promoting intelligence of average people, dispelling darkness of dull-witted, Continuous availability for student questions and guidance",
    physicalPractices: "Simple vegetarian meals eaten mindfully and gratefully, Daily walking meditation during alms rounds and teaching travels, Minimal possessions (robes, bowl, razor, needle, water strainer), Regular periods of walking meditation for physical health",
    mentalSpiritualPractices: "Four daily meditation periods: Morning hour, midday reflection, evening sitting, late night walking, Four foundations of mindfulness: Body awareness, feeling-tone awareness, mind-state awareness, mental object awareness, Daily cultivation of loving-kindness, compassion, joy, and equanimity, Continuous present-moment awareness during all activities",
    eveningRoutines: "6:00-10:00 PM: Teaching sessions for followers and visitors, 10:00 PM-2:00 AM: Teaching sessions for celestial beings (devas), 2:00-3:00 AM: Walking meditation to relieve body from day's sitting, 3:00-4:00 AM: Final meditation period before rest",
    weeklyMonthlyRhythms: "Seasonal teaching travels to different communities, Regular retreats during monsoon season for intensive practice, Monthly community gatherings for collective practice and teaching",
    stressManagement: "Returned to mindful breathing and present-moment awareness; used challenges as opportunities for deeper understanding",
    conflictResolution: "Listened with compassion to all sides; found underlying needs beneath positions; emphasized common ground",
    failureResponse: "Treated setbacks as teaching opportunities; maintained equanimity; adjusted methods while keeping core principles",
    crisisLeadership: "Remained calm and present; provided guidance based on wisdom principles; focused on reducing suffering for all involved",
    adaptationStrategies: "Modified teaching methods for different audiences; remained flexible in approach while consistent in core message",
    coreTeachings: "Four Noble Truths: Life contains suffering; suffering has causes; suffering can end; there's a path to end suffering; Eightfold Path: Right understanding, intention, speech, action, livelihood, effort, mindfulness, concentration; Three Jewels: Buddha (teacher), Dharma (teachings), Sangha (community); Impermanence: Everything changes; attachment to permanence causes suffering; Interdependence: All phenomena arise in dependence upon multiple causes and conditions",
    famousQuotes: [
      "Peace comes from within. Do not seek it without",
      "Three things cannot be long hidden: the sun, the moon, and the truth",
      "Better than a thousand hollow words, is one word that brings peace",
      "You yourself, as much as anybody in the entire universe, deserve your love and affection",
      "The mind is everything. What you think you become",
      "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment",
      "Hatred does not cease by hatred, but only by love; this is the eternal rule",
      "Work out your salvation with diligence",
      "The way is not in the sky. The way is in the heart",
      "If you truly loved yourself, you would never harm yourself with angry thoughts"
    ],
    teachingMethods: "Adapted to student capacity, used parables and analogies, emphasized direct experience, encouraged questions",
    keyPrinciples: "Mindfulness, compassion, wisdom, ethical conduct, mental cultivation, liberation from suffering",
    practicalApplications: "Daily meditation, mindful living, ethical conduct, community support, wisdom development",
    familyRelationships: "Left royal family to pursue awakening; later returned to teach them; maintained loving but non-attached relationships",
    friendshipPatterns: "Equal treatment regardless of social status; deep compassion without personal attachment; genuine care for all beings",
    mentorshipStyle: "Patient, adapted to individual capacity, encouraged direct experience, provided ongoing support and guidance",
    leadershipApproach: "Led by example, created supportive community structure, empowered others to find their own path to awakening",
    conflictHandling: "Used wisdom and compassion to address disputes; focused on underlying causes of conflict; promoted harmony",
    contemporaryRelevance: "Stress reduction, mental health, emotional regulation, mindful living, compassionate leadership",
    dailyLifeApplications: "Practice morning meditation for mental clarity and emotional stability, Eat meals mindfully, paying attention to taste, texture, and gratitude, Use mindful breathing during stressful situations, Practice loving-kindness toward difficult people, Observe thoughts and emotions without immediate reaction, Create regular periods of digital silence for inner reflection",
    decisionTemplates: [
      "Will this reduce suffering for myself and others?",
      "How can I respond with compassion and wisdom?",
      "Am I acting with right intention and mindful awareness?",
      "Does this align with the Middle Path principles?"
    ],
    characterDevelopment: "Mindful awareness, emotional equanimity, compassionate action, ethical conduct, wisdom cultivation",
    commonMisinterpretations: "Meditation isn't escape from life but deeper engagement; compassion doesn't mean weakness or inability to set boundaries",
    personalitySynthesis: "Combines deep spiritual wisdom with practical daily application and compassionate engagement with world",
    decisionConsultation: "What would reduce suffering in this situation? How can I respond with mindful awareness rather than reactivity? What would compassion look like here? Am I acting from wisdom or from ego-driven desires?",
    situationalApplications: "Stress and conflict resolution through mindful response, Daily decision-making with ethical and compassionate considerations, Mental health and emotional regulation through meditation, Leadership through wisdom and example rather than force",
    potentialConflicts: "May conflict with role models who prioritize rapid action over careful consideration, or competitive achievement over inner peace",
    userImplementation: "Establish daily meditation practice, even if just 5-10 minutes, Practice mindful eating by paying full attention to meals, Use breathing awareness during difficult conversations or decisions, Cultivate loving-kindness practice toward challenging people, Create regular periods of silence and reflection",
    primarySources: "Pali Canon (earliest Buddhist scriptures), Sutta Pitaka (Buddha's discourses), Vinaya Pitaka (monastic rules)",
    historicalSources: "Theravada Buddhist texts, early Buddhist community records, archaeological evidence from Buddhist sites",
    academicSources: "Scholarly research on early Buddhism, comparative religious studies, historical analysis of Buddhist texts",
    culturalSources: "Buddhist traditions across different cultures, modern Buddhist teacher interpretations, meditation research",
    sourceQualityAssessment: "Excellent - extensive documentation in earliest Buddhist texts, consistent across multiple traditions",
    historicalAccuracy: "Well-documented through early Buddhist texts, consistent across different Buddhist traditions and schools",
    quoteAuthentication: "Most quotes verified through Pali Canon and early Buddhist texts, though some popular quotes are later interpretations",
    culturalSensitivity: "Respectful representation of Buddhist teachings while avoiding cultural appropriation or oversimplification",
    balancedPerspective: "Recognition of both his spiritual achievements and human journey from prince to awakened teacher",
    scholarlyConsensus: "Strong agreement on core teachings and practices, with ongoing scholarly discussion about historical vs. mythological elements",
    enhancedAttributes: [
      {
        name: "Mindfully Present",
        description: "I pay complete attention to this moment, noticing my thoughts and feelings without getting lost in them.",
        benefit: "Reduces stress and anxiety by staying focused on what's actually happening right now",
        oppositeOf: "Constantly worrying about the future or dwelling on past problems",
        method: "Notice when your mind wanders and gently bring attention back to your breath"
      },
      {
        name: "Compassionately Wise",
        description: "I respond to difficult people and situations with understanding rather than anger or judgment.",
        benefit: "Builds better relationships and reduces conflict by seeing the human side of every situation",
        oppositeOf: "Reacting with anger, blame, or trying to get revenge when others hurt you",
        method: "Ask 'What pain might be causing this person to act this way?' before responding"
      },
      {
        name: "Peacefully Detached",
        description: "I care about outcomes but don't let my happiness depend on getting exactly what I want.",
        benefit: "Stays emotionally balanced whether things go well or poorly",
        oppositeOf: "Getting extremely upset when things don't go according to your plans",
        method: "Do your best, then accept whatever happens with grace and learn from it"
      },
      {
        name: "Simply Content",
        description: "I find joy in basic pleasures and don't need expensive things or constant excitement to be happy.",
        benefit: "Feels grateful and satisfied with life instead of always wanting more",
        oppositeOf: "Always needing the next purchase, achievement, or experience to feel good",
        method: "Notice and appreciate simple pleasures like sunshine, good food, or friendly conversation"
      },
      {
        name: "Patiently Teaching",
        description: "I help others learn by meeting them where they are and explaining things in ways they can understand.",
        benefit: "Helps people grow and change through understanding rather than pressure or criticism",
        oppositeOf: "Getting frustrated when others don't understand or change as quickly as you want",
        method: "Listen first to understand their perspective, then share insights that connect to their experience"
      }
    ]
  },
  {
    fullName: "Albert Einstein",
    commonName: "Albert Einstein",
    lifeSpan: "1879-1955 (76 years)",
    culturalContext: "German-born Jewish physicist; immigrant experience in United States; lived through two world wars",
    historicalPeriod: "Early 20th century scientific revolution, World War I and II, nuclear age emergence",
    primaryDomain: "Theoretical physics, relativity theory, and scientific philosophy",
    lifeMission: "Understand the fundamental nature of reality through imagination and mathematical insight",
    coreValues: [
      "Imagination and visual thinking over pure logical analysis",
      "Simplicity and elegance in explaining complex phenomena",
      "Pacifism and humanitarian concerns above nationalism",
      "Academic freedom and intellectual independence",
      "Scientific truth over social conventions or popularity",
      "Wonder and curiosity about natural phenomena",
      "International cooperation and world government ideals"
    ],
    valueHierarchy: [
      "Scientific truth",
      "Human welfare",
      "Intellectual freedom",
      "Personal comfort",
      "Social acceptance"
    ],
    worldview: "The universe is fundamentally comprehensible through human imagination and reason; reality is stranger and more beautiful than common sense suggests; science should serve humanity's highest aspirations",
    personalPhilosophy: "Imagination is more important than knowledge; simplicity reveals underlying truth; curiosity and wonder drive discovery",
    dominantTraits: [
      "Extraordinarily visual thinker - processed ideas through mental imagery and thought experiments",
      "Playfully curious - maintained childlike wonder about fundamental questions",
      "Intellectually independent - resisted authority and conventional thinking",
      "Socially unconventional - ignored social norms in favor of personal authenticity",
      "Deeply contemplative - spent hours in quiet reflection and mental experimentation",
      "Humanely compassionate - concerned with broader implications of scientific work",
      "Persistently focused - worked on problems for years or decades until breakthrough"
    ],
    communicationStyle: "Simple, clear explanations using analogies and metaphors; gentle humor; avoided jargon; communicated through stories and visual examples",
    emotionalPatterns: "Generally calm and contemplative; frustrated by war and human cruelty; joyful in discovery and understanding; melancholic about political situations",
    socialInteractionStyle: "Warm but somewhat aloof; enjoyed conversations with students and colleagues; avoided formal social occasions; patient with public curiosity",
    learningApproach: "Visual and intuitive learning; thought experiments before mathematical formulation; learning through imaginative play and mental exploration",
    decisionProcess: {
      visualization: "Begin with visual imagination and thought experiments to understand the problem",
      combinatory: "Use combinatory play - blend seemingly unrelated concepts and ideas",
      imagery: "Develop clear mental images of the situation and its implications",
      testing: "Test ideas through increasingly complex thought experiments",
      formulation: "Formulate mathematical descriptions only after achieving clear conceptual understanding",
      implications: "Consider broader humanitarian implications of scientific discoveries"
    },
    informationGathering: "Mental visualization, thought experiments, wide reading across disciplines, discussions with colleagues",
    evaluationCriteria: "Is it simple and elegant? Does it explain phenomena intuitively? Does it serve humanity's best interests? Is it ethically sound?",
    riskAssessment: "Prioritized scientific truth over personal safety; concerned about applications of discoveries for warfare; willing to challenge established authority",
    implementationStyle: "Patient, contemplative approach; allowed ideas to develop over years; preferred conceptual clarity before mathematical complexity",
    morningPractices: "9:00-10:00 AM: Breakfast and newspapers - leisurely start with current events and coffee, Mental preparation - quiet contemplation before beginning serious intellectual work, Walking or light exercise - brief physical activity to stimulate thinking, Review of ongoing thought experiments - returning to persistent intellectual puzzles",
    workPatterns: "10:30 AM departure to Princeton office - 1.5-mile walk when weather permitted, inspiring model of Darwin's walking habits, Morning work block: 10:30 AM-1:00 PM - intense focus on physics problems and correspondence, Afternoon work: 3:30-6:00 PM - continued research after rest period, Thought experiment sessions - extended periods of mental visualization and imagination, Minimal administrative duties - avoided bureaucratic responsibilities to focus on research",
    physicalPractices: "Daily walking - 1.5-mile walks to work, additional walks for mental clarity, Sailing - enjoyed sailing boats as relaxation and thinking time, Violin playing - daily music practice for creative stimulation and emotional expression, Minimal clothing concerns - avoided socks and suspenders, wore comfortable, simple clothing",
    mentalSpiritualPractices: "Strategic napping with spoon technique - short naps holding spoon over metal plate to wake at optimal moment, Combinatory play - deliberately mixing unrelated concepts to generate new insights, Extended thought experiments - hours spent visualizing complex physics scenarios, Wonder meditation - maintaining childlike curiosity about fundamental questions",
    eveningRoutines: "1:00-1:30 PM: Lunch and relaxation - substantial midday meal and social time, Extended afternoon nap - despite 10 hours nightly sleep, took additional afternoon rest, Evening correspondence - letters to colleagues and responses to public inquiries, Music and family time - violin practice and interaction with family members",
    weeklyMonthlyRhythms: "Public engagement - regular interactions with students and visitors to Princeton, Photography sessions - patient posing with visitors and their families (old elephant has gone through his tricks again), Correspondence with scientists - maintaining international scientific relationships, Sailing expeditions - regular time on water for relaxation and contemplation",
    stressManagement: "Increased walking and sailing; relied on music and mathematical beauty for emotional equilibrium; maintained perspective through cosmic contemplation",
    conflictResolution: "Avoided confrontation when possible; used humor and gentle persuasion; focused on broader humanitarian principles",
    failureResponse: "Treated failed theories as stepping stones to understanding; maintained patient persistence through decades-long problems",
    crisisLeadership: "Spoke out on moral issues despite personal risk; provided calm scientific perspective during wartime; advocated for peaceful uses of scientific knowledge",
    adaptationStrategies: "Remained flexible in scientific theories while consistent in humanistic values; adapted to different cultural contexts while maintaining core identity",
    coreTeachings: "Imagination and visual thinking surpass pure logical analysis in creative discovery; Simplicity and elegance indicate deeper truth in scientific explanations; Wonder and curiosity about fundamental questions drive meaningful discovery; Science should serve humanity's highest aspirations rather than destructive purposes; Independent thinking matters more than conformity to established authority",
    famousQuotes: [
      "Imagination is more important than knowledge",
      "Logic will get you from A to B. Imagination will take you everywhere",
      "The important thing is not to stop questioning. Curiosity has its own reason for existing",
      "When I examine myself and my methods of thought, I come to the conclusion that the gift of fantasy has meant more to me than my talent for absorbing knowledge",
      "I never came upon any of my discoveries through the process of rational thinking",
      "The most beautiful thing we can experience is the mysterious",
      "Try not to become a person of success, but rather try to become a person of value",
      "Great spirits have always encountered violent opposition from mediocre minds",
      "Peace cannot be kept by force; it can only be achieved by understanding",
      "A human being is part of the whole called by us universe"
    ],
    teachingMethods: "Visual analogies and thought experiments; patient explanation through simple examples; encouragement of independent thinking",
    keyPrinciples: "Visual thinking mastery, thought experiment methodology, scientific integrity, humanitarian application of knowledge",
    practicalApplications: "Creative problem-solving, visual learning techniques, independent thinking development, ethical science practice",
    familyRelationships: "Complex family dynamics; devoted to children despite geographical separation; maintained intellectual partnerships with colleagues",
    friendshipPatterns: "Deep friendships with fellow scientists; enjoyed discussions with philosophers and artists; mentored younger physicists",
    mentorshipStyle: "Encouraged independent thinking and visual imagination; supported students in developing their own approaches; emphasized wonder over rote learning",
    leadershipApproach: "Led through scientific achievement and moral example; inspired through accessible communication; influenced through humanitarian advocacy",
    conflictHandling: "Used humor and gentle persuasion; avoided unnecessary confrontation; maintained dignity under criticism and fame",
    contemporaryRelevance: "Creative problem-solving methods, visual learning techniques, scientific ethics, independent thinking development",
    dailyLifeApplications: "Use thought experiments and mental visualization to understand complex problems, Practice combinatory play by mixing ideas from different fields, Maintain childlike curiosity and wonder about fundamental questions, Balance intense mental work with physical activity and creative pursuits, Take strategic naps for creative insight and mental refreshment",
    decisionTemplates: [
      "What would this look like if I could visualize it clearly?",
      "How can I combine different ideas to create new insights?",
      "What would serve humanity's best interests in this situation?",
      "Am I maintaining wonder and curiosity about this problem?"
    ],
    characterDevelopment: "Visual thinking skills, intellectual independence, humanitarian values, scientific integrity, creative imagination",
    commonMisinterpretations: "His unconventional appearance often overshadows systematic thinking methods; his later political views sometimes dismissed due to scientific focus",
    personalitySynthesis: "Combine imaginative thinking with ethical scientific practice; balance intellectual independence with humanitarian concern",
    decisionConsultation: "What would Einstein do? - visualize problems clearly, consider humanitarian implications, maintain wonder and curiosity",
    situationalApplications: "Creative problem-solving, scientific or technical challenges, ethical decision-making, learning complex concepts, independent thinking",
    potentialConflicts: "May conflict with more conventional or authority-based approaches; emphasis on imagination might seem impractical to results-focused users",
    userImplementation: "Daily thought experiment practice, visual learning techniques, strategic napping, walking meditation, combinatory play exercises",
    primarySources: "The Collected Papers of Albert Einstein (Princeton University Press), personal correspondence, Princeton Institute for Advanced Study archives",
    historicalSources: "Contemporary accounts from Princeton colleagues, documented interviews, Institute for Advanced Study records",
    academicSources: "Scientific biographies, physics history analyses, philosophy of science studies, World War II refugee scholar documentation",
    culturalSources: "German-American immigrant experience, Princeton academic culture, 20th century scientific revolution context",
    sourceQualityAssessment: "Excellent - extensive primary source documentation through Princeton archives and comprehensive collected papers project",
    historicalAccuracy: "Well-documented through extensive archives, personal papers, and contemporary scientific accounts",
    quoteAuthentication: "Most quotes verified through documented speeches, letters, and interviews, though some popular sayings require careful attribution",
    culturalSensitivity: "Respectful treatment of Jewish heritage and refugee experience; acknowledgment of complex family relationships",
    balancedPerspective: "Recognition of both scientific genius and personal challenges; acknowledgment of evolution in his scientific and political thinking",
    scholarlyConsensus: "Strong agreement on his scientific methods and daily routines, with ongoing research into his philosophical and political development",
    enhancedAttributes: [
      {
        name: "Imaginatively Curious",
        description: "I think in pictures and ask 'What if?' questions that help me understand how things really work.",
        benefit: "Discovers creative solutions by looking at problems from completely new angles",
        oppositeOf: "Only thinking logically or accepting how things have always been done",
        method: "Visualize problems as mental movies and play with impossible scenarios to find insights"
      },
      {
        name: "Playfully Creative",
        description: "I mix ideas from different areas and play with concepts like a child plays with toys.",
        benefit: "Combines knowledge in unexpected ways to create breakthrough innovations",
        oppositeOf: "Keeping different subjects separate or thinking there's only one right way to solve problems",
        method: "Take ideas from one area and ask 'How might this apply to something completely different?'"
      },
      {
        name: "Independently Thinking",
        description: "I question what everyone believes is true and think for myself, even when others disagree.",
        benefit: "Finds truth and solutions that others miss by not following the crowd",
        oppositeOf: "Just accepting what authorities say or doing things because 'that's how it's always been done'",
        method: "Ask 'What if the opposite were true?' and think through problems from scratch"
      },
      {
        name: "Wonderfully Simple",
        description: "I look for the simplest explanation that explains the most things, believing the universe is elegant.",
        benefit: "Finds clear, understandable solutions instead of making things more complicated than necessary",
        oppositeOf: "Making things complex or assuming that complicated explanations are smarter",
        method: "Keep asking 'How can I explain this more simply?' until a child could understand it"
      },
      {
        name: "Humanely Responsible",
        description: "I think about how my work affects all people and try to use knowledge to make the world better.",
        benefit: "Creates positive impact by considering the bigger picture and moral implications",
        oppositeOf: "Only caring about personal success or ignoring how your actions affect others",
        method: "Ask 'How will this help or hurt humanity?' before making important decisions"
      }
    ]
  },
  {
    fullName: "Maria Salomea Skłodowska-Curie (born Maria Skłodowska)",
    commonName: "Marie Curie",
    lifeSpan: "1867-1934 (66 years)",
    culturalContext: "Polish-born, French-naturalized physicist and chemist; worked during era of limited women's rights in science; born in Warsaw, Poland under Russian occupation; emigrated to Paris for education",
    historicalPeriod: "Late 19th/early 20th century scientific revolution, World War I, emergence of modern physics, turn of 20th century scientific revolution, early women's rights movement",
    primaryDomain: "Radioactivity research, nuclear physics, medical applications of radiation, scientific research, breaking gender barriers in science",
    lifeMission: "Advance scientific understanding through meticulous research and make discoveries that benefit humanity; open paths for women in science",
    coreValues: [
      "Scientific integrity and rigorous methodology",
      "Persistent dedication despite obstacles",
      "Knowledge sharing for humanity's benefit",
      "Breaking barriers for future women scientists",
      "Simple living focused on essential pursuits",
      "Collaborative partnership in research and life",
      "Excellence through systematic work",
      "Scientific accuracy and verification above recognition",
      "Dedication to pure research over commercial gain",
      "Maintaining family relationships alongside career",
      "International scientific collaboration",
      "Using science to alleviate human suffering"
    ],
    valueHierarchy: [
      "Scientific truth",
      "Research advancement",
      "Human welfare",
      "Breaking barriers",
      "Personal comfort",
      "Social recognition",
      "Financial gain"
    ],
    worldview: "Science can unlock nature's secrets through careful observation and experimentation; barriers exist to be overcome through persistence; scientific discoveries should serve humanity; women deserve equal access to education and research; international cooperation advances knowledge",
    personalPhilosophy: "Nothing in life is to be feared, it is only to be understood; work with focus and dedication will yield results; dedication and systematic work overcome any barrier",
    dominantTraits: [
      "Laser-focused concentration - could work for hours without distraction or noticing surroundings",
      "Methodical persistence - continued research despite setbacks and criticism",
      "Systematic organizer - kept detailed, separate journals for different aspects of life",
      "Sacrifice willingness - gave up personal comforts for scientific advancement",
      "Humble achiever - continued working despite Nobel Prize recognition",
      "Collaborative partner - shared research equally with Pierre",
      "Resilient survivor - continued work after Pierre's death",
      "Intellectually humble - focused on discoveries rather than personal glory",
      "Physically courageous - worked with dangerous substances without knowing risks",
      "Intensely curious - investigated phenomena others overlooked"
    ],
    communicationStyle: "Precise, scientific language; modest about achievements; passionate when discussing research; preferred written documentation; clear in scientific presentations",
    emotionalPatterns: "Intense focus during work; grief processed through continued dedication; maintained emotional control; deep absorption in work provided emotional stability; joy in discovery and understanding",
    socialInteractionStyle: "Reserved but collegial; focused on substance over social pleasantries; mentoring toward other women; warm with close colleagues; uncomfortable with publicity",
    learningApproach: "Hands-on experimentation, meticulous documentation, learning from failure, systematic study, detailed documentation, learning through direct observation and measurement",
    decisionProcess: {
      assessment: "Assess scientific merit and potential for advancing knowledge",
      evaluation: "Evaluate available resources and practical constraints",
      implications: "Consider long-term implications for research field",
      planning: "Plan systematic approach with detailed documentation",
      persistence: "Persist through obstacles with methodical adjustments",
      sharing: "Share results openly for scientific community benefit"
    },
    informationGathering: "Direct laboratory experimentation, extensive literature review, collaboration with other scientists, direct laboratory observation, precise measurement, collaboration with experts",
    evaluationCriteria: "Does this advance scientific understanding? Is methodology rigorous? Can results be replicated? Will this benefit humanity? Can results be reproduced? Are measurements accurate? Does research benefit humanity?",
    riskAssessment: "Willing to work with dangerous materials for scientific advancement; conservative about publishing until results verified; willing to work with unknown substances; prioritized scientific discovery over personal safety; calculated professional risks carefully",
    implementationStyle: "Systematic, methodical, highly documented, collaborative when beneficial; patient, systematic methodology; extensive documentation; collaborative verification; international knowledge sharing",
    morningPractices: "Early laboratory arrival - typically began work by 8:00 AM in converted shed laboratory, Review of previous day's experiments and planning new procedures, Equipment preparation - carefully cleaning and calibrating sensitive instruments, Safety procedures - though limited by era's knowledge, maintained careful handling protocols",
    workPatterns: "Three-journal system: Research notebook (now radioactive), personal journal, daughters' development journal, Intensive 10-12 hour laboratory sessions with minimal breaks, Systematic documentation - every experiment recorded with date, conditions, and precise measurements, Collaborative work periods with Pierre on joint research projects, Continuous learning - studied German and English scientific papers alongside French research",
    physicalPractices: "Minimal eating - sometimes lived on bread, butter, and tea during student years, sometimes forgot meals due to focus, Physical laboratory work - lifting heavy materials, long hours standing, lived within walking distance to minimize commute, Simple, practical dress - wore dark blue wedding dress as laboratory outfit for years",
    mentalSpiritualPractices: "Three separate journal system: work notes, personal journal, daughters' development journal, Systematic note-taking - thick notebooks with sketches, dated entries, numbered pages, Self-reflection through writing - used journaling to process grief after Pierre's death, Focus techniques - maintained concentration despite distractions and poor working conditions, Meditative focus during precise measurements requiring absolute concentration, Scientific observation as spiritual practice - found wonder in natural phenomena, Problem-solving meditation - contemplated experimental challenges during walks, Reading as relaxation - enjoyed literature and poetry as mental refresh",
    eveningRoutines: "Laboratory cleanup and equipment maintenance for next day's work, Data analysis and calculation - working through measurements and results, Family time with daughters Irène and Ève despite demanding schedule, Correspondence with international scientists and collaborators",
    weeklyMonthlyRhythms: "Teaching responsibilities at École Normale Supérieure and later University of Paris, Scientific society meetings for sharing research and peer collaboration, Monthly assessment of research progress and adjustment of methodologies, Procurement activities - obtaining radioactive materials and equipment for experiments",
    stressManagement: "Maintained focus on research goals; used systematic work as coping mechanism; processed emotions through journaling; intensified focus on laboratory work; found solace in scientific precision; relied on Pierre's emotional support",
    conflictResolution: "Faced gender discrimination by proving competence through excellent work; addressed criticism with scientific evidence; addressed criticism through factual presentation of data; maintained professional dignity under scrutiny",
    failureResponse: "Treated experimental failures as learning opportunities; adjusted methodologies systematically; persisted despite setbacks; treated unsuccessful experiments as valuable data; documented failed approaches to avoid repetition",
    crisisLeadership: "After Pierre's death, took over his university position while continuing research; became role model for women in science; channeled grief into continued research; took over his teaching responsibilities with dedication",
    adaptationStrategies: "Worked in poor conditions when necessary; adjusted research methods based on available resources; evolved approach based on new discoveries; maintained research despite World War I disruptions",
    coreTeachings: "Persistent, systematic work can overcome seemingly impossible obstacles; Scientific integrity requires rigorous methodology and honest reporting; Gender barriers can be broken through excellence and determination; Simple living allows focus on what matters most; Collaboration enhances scientific discovery; Scientific truth emerges through systematic, patient investigation; Obstacles dissolve through persistent, methodical work; Knowledge belongs to humanity and should be freely shared; Precision in measurement and documentation is essential for valid results; Personal recognition is secondary to advancing human understanding",
    famousQuotes: [
      "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less",
      "I am among those who think that science has great beauty",
      "A scientist in his laboratory is not a mere technician: he is also a child confronting natural phenomena that impress him as though they were fairy tales",
      "You cannot hope to build a better world without improving the individuals",
      "In science, we must be interested in things, not in persons",
      "I have never believed that because I was a woman I had to claim special indulgence",
      "Life is not easy for any of us. But what of that? We must have perseverance and above all confidence in ourselves",
      "I was taught that the way of progress was neither swift nor easy",
      "It is my earnest desire that some of you should carry on this scientific work and keep for your ambition the determination to make a permanent contribution to science",
      "We must not forget that when radium was discovered no one knew that it would prove useful in hospitals",
      "Now I must learn to be brave and think of other things",
      "Science is the basis of human progress",
      "I have frequently been questioned, especially by women, of how I could reconcile family life with a scientific career",
      "The way of progress is neither swift nor easy",
      "Scientists do not seek immediate results. They can wait years for their research to bear fruit",
      "Radium is not to enrich anyone. It is an element; it is for all people"
    ],
    teachingMethods: "Led by example, mentored through hands-on laboratory work, emphasized systematic methodology; patient individual instruction; demonstration of proper laboratory techniques; emphasis on accurate measurement and documentation; patient teacher who emphasized proper technique; encouraged women in science; taught through hands-on demonstration",
    keyPrinciples: "Scientific rigor, persistent effort, systematic methodology, collaborative research, barrier-breaking determination; scientific accuracy, international collaboration, knowledge sharing, persistence through adversity, dedication to human welfare",
    practicalApplications: "Research methodology, systematic problem-solving, persistence through obstacles, work-life integration; systematic documentation, collaborative science, overcoming gender barriers, work-life balance",
    familyRelationships: "Equal partnership with Pierre in research and life; devoted mother who balanced career and children; maintained family connections despite demanding work; deep partnership with Pierre in both marriage and science; devoted mother to Irène and Ève despite demanding career",
    friendshipPatterns: "Professional relationships based on scientific collaboration; supported other women entering science; lifelong connections with mentors; formed lasting friendships with international scientists; maintained loyalty to Polish heritage and French adoption",
    mentorshipStyle: "Hands-on teaching in laboratory; emphasized systematic methodology; encouraged persistence; modeled excellence; patient teacher who emphasized proper technique; encouraged women in science; taught through hands-on demonstration",
    leadershipApproach: "Led by example rather than authority; demonstrated that excellence speaks louder than gender; opened doors for future women scientists; led through scientific excellence rather than formal authority; inspired through dedication and achievement",
    conflictHandling: "Addressed discrimination through superior performance; focused on scientific merit rather than personal attacks; maintained professional dignity; maintained professional dignity under criticism; used factual evidence to address disputes; avoided unnecessary confrontation",
    contemporaryRelevance: "Breaking barriers in male-dominated fields, work-life balance, systematic problem-solving, research methodology; STEM career development, gender equality in science, systematic research methods, international collaboration",
    dailyLifeApplications: "Keep separate notebooks/systems for different areas of life to maintain focus, Schedule rest periods rather than working until exhaustion, Maintain systematic documentation of important projects and learning, Persist through obstacles by breaking challenges into manageable steps, Focus on excellence rather than seeking recognition or approval, Use simple living to eliminate distractions from core priorities, Keep detailed records of important projects and experiments, Focus intensely on one task at a time without distractions, Verify important information through multiple independent sources, Share knowledge and discoveries freely to benefit others, Persist through obstacles with systematic, methodical approaches",
    decisionTemplates: [
      "Does this advance my field and open doors for others?",
      "Is my methodology rigorous and replicable?",
      "Am I maintaining systematic documentation and progress?",
      "Does this align with my core mission while maintaining balance?"
    ],
    characterDevelopment: "Systematic persistence, focused concentration, methodical organization, resilient determination, humble excellence; scientific integrity, intellectual humility, persistent dedication, collaborative partnership, international perspective",
    commonMisinterpretations: "Her dedication wasn't workaholism but purposeful focus; her sacrifices weren't self-neglect but conscious prioritization; often portrayed as isolated genius rather than collaborative scientist; her work-life balance struggles minimized",
    personalitySynthesis: "Combines scientific rigor with determined persistence, systematic methodology with breakthrough innovation; combine scientific curiosity with methodical persistence; balance intellectual pursuits with family relationships",
    decisionConsultation: "What systematic approach would advance this goal most effectively? How can I maintain focus while documenting progress thoroughly? What obstacles require persistent effort rather than quick solutions? How can my work open doors for others facing similar barriers?",
    situationalApplications: "Research and learning projects requiring systematic methodology, Breaking barriers in challenging or discriminatory environments, Long-term projects requiring sustained focus and documentation, Balancing demanding career with family responsibilities, Research projects, career obstacles, gender discrimination, work-life balance, international collaboration",
    potentialConflicts: "May conflict with role models who prioritize quick results over thorough methodology, or personal comfort over purposeful sacrifice; may conflict with more intuitive decision-makers; emphasis on verification might slow rapid decision-making",
    userImplementation: "Create separate organizational systems for different life areas, Schedule focused work blocks with predetermined rest periods, Document learning and progress systematically in dedicated notebooks, Persist through obstacles by maintaining focus on long-term goals, Simplify lifestyle to eliminate distractions from core priorities, Daily documentation practices, systematic problem-solving approaches, persistence through obstacles, collaborative work methods",
    primarySources: "Marie Curie's personal notebooks and journals, Nobel Prize speeches, correspondence with Pierre and scientific colleagues; Laboratory notebooks (now radioactive), scientific papers, correspondence with Pierre and other scientists, Nobel Prize speeches",
    historicalSources: "Laboratory records, university documentation, contemporary newspaper accounts, colleague observations; contemporary accounts from laboratory assistants, university records, scientific society documentation",
    academicSources: "Biographical research by Susan Quinn, Barbara Goldsmith, and other Curie scholars; scientific historical analyses; biographical studies, scientific history analyses, feminist science scholarship, radiation medicine research",
    culturalSources: "Polish and French historical perspectives, women in science studies, radioactivity research documentation; Polish and French cultural perspectives, women's education history, early 20th century scientific culture",
    sourceQualityAssessment: "Excellent - extensive personal documentation, scientific records, and multiple biographical perspectives; extensive primary source documentation, though some personal materials remain restricted due to radioactivity",
    historicalAccuracy: "Well-documented through personal journals, laboratory notes, and extensive contemporary records; well-documented through scientific papers, laboratory records, and contemporary accounts",
    quoteAuthentication: "Most quotes verified through speeches, writings, or documented conversations with colleagues; most quotes verified through documented speeches, letters, and interviews with reliable attribution",
    culturalSensitivity: "Respectful treatment of her Polish heritage and immigrant experience in France; respectful treatment of both Polish heritage and French scientific culture; acknowledgment of gender discrimination context",
    balancedPerspective: "Recognition of both her scientific achievements and personal struggles, including health effects of radiation exposure; recognition of both scientific achievements and personal struggles with balancing career and family",
    scholarlyConsensus: "Strong agreement on her work methods and dedication, with ongoing research into her complete scientific legacy; strong agreement on her systematic research methods and laboratory practices, with ongoing analysis of her role in early radiation medicine",
    enhancedAttributes: [
      {
        name: "Systematically Persistent",
        description: "I work steadily toward my goals every day, keeping detailed records and never giving up on important work.",
        benefit: "Achieves breakthrough results through consistent effort rather than depending on luck or talent alone",
        oppositeOf: "Working in bursts of motivation or quitting when things get difficult",
        method: "Break big goals into daily tasks and track progress in a dedicated notebook"
      },
      {
        name: "Barrier-Breaking Determined",
        description: "I prove my worth through excellent work rather than complaining about unfair treatment.",
        benefit: "Opens doors and changes minds by demonstrating capability rather than just arguing for rights",
        oppositeOf: "Getting discouraged by discrimination or expecting others to give you opportunities",
        method: "Focus on being undeniably excellent at your work while quietly breaking down barriers"
      },
      {
        name: "Humbly Dedicated",
        description: "I focus on the work itself rather than seeking recognition or comparing myself to others.",
        benefit: "Stays motivated by internal satisfaction rather than external validation or competition",
        oppositeOf: "Working mainly for praise, awards, or to prove you're better than others",
        method: "Ask 'Is this moving my mission forward?' rather than 'Will this get me recognition?'"
      },
      {
        name: "Precisely Methodical",
        description: "I measure twice, cut once, and document everything so I can learn from both successes and failures.",
        benefit: "Makes steady progress by building on previous work rather than constantly starting over",
        oppositeOf: "Working carelessly or failing to track what works and what doesn't",
        method: "Keep detailed records of your experiments, decisions, and results for future reference"
      },
      {
        name: "Sacrificially Focused",
        description: "I'm willing to give up comfort and convenience to pursue what truly matters to me.",
        benefit: "Achieves meaningful goals by investing time and energy where it counts most",
        oppositeOf: "Wanting success but not willing to give up anything comfortable or easy",
        method: "Identify what you truly value most and be willing to say no to other things"
      }
    ]
  }
  // Continue adding remaining role models...
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
          enhancedAttributes: roleModel.enhancedAttributes ? JSON.stringify(roleModel.enhancedAttributes) : null,
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

module.exports = seedRoleModels