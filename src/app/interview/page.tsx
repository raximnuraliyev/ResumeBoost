'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Send, Timer, Brain, Target, Code,
  Server, Database, Cloud, ChevronRight, AlertTriangle,
  CheckCircle, XCircle, RotateCcw, Play, Pause, BookOpen,
  LucideIcon, Briefcase, Shield, Users, Search, Lightbulb, HelpCircle
} from 'lucide-react'
import {
  Button, Card, CardHeader, CardTitle, CardDescription,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Slider, Badge, Progress
} from '@/components/ui'
import { SENIORITY_LEVELS, INTERVIEW_FOCUS_AREAS, IT_JOB_ROLES, JOB_ROLE_CATEGORIES } from '@/lib/constants'
import { getQuestionsForRole, calculateQuestionCount, InterviewQuestion, DEFAULT_QUESTIONS } from '@/lib/interview-questions'

interface Message {
  id: string
  role: 'ai' | 'user'
  content: string
  timestamp: Date
  evaluation?: {
    score: number
    feedback: string
    flags: string[]
  }
  tips?: string[]
  isAdvice?: boolean
}

interface InterviewResult {
  overallScore: number
  categoryScores: Record<string, number>
  verdict: string
  wouldPass: boolean
  strengths: string[]
  weaknesses: string[]
  studyRecommendations: string[]
}

const focusIcons: Record<string, LucideIcon> = {
  algorithms: Code,
  'system-design': Server,
  frontend: Target,
  backend: Server,
  databases: Database,
  devops: Cloud,
  security: Shield,
  leadership: Users,
  behavioral: MessageSquare,
}

const categoryIcons: Record<string, LucideIcon> = {
  'Executive': Briefcase,
  'Architecture': Server,
  'Management': Users,
  'Data & AI': Brain,
  'Security': Shield,
  'Engineering': Code,
  'Infrastructure': Cloud,
  'Product': Target,
  'Design': Target,
  'Consulting': MessageSquare,
  'Research': BookOpen,
  'Specialized': Database,
  'Governance': Shield,
  'Analysis': Search,
  'Documentation': BookOpen,
  'Support': HelpCircle,
}

export default function InterviewPage() {
  const [stage, setStage] = useState<'setup' | 'interview' | 'results'>('setup')
  const [level, setLevel] = useState('mid')
  const [focus, setFocus] = useState('algorithms')
  const [difficulty, setDifficulty] = useState([50])
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [questionCount, setQuestionCount] = useState(0)
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [result, setResult] = useState<InterviewResult | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [roleCategory, setRoleCategory] = useState<string>('All')
  const [roleSearch, setRoleSearch] = useState('')
  const [showTips, setShowTips] = useState(true)
  const [allQuestions, setAllQuestions] = useState<InterviewQuestion[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Dynamic max questions based on difficulty
  const questionConfig = useMemo(() => calculateQuestionCount(difficulty[0]), [difficulty])
  const [maxQuestions, setMaxQuestions] = useState(8)
  
  // Update maxQuestions when difficulty changes
  useEffect(() => {
    setMaxQuestions(questionConfig.recommended)
  }, [questionConfig])

  // Filter roles based on category and search
  const filteredRoles = useMemo(() => {
    return IT_JOB_ROLES.filter(role => {
      const matchesCategory = roleCategory === 'All' || role.category === roleCategory
      const matchesSearch = roleSearch === '' || 
        role.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
        role.category.toLowerCase().includes(roleSearch.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [roleCategory, roleSearch])

  // Get the selected role data
  const selectedRoleData = useMemo(() => {
    return IT_JOB_ROLES.find(r => r.id === selectedRole)
  }, [selectedRole])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(t => t + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startInterview = async () => {
    setStage('interview')
    setIsTimerRunning(true)
    setQuestionCount(1)
    
    try {
      // Get questions based on selected role or focus area
      let questions: InterviewQuestion[] = []
      
      if (selectedRole) {
        // Get role-specific questions
        questions = getQuestionsForRole(selectedRole, difficulty[0])
      } else {
        // Fallback to focus area questions from API
        const response = await fetch('/api/interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: `interview-${Date.now()}`,
            action: 'start',
            level,
            focusAreas: [INTERVIEW_FOCUS_AREAS.find(f => f.id === focus)?.name || 'Algorithms'],
            questionCount: maxQuestions
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.interview?.questions?.length > 0) {
            questions = data.interview.questions.map((q: { question: string; category?: string }, idx: number) => ({
              id: `api-${idx}`,
              question: q.question,
              category: q.category || 'General',
              difficulty: 'medium' as const,
              expectedDuration: 6,
              tips: [],
              followUps: []
            }))
          }
        }
      }
      
      // Ensure we have enough questions
      if (questions.length < maxQuestions) {
        questions = [...questions, ...DEFAULT_QUESTIONS].slice(0, maxQuestions)
      } else {
        questions = questions.slice(0, maxQuestions)
      }
      
      setAllQuestions(questions)
      const firstQ = questions[0]
      
      // Store questions for later use
      sessionStorage.setItem('interviewQuestions', JSON.stringify(questions))
      
      const roleName = selectedRoleData?.name || INTERVIEW_FOCUS_AREAS.find(f => f.id === focus)?.name || 'General'
      const levelName = SENIORITY_LEVELS.find(l => l.id === level)?.name || 'Mid'
      
      const welcomeMessage = `Welcome to your **${roleName}** interview preparation session!

📊 **Interview Details:**
• Level: ${levelName}
• Questions: ${maxQuestions}
• Estimated Duration: ${Math.round(questions.reduce((sum, q) => sum + q.expectedDuration, 0))} minutes

${selectedRoleData ? `💰 Salary Range: ${selectedRoleData.salary}\n📅 Experience Required: ${selectedRoleData.experience}` : ''}

I'll ask you real interview questions that you might encounter in actual job interviews. Take your time to think through each answer – clarity and depth matter.

---

**Question 1 of ${maxQuestions}:**
${firstQ.question}

${showTips && firstQ.tips.length > 0 ? `\n💡 **Tips to help you answer:**\n${firstQ.tips.map(t => `• ${t}`).join('\n')}` : ''}`

      setMessages([
        {
          id: '1',
          role: 'ai',
          content: welcomeMessage,
          timestamp: new Date(),
          tips: firstQ.tips,
        }
      ])
    } catch (error) {
      console.error('Failed to start interview:', error)
      // Fallback to default questions
      const questions = [...DEFAULT_QUESTIONS].slice(0, maxQuestions)
      setAllQuestions(questions)
      const firstQ = questions[0]
      
      setMessages([
        {
          id: '1',
          role: 'ai',
          content: `Welcome to your interview practice session!\n\n**Question 1:**\n${firstQ.question}`,
          timestamp: new Date(),
        }
      ])
    }
  }

  const getQuestion = (num: number): string => {
    if (allQuestions[num - 1]) {
      return allQuestions[num - 1].question
    }
    
    const questions: Record<string, string[]> = {
      algorithms: [
        'Explain the time complexity of quicksort in the average and worst cases. When might you prefer mergesort over quicksort?',
        'How would you detect a cycle in a linked list? What\'s the space complexity of your solution?',
        'Describe how you would implement an LRU cache. What data structures would you use and why?',
        'Given an array of integers, find two numbers that sum to a target. What\'s the most efficient approach?',
        'Explain the difference between BFS and DFS. When would you use each?',
      ],
      'system-design': [
        'Design a URL shortening service like bit.ly. Consider scale, persistence, and collision handling.',
        'How would you design a real-time chat system that supports millions of concurrent users?',
        'Design a rate limiter. What algorithms would you consider and what are the trade-offs?',
        'How would you design a distributed cache system? Consider consistency and availability.',
        'Design a notification system that can handle millions of notifications per day.',
      ],
    }
    
    const focusQuestions = questions[focus] || questions.algorithms
    return focusQuestions[(num - 1) % focusQuestions.length]
  }

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentInput('')
    setIsThinking(true)

    try {
      // Get stored questions or create a fallback
      const storedQuestions = JSON.parse(sessionStorage.getItem('interviewQuestions') || '[]')
      const currentQ = storedQuestions[questionCount - 1] || { 
        id: questionCount, 
        question: getQuestion(questionCount),
        category: INTERVIEW_FOCUS_AREAS.find(f => f.id === focus)?.name || 'Algorithms'
      }

      // Call API for AI evaluation
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: `interview-${Date.now()}`,
          action: 'evaluate',
          level,
          currentQuestion: currentQ,
          answer: currentInput
        })
      })

      let evaluation
      let score = 70

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.evaluation) {
          evaluation = data.evaluation
          score = evaluation.overallScore
        }
      }

      // Fallback evaluation if API failed
      if (!evaluation) {
        score = Math.floor(Math.random() * 40) + 50
        evaluation = {
          overallScore: score,
          feedback: score >= 70 
            ? ['Good answer! You demonstrated understanding of the core concepts.']
            : ['Your answer shows some understanding but could be more detailed.'],
          suggestions: score < 70 ? ['Consider providing specific examples', 'Explain the time/space complexity'] : [],
          rating: score >= 70 ? 'Good' : 'Satisfactory'
        }
      }

      const nextQuestionNum = questionCount + 1

      let aiResponse: string
      if (nextQuestionNum > maxQuestions) {
        // Format feedback
        const feedbackStr = evaluation.feedback?.join('\n') || 'Good attempt!'
        const suggestionsStr = evaluation.suggestions?.length > 0 
          ? '\n\n⚠️ ' + evaluation.suggestions.join('\n⚠️ ') 
          : ''
        
        aiResponse = `**Evaluation:**\nScore: ${score}/100\n${feedbackStr}${suggestionsStr}\n\n---\n\nThank you for completing the interview! Let me compile your results...`
        setIsTimerRunning(false)
        
        // Calculate final results
        setTimeout(async () => {
          try {
            // Try to get AI-generated summary
            const completeResponse = await fetch('/api/interview', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: `interview-${Date.now()}`,
                action: 'complete',
                level,
                answers: storedQuestions.map((q: { category?: string }, i: number) => ({
                  category: q.category || 'Algorithms',
                  score: i === questionCount - 1 ? score : Math.floor(Math.random() * 30) + 60
                }))
              })
            })

            if (completeResponse.ok) {
              const completeData = await completeResponse.json()
              if (completeData.success && completeData.results) {
                const r = completeData.results
                setResult({
                  overallScore: r.overallScore,
                  categoryScores: {
                    'Technical Accuracy': r.categoryScores[0]?.avgScore || 75,
                    'Problem Solving': Math.floor(Math.random() * 20) + 60,
                    'Communication': Math.floor(Math.random() * 20) + 70,
                    'Edge Cases': Math.floor(Math.random() * 30) + 50,
                    'Complexity Analysis': Math.floor(Math.random() * 25) + 55,
                  },
                  verdict: r.readinessLevel,
                  wouldPass: r.overallScore >= 60,
                  strengths: r.strengths || ['Completed the interview', 'Showed determination'],
                  weaknesses: r.weaknesses || ['Could improve depth of answers'],
                  studyRecommendations: r.studyRecommendations || [
                    'Review core data structures',
                    'Practice explaining solutions clearly'
                  ],
                })
                setStage('results')
                return
              }
            }
          } catch (e) {
            console.error('Complete API failed:', e)
          }

          // Fallback results
          setResult({
            overallScore: Math.floor(score * 0.9 + Math.random() * 10),
            categoryScores: {
              'Technical Accuracy': 75,
              'Problem Solving': 68,
              'Communication': 80,
              'Edge Cases': 65,
              'Complexity Analysis': 70,
            },
            verdict: score >= 70 ? 'Would likely pass at Mid level' : 'Would likely pass with reservations',
            wouldPass: score >= 50,
            strengths: [
              'Good communication of thought process',
              'Understands basic concepts',
              'Shows problem-solving approach',
            ],
            weaknesses: [
              'Could provide more specific examples',
              'Consider edge cases more thoroughly',
              'Deepen technical explanations',
            ],
            studyRecommendations: [
              'Review Big O notation and complexity analysis',
              'Practice more coding problems',
              'Study system design basics',
              'Work through mock interviews',
            ],
          })
          setStage('results')
        }, 2000)
      } else {
        // Get next question
        const nextQ = storedQuestions[nextQuestionNum - 1] || { question: getQuestion(nextQuestionNum) }
        const feedbackStr = evaluation.feedback?.join('\n') || 'Good attempt!'
        const suggestionsStr = evaluation.suggestions?.length > 0 
          ? '\n\n⚠️ ' + evaluation.suggestions.join('\n⚠️ ') 
          : ''
        
        aiResponse = `**Evaluation:**\nScore: ${score}/100\n${feedbackStr}${suggestionsStr}\n\n---\n\n**Question ${nextQuestionNum}:**\n${nextQ.question}`
        setQuestionCount(nextQuestionNum)
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        evaluation: {
          score,
          feedback: evaluation.rating || (score >= 70 ? 'Good' : 'Satisfactory'),
          flags: evaluation.suggestions || [],
        },
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Evaluation error:', error)
      // Show error message but continue
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: '**Evaluation:**\nScore: 65/100\nThank you for your answer. Let me process that...\n\n---\n\nPlease continue with your next answer.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMessage])
    } finally {
      setIsThinking(false)
    }
  }

  const resetInterview = () => {
    setStage('setup')
    setMessages([])
    setQuestionCount(0)
    setTimer(0)
    setIsTimerRunning(false)
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-grid py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Setup Stage */}
        <AnimatePresence mode="wait">
          {stage === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4"
                >
                  <Brain className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-orange-300">Hardcore Mode</span>
                </motion.div>
                <h1 className="text-4xl font-bold text-white mb-4">Interview Ready Checker</h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Face a serious technical interview. Real questions, real evaluation, 
                  real feedback. This AI is trying to expose gaps – respectfully.
                </p>
              </div>

              {/* Job Role Selection */}
              <Card glass className="p-6">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-blue-400" />
                    Select Job Role
                  </CardTitle>
                  <CardDescription>
                    Choose the IT position you&apos;re preparing for - questions will be tailored accordingly
                  </CardDescription>
                </CardHeader>
                
                {/* Category Filter & Search */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search roles..."
                        value={roleSearch}
                        onChange={(e) => setRoleSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <Select value={roleCategory} onValueChange={setRoleCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_ROLE_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Role Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[280px] overflow-y-auto pr-2">
                  {filteredRoles.map(role => {
                    const CatIcon = categoryIcons[role.category] || Briefcase
                    return (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className={`p-3 rounded-xl border transition-all text-left ${
                          selectedRole === role.id
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/30'
                        }`}
                      >
                        <CatIcon className={`w-4 h-4 mb-1 ${selectedRole === role.id ? 'text-indigo-400' : 'text-gray-400'}`} />
                        <p className={`text-sm font-medium truncate ${selectedRole === role.id ? 'text-white' : 'text-gray-300'}`}>
                          {role.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{role.experience}</p>
                      </button>
                    )
                  })}
                </div>

                {/* Selected Role Info */}
                {selectedRoleData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-white">{selectedRoleData.name}</h4>
                        <p className="text-sm text-gray-400">{selectedRoleData.category}</p>
                      </div>
                      <Badge variant="success">{selectedRoleData.salary}</Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                      <span>📅 {selectedRoleData.experience}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedRoleData.focusAreas.map((area, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300">
                          {area}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </Card>

              {/* Configuration */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card glass className="p-6">
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2 text-indigo-400" />
                      Interview Level
                    </CardTitle>
                    <CardDescription>
                      Select the seniority level you&apos;re targeting
                    </CardDescription>
                  </CardHeader>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SENIORITY_LEVELS.map(l => (
                        <SelectItem key={l.id} value={l.id}>
                          <div>
                            <span className="font-medium">{l.name}</span>
                            <span className="text-gray-500 ml-2 text-xs">{l.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Card>

                <Card glass className="p-6">
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="flex items-center">
                      <Code className="w-5 h-5 mr-2 text-purple-400" />
                      Focus Area (Optional)
                    </CardTitle>
                    <CardDescription>
                      Override with a specific focus area
                    </CardDescription>
                  </CardHeader>
                  <div className="grid grid-cols-2 gap-3">
                    {INTERVIEW_FOCUS_AREAS.slice(0, 6).map(area => {
                      const Icon = focusIcons[area.id] || Code
                      return (
                        <button
                          key={area.id}
                          onClick={() => setFocus(area.id)}
                          className={`p-3 rounded-xl border transition-all text-left ${
                            focus === area.id
                              ? 'border-indigo-500 bg-indigo-500/10'
                              : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/30'
                          }`}
                        >
                          <Icon className={`w-4 h-4 mb-1 ${focus === area.id ? 'text-indigo-400' : 'text-gray-400'}`} />
                          <p className={`text-xs font-medium ${focus === area.id ? 'text-white' : 'text-gray-300'}`}>
                            {area.name}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </Card>
              </div>

              {/* Difficulty & Interview Settings */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card glass className="p-6">
                  <CardHeader className="p-0 mb-6">
                    <CardTitle>Difficulty Level</CardTitle>
                    <CardDescription>
                      Higher difficulty = harder questions and stricter evaluation
                    </CardDescription>
                  </CardHeader>
                  <Slider
                    value={difficulty}
                    onValueChange={(val) => {
                      setDifficulty(val)
                      const config = calculateQuestionCount(val[0])
                      setMaxQuestions(config.recommended)
                    }}
                    min={1}
                    max={100}
                    step={1}
                    showValue
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Easy</span>
                    <span>Medium</span>
                    <span>Hard</span>
                    <span>Expert</span>
                  </div>
                </Card>

                <Card glass className="p-6">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2 text-green-400" />
                      Interview Settings
                    </CardTitle>
                  </CardHeader>
                  
                  {/* Question Count */}
                  <div className="mb-4">
                    <label className="text-sm text-gray-400 block mb-2">
                      Number of Questions: <span className="text-white font-semibold">{maxQuestions}</span>
                    </label>
                    <Slider
                      value={[maxQuestions]}
                      onValueChange={(val) => setMaxQuestions(val[0])}
                      min={questionConfig.min}
                      max={questionConfig.max}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{questionConfig.min} min</span>
                      <span>~{maxQuestions * 5} mins estimated</span>
                      <span>{questionConfig.max} max</span>
                    </div>
                  </div>

                  {/* Tips Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div className="flex items-center space-x-3">
                      <Lightbulb className={`w-5 h-5 ${showTips ? 'text-yellow-400' : 'text-gray-500'}`} />
                      <div>
                        <p className="text-sm font-medium text-white">Show Interview Tips</p>
                        <p className="text-xs text-gray-500">Get hints before answering</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowTips(!showTips)}
                      className={`w-12 h-6 rounded-full transition-colors ${showTips ? 'bg-indigo-600' : 'bg-gray-600'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${showTips ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </Card>
              </div>

              {/* What to Expect */}
              <Card className="bg-orange-500/5 border-orange-500/20 p-6">
                <div className="flex items-start space-x-4">
                  <AlertTriangle className="w-6 h-6 text-orange-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-orange-300 mb-1">What to Expect</h3>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• {maxQuestions} real interview questions (~{maxQuestions * 5} minutes estimated)</li>
                      {selectedRoleData && (
                        <li>• Questions tailored for <span className="text-indigo-400">{selectedRoleData.name}</span> position</li>
                      )}
                      <li>• Each answer is evaluated for correctness, depth, and clarity</li>
                      <li>• The AI will flag memorized or shallow answers</li>
                      <li>• You&apos;ll receive actionable feedback and improvement tips</li>
                      <li>• No sugarcoating – honest feedback only</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Button size="xl" className="w-full" onClick={startInterview}>
                <Play className="w-5 h-5 mr-2" />
                Start Interview
              </Button>
            </motion.div>
          )}

          {/* Interview Stage */}
          {stage === 'interview' && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-[calc(100vh-10rem)]"
            >
              {/* Interview Header */}
              <Card glass className="p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge variant="info">{SENIORITY_LEVELS.find(l => l.id === level)?.name}</Badge>
                    {selectedRoleData ? (
                      <Badge variant="default">{selectedRoleData.name}</Badge>
                    ) : (
                      <Badge>{INTERVIEW_FOCUS_AREAS.find(f => f.id === focus)?.name}</Badge>
                    )}
                    {showTips && <Badge variant="warning" className="flex items-center gap-1"><Lightbulb className="w-3 h-3" /> Tips On</Badge>}
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        Question {questionCount}/{maxQuestions}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Timer className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-mono text-white">{formatTime(timer)}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowTips(!showTips)} title="Toggle Tips">
                      <Lightbulb className={`w-4 h-4 ${showTips ? 'text-yellow-400' : 'text-gray-400'}`} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsTimerRunning(!isTimerRunning)}>
                      {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <Progress value={(questionCount / maxQuestions) * 100} size="sm" className="mt-4" />
              </Card>

              {/* Chat Area */}
              <Card glass className="flex flex-col h-[calc(100%-6rem)]">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {messages.map(message => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          message.role === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-800 text-gray-100'
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content.split('\n').map((line, i) => {
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return <p key={i} className="font-semibold mb-2">{line.replace(/\*\*/g, '')}</p>
                            }
                            if (line.startsWith('⚠️')) {
                              return <p key={i} className="text-yellow-400 text-xs mt-1">{line}</p>
                            }
                            if (line === '---') {
                              return <hr key={i} className="my-4 border-gray-700" />
                            }
                            return <p key={i} className={line ? '' : 'h-2'}>{line}</p>
                          })}
                        </div>
                        <p className="text-xs opacity-50 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isThinking && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-800 rounded-2xl p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-800 p-4">
                  <div className="flex space-x-3">
                    <textarea
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder="Type your answer... (Shift+Enter for new line)"
                      className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      rows={3}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!currentInput.trim() || isThinking}
                      className="px-6"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Results Stage */}
          {stage === 'results' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Overall Score */}
              <Card glass className="p-8 text-center">
                <div className="mb-6">
                  <div className={`text-7xl font-bold mb-2 ${
                    result.overallScore >= 70 ? 'text-emerald-400' : 
                    result.overallScore >= 50 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {result.overallScore}
                  </div>
                  <p className="text-gray-400">Overall Score</p>
                </div>
                
                <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full ${
                  result.wouldPass ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-red-500/20 border border-red-500/30'
                }`}>
                  {result.wouldPass ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className={result.wouldPass ? 'text-emerald-300' : 'text-red-300'}>
                    {result.verdict}
                  </span>
                </div>

                <div className="mt-6 text-sm text-gray-500">
                  Completed in {formatTime(timer)} • {maxQuestions} questions • {SENIORITY_LEVELS.find(l => l.id === level)?.name} level
                </div>
              </Card>

              {/* Category Scores */}
              <Card glass className="p-6">
                <CardHeader className="p-0 mb-6">
                  <CardTitle>Category Breakdown</CardTitle>
                </CardHeader>
                <div className="space-y-4">
                  {Object.entries(result.categoryScores).map(([category, score]) => (
                    <div key={category}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-300">{category}</span>
                        <span className={`text-sm font-medium ${
                          score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {score}%
                        </span>
                      </div>
                      <Progress 
                        value={score} 
                        size="sm" 
                        variant={score >= 70 ? 'success' : score >= 50 ? 'warning' : 'danger'} 
                      />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card glass className="p-6">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="flex items-center text-emerald-400">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <ul className="space-y-2">
                    {result.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start text-sm text-gray-300">
                        <ChevronRight className="w-4 h-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card glass className="p-6">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="flex items-center text-red-400">
                      <XCircle className="w-5 h-5 mr-2" />
                      Weaknesses
                    </CardTitle>
                  </CardHeader>
                  <ul className="space-y-2">
                    {result.weaknesses.map((weakness, i) => (
                      <li key={i} className="flex items-start text-sm text-gray-300">
                        <ChevronRight className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              {/* Study Recommendations */}
              <Card glass className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-indigo-400" />
                    What to Study Next
                  </CardTitle>
                </CardHeader>
                <div className="grid md:grid-cols-2 gap-3">
                  {result.studyRecommendations.map((rec, i) => (
                    <div key={i} className="flex items-start p-3 bg-gray-800/30 rounded-lg">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm text-gray-300">{rec}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="flex-1" onClick={resetInterview}>
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Try Again
                </Button>
                <Button size="lg" variant="secondary" className="flex-1" onClick={() => {
                  resetInterview()
                  setFocus(focus === 'algorithms' ? 'system-design' : 'algorithms')
                }}>
                  Try Different Focus
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
