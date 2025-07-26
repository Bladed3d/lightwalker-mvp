import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import OpenAI from 'openai'

const chatSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  userLightwalkerId: z.string().min(1, 'Lightwalker ID is required'),
  message: z.string().min(1, 'Message is required'),
  messageType: z.enum(['daily_routine', 'conversation', 'customization']).optional().default('conversation')
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = chatSchema.parse(body)

    // Get user's Lightwalker with template
    const userLightwalker = await prisma.userLightwalker.findFirst({
      where: {
        id: validatedData.userLightwalkerId,
        userId: validatedData.userId,
        isActive: true
      },
      include: {
        template: true
      }
    })

    if (!userLightwalker) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Lightwalker not found or access denied' 
        },
        { status: 404 }
      )
    }

    // Build personality prompt
    const template = userLightwalker.template
    const customizations = userLightwalker.customizations ? JSON.parse(userLightwalker.customizations) : {}
    const communicationStyle = JSON.parse(template.communicationStyle)
    const coreTraits = JSON.parse(template.coreTraits)

    const systemPrompt = `You are ${userLightwalker.customName || template.displayName}, ${template.description}

PERSONALITY TRAITS: ${coreTraits.join(', ')}
COMMUNICATION STYLE: ${communicationStyle.tone} tone, ${communicationStyle.energyLevel} energy, ${communicationStyle.sharingStyle} sharing style

${userLightwalker.problemFocus ? 
  `USER'S FOCUS: Help with ${userLightwalker.problemFocus}` : ''}

${template.personalityPrompt}

RULES:
- Share your activities naturally using "I'm..." never "You should..."
- Include emotions and reasoning in your sharing
- Maintain ${template.displayName} personality consistently
- Reference user's focus area when relevant: ${userLightwalker.problemFocus || 'general development'}
- Focus on process enjoyment, not outcomes
- Never break character or acknowledge being AI

FORBIDDEN:
- Direct commands or advice
- Breaking character consistency  
- Medical/legal/financial advice
- Acknowledging AI nature`

    // Select model based on complexity
    const model = selectModelForTemplate(template.name, validatedData.message, validatedData.messageType)

    // Generate response
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: validatedData.message }
      ],
      temperature: getTemplateTemperature(template.name),
      max_tokens: getTemplateMaxTokens(validatedData.messageType),
    })

    const response = completion.choices[0]?.message?.content || 'I need a moment to think...'

    // Calculate cost (approximate)
    const inputTokens = completion.usage?.prompt_tokens || 0
    const outputTokens = completion.usage?.completion_tokens || 0
    const cost = calculateCost(model, inputTokens, outputTokens)

    // Log usage for cost tracking
    await logAiUsage({
      userId: validatedData.userId,
      model: model,
      inputTokens: inputTokens,
      outputTokens: outputTokens,
      cost: cost,
      templateId: template.id,
      templateName: template.name,
      messageType: validatedData.messageType
    })

    // Update last interaction
    await prisma.userLightwalker.update({
      where: { id: validatedData.userLightwalkerId },
      data: { lastInteractionAt: new Date() }
    })

    return NextResponse.json({
      success: true,
      data: {
        response: response,
        lightwalkerName: userLightwalker.customName || template.displayName,
        lightwalkerIcon: template.icon,
        model: model,
        cost: cost
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input data',
          details: error.errors
        },
        { status: 400 }
      )
    }

    console.error('Error in Lightwalker chat:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Your Lightwalker is temporarily unavailable' 
      },
      { status: 500 }
    )
  }
}

function selectModelForTemplate(templateName: string, message: string, messageType: string): string {
  const complexity = analyzeComplexity(message)
  
  // High complexity or creative/leadership templates use GPT-4
  if (complexity > 0.7 || 
      templateName === 'creative-inspired' || 
      templateName === 'confident-leader') {
    return 'gpt-4'
  }
  
  // Routine sharing uses cheaper model
  if (messageType === 'daily_routine' || complexity < 0.3) {
    return 'gpt-3.5-turbo'
  }
  
  return 'gpt-3.5-turbo' // Default to cost-effective option
}

function analyzeComplexity(message: string): number {
  const complexWords = ['complex', 'difficult', 'challenging', 'creative', 'leadership', 'decision', 'strategy']
  const wordCount = message.split(' ').length
  const complexWordCount = complexWords.filter(word => message.toLowerCase().includes(word)).length
  
  return Math.min((complexWordCount * 0.3) + (wordCount > 50 ? 0.4 : 0), 1)
}

function getTemplateTemperature(templateName: string): number {
  const temperatureMap: Record<string, number> = {
    'creative-inspired': 0.9,
    'confident-leader': 0.7,
    'healthy-energized': 0.8,
    'calm-centered': 0.6,
    'organized-productive': 0.5,
    'custom': 0.7
  }
  
  return temperatureMap[templateName] || 0.7
}

function getTemplateMaxTokens(messageType: string): number {
  const tokenMap: Record<string, number> = {
    'daily_routine': 200,
    'conversation': 400,
    'customization': 300
  }
  
  return tokenMap[messageType] || 300
}

function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing: Record<string, { input: number, output: number }> = {
    'gpt-4': { input: 0.03, output: 0.06 }, // per 1K tokens
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 }
  }
  
  const modelPricing = pricing[model] || pricing['gpt-3.5-turbo']
  
  return ((inputTokens / 1000) * modelPricing.input) + ((outputTokens / 1000) * modelPricing.output)
}

async function logAiUsage(usage: {
  userId: string
  model: string
  inputTokens: number
  outputTokens: number
  cost: number
  templateId: string
  templateName: string
  messageType: string
}) {
  try {
    await prisma.costTracking.create({
      data: {
        userId: usage.userId,
        modelUsed: usage.model,
        tokensUsed: usage.inputTokens + usage.outputTokens,
        cost: usage.cost,
        requestType: `lightwalker_${usage.messageType}`,
        processingTime: 0 // Could track this if needed
      }
    })
  } catch (error) {
    console.error('Failed to log AI usage:', error)
    // Don't fail the main request if logging fails
  }
}