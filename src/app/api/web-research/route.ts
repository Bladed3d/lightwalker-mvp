import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { personName, query } = await request.json()

    if (!personName || typeof personName !== 'string') {
      return NextResponse.json(
        { error: 'Person name is required', success: false },
        { status: 400 }
      )
    }

    console.log('🔍 Starting AI analysis for:', personName)

    // Use AI's general knowledge to analyze the person directly
    // This is more reliable and cost-effective than web scraping
    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lightwalker-mvp.vercel.app',
        'X-Title': 'Lightwalker Character Research'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [{
          role: 'system',
          content: 'You extract personality traits and leadership qualities from biographical information. Focus on character traits that can be developed, not circumstances or achievements. Return only JSON.'
        }, {
          role: 'user',
          content: `Analyze ${personName} and extract their key personality traits and leadership qualities that made them successful. Focus on character traits that can be developed, not achievements or circumstances.

Extract traits like:
- Character traits (focused, patient, strategic, innovative, persistent, etc.)
- Leadership qualities (visionary, decisive, empathetic, inspiring, etc.) 
- Behavioral patterns (systematic, analytical, collaborative, resilient, etc.)
- Communication style (persuasive, clear, authentic, etc.)

Avoid:
- Achievements, titles, or circumstances (being rich, famous, etc.)
- Physical attributes or demographics
- Luck or external factors

Return 4-8 key traits as single adjectives or short phrases.

Return only this JSON format: {"attributes": ["strategic", "innovative", "persistent", "visionary"]}`
        }],
        max_tokens: 200,
        temperature: 0.1
      })
    })

    if (!aiResponse.ok) {
      console.error('❌ AI extraction failed:', aiResponse.status)
      throw new Error('AI attribute extraction failed')
    }

    const aiData = await aiResponse.json()
    console.log('🤖 AI response:', aiData)

    if (!aiData.choices || !aiData.choices[0]?.message?.content) {
      throw new Error('Invalid AI response format')
    }

    let extractedData
    try {
      extractedData = JSON.parse(aiData.choices[0].message.content)
    } catch (parseError) {
      console.error('❌ JSON parse failed:', parseError)
      console.log('Raw AI response:', aiData.choices[0].message.content)
      throw new Error('Failed to parse AI response')
    }

    if (!extractedData.attributes || !Array.isArray(extractedData.attributes)) {
      throw new Error('No attributes found in AI response')
    }

    console.log('✅ Successfully extracted attributes:', extractedData.attributes)

    return NextResponse.json({
      success: true,
      personName,
      attributes: extractedData.attributes,
      sourceCount: extractedData.attributes.length
    })

  } catch (error) {
    console.error('❌ Web research API error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Research failed', 
        success: false 
      },
      { status: 500 }
    )
  }
}