import { NextResponse } from 'next/server'
import { generateAIResponse, AI_MODELS } from '@/lib/openrouter'
import { parsePDF } from '@/lib/pdf-parser'

// Analysis result type for the API
interface AnalysisResult {
  overallScore: number
  structuralScore: number
  technicalScore: number
  atsScore: number
  realismScore: number
  structuralIssues: string[]
  technicalIssues: string[]
  atsIssues: string[]
  realismFlags: string[]
  strengths: string[]
  improvements: string[]
  recruiterDoubts: string[]
  jobMatchScore?: number
  missingKeywords: string[]
  filterRisk: 'low' | 'medium' | 'high'
  companyFit?: string
}

// Extract text from PDF file using our wrapper
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return parsePDF(buffer)
}

// Extract text from DOCX file
async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value || ''
  } catch (error) {
    console.error('DOCX parsing error:', error)
    throw new Error('Failed to parse DOCX file')
  }
}

// AI-powered CV analysis with job description context
async function analyzeWithAI(cvText: string, jobDescription?: string, companyName?: string): Promise<AnalysisResult> {
  const systemPrompt = `You are a senior technical recruiter and CV expert with 15+ years of experience. You provide brutally honest, actionable feedback on CVs.
You must respond ONLY with valid JSON - no markdown, no explanation, just the JSON object.`

  let userPrompt = `Analyze this CV and provide detailed feedback in JSON format:

CV CONTENT:
${cvText}
`

  if (jobDescription) {
    userPrompt += `
JOB DESCRIPTION TO MATCH AGAINST:
${jobDescription}
`
  }

  if (companyName) {
    userPrompt += `
TARGET COMPANY: ${companyName}
Consider this company's culture, hiring standards, and what they look for in candidates.
`
  }

  userPrompt += `
Respond with this exact JSON structure (no markdown code blocks, just raw JSON):
{
  "overallScore": <number 0-100>,
  "structuralScore": <number 0-100, evaluates format, readability, organization>,
  "technicalScore": <number 0-100, evaluates technical skills and depth>,
  "atsScore": <number 0-100, evaluates ATS-friendliness and keyword optimization>,
  "realismScore": <number 0-100, evaluates if claims seem realistic and verifiable>,
  "structuralIssues": ["<issue 1>", "<issue 2>"],
  "technicalIssues": ["<issue 1>", "<issue 2>"],
  "atsIssues": ["<issue 1>", "<issue 2>"],
  "realismFlags": ["<concern 1>", "<concern 2>"],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "recruiterDoubts": ["<doubt a recruiter might have 1>", "<doubt 2>"],
  "jobMatchScore": ${jobDescription ? '<number 0-100, how well CV matches job>' : 'null'},
  "missingKeywords": [${jobDescription ? '"<keyword 1>", "<keyword 2>"' : ''}],
  "filterRisk": "<'low' | 'medium' | 'high'>"${companyName ? `,
  "companyFit": "<detailed assessment of fit for ${companyName}>"` : ''}
}

Be brutal but constructive. Point out real issues. ${jobDescription ? 'Compare CV against the job requirements.' : 'Evaluate based on general best practices for a strong CV.'}`

  const result = await generateAIResponse(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    AI_MODELS.DEEPSEEK_CHIMERA,
    { temperature: 0.4, max_tokens: 2500 }
  )
  
  // Parse AI response as JSON
  try {
    // Clean up the response - remove any markdown code blocks if present
    let cleanContent = result.content.trim()
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.slice(7)
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.slice(3)
    }
    if (cleanContent.endsWith('```')) {
      cleanContent = cleanContent.slice(0, -3)
    }
    cleanContent = cleanContent.trim()
    
    const parsed = JSON.parse(cleanContent)
    return parsed as AnalysisResult
  } catch {
    console.error('Failed to parse AI response:', result.content)
    throw new Error('Failed to parse AI analysis response')
  }
}

// Fallback heuristic analysis
function analyzeFallback(cvText: string, jobDescription?: string): AnalysisResult {
  const textLength = cvText.length
  const hasQuantifiedAchievements = /\d+%|\d+ (users|projects|years)/i.test(cvText)
  const hasTechnicalSkills = /python|javascript|java|react|node|aws|docker/i.test(cvText)
  const hasActionVerbs = /led|developed|implemented|achieved|managed|built/i.test(cvText)
  
  // Calculate scores based on content analysis
  const structuralScore = Math.min(100, 40 + (textLength > 500 ? 30 : 10) + (hasActionVerbs ? 20 : 0) + Math.random() * 10)
  const technicalScore = hasTechnicalSkills ? 60 + Math.random() * 30 : 30 + Math.random() * 20
  const atsScore = Math.min(100, 50 + (textLength > 300 ? 20 : 0) + (hasTechnicalSkills ? 15 : 0) + Math.random() * 15)
  const realismScore = hasQuantifiedAchievements ? 70 + Math.random() * 20 : 40 + Math.random() * 30
  
  const overallScore = Math.round((structuralScore + technicalScore + atsScore + realismScore) / 4)
  
  // Generate feedback based on analysis
  const structuralIssues: string[] = []
  const technicalIssues: string[] = []
  const atsIssues: string[] = []
  const realismFlags: string[] = []
  const strengths: string[] = []
  const improvements: string[] = []
  
  if (textLength < 300) {
    structuralIssues.push('CV is too short - recruiters expect more detail')
    improvements.push('Add more specific examples and achievements')
  }
  
  if (!hasActionVerbs) {
    structuralIssues.push('Missing action verbs - start bullets with impactful words')
    improvements.push('Use action verbs like "Led", "Developed", "Achieved"')
  }
  
  if (!hasTechnicalSkills) {
    technicalIssues.push('Technical skills section is weak or missing')
    improvements.push('Add a dedicated technical skills section with specific technologies')
  }
  
  if (!hasQuantifiedAchievements) {
    realismFlags.push('No quantified achievements - looks generic')
    improvements.push('Add metrics: "Improved performance by X%", "Managed team of Y"')
  } else {
    strengths.push('Good use of quantified achievements')
  }
  
  // Job-specific analysis if job description provided
  let jobMatchScore: number | undefined
  let missingKeywords: string[] = []
  
  if (jobDescription) {
    const jobKeywords = jobDescription.toLowerCase().match(/\b\w{4,}\b/g) || []
    const cvKeywords = cvText.toLowerCase().match(/\b\w{4,}\b/g) || []
    const cvKeywordSet = new Set(cvKeywords)
    
    missingKeywords = jobKeywords
      .filter(keyword => !cvKeywordSet.has(keyword))
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 5)
    
    const matchedKeywords = jobKeywords.filter(keyword => cvKeywordSet.has(keyword))
    jobMatchScore = Math.round((matchedKeywords.length / jobKeywords.length) * 100)
    
    if (missingKeywords.length > 0) {
      atsIssues.push(`Missing keywords from job description: ${missingKeywords.join(', ')}`)
    }
  }
  
  // Recruiter doubts (brutal feedback)
  const recruiterDoubts: string[] = []
  
  if (overallScore < 60) {
    recruiterDoubts.push("I've seen hundreds of CVs like this - what makes you different?")
    recruiterDoubts.push("No clear career progression visible - job hopper or stagnant?")
  }
  
  if (!hasQuantifiedAchievements) {
    recruiterDoubts.push("Where are the numbers? 'Improved performance' means nothing without metrics.")
    recruiterDoubts.push("These responsibilities could describe anyone - show me YOUR impact.")
  }
  
  if (realismScore < 50) {
    recruiterDoubts.push("Some claims seem exaggerated - be prepared to back these up.")
  }
  
  if (strengths.length === 0) {
    strengths.push('CV is complete and readable')
  }
  
  return {
    overallScore,
    structuralScore: Math.round(structuralScore),
    technicalScore: Math.round(technicalScore),
    atsScore: Math.round(atsScore),
    realismScore: Math.round(realismScore),
    structuralIssues,
    technicalIssues,
    atsIssues,
    realismFlags,
    strengths,
    improvements,
    recruiterDoubts,
    jobMatchScore,
    missingKeywords,
    filterRisk: overallScore < 50 ? 'high' : overallScore < 70 ? 'medium' : 'low',
  }
}

// Extract company name from job description
function extractCompanyName(jobDescription: string): string | undefined {
  // Common patterns for company names in job descriptions
  const patterns = [
    /(?:at|for|join)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/i,
    /^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\s+is\s+(?:looking|hiring|seeking)/im,
    /company:\s*([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/i,
  ]
  
  for (const pattern of patterns) {
    const match = jobDescription.match(pattern)
    if (match && match[1]) {
      const company = match[1].trim()
      // Filter out common false positives
      const falsePositives = ['We', 'The', 'Our', 'This', 'A', 'An', 'Looking', 'Seeking', 'Hiring']
      if (!falsePositives.includes(company)) {
        return company
      }
    }
  }
  
  return undefined
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || ''
    
    let cvText = ''
    let jobDescription: string | undefined
    let companyName: string | undefined
    
    // Handle multipart form data (file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      jobDescription = formData.get('jobDescription') as string | null || undefined
      companyName = formData.get('companyName') as string | null || undefined
      // sessionId available for future analytics: formData.get('sessionId')
      
      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file uploaded' },
          { status: 400 }
        )
      }
      
      // Get file buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const fileType = file.type
      const fileName = file.name.toLowerCase()
      
      // Extract text based on file type
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        cvText = await extractTextFromPDF(buffer)
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')
      ) {
        cvText = await extractTextFromDOCX(buffer)
      } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        cvText = buffer.toString('utf-8')
      } else {
        return NextResponse.json(
          { success: false, error: 'Unsupported file format. Please upload PDF, DOCX, or TXT.' },
          { status: 400 }
        )
      }
    } 
    // Handle JSON body (for backwards compatibility)
    else {
      const body = await request.json()
      cvText = body.cvText || ''
      jobDescription = body.jobDescription
      companyName = body.companyName
      // sessionId available for future analytics tracking
      void (body.sessionId || `session-${Date.now()}`)
    }
    
    if (!cvText || cvText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Could not extract text from CV. Please try a different file.' },
        { status: 400 }
      )
    }
    
    // Try to extract company name from job description if not provided
    if (jobDescription && !companyName) {
      companyName = extractCompanyName(jobDescription)
    }
    
    let analysis: AnalysisResult
    let tokensUsed = 0
    let model = 'fallback'
    
    try {
      // Try AI analysis first
      analysis = await analyzeWithAI(cvText, jobDescription, companyName)
      tokensUsed = 1200 // Estimate
      model = 'llama-3.3-70b-instruct'
    } catch (aiError) {
      console.warn('AI analysis failed, using heuristic fallback:', aiError)
      analysis = analyzeFallback(cvText, jobDescription)
    }
    
    return NextResponse.json({
      success: true,
      analysis,
      tokensUsed,
      model,
      extractedTextLength: cvText.length,
      detectedCompany: companyName,
    })
  } catch (error) {
    console.error('CV analysis error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to analyze CV. Please try again.' },
      { status: 500 }
    )
  }
}
