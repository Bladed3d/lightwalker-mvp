import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  return handleAddCorporate()
}

export async function GET(request: NextRequest) {
  return handleAddCorporate()
}

async function handleAddCorporate() {
  try {
    // Just add the Corporate Development template without clearing existing data
    const corporateTemplate = {
      name: 'corporate-development',
      displayName: 'Corporate Development™ (Coming Soon)',
      tagline: 'Transform performance reviews into growth partnerships',
      description: 'Revolutionize employee development by co-creating their ideal professional future self. Align personal growth with company goals and clear advancement pathways.',
      category: 'business',
      monthlyPrice: 99.00,
      personalityPrompt: 'You facilitate the process where managers and employees co-create the employee\'s ideal professional future self. You connect personal growth to company objectives and help establish clear pathways for advancement. You transform criticism into collaborative development.',
      communicationStyle: JSON.stringify({ tone: 'professional', energyLevel: 'motivated', sharingStyle: 'strategic' }),
      coreTraits: JSON.stringify(['Strategic', 'Developmental', 'Goal-oriented', 'Collaborative']),
      dailyRoutines: JSON.stringify({ 
        morning: [{ time: '08:00', activity: 'Professional growth planning', description: 'Aligning daily work with long-term development goals' }],
        afternoon: [{ time: '14:00', activity: 'Skills development', description: 'Practicing the qualities of my ideal professional self' }],
        evening: [{ time: '18:00', activity: 'Career reflection', description: 'How did I embody my professional growth vision today?' }]
      }),
      challengeResponses: JSON.stringify({ 
        performance_gap: 'Focus on the future professional identity rather than current shortcomings',
        career_uncertainty: 'Clarify values and strengths to guide professional development',
        manager_conflict: 'Find shared goals and mutual investment in growth'
      }),
      sampleActivities: JSON.stringify([
        'Working with my manager to define my ideal future role and the steps to get there',
        'Connecting my personal development goals with company advancement opportunities',
        'Transforming feedback into actionable character development'
      ]),
      icon: '🏢',
      colorScheme: JSON.stringify({ primary: '#1f2937', secondary: '#f3f4f6' })
    }

    // Check if it already exists
    const existing = await prisma.lightwalkerTemplate.findUnique({
      where: { name: 'corporate-development' }
    })

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Corporate Development™ template already exists',
        action: 'no_change',
        template: existing.displayName
      })
    }

    // Create the new template
    const created = await prisma.lightwalkerTemplate.create({
      data: corporateTemplate
    })

    // Count current templates
    const totalTemplates = await prisma.lightwalkerTemplate.count()
    const generalTemplates = await prisma.lightwalkerTemplate.count({
      where: { category: 'general' }
    })

    return NextResponse.json({
      success: true,
      message: 'Corporate Development™ template added successfully',
      action: 'created',
      template: created.displayName,
      totalTemplates: totalTemplates,
      generalTemplates: generalTemplates
    })

  } catch (error) {
    console.error('Add corporate template error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add Corporate Development template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}