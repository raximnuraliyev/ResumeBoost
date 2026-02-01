// Centralized metrics tracking for platform usage
// Metrics are stored in-memory on the server

// ===== INTERFACES =====

interface PlatformMetrics {
  totalTokensUsed: number
  totalRequests: number
  totalErrors: number
  totalResponseTime: number
  requestsWithTime: number
  lastUpdated: Date
  hourlyTokens: Map<number, number>
  hourlyRequests: Map<number, number>
}

interface FeatureUsage {
  name: string
  requests: number
  tokens: number
  errors: number
  totalLatency: number
  requestsWithLatency: number
  lastUsed: Date
}

interface SessionInfo {
  id: string
  createdAt: Date
  lastActive: Date
  feature?: string
  pageViews: number
}

// ===== GLOBAL STATE =====

// Main platform metrics
export const platformMetrics: PlatformMetrics = {
  totalTokensUsed: 0,
  totalRequests: 0,
  totalErrors: 0,
  totalResponseTime: 0,
  requestsWithTime: 0,
  lastUpdated: new Date(),
  hourlyTokens: new Map(),
  hourlyRequests: new Map(),
}

// Feature usage tracking
export const featureUsage: Map<string, FeatureUsage> = new Map([
  ['CV Maker', { name: 'CV Maker', requests: 0, tokens: 0, errors: 0, totalLatency: 0, requestsWithLatency: 0, lastUsed: new Date() }],
  ['CV Analyzer', { name: 'CV Analyzer', requests: 0, tokens: 0, errors: 0, totalLatency: 0, requestsWithLatency: 0, lastUsed: new Date() }],
  ['Interview', { name: 'Interview', requests: 0, tokens: 0, errors: 0, totalLatency: 0, requestsWithLatency: 0, lastUsed: new Date() }],
])

// Session tracking
export const activeSessions: Map<string, SessionInfo> = new Map()

// All-time unique sessions (for total count)
let totalUniqueSessions = 0

// ===== TRACKING FUNCTIONS =====

/**
 * Track an AI request with full metrics
 */
export function trackAIRequest(
  feature: string, 
  tokens: number, 
  latencyMs: number, 
  error: boolean = false
) {
  const now = new Date()
  const hour = now.getHours()
  
  // Update platform metrics
  platformMetrics.totalTokensUsed += tokens
  platformMetrics.totalRequests++
  if (error) platformMetrics.totalErrors++
  if (latencyMs > 0) {
    platformMetrics.totalResponseTime += latencyMs
    platformMetrics.requestsWithTime++
  }
  platformMetrics.lastUpdated = now
  
  // Update hourly data
  platformMetrics.hourlyTokens.set(hour, (platformMetrics.hourlyTokens.get(hour) || 0) + tokens)
  platformMetrics.hourlyRequests.set(hour, (platformMetrics.hourlyRequests.get(hour) || 0) + 1)
  
  // Update feature usage
  const usage = featureUsage.get(feature) || { 
    name: feature, requests: 0, tokens: 0, errors: 0, 
    totalLatency: 0, requestsWithLatency: 0, lastUsed: now 
  }
  usage.requests++
  usage.tokens += tokens
  if (error) usage.errors++
  if (latencyMs > 0) {
    usage.totalLatency += latencyMs
    usage.requestsWithLatency++
  }
  usage.lastUsed = now
  featureUsage.set(feature, usage)
}

/**
 * Track page view / session activity
 */
export function trackSession(sessionId: string, feature?: string) {
  const now = new Date()
  const existing = activeSessions.get(sessionId)
  
  if (existing) {
    existing.lastActive = now
    existing.pageViews++
    if (feature) existing.feature = feature
  } else {
    activeSessions.set(sessionId, {
      id: sessionId,
      createdAt: now,
      lastActive: now,
      feature,
      pageViews: 1,
    })
    totalUniqueSessions++
  }
  
  // Clean up old sessions (older than 30 minutes)
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
  for (const [id, session] of activeSessions.entries()) {
    if (session.lastActive < thirtyMinutesAgo) {
      activeSessions.delete(id)
    }
  }
}

/**
 * Track a general page request (non-AI)
 */
export function trackRequest() {
  platformMetrics.totalRequests++
  platformMetrics.lastUpdated = new Date()
}

/**
 * Track feature usage (without full AI metrics)
 */
export function trackFeatureUsage(feature: string, tokens: number = 0, error: boolean = false) {
  trackAIRequest(feature, tokens, 0, error)
}

// ===== GETTER FUNCTIONS =====

/**
 * Get active sessions (active in last 5 minutes)
 */
export function getActiveSessionCount(): number {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  let count = 0
  for (const session of activeSessions.values()) {
    if (session.lastActive > fiveMinutesAgo) {
      count++
    }
  }
  return count
}

/**
 * Get total unique sessions all-time
 */
export function getTotalSessionCount(): number {
  return totalUniqueSessions
}

/**
 * Get total page views across all sessions
 */
export function getTotalPageViews(): number {
  let total = 0
  for (const session of activeSessions.values()) {
    total += session.pageViews
  }
  return total
}

/**
 * Get average response time in seconds
 */
export function getAvgResponseTime(): number {
  if (platformMetrics.requestsWithTime === 0) return 0
  return (platformMetrics.totalResponseTime / platformMetrics.requestsWithTime) / 1000
}

/**
 * Get error rate as percentage
 */
export function getErrorRate(): number {
  if (platformMetrics.totalRequests === 0) return 0
  return (platformMetrics.totalErrors / platformMetrics.totalRequests) * 100
}

/**
 * Get peak usage hour
 */
export function getPeakHour(): string {
  let maxTokens = 0
  let peakHour = -1
  
  for (const [hour, tokens] of platformMetrics.hourlyTokens) {
    if (tokens > maxTokens) {
      maxTokens = tokens
      peakHour = hour
    }
  }
  
  if (peakHour === -1) return '--:--'
  return `${peakHour.toString().padStart(2, '0')}:00`
}

/**
 * Get hourly usage data for charts
 */
export function getHourlyData(): Array<{ hour: number; tokens: number; requests: number }> {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    tokens: platformMetrics.hourlyTokens.get(i) || 0,
    requests: platformMetrics.hourlyRequests.get(i) || 0,
  }))
}

/**
 * Get feature usage data for display
 */
export function getFeatureUsageData() {
  return Array.from(featureUsage.values()).map(f => ({
    name: f.name,
    requests: f.requests,
    tokens: f.tokens,
    errors: f.errors,
    avgLatency: f.requestsWithLatency > 0 
      ? Math.round(f.totalLatency / f.requestsWithLatency) / 1000 
      : 0,
  }))
}

/**
 * Get platform health status
 */
export function getPlatformHealth() {
  const avgLatency = getAvgResponseTime()
  const errorRate = getErrorRate()
  const activeUsers = getActiveSessionCount()
  
  return [
    {
      name: 'API Status',
      status: platformMetrics.totalRequests > 0 ? 'active' as const : 'monitoring' as const,
      description: platformMetrics.totalRequests > 0 
        ? `${platformMetrics.totalRequests} requests processed`
        : 'Waiting for requests',
      metric: platformMetrics.totalRequests,
    },
    {
      name: 'Response Time',
      status: avgLatency < 3 ? 'active' as const : 'monitoring' as const,
      description: avgLatency > 0 
        ? `${avgLatency.toFixed(2)}s average`
        : 'No data yet',
      metric: Math.round(avgLatency * 100) / 100,
    },
    {
      name: 'Error Rate',
      status: errorRate < 5 ? 'active' as const : 'monitoring' as const,
      description: errorRate > 0 
        ? `${errorRate.toFixed(1)}% of requests`
        : 'No errors',
      metric: Math.round(errorRate * 10) / 10,
    },
    {
      name: 'Active Users',
      status: activeUsers > 0 ? 'active' as const : 'monitoring' as const,
      description: activeUsers > 0 
        ? `${activeUsers} users online`
        : 'No active users',
      metric: activeUsers,
    },
    {
      name: 'Token Usage',
      status: platformMetrics.totalTokensUsed > 0 ? 'active' as const : 'monitoring' as const,
      description: platformMetrics.totalTokensUsed > 0 
        ? `${(platformMetrics.totalTokensUsed / 1000000).toFixed(3)}M tokens`
        : 'No tokens used',
      metric: platformMetrics.totalTokensUsed,
    },
  ]
}

/**
 * Get all metrics for API response
 */
export function getAllMetrics() {
  return {
    totalTokens: platformMetrics.totalTokensUsed,
    totalRequests: platformMetrics.totalRequests,
    totalErrors: platformMetrics.totalErrors,
    avgResponseTime: getAvgResponseTime(),
    errorRate: getErrorRate(),
    peakHour: getPeakHour(),
    activeSessions: getActiveSessionCount(),
    totalSessions: getTotalSessionCount(),
    totalPageViews: getTotalPageViews(),
    lastUpdated: platformMetrics.lastUpdated.toISOString(),
  }
}

// ===== LEGACY EXPORTS FOR COMPATIBILITY =====

export const securityMetrics = {
  rateLimitHits: 0,
  blockedRequests: 0,
  sanitizedInputs: 0,
  sessionValidations: 0,
  promptFilters: 0,
  totalRequests: platformMetrics.totalRequests,
  lastUpdated: platformMetrics.lastUpdated,
}

export function trackSanitizedInput() {
  platformMetrics.totalRequests++
}

export function trackSessionValidation() {
  platformMetrics.totalRequests++
}

export function trackBlockedRequest() {
  platformMetrics.totalErrors++
  platformMetrics.totalRequests++
}

export function trackPromptFilter() {
  platformMetrics.totalRequests++
}

export function getSecurityStatus() {
  return getPlatformHealth()
}

export function getSecurityMetrics() {
  return getAllMetrics()
}
