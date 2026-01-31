import { NextResponse } from 'next/server'

// Note: Prisma database is optional - stats work without it
// Session tracking uses in-memory storage for demo

// OpenRouter API for real usage data
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''

interface OpenRouterActivity {
  id: string
  created_at: string
  model: string
  tokens_prompt: number
  tokens_completion: number
  total_cost: number
  latency_ms: number
  app_name?: string
}

// Fetch real usage data from OpenRouter API
async function fetchOpenRouterUsage(): Promise<{
  activities: OpenRouterActivity[]
  totalTokens: number
  totalCost: number
  avgLatency: number
  requestCount: number
}> {
  if (!OPENROUTER_API_KEY || !OPENROUTER_API_KEY.startsWith('sk-or-')) {
    return { activities: [], totalTokens: 0, totalCost: 0, avgLatency: 0, requestCount: 0 }
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
    })

    if (!response.ok) {
      console.error('OpenRouter API key info failed:', response.status)
      return { activities: [], totalTokens: 0, totalCost: 0, avgLatency: 0, requestCount: 0 }
    }

    const keyInfo = await response.json()
    
    // Try to get activity data
    const activityResponse = await fetch('https://openrouter.ai/api/v1/activity', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
    })

    let activities: OpenRouterActivity[] = []
    if (activityResponse.ok) {
      const activityData = await activityResponse.json()
      activities = activityData.data || []
    }

    // Calculate totals from key info
    const totalTokens = keyInfo.data?.usage || 0
    const totalCost = keyInfo.data?.total_cost || 0
    
    // Calculate average latency from activities
    const avgLatency = activities.length > 0
      ? activities.reduce((sum, a) => sum + (a.latency_ms || 0), 0) / activities.length / 1000
      : 0

    return {
      activities,
      totalTokens,
      totalCost,
      avgLatency,
      requestCount: activities.length,
    }
  } catch (error) {
    console.error('Failed to fetch OpenRouter usage:', error)
    return { activities: [], totalTokens: 0, totalCost: 0, avgLatency: 0, requestCount: 0 }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const timeRange = searchParams.get('timeRange') || '24h'
  
  try {
    // Fetch real OpenRouter usage data
    const openRouterData = await fetchOpenRouterUsage()
    
    // Database stats disabled - Prisma Postgres local server not running
    // Sessions are tracked in-memory for demo purposes
    const dbStats = { totalSessions: 0, activeSessions: 0 }
    
    // Calculate stats from OpenRouter activities
    const activities = openRouterData.activities
    
    // Group by feature (based on app name or model)
    const featureUsageMap: Record<string, {
      name: string
      tokens: number
      requests: number
      totalLatency: number
      latencyCount: number
      cost: number
    }> = {}
    
    // Process activities into feature buckets
    activities.forEach(activity => {
      const featureName = activity.app_name || 'CV Maker'
      
      if (!featureUsageMap[featureName]) {
        featureUsageMap[featureName] = {
          name: featureName,
          tokens: 0,
          requests: 0,
          totalLatency: 0,
          latencyCount: 0,
          cost: 0,
        }
      }
      
      featureUsageMap[featureName].tokens += (activity.tokens_prompt || 0) + (activity.tokens_completion || 0)
      featureUsageMap[featureName].requests += 1
      featureUsageMap[featureName].cost += activity.total_cost || 0
      
      if (activity.latency_ms) {
        featureUsageMap[featureName].totalLatency += activity.latency_ms
        featureUsageMap[featureName].latencyCount += 1
      }
    })

    // If no activities but we have usage, create a default entry
    if (Object.keys(featureUsageMap).length === 0 && openRouterData.totalTokens > 0) {
      featureUsageMap['Job Application Platform'] = {
        name: 'Job Application Platform',
        tokens: openRouterData.totalTokens,
        requests: openRouterData.requestCount || 1,
        totalLatency: 0,
        latencyCount: 0,
        cost: openRouterData.totalCost,
      }
    }

    const formattedFeatures = Object.values(featureUsageMap).map(feature => ({
      name: feature.name,
      tokens: feature.tokens,
      requests: feature.requests,
      avgLatency: feature.latencyCount > 0 
        ? parseFloat((feature.totalLatency / feature.latencyCount / 1000).toFixed(2))
        : 0,
      errors: 0,
      cost: feature.cost,
    }))

    // Sort by requests descending
    formattedFeatures.sort((a, b) => b.requests - a.requests)

    // Calculate hourly data from activities
    const hourlyUsage: Record<number, number> = {}
    activities.forEach(activity => {
      const hour = new Date(activity.created_at).getHours()
      hourlyUsage[hour] = (hourlyUsage[hour] || 0) + (activity.tokens_prompt || 0) + (activity.tokens_completion || 0)
    })

    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      tokens: hourlyUsage[i] || 0,
    }))

    // Find peak hour
    let peakHour = '--:--'
    let maxUsage = 0
    Object.entries(hourlyUsage).forEach(([hour, tokens]) => {
      if (tokens > maxUsage) {
        maxUsage = tokens
        peakHour = `${hour.padStart(2, '0')}:00`
      }
    })

    // Format stats
    const formattedStats = {
      totalSessions: dbStats.totalSessions,
      activeSessions: dbStats.activeSessions,
      totalTokens: openRouterData.totalTokens,
      avgResponseTime: openRouterData.avgLatency,
      errorRate: 0,
      peakHour,
      totalCost: openRouterData.totalCost,
    }

    // Return all stats
    return NextResponse.json({
      success: true,
      stats: formattedStats,
      features: formattedFeatures,
      abuse: [],
      hourlyData,
      timeRange,
      generatedAt: new Date().toISOString(),
      source: openRouterData.totalTokens > 0 ? 'openrouter' : 'empty',
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
      },
      features: [],
      abuse: [],
      hourlyData: Array.from({ length: 24 }, (_, i) => ({ hour: i, tokens: 0 })),
      timeRange,
      generatedAt: new Date().toISOString(),
      source: 'error',
    })
  }
}
