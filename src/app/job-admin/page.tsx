'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, AlertTriangle, Users, Clock, Zap,
  TrendingUp, TrendingDown, Shield, Eye, CheckCircle,
  XCircle, Filter, RefreshCw, Lock, LogIn, Trash2,
  Edit3, PlayCircle, FileText,
  MessageSquare, Briefcase
} from 'lucide-react'
import {
  Button, Card, CardHeader, CardTitle, CardDescription,
  Badge, Progress, Tabs, TabsList, TabsTrigger, TabsContent,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Input
} from '@/components/ui'
import { validateAdminCredentials } from '@/lib/openrouter'

// Types
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
  icon?: React.ReactNode
}

interface Issue {
  id: string
  feature: string
  description: string
  severity: 'high' | 'medium' | 'low'
  status: 'open' | 'in-progress' | 'resolved'
  time: string
  createdAt: Date
  email?: string
}

interface AbuseAttempt {
  type: string
  count: number
  blocked: boolean
  lastSeen: string
}

interface SecurityStatus {
  name: string
  status: 'active' | 'monitoring'
  description: string
  metric: number
}

interface HourlyData {
  hour: number
  tokens: number
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [timeRange, setTimeRange] = useState('24h')
  const [issueFilter, setIssueFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [editingIssue, setEditingIssue] = useState<string | null>(null)
  
  // Dynamic data state
  const [usageStats, setUsageStats] = useState<AdminStats | null>(null)
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([])
  const [recentIssues, setRecentIssues] = useState<Issue[]>([])
  const [abuseAttempts, setAbuseAttempts] = useState<AbuseAttempt[]>([])
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus[]>([])
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  // Helper to get relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  // Load dynamic admin data
  const loadAdminData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Get or create session ID for tracking
      let sessionId = localStorage.getItem('admin-session-id')
      if (!sessionId) {
        sessionId = `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('admin-session-id', sessionId)
      }
      
      // Load stats from admin API with session ID
      const statsResponse = await fetch(`/api/admin/stats?sessionId=${sessionId}`)
      if (statsResponse.ok) {
        const data = await statsResponse.json()
        if (data.stats) setUsageStats(data.stats)
        if (data.features) {
          setFeatureUsage(data.features.map((f: FeatureUsage) => ({
            ...f,
            icon: f.name === 'CV Maker' ? <FileText className="w-5 h-5" /> :
                  f.name === 'CV Analyzer' ? <Eye className="w-5 h-5" /> :
                  f.name === 'Interview' ? <MessageSquare className="w-5 h-5" /> :
                  <Briefcase className="w-5 h-5" />
          })))
        }
        if (data.hourlyData) setHourlyData(data.hourlyData)
        if (data.abuse) setAbuseAttempts(data.abuse)
        if (data.platformHealth) setSecurityStatus(data.platformHealth)
      }
      
      // Load issues from issues API
      const issuesResponse = await fetch('/api/issues')
      if (issuesResponse.ok) {
        const issuesData = await issuesResponse.json()
        if (issuesData.issues?.length > 0) {
          setRecentIssues(issuesData.issues.map((issue: Issue) => ({
            ...issue,
            time: getRelativeTime(new Date(issue.createdAt))
          })))
        }
      }
      
      setDataLoaded(true)
    } catch (error) {
      console.error('Failed to load admin data:', error)
    }
    setIsLoading(false)
  }, [])

  // Check for existing auth on mount - use layout effect for sync state restoration
  useEffect(() => {
    let mounted = true
    const savedAuth = localStorage.getItem('job-admin-auth')
    if (savedAuth && mounted) {
      try {
        const parsed = JSON.parse(savedAuth)
        if (parsed.username && parsed.authenticated) {
          // Use functional updates to avoid cascading renders
          Promise.resolve().then(() => {
            if (mounted) {
              setIsAuthenticated(true)
              setUsername(parsed.username)
            }
          })
        }
      } catch {
        localStorage.removeItem('job-admin-auth')
      }
    }
    return () => { mounted = false }
  }, [])

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated && !dataLoaded) {
      // Defer the data loading to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        loadAdminData()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, dataLoaded, loadAdminData])

  const handleLogin = () => {
    if (validateAdminCredentials(username, password)) {
      setIsAuthenticated(true)
      localStorage.setItem('job-admin-auth', JSON.stringify({ username, authenticated: true }))
      setError('')
    } else {
      setError('Invalid username or password. Access denied.')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUsername('')
    setPassword('')
    setDataLoaded(false)
    localStorage.removeItem('job-admin-auth')
  }

  const handleRefresh = () => {
    setDataLoaded(false)
    loadAdminData()
  }

  const handleUpdateIssueStatus = async (issueId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/issues', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId, status: newStatus })
      })
      
      if (response.ok) {
        setRecentIssues(prev => prev.map(issue => 
          issue.id === issueId ? { ...issue, status: newStatus as Issue['status'] } : issue
        ))
        setEditingIssue(null)
      }
    } catch (error) {
      console.error('Failed to update issue:', error)
    }
  }

  const handleDeleteIssue = async (issueId: string) => {
    try {
      const response = await fetch(`/api/issues?issueId=${issueId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setRecentIssues(prev => prev.filter(issue => issue.id !== issueId))
        setShowDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Failed to delete issue:', error)
    }
  }

  const filteredIssues = issueFilter === 'all' 
    ? recentIssues 
    : recentIssues.filter(i => i.status === issueFilter)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'in-progress': return <PlayCircle className="w-4 h-4 text-blue-400" />
      case 'resolved': return <CheckCircle className="w-4 h-4 text-emerald-400" />
      default: return null
    }
  }

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

  // Loading state
  if (isLoading && !dataLoaded) {
    return (
      <div className="min-h-screen bg-grid flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <RefreshCw className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard data...</p>
        </motion.div>
      </div>
    )
  }

  // No data state
  const hasNoData = !usageStats && featureUsage.length === 0 && recentIssues.length === 0

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

        {hasNoData ? (
          <Card glass className="p-12 text-center">
            <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Data Available</h2>
            <p className="text-gray-400 mb-6">
              Start using ResumeBoost features to see analytics here.
              <br />
              Data will automatically appear as users interact with the platform.
            </p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Again
            </Button>
          </Card>
        ) : (
          <>
            {/* Overview Stats */}
            {usageStats && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <Card glass className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-indigo-400" />
                    {usageStats.totalSessions > 0 && (
                      <Badge variant="success" className="text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-white">{usageStats.totalSessions.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total Sessions</p>
                </Card>

                <Card glass className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    {usageStats.activeSessions > 0 && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
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
                  <p className="text-2xl font-bold text-white">{usageStats.avgResponseTime.toFixed(1)}s</p>
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
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{usageStats.peakHour}</p>
                  <p className="text-xs text-gray-500">Peak Hour</p>
                </Card>
              </div>
            )}

            <Tabs defaultValue="usage" className="space-y-6">
              <TabsList>
                <TabsTrigger value="usage">
                  <Zap className="w-4 h-4 mr-2" />
                  AI Usage
                </TabsTrigger>
                <TabsTrigger value="issues">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Issues ({recentIssues.length})
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </TabsTrigger>
              </TabsList>

              {/* AI Usage Tab */}
              <TabsContent value="usage" className="space-y-6">
                {/* Always show feature cards */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {(featureUsage.length > 0 ? featureUsage : [
                    { name: 'CV Maker', tokens: 0, requests: 0, avgLatency: 0, errors: 0, icon: <FileText className="w-5 h-5" /> },
                    { name: 'CV Analyzer', tokens: 0, requests: 0, avgLatency: 0, errors: 0, icon: <Eye className="w-5 h-5" /> },
                    { name: 'Interview', tokens: 0, requests: 0, avgLatency: 0, errors: 0, icon: <MessageSquare className="w-5 h-5" /> },
                  ]).map((feature, index) => (
                    <motion.div
                      key={feature.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card glass className="p-6">
                        <CardHeader className="p-0 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-xl ${feature.requests > 0 ? 'bg-indigo-500/20' : 'bg-gray-700/30'} flex items-center justify-center ${feature.requests > 0 ? 'text-indigo-400' : 'text-gray-500'}`}>
                                {feature.icon}
                              </div>
                              <CardTitle className="text-lg">{feature.name}</CardTitle>
                            </div>
                            <Badge variant={feature.requests > 0 ? 'info' : 'default'}>
                              {feature.requests.toLocaleString()} req
                            </Badge>
                          </div>
                        </CardHeader>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-400">Tokens Used</span>
                              <span className="text-white">
                                {feature.tokens > 0 ? `${(feature.tokens / 1000000).toFixed(3)}M` : '0'}
                              </span>
                            </div>
                            <Progress value={feature.tokens > 0 ? Math.min((feature.tokens / 5000000) * 100, 100) : 0} size="sm" />
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-center pt-4 border-t border-gray-800">
                            <div>
                              <p className="text-lg font-semibold text-white">
                                {feature.avgLatency > 0 ? `${feature.avgLatency.toFixed(1)}s` : '--'}
                              </p>
                              <p className="text-xs text-gray-500">Avg Latency</p>
                            </div>
                            <div>
                              <p className={`text-lg font-semibold ${feature.errors > 10 ? 'text-red-400' : feature.errors > 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                                {feature.errors}
                              </p>
                              <p className="text-xs text-gray-500">Errors</p>
                            </div>
                          </div>
                          {feature.requests === 0 && (
                            <div className="text-center pt-2">
                              <p className="text-xs text-gray-500 italic">No activity yet</p>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Token Usage Chart */}
                <Card glass className="p-6">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle>Token Usage Over Time</CardTitle>
                    <CardDescription>Hourly breakdown of token consumption (24h)</CardDescription>
                  </CardHeader>
                  <div className="h-64 flex items-end justify-around space-x-1">
                    {(hourlyData.length > 0 ? hourlyData : Array.from({ length: 24 }, (_, i) => ({ hour: i, tokens: 0 }))).map((data) => {
                      const maxTokens = Math.max(...hourlyData.map(d => d.tokens), 1)
                      const height = maxTokens > 0 ? (data.tokens / maxTokens) * 100 : 0
                      const currentHour = new Date().getHours()
                      const isCurrentHour = data.hour === currentHour
                      return (
                        <div key={data.hour} className="flex-1 flex flex-col items-center group">
                          <div className="relative w-full h-48 flex items-end">
                            <div
                              className={`w-full rounded-t transition-all ${
                                isCurrentHour 
                                  ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' 
                                  : height > 0 
                                    ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-indigo-300'
                                    : 'bg-gray-700/30'
                              }`}
                              style={{ 
                                height: height > 0 ? `${Math.max(height, 5)}%` : '4px',
                                minHeight: '4px' 
                              }}
                            />
                            {data.tokens > 0 && (
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 px-2 py-1 rounded text-xs text-white whitespace-nowrap z-10">
                                {data.tokens.toLocaleString()} tokens
                              </div>
                            )}
                          </div>
                          <span className={`text-xs mt-2 ${isCurrentHour ? 'text-emerald-400 font-bold' : 'text-gray-500'}`}>
                            {data.hour}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  {hourlyData.every(d => d.tokens === 0) && (
                    <p className="text-center text-gray-500 text-sm mt-4">
                      Token usage will appear here as users interact with AI features
                    </p>
                  )}
                </Card>
              </TabsContent>

              {/* Issues Tab */}
              <TabsContent value="issues" className="space-y-6">
                <Card glass className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <CardTitle>Issue Management</CardTitle>
                      <CardDescription>Track, update, and resolve reported issues</CardDescription>
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

                  {filteredIssues.length > 0 ? (
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {filteredIssues.map((issue) => (
                          <motion.div
                            key={issue.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            className="p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4">
                                <div className={`w-3 h-3 rounded-full mt-1.5 ${getSeverityColor(issue.severity)}`} />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <code className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                                      {issue.id}
                                    </code>
                                    <Badge variant={
                                      issue.status === 'open' ? 'warning' :
                                      issue.status === 'in-progress' ? 'info' : 'success'
                                    } className="text-xs flex items-center gap-1">
                                      {getStatusIcon(issue.status)}
                                      {issue.status}
                                    </Badge>
                                    <Badge variant={
                                      issue.severity === 'high' ? 'danger' :
                                      issue.severity === 'medium' ? 'warning' : 'info'
                                    } className="text-xs">
                                      {issue.severity}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-white">{issue.description}</p>
                                  <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                                    <span className="flex items-center">
                                      <Briefcase className="w-3 h-3 mr-1" />
                                      {issue.feature}
                                    </span>
                                    <span className="flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {issue.time}
                                    </span>
                                    {issue.email && (
                                      <span className="text-indigo-400">{issue.email}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1">
                                {/* Status Change Dropdown */}
                                <div className="relative">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingIssue(editingIssue === issue.id ? null : issue.id)}
                                    className="text-gray-400 hover:text-white"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                  
                                  <AnimatePresence>
                                    {editingIssue === issue.id && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-1 z-10 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-2 min-w-[150px]"
                                      >
                                        <p className="text-xs text-gray-500 px-2 mb-1">Change Status</p>
                                        {['open', 'in-progress', 'resolved'].map((status) => (
                                          <button
                                            key={status}
                                            onClick={() => handleUpdateIssueStatus(issue.id, status)}
                                            className={`w-full text-left px-3 py-1.5 rounded text-sm flex items-center space-x-2 hover:bg-gray-800 transition-colors ${
                                              issue.status === status ? 'bg-gray-800 text-indigo-400' : 'text-gray-300'
                                            }`}
                                          >
                                            {status === 'open' && <AlertTriangle className="w-3 h-3" />}
                                            {status === 'in-progress' && <PlayCircle className="w-3 h-3" />}
                                            {status === 'resolved' && <CheckCircle className="w-3 h-3" />}
                                            <span className="capitalize">{status.replace('-', ' ')}</span>
                                          </button>
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>

                                {/* Quick Actions */}
                                {issue.status !== 'resolved' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUpdateIssueStatus(issue.id, 'resolved')}
                                    className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                    title="Mark as Resolved"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                )}

                                {/* Delete Button */}
                                <div className="relative">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDeleteConfirm(showDeleteConfirm === issue.id ? null : issue.id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    title="Delete Issue"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                  
                                  <AnimatePresence>
                                    {showDeleteConfirm === issue.id && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-1 z-10 bg-gray-900 border border-red-500/30 rounded-lg shadow-xl p-3 min-w-[180px]"
                                      >
                                        <p className="text-sm text-white mb-2">Delete this issue?</p>
                                        <div className="flex space-x-2">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setShowDeleteConfirm(null)}
                                            className="flex-1"
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            size="sm"
                                            onClick={() => handleDeleteIssue(issue.id)}
                                            className="flex-1 bg-red-500 hover:bg-red-600"
                                          >
                                            Delete
                                          </Button>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {issueFilter === 'all' ? 'No Issues Reported' : `No ${issueFilter} Issues`}
                      </h3>
                      <p className="text-gray-400">
                        {issueFilter === 'all' 
                          ? 'Great! No issues have been reported yet.' 
                          : 'Try changing the filter to see other issues.'}
                      </p>
                    </div>
                  )}
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
                    {abuseAttempts.length > 0 ? (
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
                    ) : (
                      <div className="text-center py-8">
                        <Shield className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No abuse attempts detected</p>
                      </div>
                    )}
                  </Card>

                  <Card glass className="p-6">
                    <CardHeader className="p-0 mb-4">
                      <CardTitle>Platform Health</CardTitle>
                      <CardDescription>Real-time system metrics</CardDescription>
                    </CardHeader>
                    <div className="space-y-3">
                      {(securityStatus.length > 0 ? securityStatus : [
                        { name: 'API Status', status: 'monitoring' as const, description: 'Waiting for requests', metric: 0 },
                        { name: 'Response Time', status: 'monitoring' as const, description: 'No data yet', metric: 0 },
                        { name: 'Error Rate', status: 'active' as const, description: 'No errors', metric: 0 },
                        { name: 'Active Users', status: 'monitoring' as const, description: 'No active users', metric: 0 },
                        { name: 'Token Usage', status: 'monitoring' as const, description: 'No tokens used', metric: 0 },
                      ]).map((item) => (
                        <div
                          key={item.name}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            item.status === 'active' 
                              ? 'bg-emerald-500/10 border-emerald-500/20' 
                              : 'bg-yellow-500/10 border-yellow-500/20'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {item.status === 'active' ? (
                              <CheckCircle className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-yellow-400" />
                            )}
                            <div>
                              <span className="text-white text-sm">{item.name}</span>
                              <p className="text-xs text-gray-500">{item.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.metric > 0 && (
                              <span className="text-xs text-gray-400 font-mono">{item.metric}</span>
                            )}
                            <Badge variant={item.status === 'active' ? 'success' : 'warning'}>
                              {item.status === 'active' ? 'Active' : 'Monitoring'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}
