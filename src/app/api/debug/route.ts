import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const databaseUrl = process.env.DATABASE_URL
    
    return NextResponse.json({
      success: true,
      data: {
        hasDatabaseUrl: !!databaseUrl,
        urlLength: databaseUrl?.length || 0,
        urlStart: databaseUrl?.substring(0, 20) || 'Not set',
        allEnvVars: Object.keys(process.env).filter(key => 
          key.includes('DATABASE') || key.includes('NEON') || key.includes('POSTGRES')
        )
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}