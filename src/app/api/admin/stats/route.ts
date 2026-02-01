import { NextResponse } from 'next/server'
import { 
  getAllMetrics, 
  getFeatureUsageData, 
  getHourlyData, 
  getPlatformHealth,
  trackRequest,
  trackSession,
} from '@/lib/security-metrics'

// OpenRouter API for additional context
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''

// Fetch OpenRouter key info (just for status check)
async function fetchOpenRouterStatus(): Promise<{
  isActive: boolean
  isFreeTier: boolean
  creditLimit: number
}> {
  if (!OPENROUTER_API_KEY || !OPENROUTER_API_KEY.startsWith('sk-or-')) {
    return { isActive: false, isFreeTier: true, creditLimit: 0 }
  }

  try {
    const keyResponse = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
    })

    if (!keyResponse.ok) {
      return { isActive: false, isFreeTier: true, creditLimit: 0 }
    }

    const keyInfo = await keyResponse.json()
    const data = keyInfo.data || {}
    
    return {
      isActive: true,
      isFreeTier: data.is_free_tier ?? true,
      creditLimit: data.limit || 0,
    }
  } catch {
    return { isActive: false, isFreeTier: true, creditLimit: 0 }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const timeRange = searchParams.get('timeRange') || '24h'
  const sessionId = searchParams.get('sessionId')
  
  // Track this request and session
  trackRequest()
  if (sessionId) {
    trackSession(sessionId, 'Admin Dashboard')
  }
  
  try {
    // Get OpenRouter status (just to check if API is configured)
    const openRouterStatus = await fetchOpenRouterStatus()
    
    // Get all metrics from our local tracking
    const metrics = getAllMetrics()
    const features = getFeatureUsageData()
    const hourlyData = getHourlyData()
    const platformHealth = getPlatformHealth()
    
    // Format features for display - always include all features even if 0 requests
    const formattedFeatures = features
      .map(feature => ({
        name: feature.name,
        tokens: feature.tokens,
        requests: feature.requests,
        avgLatency: feature.avgLatency,
        errors: feature.errors,
        cost: 0, // Free tier
      }))
      .sort((a, b) => b.requests - a.requests)

    // Format hourly data for charts
    const formattedHourly = hourlyData.map(h => ({
      hour: h.hour,
      tokens: h.tokens,
    }))

    // Format stats for display
    const formattedStats = {
      totalSessions: metrics.totalSessions,
      activeSessions: metrics.activeSessions,
      totalTokens: metrics.totalTokens,
      avgResponseTime: metrics.avgResponseTime,
      errorRate: metrics.errorRate,
      peakHour: metrics.peakHour,
      totalCost: 0, // Free tier
      totalRequests: metrics.totalRequests,
      totalPageViews: metrics.totalPageViews,
      isFreeTier: openRouterStatus.isFreeTier,
      apiActive: openRouterStatus.isActive,
    }

    // Return all stats
    return NextResponse.json({
      success: true,
      stats: formattedStats,
      features: formattedFeatures,
      abuse: [],
      hourlyData: formattedHourly,
      platformHealth,
      securityMetrics: {
        totalRequests: metrics.totalRequests,
        totalErrors: metrics.totalErrors,
        errorRate: metrics.errorRate,
        avgResponseTime: metrics.avgResponseTime,
      },
      timeRange,
      generatedAt: new Date().toISOString(),
      source: 'local',
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    
    // Return empty stats on error
    return NextResponse.json({
      success: true,
      stats: {
        totalSessions: 0,
        activeSessions: 0,
        totalTokens: 0,
        avgResponseTime: 0,
        errorRate: 0,
        peakHour: '--:--',
        totalRequests: 0,
      },
      features: [],
      abuse: [],
      hourlyData: Array.from({ length: 24 }, (_, i) => ({ hour: i, tokens: 0 })),
      platformHealth: [],
      timeRange,
      generatedAt: new Date().toISOString(),
      source: 'error',
    })
  }
}
