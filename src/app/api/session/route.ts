import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { trackRequest, trackSessionValidation, trackSession } from '@/lib/security-metrics'

// In production, this would use a database like Prisma
// For hackathon demo, we use in-memory storage
const sessions = new Map<string, {
  id: string
  createdAt: Date
  lastActive: Date
  data: Record<string, unknown>
}>()

export async function POST() {
  trackRequest()
  try {
    const sessionId = uuidv4()
    const session = {
      id: sessionId,
      createdAt: new Date(),
      lastActive: new Date(),
      data: {},
    }
    
    sessions.set(sessionId, session)
    trackSessionValidation()
    trackSession(sessionId)
    
    return NextResponse.json({
      success: true,
      sessionId,
      message: 'Session created successfully',
    })
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  trackRequest()
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      )
    }
    
    const session = sessions.get(sessionId)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }
    
    // Update last active
    session.lastActive = new Date()
    trackSessionValidation()
    trackSession(sessionId)
    
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        createdAt: session.createdAt,
        lastActive: session.lastActive,
      },
    })
  } catch (error) {
    console.error('Session retrieval error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve session' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      )
    }
    
    const deleted = sessions.delete(sessionId)
    
    return NextResponse.json({
      success: true,
      deleted,
      message: deleted ? 'Session deleted' : 'Session not found',
    })
  } catch (error) {
    console.error('Session deletion error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}
