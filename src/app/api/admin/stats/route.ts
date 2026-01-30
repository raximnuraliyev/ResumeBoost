import { NextResponse } from 'next/server'

// Mock admin stats - In production, these would come from database
const generateMockStats = () => {
  return {
    overview: {
      totalSessions: Math.floor(Math.random() * 5000) + 10000,
      activeSessions: Math.floor(Math.random() * 200) + 100,
      totalTokensUsed: Math.floor(Math.random() * 5000000) + 5000000,
      avgResponseTime: (Math.random() * 1.5 + 1).toFixed(2),
      errorRate: (Math.random() * 0.03).toFixed(4),
      peakHour: `${Math.floor(Math.random() * 4) + 12}:00`,
    },
    featureUsage: {
      'CV Maker': {
        requests: Math.floor(Math.random() * 5000) + 5000,
        tokens: Math.floor(Math.random() * 2000000) + 2000000,
        avgLatency: (Math.random() * 1 + 1.5).toFixed(2),
        errors: Math.floor(Math.random() * 20),
        successRate: (95 + Math.random() * 4).toFixed(1),
      },
      'CV Analyzer': {
        requests: Math.floor(Math.random() * 3000) + 3000,
        tokens: Math.floor(Math.random() * 1500000) + 1000000,
        avgLatency: (Math.random() * 0.8 + 1.2).toFixed(2),
        errors: Math.floor(Math.random() * 15),
        successRate: (96 + Math.random() * 3).toFixed(1),
      },
      'Interview': {
        requests: Math.floor(Math.random() * 2000) + 2000,
        tokens: Math.floor(Math.random() * 1000000) + 500000,
        avgLatency: (Math.random() * 0.5 + 1).toFixed(2),
        errors: Math.floor(Math.random() * 10),
        successRate: (97 + Math.random() * 2).toFixed(1),
      },
    },
    hourlyTokens: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      tokens: Math.floor(Math.random() * 100000) + 50000,
      requests: Math.floor(Math.random() * 500) + 200,
    })),
    security: {
      blockedAttempts: {
        promptInjection: Math.floor(Math.random() * 30) + 10,
        rateLimitExceeded: Math.floor(Math.random() * 200) + 50,
        suspiciousContent: Math.floor(Math.random() * 15) + 5,
      },
      activeProtections: {
        rateLimiting: true,
        promptFiltering: true,
        sessionValidation: true,
        ddosProtection: 'monitoring',
      },
    },
    systemHealth: {
      api: {
        status: 'healthy',
        uptime: (99 + Math.random() * 0.99).toFixed(2),
        responseTime: Math.floor(Math.random() * 30) + 30,
        memoryUsage: Math.floor(Math.random() * 30) + 40,
      },
      openrouter: {
        status: 'connected',
        quotaUsed: (Math.random() * 300 + 100).toFixed(2),
        quotaRemaining: (Math.random() * 500 + 500).toFixed(2),
        rateLimitUsage: Math.floor(Math.random() * 30) + 20,
      },
      database: {
        status: 'connected',
        connections: Math.floor(Math.random() * 30) + 10,
        maxConnections: 100,
        avgQueryTime: Math.floor(Math.random() * 10) + 8,
        storage: (Math.random() * 2 + 1).toFixed(1),
      },
    },
    recentErrors: [
      {
        time: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        type: 'API Timeout',
        message: 'OpenRouter response exceeded 30s',
        feature: 'CV Maker',
      },
      {
        time: new Date(Date.now() - Math.random() * 7200000).toISOString(),
        type: 'Validation Error',
        message: 'Invalid CV block structure',
        feature: 'CV Maker',
      },
      {
        time: new Date(Date.now() - Math.random() * 10800000).toISOString(),
        type: 'Rate Limit',
        message: 'Session rate limit exceeded',
        feature: 'Interview',
      },
    ],
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '24h'
    const section = searchParams.get('section')
    
    // Simulate data fetching delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const stats = generateMockStats()
    
    // Return specific section if requested
    if (section) {
      const sectionData = stats[section as keyof typeof stats]
      if (!sectionData) {
        return NextResponse.json(
          { success: false, error: `Unknown section: ${section}` },
          { status: 400 }
        )
      }
      return NextResponse.json({
        success: true,
        data: sectionData,
        timeRange,
        generatedAt: new Date().toISOString(),
      })
    }
    
    // Return formatted data for the admin dashboard
    const formattedStats = {
      totalSessions: stats.overview.totalSessions,
      activeSessions: stats.overview.activeSessions,
      totalTokens: stats.overview.totalTokensUsed,
      avgResponseTime: parseFloat(stats.overview.avgResponseTime),
      errorRate: parseFloat(stats.overview.errorRate),
      peakHour: stats.overview.peakHour,
    }
    
    const formattedFeatures = Object.entries(stats.featureUsage).map(([name, data]) => ({
      name,
      tokens: data.tokens,
      requests: data.requests,
      avgLatency: parseFloat(data.avgLatency),
      errors: data.errors,
    }))
    
    const formattedAbuse = [
      { type: 'Prompt Injection', count: stats.security.blockedAttempts.promptInjection, blocked: true, lastSeen: getRandomRecentTime() },
      { type: 'Rate Limit Exceeded', count: stats.security.blockedAttempts.rateLimitExceeded, blocked: true, lastSeen: getRandomRecentTime() },
      { type: 'Suspicious Content', count: stats.security.blockedAttempts.suspiciousContent, blocked: true, lastSeen: getRandomRecentTime() },
    ]
    
    // Return all stats in the expected format
    return NextResponse.json({
      success: true,
      stats: formattedStats,
      features: formattedFeatures,
      abuse: formattedAbuse,
      data: stats,
      timeRange,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin stats' },
      { status: 500 }
    )
  }
}

function getRandomRecentTime() {
  const minutes = Math.floor(Math.random() * 360) // Up to 6 hours
  if (minutes < 60) return `${minutes}m ago`
  return `${Math.floor(minutes / 60)}h ago`
}
