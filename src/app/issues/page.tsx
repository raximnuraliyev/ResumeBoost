'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare, Send, CheckCircle, Clock, AlertCircle,
  Image as ImageIcon, X, Copy, Check, RefreshCw
} from 'lucide-react'
import {
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent,
  Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Badge
} from '@/components/ui'
import { FEATURES, ISSUE_SEVERITIES, ISSUE_STATUSES } from '@/lib/constants'

interface SubmittedIssue {
  id: string
  feature: string
  description: string
  severity: string
  status: string
  createdAt: Date
}

// Generate a session ID for tracking
const getSessionId = () => {
  if (typeof window === 'undefined') return ''
  let sessionId = localStorage.getItem('issue-session-id')
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem('issue-session-id', sessionId)
  }
  return sessionId
}

export default function IssuesPage() {
  const [feature, setFeature] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState('medium')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedIssue, setSubmittedIssue] = useState<SubmittedIssue | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [isLoadingIssues, setIsLoadingIssues] = useState(false)

  // Dynamically loaded previous issues from API
  const [previousIssues, setPreviousIssues] = useState<SubmittedIssue[]>([])

  // Load issues on mount
  useEffect(() => {
    loadPreviousIssues()
  }, [])

  const loadPreviousIssues = async () => {
    setIsLoadingIssues(true)
    try {
      const sessionId = getSessionId()
      const response = await fetch(`/api/issues?sessionId=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.issues?.length > 0) {
          setPreviousIssues(data.issues.map((issue: any) => ({
            ...issue,
            createdAt: new Date(issue.createdAt)
          })))
        }
      }
    } catch (error) {
      console.error('Failed to load issues:', error)
    }
    setIsLoadingIssues(false)
  }

  const handleSubmit = async () => {
    if (!description.trim()) return
    if (!feature) {
      setError('Please select a feature')
      return
    }

    setIsSubmitting(true)
    setError('')
    
    try {
      const sessionId = getSessionId()
      
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          feature,
          description,
          severity,
          screenshot: screenshot ? await convertFileToBase64(screenshot) : undefined,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit issue')
      }
      
      const newIssue: SubmittedIssue = {
        id: data.issue.id,
        feature,
        description,
        severity,
        status: 'open',
        createdAt: new Date(data.issue.createdAt),
      }

      setSubmittedIssue(newIssue)
      
      // Reset form
      setFeature('')
      setDescription('')
      setSeverity('medium')
      setScreenshot(null)
      
      // Refresh issues list
      loadPreviousIssues()
    } catch (err: any) {
      setError(err.message || 'Failed to submit issue. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const copyIssueId = () => {
    if (submittedIssue) {
      navigator.clipboard.writeText(submittedIssue.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4 text-blue-400" />
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-400" />
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="info">Open</Badge>
      case 'in-progress':
        return <Badge variant="warning">In Progress</Badge>
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-grid py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4"
          >
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">No Account Required</span>
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">Support & Issues</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Found a bug? Have feedback? Report it here. No login needed – 
            we'll give you an issue ID to track progress.
          </p>
        </div>

        {/* Success Message */}
        {submittedIssue && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-emerald-500/10 border-emerald-500/30 p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-emerald-400 mb-1">
                    Issue Submitted Successfully
                  </h3>
                  <p className="text-gray-300 mb-3">
                    Your issue has been recorded. Save this ID to track its status:
                  </p>
                  <div className="flex items-center space-x-3">
                    <code className="px-4 py-2 bg-gray-800 rounded-lg text-white font-mono text-lg">
                      {submittedIssue.id}
                    </code>
                    <Button variant="outline" size="sm" onClick={copyIssueId}>
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <button
                  onClick={() => setSubmittedIssue(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Submit Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card glass className="p-6">
                <CardHeader className="p-0 mb-6">
                  <CardTitle>Report an Issue</CardTitle>
                  <CardDescription>
                    Describe the problem in detail. Include steps to reproduce if possible.
                  </CardDescription>
                </CardHeader>

                <div className="space-y-6">
                  {/* Feature Selection */}
                  <Select value={feature} onValueChange={setFeature}>
                    <SelectTrigger label="Affected Feature (Optional)">
                      <SelectValue placeholder="Select a feature..." />
                    </SelectTrigger>
                    <SelectContent>
                      {FEATURES.map(f => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">Other / General</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Description */}
                  <Textarea
                    label="Description"
                    placeholder="Describe the issue in detail. What happened? What did you expect to happen? Steps to reproduce?"
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />

                  {/* Severity */}
                  <Select value={severity} onValueChange={setSeverity}>
                    <SelectTrigger label="Severity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ISSUE_SEVERITIES.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          <span className={s.color}>{s.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Screenshot Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Screenshot (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-gray-600 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="screenshot"
                        onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                      />
                      <label htmlFor="screenshot" className="cursor-pointer">
                        {screenshot ? (
                          <div className="flex items-center justify-center space-x-3">
                            <ImageIcon className="w-6 h-6 text-emerald-400" />
                            <span className="text-white">{screenshot.name}</span>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                setScreenshot(null)
                              }}
                              className="text-gray-400 hover:text-red-400"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <ImageIcon className="w-8 h-8 text-gray-500 mx-auto" />
                            <p className="text-sm text-gray-400">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!description.trim() || isSubmitting}
                    isLoading={isSubmitting}
                    onClick={handleSubmit}
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Submit Issue
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By submitting, you agree that this feedback may be used to improve the platform.
                    No personal data is collected beyond the session ID.
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Previous Issues */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card glass className="p-6">
                <CardHeader className="p-0 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Recent Issues</CardTitle>
                      <CardDescription>
                        Issues from this session
                      </CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={loadPreviousIssues}
                      disabled={isLoadingIssues}
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingIssues ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>

                {isLoadingIssues ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 text-gray-500 mx-auto mb-3 animate-spin" />
                    <p className="text-sm text-gray-500">Loading issues...</p>
                  </div>
                ) : previousIssues.length > 0 ? (
                  <div className="space-y-4">
                    {previousIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="p-4 bg-gray-800/30 rounded-xl space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <code className="text-xs font-mono text-indigo-400">
                            {issue.id}
                          </code>
                          {getStatusBadge(issue.status)}
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2">
                          {issue.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{FEATURES.find(f => f.id === issue.feature)?.name || 'General'}</span>
                          <span>{issue.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No issues submitted yet</p>
                  </div>
                )}
              </Card>

              {/* FAQ */}
              <Card glass className="p-6 mt-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-base">Quick Help</CardTitle>
                </CardHeader>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <p className="font-medium text-white mb-1">CV not downloading?</p>
                    <p className="text-gray-400">Try a different browser or disable ad blockers.</p>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <p className="font-medium text-white mb-1">AI seems stuck?</p>
                    <p className="text-gray-400">Refresh the page. Your session data is preserved.</p>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <p className="font-medium text-white mb-1">Lost your issue ID?</p>
                    <p className="text-gray-400">Check your browser's console or local storage.</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
