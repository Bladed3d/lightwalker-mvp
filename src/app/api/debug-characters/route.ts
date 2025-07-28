import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/debug-characters - Debug endpoint to see all characters
export async function GET(request: NextRequest) {
  try {
    const characters = await prisma.savedCharacter.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({ 
      characters,
      count: characters.length,
      message: 'Debug: All characters in database'
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