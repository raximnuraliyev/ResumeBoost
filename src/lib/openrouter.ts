// OpenRouter API configuration and utilities
// Last updated: Force reload trigger

// Use environment variable - DO NOT hardcode API keys!
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

// Check if API key is configured
const isApiKeyConfigured = () => {
  return OPENROUTER_API_KEY && OPENROUTER_API_KEY !== 'your-openrouter-api-key-here' && OPENROUTER_API_KEY.startsWith('sk-or-')
}

// Available free models - updated with correct OpenRouter model IDs (June 2025)
export const AI_MODELS = {
  // TNG DeepSeek R1T2 Chimera - Best free model, most popular
  DEEPSEEK_CHIMERA: 'tngtech/deepseek-r1t2-chimera:free',
  // Meta Llama 3.3 70B - Great for general text generation
  LLAMA: 'meta-llama/llama-3.3-70b-instruct:free',
  // DeepSeek R1 0528 - Good for reasoning
  DEEPSEEK_R1: 'deepseek/deepseek-r1-0528:free',
  // NVIDIA Nemotron - Good for agentic tasks
  NVIDIA: 'nvidia/nemotron-3-nano-30b-a3b:free',
  // GLM 4.5 Air - Good for general use with reasoning
  GLM: 'z-ai/glm-4.5-air:free',
  // Arcee Trinity - Good for creative tasks
  ARCEE: 'arcee-ai/trinity-large-preview:free',
} as const

export type AIModel = typeof AI_MODELS[keyof typeof AI_MODELS]

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenRouterResponse {
  id: string
  choices: {
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// Import tracking function
import { trackAIRequest } from './security-metrics'

export async function generateAIResponse(
  messages: OpenRouterMessage[],
  model: AIModel = AI_MODELS.LLAMA,
  options: {
    temperature?: number
    max_tokens?: number
    feature?: string  // Track which feature is making the request
  } = {}
): Promise<{ content: string; tokensUsed: number; latencyMs: number }> {
  const { temperature = 0.7, max_tokens = 2000, feature = 'Unknown' } = options
  const startTime = Date.now()

  // Check if API key is configured
  if (!isApiKeyConfigured()) {
    console.error('OpenRouter API key not configured. Please set OPENROUTER_API_KEY in your .env file.')
    console.error('Get your API key from: https://openrouter.ai/keys')
    throw new Error('AI service not configured. Please add OPENROUTER_API_KEY to your .env file. Get your key from https://openrouter.ai/keys')
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://job-application.dev',
        'X-Title': 'Job Application Platform',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
      }),
    })

    const latencyMs = Date.now() - startTime

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', errorText)
      
      // Track error
      trackAIRequest(feature, 0, latencyMs, true)
      
      if (response.status === 401) {
        throw new Error('Invalid OpenRouter API key. Please check your OPENROUTER_API_KEY in .env file. Get a new key from https://openrouter.ai/keys')
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.')
      }
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data: OpenRouterResponse = await response.json()
    const tokensUsed = data.usage?.total_tokens || 0
    
    // Track successful request with tokens and latency
    trackAIRequest(feature, tokensUsed, latencyMs, false)
    
    console.log(`[${feature}] AI request: ${tokensUsed} tokens, ${latencyMs}ms`)
    
    return {
      content: data.choices[0]?.message?.content || '',
      tokensUsed,
      latencyMs,
    }
  } catch (error) {
    const latencyMs = Date.now() - startTime
    trackAIRequest(feature, 0, latencyMs, true)
    console.error('AI generation error:', error)
    throw error
  }
}

// CV Generation prompts
export const CV_PROMPTS = {
  summary: (context: Record<string, unknown>) => `Generate a professional summary for a ${context.targetLevel || 'mid-level'} software engineer CV. 
The person has experience in: ${context.skills || 'software development'}.
Years of experience: ${context.yearsExperience || '3-5'}.
Keep it concise (3-4 sentences), professional, and impactful. Focus on value they bring.
Output only the summary text, no headers or labels.`,

  experience: (context: Record<string, unknown>) => `Generate a work experience entry for a CV.
Company: ${context.company || 'Tech Company'}
Position: ${context.position || 'Software Engineer'}
Duration: ${context.dates || '2020 - Present'}
Technologies: ${context.technologies || 'Modern tech stack'}

Generate 4-5 bullet points that:
- Start with strong action verbs
- Include quantified achievements where possible
- Highlight technical impact and leadership
Output in markdown bullet format.`,

  skills: (context: Record<string, unknown>) => `Generate a technical skills section for a ${context.targetLevel || 'mid-level'} software engineer.
Focus areas: ${context.focusAreas || 'Full-stack development'}
Include categories: Languages, Frameworks, Databases, Cloud/DevOps, Tools
Output in markdown format with **Category:** prefix for each group.`,

  education: (context: Record<string, unknown>) => `Generate an education entry for a CV.
University: ${context.university || 'Technical University'}
Degree: ${context.degree || 'Bachelor of Science in Computer Science'}
Graduation: ${context.graduationYear || '2020'}
Include relevant coursework and GPA if strong (3.5+).
Output in clean markdown format.`,

  projects: (context: Record<string, unknown>) => `Generate a project entry for a software engineering CV.
Project Name: ${context.projectName || 'Full-Stack Application'}
Technologies: ${context.technologies || 'React, Node.js, PostgreSQL'}
Generate a brief description and 3-4 bullet points highlighting:
- Technical challenges solved
- Scale/impact metrics
- Key features implemented
Output in markdown format.`,
}

// CV Analysis prompts
export const ANALYSIS_PROMPTS = {
  analyze: (cvText: string, jobDescription?: string) => `You are a brutal, honest CV reviewer for software engineering positions. Analyze this CV:

CV Content:
${cvText}

${jobDescription ? `Target Job Description:\n${jobDescription}\n` : ''}

Provide analysis in this exact JSON format:
{
  "overallScore": <number 0-100>,
  "structuralScore": <number 0-100>,
  "technicalScore": <number 0-100>,
  "atsScore": <number 0-100>,
  "realismScore": <number 0-100>,
  "structuralIssues": ["issue1", "issue2"],
  "technicalIssues": ["issue1", "issue2"],
  "atsIssues": ["issue1", "issue2"],
  "realismFlags": ["flag1", "flag2"],
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "recruiterDoubts": ["doubt1", "doubt2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "filterRisk": "low" | "medium" | "high"
}

Be brutally honest. Recruiters are skeptical. Point out:
- Vague claims without metrics
- Buzzwords without substance
- Unrealistic experience claims
- Missing fundamentals for claimed seniority
- ATS optimization issues

Output ONLY valid JSON, no markdown or explanation.`,
}

// Interview prompts
export const INTERVIEW_PROMPTS = {
  generateQuestion: (level: string, focusArea: string, questionNumber: number) => `You are a senior software engineer conducting a technical interview.
Level: ${level}
Focus Area: ${focusArea}
Question Number: ${questionNumber}

Generate ONE technical interview question appropriate for this level and focus area.
Make it practical and specific, not generic.
Output only the question, nothing else.`,

  evaluateAnswer: (question: string, answer: string, level: string) => `You are a STRICT senior software engineer evaluating an interview answer.
Question: ${question}
Candidate Answer: ${answer}
Expected Level: ${level}

SCORING GUIDELINES (be strict!):
- 0-20: No real answer, irrelevant, or "I don't know"
- 21-40: Vague answer without technical substance
- 41-60: Basic understanding shown but missing key concepts
- 61-75: Good answer with most concepts covered
- 76-90: Strong answer with depth and examples
- 91-100: Exceptional, interview-ready answer

IMPORTANT: 
- Short/vague answers should score BELOW 40
- Answers without technical detail should NOT exceed 50
- Only give 70+ if the answer demonstrates real knowledge
- Be harsh on non-answers like "I would google it" or single-word responses

Provide evaluation in this exact JSON format:
{
  "overallScore": <number 0-100>,
  "relevanceScore": <number 0-100>,
  "depthScore": <number 0-100>,
  "clarityScore": <number 0-100>,
  "feedback": ["positive point 1", "positive point 2"],
  "suggestions": ["improvement 1", "improvement 2"],
  "rating": "Excellent" | "Good" | "Satisfactory" | "Needs Improvement",
  "followUpQuestion": "<optional follow-up question or null>"
}

Output ONLY valid JSON.`,
}

// Admin credentials with passwords
export const ADMIN_CREDENTIALS: Record<string, string> = {
  'ajax': 'admin123',
  'yevgenevic': 'admin123',
  'ajaxmanson': 'admin123',
} as const

export const ADMIN_USERS = Object.keys(ADMIN_CREDENTIALS) as readonly string[]
export type AdminUser = keyof typeof ADMIN_CREDENTIALS

export function isAdminUser(username: string): boolean {
  return username.toLowerCase() in ADMIN_CREDENTIALS
}

export function validateAdminCredentials(username: string, password: string): boolean {
  const user = username.toLowerCase()
  return ADMIN_CREDENTIALS[user] === password
}
