import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, templateName } = await request.json()

    // Validate required fields
    if (!email || !firstName || !templateName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if email already exists for this template
    const existingEntry = await prisma.waitlistEntry.findFirst({
      where: {
        email: email.toLowerCase(),
        templateName
      }
    })

    if (existingEntry) {
      return NextResponse.json({
        success: true,
        message: 'Already on waitlist',
        alreadyExists: true
      })
    }

    // Create waitlist entry
    const waitlistEntry = await prisma.waitlistEntry.create({
      data: {
        email: email.toLowerCase(),
        firstName: firstName.trim(),
        templateName,
        createdAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully joined waitlist',
      entry: {
        id: waitlistEntry.id,
        firstName: waitlistEntry.firstName,
        templateName: waitlistEntry.templateName
      }
    })

  } catch (error) {
    console.error('Waitlist signup error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to join waitlist',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}