import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Force dynamic rendering to prevent build-time database calls
export const dynamic = 'force-dynamic'

// GET /api/explore-attributes - Explore traits and subtraits in the database
export async function GET(request: NextRequest) {
  try {
    // Get traits with their subtraits
    const traits = await prisma.trait.findMany({
      include: {
        subTraits: {
          orderBy: { type: 'asc' }
        },
        roleModel: {
          select: {
            code: true,
            commonName: true,
            fullName: true
          }
        }
      },
      orderBy: [
        { roleModelCode: 'asc' },
        { traitNumber: 'asc' }
      ],
      take: 10 // Limit to first 10 for exploration
    })

    // Summary statistics
    const totalTraits = await prisma.trait.count()
    const totalSubTraits = await prisma.subTrait.count()
    const subTraitsByType = await prisma.subTrait.groupBy({
      by: ['type'],
      _count: { type: true }
    })

    // Sample of different subtrait types
    const attributeExamples = await prisma.subTrait.findMany({
      where: { type: 'ATTRIBUTE' },
      take: 5,
      select: {
        subTraitCode: true,
        title: true,
        description: true
      }
    })

    const actionExamples = await prisma.subTrait.findMany({
      where: { type: 'ACTION' },
      take: 5,
      select: {
        subTraitCode: true,
        title: true,
        description: true,
        method: true
      }
    })

    return NextResponse.json({ 
      summary: {
        totalTraits,
        totalSubTraits,
        subTraitsByType
      },
      sampleTraits: traits,
      examples: {
        attributes: attributeExamples,
        actions: actionExamples
      },
      message: 'Database exploration successful'
    })
  } catch (error) {
    console.error('Database exploration failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to explore database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}