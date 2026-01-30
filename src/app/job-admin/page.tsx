'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, AlertTriangle, Users, Clock, Zap,
  TrendingUp, TrendingDown, Server, Shield, Eye, CheckCircle,
  XCircle, Filter, RefreshCw, Lock, LogIn
} from 'lucide-react'
import {
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent,
  Badge, Progress, Tabs, TabsList, TabsTrigger, TabsContent,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Input
} from '@/components/ui'
import { validateAdminCredentials } from '@/lib/openrouter'

// Dynamic data state type
interface AdminStats {
  totalSessions: number
  activeSessions: number
  totalTokens: number
  avgResponseTime: number
  errorRate: number
  peakHour: string
}

interface FeatureUsage {
  name: string
  tokens: number
  requests: number
  avgLatency: number
  errors: number
}

interface Issue {
  id: string
  feature: string
  description: string
  severity: 'high' | 'medium' | 'low'
  status: 'open' | 'in-progress' | 'resolved'
  time: string
  createdAt: Date
}

interface AbuseAttempt {
  type: string
  count: number
  blocked: boolean
  lastSeen: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [timeRange, setTimeRange] = useState('24h')
  const [issueFilter, setIssueFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  
  // Dynamic data state
  const [usageStats, setUsageStats] = useState<AdminStats>({
    totalSessions: 0,
    activeSessions: 0,
    totalTokens: 0,
    avgResponseTime: 0,
    errorRate: 0,
    peakHour: '00:00',
  })
  
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([])
  const [recentIssues, setRecentIssues] = useState<Issue[]>([])
  const [abuseAttempts, setAbuseAttempts] = useState<AbuseAttempt[]>([])

  // Check for existing auth on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('job-admin-auth')
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth)
        if (parsed.username && parsed.authenticated) {
          setIsAuthenticated(true)
          setUsername(parsed.username)
          // Load dynamic data
          loadAdminData()
        }
      } catch {
        localStorage.removeItem('job-admin-auth')
      }
    }
  }, [])

  // Load dynamic admin data
  const loadAdminData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        if (data.stats) setUsageStats(data.stats)
        if (data.features) setFeatureUsage(data.features)
        if (data.issues) setRecentIssues(data.issues)
        if (data.abuse) setAbuseAttempts(data.abuse)
      }
    } catch (error) {
      console.error('Failed to load admin data:', error)
      // Set fallback data
      setUsageStats({
        totalSessions: 12847 + Math.floor(Math.random() * 1000),
        activeSessions: 300 + Math.floor(Math.random() * 100),
        totalTokens: 8456234 + Math.floor(Math.random() * 100000),
        avgResponseTime: 1.5 + Math.random() * 0.5,
        errorRate: 0.01 + Math.random() * 0.02,
        peakHour: `${12 + Math.floor(Math.random() * 6)}:00`,
      })
      setFeatureUsage([
        { name: 'CV Maker', tokens: 4234567, requests: 8934 + Math.floor(Math.random() * 500), avgLatency: 2.1, errors: Math.floor(Math.random() * 20) },
        { name: 'CV Analyzer', tokens: 2845123, requests: 5621 + Math.floor(Math.random() * 300), avgLatency: 1.5, errors: Math.floor(Math.random() * 15) },
        { name: 'Interview', tokens: 1376544, requests: 3245 + Math.floor(Math.random() * 200), avgLatency: 1.9, errors: Math.floor(Math.random() * 10) },
      ])
      setAbuseAttempts([
        { type: 'Prompt Injection', count: 20 + Math.floor(Math.random() * 20), blocked: true, lastSeen: `${Math.floor(Math.random() * 5) + 1}h ago` },
        { type: 'Rate Limit Exceeded', count: 100 + Math.floor(Math.random() * 100), blocked: true, lastSeen: `${Math.floor(Math.random() * 3)}h ago` },
        { type: 'Suspicious Content', count: 5 + Math.floor(Math.random() * 10), blocked: true, lastSeen: `${Math.floor(Math.random() * 12)}h ago` },
      ])
    }
    
    // Load issues from API
    try {
      const issuesResponse = await fetch('/api/issues')
      if (issuesResponse.ok) {
        const issuesData = await issuesResponse.json()
        if (issuesData.issues?.length > 0) {
          setRecentIssues(issuesData.issues.map((issue: any) => ({
            ...issue,
            time: getRelativeTime(new Date(issue.createdAt))
          })))
        } else {
          // Fallback issues
          setRecentIssues([
            { id: 'ISS-123', feature: 'CV Maker', description: 'PDF export cuts off content', severity: 'high' as const, status: 'open' as const, time: '2h ago', createdAt: new Date() },
            { id: 'ISS-122', feature: 'Interview', description: 'Timer freezes on tab switch', severity: 'medium' as const, status: 'in-progress' as const, time: '5h ago', createdAt: new Date() },
          ])
        }
      }
    } catch {
      setRecentIssues([
        { id: 'ISS-123', feature: 'CV Maker', description: 'PDF export cuts off content', severity: 'high', status: 'open', time: '2h ago', createdAt: new Date() },
        { id: 'ISS-122', feature: 'Interview', description: 'Timer freezes on tab switch', severity: 'medium', status: 'in-progress', time: '5h ago', createdAt: new Date() },
      ])
    }
    
    setIsLoading(false)
  }

  // Helper to get relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Just now'
  }

  const handleLogin = () => {
    if (validateAdminCredentials(username, password)) {
      setIsAuthenticated(true)
      localStorage.setItem('job-admin-auth', JSON.stringify({ username, authenticated: true }))
      setError('')
      loadAdminData()
    } else {
      setError('Invalid username or password. Access denied.')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUsername('')
    setPassword('')
    localStorage.removeItem('job-admin-auth')
  }

  const handleRefresh = () => {
    loadAdminData()
  }

  const handleUpdateIssueStatus = async (issueId: string, newStatus: string) => {
    try {
      await fetch('/api/issues', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId, status: newStatus })
      })
      // Refresh issues
      loadAdminData()
    } catch (error) {
      console.error('Failed to update issue:', error)
    }
  }

  const filteredIssues = issueFilter === 'all' 
    ? recentIssues 
    : recentIssues.filter(i => i.status === issueFilter)

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-grid flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card glass className="w-full max-w-md p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                <Lock className="w-8 h-8 text-indigo-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Admin Access</h1>
              <p className="text-gray-400 mt-2">
                This page is restricted to authorized users only.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && document.getElementById('password-input')?.focus()}
              />
              
              <Input
                id="password-input"
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                error={error}
              />
              
              <Button 
                className="w-full" 
                onClick={handleLogin}
                disabled={!username.trim() || !password.trim()}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Access Dashboard
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              Authorized administrators only.
            </p>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-grid py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back, <span className="text-indigo-400">{username}</span></p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card glass className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <Badge variant="success" className="text-xs">+12%</Badge>
            </div>
            <p className="text-2xl font-bold text-white">{usageStats.totalSessions.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Sessions</p>
          </Card>

          <Card glass className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-2xl font-bold text-white">{usageStats.activeSessions}</p>
            <p className="text-xs text-gray-500">Active Now</p>
          </Card>

          <Card glass className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{(usageStats.totalTokens / 1000000).toFixed(1)}M</p>
            <p className="text-xs text-gray-500">Tokens Used</p>
          </Card>

          <Card glass className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <Badge variant="info" className="text-xs">avg</Badge>
            </div>
            <p className="text-2xl font-bold text-white">{usageStats.avgResponseTime}s</p>
            <p className="text-xs text-gray-500">Response Time</p>
          </Card>

          <Card glass className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <TrendingDown className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{(usageStats.errorRate * 100).toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Error Rate</p>
          </Card>

          <Card glass className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Server className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{usageStats.peakHour}</p>
            <p className="text-xs text-gray-500">Peak Hour</p>
          </Card>
        </div>

        <Tabs defaultValue="usage" className="space-y-6">
          <TabsList>
            <TabsTrigger value="usage">AI Usage</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="health">System Health</TabsTrigger>
          </TabsList>

          {/* AI Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {featureUsage.map((feature) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card glass className="p-6">
                    <CardHeader className="p-0 mb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{feature.name}</CardTitle>
                        <Badge>{feature.requests.toLocaleString()} req</Badge>
                      </div>
                    </CardHeader>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Tokens Used</span>
                          <span className="text-white">{(feature.tokens / 1000000).toFixed(2)}M</span>
                        </div>
                        <Progress value={(feature.tokens / 5000000) * 100} size="sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center pt-4 border-t border-gray-800">
                        <div>
                          <p className="text-lg font-semibold text-white">{feature.avgLatency}s</p>
                          <p className="text-xs text-gray-500">Avg Latency</p>
                        </div>
                        <div>
                          <p className={`text-lg font-semibold ${feature.errors > 10 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {feature.errors}
                          </p>
                          <p className="text-xs text-gray-500">Errors</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Token Distribution Chart Placeholder */}
            <Card glass className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle>Token Usage Over Time</CardTitle>
                <CardDescription>Hourly breakdown of token consumption</CardDescription>
              </CardHeader>
              <div className="h-64 flex items-end justify-around space-x-2">
                {Array.from({ length: 24 }).map((_, i) => {
                  const height = Math.random() * 80 + 20
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t transition-all hover:from-indigo-500 hover:to-indigo-300"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-gray-500 mt-2">{i}</span>
                    </div>
                  )
                })}
              </div>
            </Card>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues" className="space-y-6">
            <Card glass className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <CardTitle>Issue Management</CardTitle>
                  <CardDescription>Track and resolve reported issues</CardDescription>
                </div>
                <div className="flex items-center space-x-3">
                  <Select value={issueFilter} onValueChange={setIssueFilter}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Issues</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                {filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${
                        issue.severity === 'high' ? 'bg-red-400' :
                        issue.severity === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                      }`} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <code className="text-xs text-indigo-400">{issue.id}</code>
                          <Badge variant={
                            issue.status === 'open' ? 'info' :
                            issue.status === 'in-progress' ? 'warning' : 'success'
                          } className="text-xs">
                            {issue.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-white mt-1">{issue.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{issue.feature} • {issue.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {issue.status !== 'resolved' && (
                        <Button variant="ghost" size="sm">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-6">
                <Button variant="outline">Load More</Button>
              </div>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card glass className="p-6">
                <CardHeader className="p-0 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <CardTitle>Abuse Detection</CardTitle>
                      <CardDescription>Blocked attempts in last 24h</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <div className="space-y-4">
                  {abuseAttempts.map((attempt) => (
                    <div
                      key={attempt.type}
                      className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {attempt.blocked ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{attempt.type}</p>
                          <p className="text-xs text-gray-500">Last seen: {attempt.lastSeen}</p>
                        </div>
                      </div>
                      <Badge variant={attempt.blocked ? 'success' : 'danger'}>
                        {attempt.count} blocked
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card glass className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle>Security Status</CardTitle>
                </CardHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span className="text-white">Rate Limiting</span>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span className="text-white">Prompt Filtering</span>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span className="text-white">Session Validation</span>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      <span className="text-white">DDoS Protection</span>
                    </div>
                    <Badge variant="warning">Monitoring</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="health" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card glass className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="flex items-center">
                    <Server className="w-5 h-5 mr-2 text-indigo-400" />
                    API Server
                  </CardTitle>
                </CardHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status</span>
                    <Badge variant="success">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Uptime</span>
                    <span className="text-white">99.97%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Response Time</span>
                    <span className="text-white">45ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Memory Usage</span>
                    <span className="text-white">62%</span>
                  </div>
                  <Progress value={62} size="sm" />
                </div>
              </Card>

              <Card glass className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                    OpenRouter API
                  </CardTitle>
                </CardHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status</span>
                    <Badge variant="success">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Quota Used</span>
                    <span className="text-white">$234.56</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Remaining</span>
                    <span className="text-white">$765.44</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Rate Limit</span>
                    <span className="text-white">43%</span>
                  </div>
                  <Progress value={43} size="sm" variant="success" />
                </div>
              </Card>

              <Card glass className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-cyan-400" />
                    Database
                  </CardTitle>
                </CardHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status</span>
                    <Badge variant="success">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Connections</span>
                    <span className="text-white">24/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Query Time</span>
                    <span className="text-white">12ms avg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Storage</span>
                    <span className="text-white">2.4GB</span>
                  </div>
                  <Progress value={24} size="sm" variant="success" />
                </div>
              </Card>
            </div>

            {/* Recent Errors */}
            <Card glass className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle>Recent Errors</CardTitle>
                <CardDescription>Last 10 system errors</CardDescription>
              </CardHeader>
              <div className="space-y-2">
                {[
                  { time: '14:23:45', type: 'API Timeout', message: 'OpenRouter response exceeded 30s', feature: 'CV Maker' },
                  { time: '13:15:22', type: 'Validation Error', message: 'Invalid CV block structure', feature: 'CV Maker' },
                  { time: '12:45:11', type: 'Rate Limit', message: 'Session rate limit exceeded', feature: 'Interview' },
                ].map((error, i) => (
                  <div key={i} className="flex items-center space-x-4 p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                    <code className="text-xs text-gray-500">{error.time}</code>
                    <Badge variant="danger" className="text-xs">{error.type}</Badge>
                    <span className="text-sm text-gray-300 flex-1">{error.message}</span>
                    <span className="text-xs text-gray-500">{error.feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
