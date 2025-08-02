import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Force dynamic rendering to prevent build-time database calls
export const dynamic = 'force-dynamic'

// GET /api/debug-characters - Debug endpoint to see all characters
export async function GET(request: NextRequest) {
  try {
    const characters = await prisma.savedCharacter.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Test direct lookup of the specific character
    const testId = 'cmdnkdh1z0000y8e1nz79fzbg'
    const directLookup = await prisma.savedCharacter.findUnique({
      where: { id: testId }
    })

    return NextResponse.json({ 
      characters,
      count: characters.length,
      message: 'Debug: All characters in database',
      testLookup: {
        searchedId: testId,
        found: directLookup,
        exists: !!directLookup
      }
    })
  } catch (error) {
    console.error('Debug characters failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to debug characters',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}