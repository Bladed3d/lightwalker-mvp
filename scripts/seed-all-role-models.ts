import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Comprehensive role model data extracted from role-model-profiles-comprehensive.md
const roleModelsData = [
  {
    id: 'steve-jobs',
    fullName: 'Steven Paul Jobs',
    commonName: 'Steve Jobs',
    lifeSpan: '1955-2011 (56 years)',
    primaryDomain: 'Innovation and technology leadership',
    lifeMission: 'Create technology products that are intuitive, beautiful, and transform how people live',
    coreValues: [
      'Perfectionism in design and user experience',
      'Simplicity over complexity', 
      'Revolutionary thinking over incremental improvement',
      'User needs over technical specifications',
      'Aesthetic beauty as functional necessity',
      'Focus over feature proliferation',
      'Control over distribution and experience'
    ],
    famousQuotes: [
      'Stay hungry, stay foolish',
      'Design is not just what it looks like and feels like. Design is how it works',
      'Innovation distinguishes between a leader and a follower',
      'People don\'t know what they want until you show it to them',
      'Focus is about saying no'
    ]
  },
  {
    id: 'isaac-newton',
    fullName: 'Sir Isaac Newton',
    commonName: 'Isaac Newton',
    lifeSpan: '1643-1727 (84 years)',
    primaryDomain: 'Mathematical physics and natural philosophy',
    lifeMission: 'Understand the mathematical laws governing the natural world',
    coreValues: [
      'Pursuit of absolute truth through mathematics',
      'Systematic observation and experimentation',
      'Logical reasoning over accepted authority',
      'Precision and accuracy in all work',
      'Solitude and concentration for deep thinking',
      'Divine order underlying natural phenomena',
      'Intellectual integrity and honesty'
    ],
    famousQuotes: [
      'If I have seen further it is by standing on the shoulders of giants',
      'Nature is pleased with simplicity',
      'Genius is patience',
      'What we know is a drop, what we don\'t know is an ocean',
      'I keep the subject constantly before me until the first dawnings open little by little into the full light'
    ]
  },
  {
    id: 'buddha',
    fullName: 'Siddhartha Gautama (later known as Buddha, "the Awakened One")',
    commonName: 'Buddha',
    lifeSpan: 'c. 563-483 BCE (approximately 80 years)',
    primaryDomain: 'Spiritual wisdom, meditation, and teaching liberation from suffering',
    lifeMission: 'End suffering for all beings through teaching the path to enlightenment',
    coreValues: [
      'Compassion for all living beings',
      'Mindful awareness in every moment',
      'Non-attachment to desires and outcomes',
      'Right conduct in thoughts, speech, and actions',
      'Wisdom through direct experience rather than theory',
      'Middle Path between extremes',
      'Service to others\' awakening'
    ],
    famousQuotes: [
      'Peace comes from within. Do not seek it without',
      'Three things cannot be long hidden: the sun, the moon, and the truth',
      'The mind is everything. What you think you become',
      'Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment',
      'Hatred does not cease by hatred, but only by love; this is the eternal rule'
    ]
  },
  {
    id: 'abraham-lincoln',
    fullName: 'Abraham Lincoln',
    commonName: 'Abraham Lincoln',
    lifeSpan: '1809-1865 (56 years)',
    primaryDomain: 'Political leadership, moral governance, and national unity during crisis',
    lifeMission: 'Preserve the Union and extend freedom and equality to all Americans',
    coreValues: [
      'Union preservation above all other considerations',
      'Equality and human dignity for all people',
      'Government by and for the people',
      'Moral courage in face of opposition',
      'Compassion even toward enemies',
      'Intellectual honesty and continuous learning',
      'Humility despite great power'
    ],
    famousQuotes: [
      'A house divided against itself cannot stand',
      'With malice toward none, with charity for all',
      'Government of the people, by the people, for the people',
      'The best way to destroy an enemy is to make him a friend',
      'Character is like a tree and reputation like a shadow. The shadow is what we think of it; the tree is the real thing'
    ]
  },
  {
    id: 'marie-curie',
    fullName: 'Maria Skłodowska-Curie',
    commonName: 'Marie Curie',
    lifeSpan: '1867-1934 (66 years)',
    primaryDomain: 'Scientific research, radioactivity pioneer, breaking gender barriers in science',
    lifeMission: 'Advance scientific knowledge through rigorous research and open paths for women in science',
    coreValues: [
      'Scientific integrity and rigorous methodology',
      'Persistent dedication despite obstacles',
      'Knowledge sharing for humanity\'s benefit',
      'Breaking barriers for future women scientists',
      'Simple living focused on essential pursuits',
      'Collaborative partnership in research and life',
      'Excellence through systematic work'
    ],
    famousQuotes: [
      'Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less',
      'I am among those who think that science has great beauty',
      'Life is not easy for any of us. But what of that? We must have perseverance and above all confidence in ourselves',
      'I was taught that the way of progress was neither swift nor easy',
      'We must not forget that when radium was discovered no one knew that it would prove useful in hospitals'
    ]
  },
  {
    id: 'leonardo-da-vinci',
    fullName: 'Leonardo di ser Piero da Vinci',
    commonName: 'Leonardo da Vinci',
    lifeSpan: '1452-1519 (67 years)',
    primaryDomain: 'Art, science, engineering, and interdisciplinary innovation',
    lifeMission: 'Understand all aspects of nature through direct observation, experimentation, and artistic expression',
    coreValues: [
      'Insatiable curiosity about natural phenomena',
      'Direct observation over accepted authority',
      'Integration of art and science',
      'Perfectionist craftsmanship in all work',
      'Continuous learning and experimentation',
      'Innovation through interdisciplinary thinking',
      'Beauty as essential to understanding truth'
    ],
    famousQuotes: [
      'Learning never exhausts the mind',
      'Simplicity is the ultimate sophistication',
      'Art is never finished, only abandoned',
      'The noblest pleasure is the joy of understanding',
      'Experience is the father of all knowledge'
    ]
  },
  {
    id: 'marcus-aurelius',
    fullName: 'Marcus Aurelius Antoninus',
    commonName: 'Marcus Aurelius',
    lifeSpan: '121-180 CE (59 years)',
    primaryDomain: 'Stoic philosophy, imperial leadership, and philosophical governance',
    lifeMission: 'Rule the Roman Empire with wisdom and virtue while maintaining personal philosophical development',
    coreValues: [
      'Virtue as the highest good',
      'Duty to serve the common good',
      'Acceptance of what cannot be changed',
      'Rational thinking over emotional reaction',
      'Personal responsibility and self-discipline',
      'Compassion and justice for all people',
      'Continuous self-improvement and reflection'
    ],
    famousQuotes: [
      'You have power over your mind - not outside events. Realize this, and you will find strength',
      'The best revenge is not to be like your enemy',
      'Waste no more time arguing what a good man should be. Be one',
      'If you seek tranquility, do less. Or more accurately, do what\'s essential',
      'The universe is change; our life is what our thoughts make it'
    ]
  },
  {
    id: 'thomas-edison',
    fullName: 'Thomas Alva Edison',
    commonName: 'Thomas Edison',
    lifeSpan: '1847-1931 (84 years)',
    primaryDomain: 'Invention, innovation, and technological entrepreneurship',
    lifeMission: 'Create practical inventions that improve daily life and transform society through technology',
    coreValues: [
      'Persistent experimentation until success',
      'Practical utility over theoretical elegance',
      'Hard work and dedication above natural talent',
      'Systematic methodology in invention process',
      'Commercial viability of innovations',
      'Collaborative teamwork in invention factory',
      'Continuous learning and improvement'
    ],
    famousQuotes: [
      'Genius is two percent inspiration and 98 percent perspiration',
      'I have not failed. I\'ve just found 10,000 ways that won\'t work',
      'There\'s a way to do it better - find it',
      'Opportunity is missed by most people because it is dressed in overalls and looks like work',
      'Many of life\'s failures are people who did not realize how close they were to success when they gave up'
    ]
  },
  {
    id: 'nikola-tesla',
    fullName: 'Nikola Tesla',
    commonName: 'Nikola Tesla',
    lifeSpan: '1856-1943 (86 years)',
    primaryDomain: 'Electrical engineering, invention, and wireless technology development',
    lifeMission: 'Harness electrical energy to transform human civilization and create technologies that benefit all humanity',
    coreValues: [
      'Scientific truth discovered through experimentation and visualization',
      'Technology serving humanity rather than personal profit',
      'Perfection through mental refinement before physical construction',
      'Safety and responsibility in dangerous experimental work',
      'Solitude and focused concentration for breakthrough discoveries',
      'International collaboration and sharing of knowledge',
      'Pushing beyond conventional limits of possibility'
    ],
    famousQuotes: [
      'Be alone, that is the secret of invention; be alone, that is when ideas are born',
      'My brain is only a receiver, in the Universe there is a core from which we obtain knowledge, strength and inspiration',
      'If you want to find the secrets of the universe, think in terms of energy, frequency and vibration',
      'The present is theirs; the future, for which I really worked, is mine',
      'My method is different. I do not rush into actual work. When I get an idea I start at once building it up in my imagination'
    ]
  },
  {
    id: 'benjamin-franklin',
    fullName: 'Benjamin Franklin',
    commonName: 'Benjamin Franklin',
    lifeSpan: '1706-1790 (84 years)',
    primaryDomain: 'Innovation, diplomacy, publishing, scientific discovery, and moral philosophy',
    lifeMission: 'Improve himself and society through systematic application of reason, virtue, and practical innovation',
    coreValues: [
      'Systematic self-improvement through measurable practice',
      'Practical utility over theoretical speculation',
      'Civic duty and public service above personal gain',
      'Scientific inquiry and empirical observation',
      'Economic frugality and productive industry',
      'Religious tolerance and rational spirituality',
      'International diplomacy and peaceful cooperation'
    ],
    famousQuotes: [
      'An investment in knowledge pays the best interest',
      'Well done is better than well said',
      'By failing to prepare, you are preparing to fail',
      'Early to bed and early to rise makes a man healthy, wealthy, and wise',
      'Energy and persistence conquer all things'
    ]
  },
  {
    id: 'albert-einstein',
    fullName: 'Albert Einstein',
    commonName: 'Albert Einstein',
    lifeSpan: '1879-1955 (76 years)',
    primaryDomain: 'Theoretical physics, relativity theory, and scientific philosophy',
    lifeMission: 'Understand the fundamental nature of reality through imagination and mathematical insight',
    coreValues: [
      'Imagination and visual thinking over pure logical analysis',
      'Simplicity and elegance in explaining complex phenomena',
      'Pacifism and humanitarian concerns above nationalism',
      'Academic freedom and intellectual independence',
      'Scientific truth over social conventions or popularity',
      'Wonder and curiosity about natural phenomena',
      'International cooperation and world government ideals'
    ],
    famousQuotes: [
      'Imagination is more important than knowledge',
      'Logic will get you from A to B. Imagination will take you everywhere',
      'The important thing is not to stop questioning. Curiosity has its own reason for existing',
      'The most beautiful thing we can experience is the mysterious',
      'Try not to become a person of success, but rather try to become a person of value'
    ]
  },
  {
    id: 'charles-darwin',
    fullName: 'Charles Robert Darwin',
    commonName: 'Charles Darwin',
    lifeSpan: '1809-1882 (73 years)',
    primaryDomain: 'Natural history, evolutionary biology, and scientific methodology',
    lifeMission: 'Understand the natural world through systematic observation and develop theories that explain the diversity of life',
    coreValues: [
      'Rigorous observation and evidence-based reasoning',
      'Patient persistence in gathering data over decades',
      'Intellectual honesty even when conclusions challenge conventional beliefs',
      'Systematic methodology over hasty conclusions',
      'Collaboration through extensive correspondence networks',
      'Respect for factual evidence over social or religious pressure',
      'Continuous learning and self-correction based on new evidence'
    ],
    famousQuotes: [
      'It is not the strongest of the species that survives, nor the most intelligent, but the one most responsive to change',
      'I have slowly come to the conclusion that the species is not immutable',
      'Without speculation there is no good & original observation',
      'In the long history of humankind those who learned to collaborate and improvise most effectively have prevailed',
      'False facts are highly injurious to the progress of science'
    ]
  },
  {
    id: 'confucius',
    fullName: 'Kong Qiu (known as Confucius in the West)',
    commonName: 'Confucius',
    lifeSpan: '551-479 BCE (72 years)',
    primaryDomain: 'Ethics, education, moral philosophy, and social governance',
    lifeMission: 'Restore social harmony through moral education and cultivation of virtuous character in individuals and leaders',
    coreValues: [
      'Ren (仁) - benevolence and humaneness above personal gain',
      'Li (礼) - proper conduct and ritual propriety in all relationships',
      'Lifelong learning and moral self-cultivation',
      'Respect for elders, ancestors, and social harmony',
      'Education accessible to all regardless of social class',
      'Leading by moral example rather than force',
      'Loyalty and trustworthiness in all relationships'
    ],
    famousQuotes: [
      'By nature, men are nearly alike; by practice, they get to be wide apart',
      'The man who moves a mountain begins by carrying away small stones',
      'It does not matter how slowly you go as long as you do not stop',
      'Real knowledge is to know the extent of one\'s ignorance',
      'Study the past if you would define the future'
    ]
  },
  {
    id: 'socrates',
    fullName: 'Socrates of Athens',
    commonName: 'Socrates',
    lifeSpan: '470-399 BCE (71 years)',
    primaryDomain: 'Moral philosophy, ethics, and philosophical methodology',
    lifeMission: 'Examine human life and virtue through philosophical questioning to help others achieve wisdom and moral understanding',
    coreValues: [
      'Moral virtue based on knowledge and self-understanding',
      'The examined life as essential for human flourishing',
      'Intellectual humility - acknowledging the limits of one\'s knowledge',
      'Truth-seeking through rigorous questioning and dialogue',
      'Civic duty and moral responsibility to community',
      'Soul\'s health more important than bodily pleasures or material wealth',
      'Integrity and consistency between beliefs and actions'
    ],
    famousQuotes: [
      'The unexamined life is not worth living',
      'I know one thing: that I know nothing',
      'Wisdom begins in wonder',
      'The only true wisdom is in knowing you know nothing',
      'I cannot teach anybody anything. I can only make them think'
    ]
  },
  {
    id: 'aristotle',
    fullName: 'Aristotle of Stagira',
    commonName: 'Aristotle',
    lifeSpan: '384-322 BCE (62 years)',
    primaryDomain: 'Philosophy, natural science, logic, ethics, and systematic knowledge organization',
    lifeMission: 'Systematically organize and understand all human knowledge through empirical observation and logical reasoning',
    coreValues: [
      'Empirical observation and evidence-based understanding',
      'Systematic organization of knowledge across all disciplines',
      'Practical wisdom (phronesis) applied to ethical living',
      'Balance and moderation in all aspects of life',
      'Teaching and mentoring future thinkers and leaders',
      'Integration of contemplative and practical life',
      'Excellence (arete) as the goal of human activity'
    ],
    famousQuotes: [
      'The whole is greater than the sum of its parts',
      'We are what we repeatedly do. Excellence, then, is not an act, but a habit',
      'Knowing yourself is the beginning of all wisdom',
      'It is the mark of an educated mind to be able to entertain a thought without accepting it',
      'Happiness depends upon ourselves'
    ]
  },
  {
    id: 'nelson-mandela',
    fullName: 'Nelson Rolihlahla Mandela',
    commonName: 'Nelson Mandela',
    lifeSpan: '1918-2013 (95 years)',
    primaryDomain: 'Political leadership, social justice, reconciliation, and human rights advocacy',
    lifeMission: 'End apartheid and build a democratic, non-racial South Africa through reconciliation rather than revenge',
    coreValues: [
      'Human dignity and equality regardless of race or background',
      'Forgiveness and reconciliation over revenge and retribution',
      'Patient persistence in pursuit of justice',
      'Unity and nation-building through inclusive leadership',
      'Education and personal development as pathways to freedom',
      'Moral courage in face of personal sacrifice',
      'Peaceful resolution of conflicts when possible'
    ],
    famousQuotes: [
      'As I walked out the door toward the gate that would lead to my freedom, I knew if I didn\'t leave my bitterness and hatred behind, I\'d still be in prison',
      'Education is the most powerful weapon which you can use to change the world',
      'Forgiveness liberates the soul, it removes fear. That\'s why it\'s such a powerful weapon',
      'I learned that courage was not the absence of fear, but the triumph over it',
      'It always seems impossible until it\'s done'
    ]
  },
  {
    id: 'eleanor-roosevelt',
    fullName: 'Anna Eleanor Roosevelt',
    commonName: 'Eleanor Roosevelt',
    lifeSpan: '1884-1962 (78 years)',
    primaryDomain: 'Human rights advocacy, social justice, political activism, and international diplomacy',
    lifeMission: 'Expand human rights and dignity for all people, regardless of race, gender, or social status',
    coreValues: [
      'Universal human dignity and equal rights for all people',
      'Courage to face fears and do what must be done',
      'Service to others, especially the marginalized and voiceless',
      'Education and personal growth as lifelong pursuits',
      'International cooperation and understanding',
      'Women\'s empowerment and gender equality',
      'Social justice over personal comfort or convenience'
    ],
    famousQuotes: [
      'You gain strength, courage and confidence by every experience in which you really stop to look fear in the face',
      'You must do the thing you think you cannot do',
      'No one can make you feel inferior without your consent',
      'The future belongs to those who believe in the beauty of their dreams',
      'Great minds discuss ideas; average minds discuss events; small minds discuss people'
    ]
  },
  {
    id: 'mahatma-gandhi',
    fullName: 'Mohandas Karamchand Gandhi (known as Mahatma Gandhi)',
    commonName: 'Mahatma Gandhi',
    lifeSpan: '1869-1948 (78 years)',
    primaryDomain: 'Nonviolent resistance, political philosophy, spiritual leadership, and social reform',
    lifeMission: 'Achieve justice and freedom through truth (satya) and nonviolence (ahimsa) while transforming both self and society',
    coreValues: [
      'Satyagraha - truth force as the foundation of all action',
      'Ahimsa - complete nonviolence in thought, word, and deed',
      'Self-discipline and personal transformation as basis for social change',
      'Simple living and economic self-sufficiency',
      'Religious tolerance and unity among all faiths',
      'Service to the poorest and most marginalized people',
      'Truthfulness in all circumstances regardless of consequences'
    ],
    famousQuotes: [
      'Be the change you wish to see in the world',
      'Truth is God',
      'An eye for an eye only ends up making the whole world blind',
      'The weak can never forgive. Forgiveness is the attribute of the strong',
      'Live as if you were to die tomorrow. Learn as if you were to live forever'
    ]
  },
  {
    id: 'rumi',
    fullName: 'Jalāl al-Dīn Muḥammad Rūmī (known as Mevlana in Turkey)',
    commonName: 'Rumi',
    lifeSpan: '1207-1273 (66 years)',
    primaryDomain: 'Sufi mysticism, spiritual poetry, Islamic scholarship, and mystical teaching',
    lifeMission: 'Guide souls to direct experience of divine love through mystical practice and spiritual transformation',
    coreValues: [
      'Divine love (ishq) as the ultimate reality and goal of existence',
      'Unity of all beings in the Divine presence',
      'Service to humanity as service to God',
      'Spiritual transformation through surrender and devotion',
      'Religious tolerance and universal spirituality',
      'Ecstatic worship and mystical experience',
      'Teaching through poetry, music, and sacred movement'
    ],
    famousQuotes: [
      'Love is the bridge between you and everything',
      'Let yourself be silently drawn by the strange pull of what you really love. It will not lead you astray',
      'The wound is the place where the Light enters you',
      'You are not just the drop in the ocean, but the entire ocean in each drop',
      'When you do things from your soul, you feel a river moving in you, a joy'
    ]
  }
]

async function seedAllRoleModels() {
  console.log('🌱 Seeding all role models to Lightwalker database...')

  try {
    for (const roleModelData of roleModelsData) {
      console.log(`Adding ${roleModelData.commonName}...`)
      
      const defaultText = `Information about ${roleModelData.commonName} available from comprehensive historical sources.`
      
      await prisma.roleModel.upsert({
        where: { id: roleModelData.id },
        update: {
          fullName: roleModelData.fullName,
          commonName: roleModelData.commonName,
          lifeSpan: roleModelData.lifeSpan,
          primaryDomain: roleModelData.primaryDomain,
          lifeMission: roleModelData.lifeMission,
          coreValues: JSON.stringify(roleModelData.coreValues),
          famousQuotes: JSON.stringify(roleModelData.famousQuotes),
          contemporaryRelevance: `${roleModelData.commonName}'s wisdom remains highly relevant for personal development and leadership in the modern world.`,
          characterDevelopment: `By studying ${roleModelData.commonName}'s methods and values, users can develop similar approaches to their own challenges and growth.`,
          isActive: true
        },
        create: {
          id: roleModelData.id,
          fullName: roleModelData.fullName,
          commonName: roleModelData.commonName,
          lifeSpan: roleModelData.lifeSpan,
          culturalContext: defaultText,
          historicalPeriod: roleModelData.lifeSpan,
          primaryDomain: roleModelData.primaryDomain,
          lifeMission: roleModelData.lifeMission,
          coreValues: JSON.stringify(roleModelData.coreValues),
          valueHierarchy: JSON.stringify(roleModelData.coreValues.slice(0, 3)),
          worldview: defaultText,
          personalPhilosophy: roleModelData.famousQuotes[0] || defaultText,
          dominantTraits: JSON.stringify(roleModelData.coreValues.slice(0, 5)),
          communicationStyle: defaultText,
          emotionalPatterns: defaultText,
          socialInteractionStyle: defaultText,
          learningApproach: defaultText,
          decisionProcess: JSON.stringify({ approach: "Based on core values and principles" }),
          informationGathering: defaultText,
          evaluationCriteria: defaultText,
          riskAssessment: defaultText,
          implementationStyle: defaultText,
          morningPractices: defaultText,
          workPatterns: defaultText,
          physicalPractices: defaultText,
          mentalSpiritualPractices: defaultText,
          eveningRoutines: defaultText,
          weeklyMonthlyRhythms: defaultText,
          stressManagement: defaultText,
          conflictResolution: defaultText,
          failureResponse: defaultText,
          crisisLeadership: defaultText,
          adaptationStrategies: defaultText,
          coreTeachings: defaultText,
          famousQuotes: JSON.stringify(roleModelData.famousQuotes),
          teachingMethods: defaultText,
          keyPrinciples: JSON.stringify(roleModelData.coreValues.slice(0, 3)),
          practicalApplications: defaultText,
          familyRelationships: defaultText,
          friendshipPatterns: defaultText,
          mentorshipStyle: defaultText,
          leadershipApproach: defaultText,
          conflictHandling: defaultText,
          contemporaryRelevance: `${roleModelData.commonName}'s wisdom remains highly relevant for personal development and leadership in the modern world.`,
          dailyLifeApplications: defaultText,
          decisionTemplates: JSON.stringify([{ template: "Apply core values to decision making" }]),
          characterDevelopment: `By studying ${roleModelData.commonName}'s methods and values, users can develop similar approaches to their own challenges and growth.`,
          commonMisinterpretations: defaultText,
          personalitySynthesis: defaultText,
          decisionConsultation: defaultText,
          situationalApplications: defaultText,
          potentialConflicts: defaultText,
          userImplementation: defaultText,
          primarySources: defaultText,
          historicalSources: defaultText,
          academicSources: defaultText,
          culturalSources: defaultText,
          sourceQualityAssessment: defaultText,
          historicalAccuracy: defaultText,
          quoteAuthentication: defaultText,
          culturalSensitivity: defaultText,
          balancedPerspective: defaultText,
          scholarlyConsensus: defaultText,
          isActive: true
        }
      })
    }

    console.log(`✅ Successfully seeded ${roleModelsData.length} role models`)
    console.log('Role models added:')
    roleModelsData.forEach(rm => console.log(`  - ${rm.commonName} (${rm.primaryDomain})`))

  } catch (error) {
    console.error('❌ Error seeding role models:', error)
    throw error
  }
}

// Run the seeding
seedAllRoleModels()
  .then(async () => {
    await prisma.$disconnect()
    console.log('🎉 Database seeding completed successfully!')
  })
  .catch(async (e) => {
    console.error('💥 Database seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })