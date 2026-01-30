import { LanguageCode, SeniorityLevel, CVBlockType, InterviewFocus } from './constants'

// CV Block content types
export interface HeaderContent {
  fullName: string
  professionalTitle: string
  email?: string
  phone?: string
  location?: string
  linkedin?: string
  github?: string
  website?: string
}

export interface SummaryContent {
  text: string
}

export interface SkillCategory {
  category: string
  skills: string[]
}

export interface SkillsContent {
  categories: SkillCategory[]
}

export interface ExperienceItem {
  company: string
  position: string
  location?: string
  startDate: string
  endDate?: string
  current: boolean
  bullets: string[]
}

export interface ExperienceContent {
  items: ExperienceItem[]
}

export interface EducationItem {
  institution: string
  degree: string
  field: string
  location?: string
  startDate: string
  endDate?: string
  gpa?: string
  honors?: string[]
}

export interface EducationContent {
  items: EducationItem[]
}

export interface ProjectItem {
  name: string
  description: string
  technologies: string[]
  url?: string
  github?: string
  startDate?: string
  endDate?: string
}

export interface ProjectsContent {
  items: ProjectItem[]
}

export interface CertificationItem {
  name: string
  issuer: string
  date: string
  expiryDate?: string
  credentialId?: string
  url?: string
}

export interface CertificationsContent {
  items: CertificationItem[]
}

export interface PublicationItem {
  title: string
  publisher: string
  date: string
  url?: string
  description?: string
}

export interface PublicationsContent {
  items: PublicationItem[]
}

export interface CompetitionItem {
  name: string
  organizer?: string
  date: string
  placement?: string
  description?: string
}

export interface CompetitionsContent {
  items: CompetitionItem[]
}

export interface VolunteeringItem {
  organization: string
  role: string
  startDate: string
  endDate?: string
  description?: string
}

export interface VolunteeringContent {
  items: VolunteeringItem[]
}

export interface AwardItem {
  name: string
  issuer: string
  date: string
  description?: string
}

export interface AwardsContent {
  items: AwardItem[]
}

export interface LanguageItem {
  language: string
  proficiency: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'beginner'
}

export interface LanguagesContent {
  items: LanguageItem[]
}

export interface ReferenceItem {
  name: string
  position: string
  company: string
  email?: string
  phone?: string
  relationship?: string
}

export interface ReferencesContent {
  items: ReferenceItem[]
}

export interface CustomContent {
  text?: string
  items?: Array<{ title: string; description: string }>
}

export type CVBlockContent = 
  | HeaderContent
  | SummaryContent
  | SkillsContent
  | ExperienceContent
  | EducationContent
  | ProjectsContent
  | CertificationsContent
  | PublicationsContent
  | CompetitionsContent
  | VolunteeringContent
  | AwardsContent
  | LanguagesContent
  | ReferencesContent
  | CustomContent

// CV Block
export interface CVBlock {
  id: string
  blockType: CVBlockType | string
  position: number
  isEnabled: boolean
  customTitle?: string
  content: CVBlockContent
}

// CV Style settings
export interface CVStyle {
  fontFamily: string
  fontSize: number
  lineHeight: number
  primaryColor: string
  accentColor: string
  sectionSpacing: number
  bulletStyle: 'disc' | 'circle' | 'square' | 'dash' | 'arrow'
  alignment: 'left' | 'center' | 'justified'
}

// Complete CV
export interface CV {
  id: string
  sessionId: string
  language: LanguageCode
  levelTarget?: SeniorityLevel
  blocks: CVBlock[]
  style: CVStyle
  qualityScore?: number
  atsScore?: number
  readabilityScore?: number
  languageScore?: number
  createdAt: Date
  updatedAt: Date
}

// CV Analysis result
export interface CVAnalysis {
  id: string
  cvId: string
  jobDescription?: string
  matchScore?: number
  atsScore?: number
  realismScore?: number
  feedback: {
    structural: StructuralFeedback
    technical: TechnicalFeedback
    ats: ATSFeedback
    realism: RealismFeedback
    suggestions: string[]
  }
  createdAt: Date
}

export interface StructuralFeedback {
  sectionOrdering: { score: number; issues: string[] }
  skillGrouping: { score: number; issues: string[] }
  bulletClarity: { score: number; issues: string[] }
  redundancy: { score: number; issues: string[] }
}

export interface TechnicalFeedback {
  skillCredibility: { score: number; issues: string[] }
  depthVsBuzzwords: { score: number; issues: string[] }
  missingFundamentals: string[]
}

export interface ATSFeedback {
  keywordCoverage: { score: number; missing: string[] }
  tokenFrequency: { score: number; issues: string[] }
  parsingSurvivability: { score: number; issues: string[] }
}

export interface RealismFeedback {
  believabilityScore: number
  suggestedLevel: SeniorityLevel
  overclaiming: string[]
  underclaiming: string[]
}

// Interview types
export interface Interview {
  id: string
  cvId: string
  level: SeniorityLevel
  focus?: InterviewFocus
  difficulty: number
  status: 'pending' | 'in-progress' | 'completed'
  questions: InterviewQuestion[]
  overallScore?: number
  createdAt: Date
  completedAt?: Date
}

export interface InterviewQuestion {
  id: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  questionText: string
  expectedAnswer?: string
  position: number
  answer?: InterviewAnswer
}

export interface InterviewAnswer {
  id: string
  userAnswer: string
  evaluation?: {
    correctness: number
    depth: number
    clarity: number
    timeComplexityAwareness: number
    edgeCaseAwareness: number
    overallScore: number
    feedback: string
    flags: string[]
  }
  score?: number
  createdAt: Date
}

export interface InterviewResult {
  overallScore: number
  categoryScores: Record<string, number>
  weaknesses: string[]
  strengths: string[]
  studyRecommendations: string[]
  wouldPass: boolean
  verdict: string
}

// Issue type
export interface Issue {
  id: string
  sessionId?: string
  feature?: string
  description: string
  screenshot?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  createdAt: Date
  updatedAt: Date
}

// AI Usage log
export interface AIUsageLog {
  id: string
  sessionId: string
  feature: string
  modelName: string
  tokensUsed: number
  latencyMs?: number
  success: boolean
  errorMsg?: string
  createdAt: Date
}

// Session
export interface Session {
  id: string
  createdAt: Date
  lastActiveAt: Date
  userAgent?: string
}

// API Response types
export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Streaming generation status
export interface GenerationStatus {
  phase: 'initializing' | 'structuring' | 'writing' | 'optimizing' | 'complete' | 'error'
  currentSection?: string
  message: string
  progress: number
}
