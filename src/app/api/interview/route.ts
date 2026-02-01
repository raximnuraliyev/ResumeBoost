import { NextResponse } from 'next/server'
import { SENIORITY_LEVELS } from '@/lib/constants'
import { generateAIResponse, INTERVIEW_PROMPTS, AI_MODELS } from '@/lib/openrouter'
import { trackRequest, trackSanitizedInput, trackSessionValidation, trackPromptFilter, trackBlockedRequest, trackFeatureUsage, trackSession } from '@/lib/security-metrics'

// Interview question bank organized by level and focus area (fallback)
const questionBank: Record<string, Record<string, string[]>> = {
  junior: {
    'Data Structures': [
      'What is the difference between an array and a linked list? When would you use each?',
      'Explain how a hash table works. What is a hash collision and how can you handle it?',
      'What is the time complexity of searching in a binary search tree?',
      'Describe the difference between a stack and a queue. Give examples of use cases.',
      'What is a heap and where is it commonly used?',
    ],
    'Algorithms': [
      'Explain the difference between BFS and DFS. When would you use each?',
      'What is binary search and what is its time complexity?',
      'Describe bubble sort. What is its time complexity?',
      'What is recursion? Can you give an example problem that uses recursion?',
      'Explain the two-pointer technique with an example.',
    ],
    'System Design': [
      'What is the difference between SQL and NoSQL databases?',
      'Explain what caching is and why it is useful.',
      'What is an API and how does REST work?',
      'Describe the client-server architecture.',
      'What is the difference between vertical and horizontal scaling?',
    ],
    'Behavioral': [
      'Tell me about a challenging project you worked on.',
      'How do you handle disagreements with team members?',
      'Describe a time when you had to learn something new quickly.',
      'How do you prioritize your tasks?',
      'What motivates you as a software developer?',
    ],
  },
  mid: {
    'Data Structures': [
      'Explain the implementation of an LRU cache.',
      'What are self-balancing trees? Explain how AVL trees maintain balance.',
      'Describe a Trie and its applications.',
      'What is a graph? Explain different representations.',
      'How would you implement a priority queue?',
    ],
    'Algorithms': [
      'Explain Dijkstra\'s algorithm and its time complexity.',
      'What is dynamic programming? Give an example.',
      'Describe the quicksort algorithm and its average time complexity.',
      'What is the difference between greedy algorithms and dynamic programming?',
      'Explain the sliding window technique with a problem example.',
    ],
    'System Design': [
      'How would you design a URL shortening service?',
      'Explain the CAP theorem.',
      'What is database sharding and when would you use it?',
      'Describe microservices vs monolithic architecture.',
      'How does a load balancer work?',
    ],
    'Behavioral': [
      'Describe a time when you had to make a difficult technical decision.',
      'How do you mentor junior developers?',
      'Tell me about a time when you had to deal with technical debt.',
      'How do you handle project deadlines when scope changes?',
      'Describe a time when you improved a process or system.',
    ],
  },
  senior: {
    'Data Structures': [
      'Explain how a B-tree works and where it\'s commonly used.',
      'What are skip lists and how do they compare to balanced trees?',
      'Describe consistent hashing and its applications.',
      'How would you design a thread-safe data structure?',
      'Explain the implementation of a concurrent hash map.',
    ],
    'Algorithms': [
      'Explain the A* pathfinding algorithm.',
      'What is the difference between deterministic and randomized algorithms?',
      'Describe approximation algorithms and when to use them.',
      'How would you approach solving NP-hard problems in practice?',
      'Explain amortized analysis with an example.',
    ],
    'System Design': [
      'How would you design a distributed cache like Redis?',
      'Explain event-driven architecture and its trade-offs.',
      'Design a real-time notification system.',
      'How would you handle database migrations with zero downtime?',
      'Describe strategies for handling high-traffic scenarios.',
    ],
    'Behavioral': [
      'Describe how you\'ve influenced technical strategy at your company.',
      'How do you balance technical debt with feature development?',
      'Tell me about a system you designed that had to scale significantly.',
      'How do you handle conflicts between engineering and product teams?',
      'Describe your approach to building and leading engineering teams.',
    ],
  },
}

// Follow-up questions based on answers
const followUpQuestions: Record<string, string[]> = {
  'Data Structures': [
    'Can you walk me through the time complexity of that operation?',
    'How would you optimize this for memory usage?',
    'What edge cases would you need to handle?',
  ],
  'Algorithms': [
    'Can you code this solution?',
    'How would you test this algorithm?',
    'What is the space complexity?',
  ],
  'System Design': [
    'How would you handle failures in this system?',
    'What monitoring would you put in place?',
    'How would this scale to 10x the traffic?',
  ],
  'Behavioral': [
    'What would you do differently if you could do it again?',
    'How did the team react to your approach?',
    'What did you learn from this experience?',
  ],
}

export async function POST(request: Request) {
  trackRequest()
  try {
    const body = await request.json()
    const { 
      sessionId, 
      action, 
      level = 'mid', 
      focusAreas = ['Data Structures', 'Algorithms'],
      questionCount = 5,
      currentQuestion,
      answer,
    } = body
    
    if (!sessionId) {
      trackBlockedRequest()
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      )
    }
    
    trackSessionValidation()
    trackSession(sessionId, 'Interview')
    trackFeatureUsage('Interview')
    
    // Validate level
    if (!SENIORITY_LEVELS.some(l => l.id === level)) {
      trackBlockedRequest()
      return NextResponse.json(
        { success: false, error: 'Invalid seniority level' },
        { status: 400 }
      )
    }
    
    // Action: Generate interview questions
    if (action === 'start') {
      const questions: { id: number; question: string; category: string }[] = []
      let questionId = 1
      
      // Get questions from each focus area
      focusAreas.forEach((area: string) => {
        const areaQuestions = questionBank[level]?.[area] || []
        const shuffled = [...areaQuestions].sort(() => Math.random() - 0.5)
        const selected = shuffled.slice(0, Math.ceil(questionCount / focusAreas.length))
        
        selected.forEach(q => {
          questions.push({
            id: questionId++,
            question: q,
            category: area,
          })
        })
      })
      
      // Shuffle all questions
      const shuffledQuestions = questions.sort(() => Math.random() - 0.5).slice(0, questionCount)
      
      return NextResponse.json({
        success: true,
        interview: {
          level,
          focusAreas,
          totalQuestions: shuffledQuestions.length,
          questions: shuffledQuestions,
          startedAt: new Date().toISOString(),
        },
      })
    }
    
    // Action: Evaluate answer
    if (action === 'evaluate') {
      if (!currentQuestion || !answer) {
        return NextResponse.json(
          { success: false, error: 'Question and answer required' },
          { status: 400 }
        )
      }
      
      try {
        // Try AI evaluation first
        const prompt = INTERVIEW_PROMPTS.evaluateAnswer(currentQuestion.question, answer, level)
        const result = await generateAIResponse(
          [
            { role: 'system', content: 'You are a senior software engineer evaluating interview answers. Be fair but thorough. Output only valid JSON.' },
            { role: 'user', content: prompt }
          ],
          AI_MODELS.DEEPSEEK_CHIMERA,
          { temperature: 0.5, max_tokens: 1000, feature: 'Interview Evaluation' }
        )
        
        const evaluation = JSON.parse(result.content)
        
        return NextResponse.json({
          success: true,
          evaluation: {
            questionId: currentQuestion.id,
            ...evaluation,
          },
          tokensUsed: result.tokensUsed,
          model: 'deepseek-r1t-chimera',
        })
      } catch (aiError) {
        console.warn('AI evaluation failed, using heuristic:', aiError)
        
        // Fallback heuristic evaluation - STRICT scoring
        const answerLength = answer.trim().length
        const wordCount = answer.trim().split(/\s+/).length
        const hasKeywords = /complexity|algorithm|data structure|scalab|optim|implement|O\(|time|space|memory|recursive|iterative|hash|tree|array|list|queue|stack/i.test(answer)
        const hasExamples = /for example|such as|like|consider|instance|scenario|case/i.test(answer)
        const isStructured = answer.includes('\n') || answer.length > 200
        const hasExplanation = /because|therefore|this means|which allows|the reason|this is/i.test(answer)
        const isNonAnswer = /don't know|not sure|i would google|no idea|skip|pass/i.test(answer)
        
        // Very strict base scoring
        let baseScore = 10 // Start very low
        
        // Penalize non-answers heavily
        if (isNonAnswer || wordCount < 5) {
          baseScore = Math.floor(Math.random() * 15) + 5 // 5-20
        } else if (wordCount < 20) {
          // Very short answers
          baseScore = Math.floor(Math.random() * 20) + 15 // 15-35
        } else if (wordCount < 50) {
          // Short answers
          baseScore = 25 + (hasKeywords ? 15 : 0) + Math.floor(Math.random() * 15) // 25-55
        } else {
          // Reasonable length answers
          baseScore = 35 + (hasKeywords ? 20 : 0) + (hasExamples ? 15 : 0) + (hasExplanation ? 15 : 0) + Math.floor(Math.random() * 15)
        }
        
        const relevanceScore = Math.min(100, baseScore + (hasKeywords ? 10 : -10))
        const depthScore = Math.min(100, baseScore + (answerLength > 100 ? 10 : -15) + (hasExamples ? 10 : 0))
        const clarityScore = Math.min(100, baseScore + (isStructured ? 15 : 0) + (hasExplanation ? 10 : 0))
        const overallScore = Math.max(5, Math.min(100, Math.round((relevanceScore + depthScore + clarityScore) / 3)))
        
        const feedback: string[] = []
        const suggestions: string[] = []
        
        if (relevanceScore >= 70) {
          feedback.push('Good understanding of the core concepts.')
        } else {
          suggestions.push('Make sure to address all parts of the question directly.')
        }
        
        if (depthScore >= 70) {
          feedback.push('Nice depth of explanation with good examples.')
        } else {
          suggestions.push('Try to provide specific examples or use cases.')
        }
        
        const category = currentQuestion.category || 'Data Structures'
        const followUps = followUpQuestions[category] || []
        const followUp = overallScore > 50 && Math.random() > 0.5
          ? followUps[Math.floor(Math.random() * followUps.length)]
          : null

        return NextResponse.json({
          success: true,
          evaluation: {
            questionId: currentQuestion.id,
            overallScore,
            relevanceScore: Math.round(relevanceScore),
            depthScore: Math.round(depthScore),
            clarityScore: Math.round(clarityScore),
            feedback,
            suggestions,
            followUpQuestion: followUp,
            rating: overallScore >= 80 ? 'Excellent' : 
                    overallScore >= 60 ? 'Good' : 
                    overallScore >= 40 ? 'Satisfactory' : 'Needs Improvement',
          },
          tokensUsed: 0,
          model: 'fallback',
        })
      }
    }
    
    // Action: Generate final results
    if (action === 'complete') {
      const { answers } = body
      
      if (!answers || answers.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Answers required for completion' },
          { status: 400 }
        )
      }
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Calculate aggregate scores
      const avgScore = Math.round(answers.reduce((sum: number, a: { score: number }) => sum + a.score, 0) / answers.length)
      
      // Group scores by category
      const categoryScores: Record<string, number[]> = {}
      answers.forEach((a: { category: string; score: number }) => {
        if (!categoryScores[a.category]) categoryScores[a.category] = []
        categoryScores[a.category].push(a.score)
      })
      
      const categoryAverages = Object.entries(categoryScores).map(([category, scores]) => ({
        category,
        avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        questionsCount: scores.length,
      }))
      
      // Generate summary with ALWAYS providing study recommendations
      const strengths: string[] = []
      const weaknesses: string[] = []
      const studyRecommendations: string[] = []
      
      // Study resource mapping for each category
      const studyResources: Record<string, string[]> = {
        'Data Structures': [
          'Review arrays, linked lists, trees, and hash maps',
          'Practice LeetCode easy/medium problems on data structures',
          'Study time/space complexity for common operations'
        ],
        'Algorithms': [
          'Study sorting algorithms (quicksort, mergesort, heapsort)',
          'Practice dynamic programming on LeetCode',
          'Review graph algorithms (BFS, DFS, Dijkstra)'
        ],
        'System Design': [
          'Read "Designing Data-Intensive Applications" by Martin Kleppmann',
          'Study common patterns: load balancing, caching, sharding',
          'Practice designing systems like URL shortener, chat app'
        ],
        'Behavioral': [
          'Prepare STAR method stories for common scenarios',
          'Practice explaining past projects clearly',
          'Review leadership and teamwork examples'
        ]
      }
      
      categoryAverages.forEach(({ category, avgScore }) => {
        if (avgScore >= 75) {
          strengths.push(category)
        } else if (avgScore >= 50) {
          // Moderate performance - still needs work
          weaknesses.push(`${category} (needs improvement)`)
          const resources = studyResources[category] || [`Review ${category} fundamentals`]
          studyRecommendations.push(resources[0])
        } else {
          // Poor performance
          weaknesses.push(category)
          const resources = studyResources[category] || [`Review ${category} fundamentals and practice more problems`]
          studyRecommendations.push(...resources.slice(0, 2))
        }
      })
      
      // Always add general recommendations based on overall score
      if (avgScore < 40) {
        studyRecommendations.push('Consider taking a structured course on data structures & algorithms')
        studyRecommendations.push('Practice explaining your thought process out loud')
      } else if (avgScore < 60) {
        studyRecommendations.push('Focus on depth - practice explaining WHY, not just WHAT')
        studyRecommendations.push('Do mock interviews to improve communication')
      } else if (avgScore < 80) {
        studyRecommendations.push('Work on edge cases and complexity analysis')
      }
      
      // Ensure we always have at least some recommendations
      if (studyRecommendations.length === 0) {
        studyRecommendations.push('Keep practicing with increasingly difficult problems')
        studyRecommendations.push('Focus on system design for senior-level preparation')
      }
      
      if (strengths.length === 0) {
        strengths.push('Motivation')
      }
      
      if (weaknesses.length === 0) {
        weaknesses.push('Keep practicing to maintain your skills')
      }
      
      // Overall readiness assessment - more honest thresholds
      const readinessLevel = avgScore >= 85 ? 'Ready for Senior Interviews' :
                            avgScore >= 70 ? 'Ready for Mid-level Interviews' :
                            avgScore >= 55 ? 'Approaching Interview Ready' :
                            avgScore >= 40 ? 'More Preparation Needed' :
                            'Significant Study Required'
      
      return NextResponse.json({
        success: true,
        results: {
          overallScore: avgScore,
          categoryScores: categoryAverages,
          strengths,
          weaknesses,
          readinessLevel,
          studyRecommendations,
          totalQuestions: answers.length,
          completedAt: new Date().toISOString(),
          recommendation: avgScore >= 70 
            ? 'You are well-prepared. Focus on real interview practice.' 
            : 'Keep studying and practicing. Consider mock interviews.',
        },
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Interview API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process interview request' },
      { status: 500 }
    )
  }
}
