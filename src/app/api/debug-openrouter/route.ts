import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    
    console.log('🔧 DEBUG: All env vars:', Object.keys(process.env).filter(k => k.includes('OPENROUTER')))
    console.log('🔧 DEBUG: API Key exists:', !!apiKey)
    console.log('🔧 DEBUG: API Key length:', apiKey?.length)
    console.log('🔧 DEBUG: API Key prefix:', apiKey?.substring(0, 20) + '...')
    console.log('🔧 DEBUG: API Key full (masked):', apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length-10)}` : 'MISSING')
    
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key found' })
    }

    console.log('🔧 DEBUG: Making OpenRouter call...')
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lightwalker-mvp.vercel.app',
        'X-Title': 'Lightwalker Character Creation'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1:free',
        messages: [{
          role: 'system',
          content: 'Extract keywords from: "I want to learn forgiveness". Return JSON: {"keywords": ["forgiveness"], "primaryIntent": "traits", "confidence": 0.9}'
        }],
        max_tokens: 150,
        temperature: 0.1
      })
    })

    console.log('🔧 DEBUG: Response status:', response.status)
    console.log('🔧 DEBUG: Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.log('🚨 OpenRouter ERROR:', errorText)
      return NextResponse.json({ 
        error: 'OpenRouter failed', 
        status: response.status,
        details: errorText 
      })
    }

    const data = await response.json()
    console.log('🔧 DEBUG: OpenRouter response:', JSON.stringify(data, null, 2))
    
    const content = data.choices[0]?.message?.content
    console.log('🔧 DEBUG: Content to parse:', content)
    
    try {
      // Strip markdown code blocks if present
      let cleanContent = content.trim()
      
      // Remove opening ```json and closing ```
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7) // Remove '```json'
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3) // Remove closing '```'
      }
      
      cleanContent = cleanContent.trim()
      console.log('🔧 Original content:', content)
      console.log('🔧 Cleaned content:', cleanContent)
      
      const parsed = JSON.parse(cleanContent)
      console.log('✅ SUCCESS: Parsed JSON:', parsed)
      return NextResponse.json({ success: true, result: parsed })
    } catch (parseError) {
      console.log('🚨 JSON Parse Error:', parseError)
      console.log('🚨 Raw content:', content)
      return NextResponse.json({
        error: 'JSON parse failed',
        rawContent: content,
        parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      })
    }

  } catch (error) {
    console.log('🚨 FATAL ERROR:', error)
    return NextResponse.json({ 
      error: 'Fatal error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}