import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { FEATURES, ISSUE_SEVERITIES } from '@/lib/constants'

// In-memory storage for issues (in production, use database)
const issues = new Map<string, {
  id: string
  sessionId: string
  feature: string
  description: string
  severity: string
  status: string
  screenshot?: string
  createdAt: Date
  updatedAt: Date
}>()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sessionId, feature, description, severity, screenshot } = body
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      )
    }
    
    if (!feature || !FEATURES.some(f => f.id === feature)) {
      return NextResponse.json(
        { success: false, error: 'Valid feature selection required' },
        { status: 400 }
      )
    }
    
    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Description must be at least 10 characters' },
        { status: 400 }
      )
    }
    
    if (!severity || !ISSUE_SEVERITIES.includes(severity)) {
      return NextResponse.json(
        { success: false, error: 'Valid severity level required' },
        { status: 400 }
      )
    }
    
    const issueId = `ISS-${uuidv4().slice(0, 8).toUpperCase()}`
    const issue = {
      id: issueId,
      sessionId,
      feature,
      description: description.trim(),
      severity,
      status: 'open',
      screenshot,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    issues.set(issueId, issue)
    
    return NextResponse.json({
      success: true,
      issue: {
        id: issue.id,
        feature: issue.feature,
        status: issue.status,
        createdAt: issue.createdAt,
      },
      message: `Issue ${issueId} created successfully`,
    })
  } catch (error) {
    console.error('Issue creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create issue' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const issueId = searchParams.get('issueId')
    const status = searchParams.get('status')
    
    // Get specific issue
    if (issueId) {
      const issue = issues.get(issueId)
      if (!issue) {
        return NextResponse.json(
          { success: false, error: 'Issue not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, issue })
    }
    
    // Get all issues for session or filtered
    let filteredIssues = Array.from(issues.values())
    
    if (sessionId) {
      filteredIssues = filteredIssues.filter(i => i.sessionId === sessionId)
    }
    
    if (status) {
      filteredIssues = filteredIssues.filter(i => i.status === status)
    }
    
    // Sort by creation date (newest first)
    filteredIssues.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    
    return NextResponse.json({
      success: true,
      issues: filteredIssues.map(i => ({
        id: i.id,
        feature: i.feature,
        description: i.description.slice(0, 100) + (i.description.length > 100 ? '...' : ''),
        severity: i.severity,
        status: i.status,
        createdAt: i.createdAt,
      })),
      total: filteredIssues.length,
    })
  } catch (error) {
    console.error('Issue retrieval error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve issues' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { issueId, status } = body
    
    if (!issueId) {
      return NextResponse.json(
        { success: false, error: 'Issue ID required' },
        { status: 400 }
      )
    }
    
    const issue = issues.get(issueId)
    if (!issue) {
      return NextResponse.json(
        { success: false, error: 'Issue not found' },
        { status: 404 }
      )
    }
    
    if (status) {
      if (!['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status' },
          { status: 400 }
        )
      }
      issue.status = status
    }
    
    issue.updatedAt = new Date()
    issues.set(issueId, issue)
    
    return NextResponse.json({
      success: true,
      issue: {
        id: issue.id,
        status: issue.status,
        updatedAt: issue.updatedAt,
      },
      message: 'Issue updated successfully',
    })
  } catch (error) {
    console.error('Issue update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update issue' },
      { status: 500 }
    )
  }
}
