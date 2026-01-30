'use client'

import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  User, FileText, Code, Briefcase, GraduationCap, Folder, 
  Award, BookOpen, Trophy, Heart, Medal, Globe, Users,
  Plus, GripVertical, Trash2, Eye, EyeOff, ChevronDown,
  Download, Wand2, Settings, Languages, Palette, Loader2,
  AlignLeft, AlignCenter, AlignJustify, Type
} from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import { 
  Button, Card, Input, Textarea, Select, SelectContent, 
  SelectItem, SelectTrigger, SelectValue, Switch, Slider,
  Tabs, TabsList, TabsTrigger, TabsContent, Badge, Progress
} from '@/components/ui'
import { SUPPORTED_LANGUAGES, CV_BLOCK_TYPES, FONT_FAMILIES, SENIORITY_LEVELS } from '@/lib/constants'
import { CVBlock, CVStyle, GenerationStatus } from '@/lib/types'

const blockIcons: Record<string, LucideIcon> = {
  header: User,
  summary: FileText,
  skills: Code,
  experience: Briefcase,
  education: GraduationCap,
  projects: Folder,
  certifications: Award,
  publications: BookOpen,
  competitions: Trophy,
  volunteering: Heart,
  awards: Medal,
  languages: Globe,
  references: Users,
}

const defaultBlocks: CVBlock[] = [
  { id: '1', blockType: 'header', position: 0, isEnabled: true, content: { fullName: '', professionalTitle: '' } },
  { id: '2', blockType: 'summary', position: 1, isEnabled: true, content: { text: '' } },
  { id: '3', blockType: 'skills', position: 2, isEnabled: true, content: { categories: [] } },
  { id: '4', blockType: 'experience', position: 3, isEnabled: true, content: { items: [] } },
  { id: '5', blockType: 'education', position: 4, isEnabled: true, content: { items: [] } },
  { id: '6', blockType: 'projects', position: 5, isEnabled: true, content: { items: [] } },
]

const defaultStyle: CVStyle = {
  fontFamily: 'inter',
  fontSize: 11,
  lineHeight: 1.5,
  primaryColor: '#1f2937',
  accentColor: '#6366f1',
  sectionSpacing: 16,
  bulletStyle: 'disc',
  alignment: 'left',
}

// Extended styling per section
interface SectionStyle {
  alignment: 'left' | 'center' | 'right' | 'justify'
  fontSize: number
  color: string
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold'
}

const defaultSectionStyles: Record<string, SectionStyle> = {
  header: { alignment: 'center', fontSize: 14, color: '#1f2937', fontWeight: 'bold' },
  sectionTitle: { alignment: 'left', fontSize: 12, color: '#6366f1', fontWeight: 'semibold' },
  content: { alignment: 'left', fontSize: 11, color: '#374151', fontWeight: 'normal' },
}

// CV Score Calculator Function
function calculateCVScores(blocks: CVBlock[]): {
  quality: number
  readability: number
  ats: number
  language: number
  completeness: number
  impact: number
  keywords: number
  formatting: number
  suggestions: string[]
} {
  const suggestions: string[] = []
  let completenessScore = 0
  let impactScore = 0
  let keywordsScore = 0
  let formattingScore = 0
  let readabilityScore = 0
  let atsScore = 0
  let languageScore = 0

  const enabledBlocks = blocks.filter(b => b.isEnabled)
  
  // Completeness scoring (25 points max)
  // Check each section for content
  const header = enabledBlocks.find(b => b.blockType === 'header')?.content as any
  const summary = enabledBlocks.find(b => b.blockType === 'summary')?.content as any
  const skills = enabledBlocks.find(b => b.blockType === 'skills')?.content as any
  const experience = enabledBlocks.find(b => b.blockType === 'experience')?.content as any
  const education = enabledBlocks.find(b => b.blockType === 'education')?.content as any
  const projects = enabledBlocks.find(b => b.blockType === 'projects')?.content as any

  // Header completeness
  if (header?.fullName && header.fullName.trim().length > 2) completenessScore += 4
  else suggestions.push('Add your full name')
  
  if (header?.professionalTitle && header.professionalTitle.trim().length > 2) completenessScore += 4
  else suggestions.push('Add a professional title')
  
  if (header?.email && header.email.includes('@')) completenessScore += 3
  else suggestions.push('Add your email address')
  
  if (header?.phone && header.phone.length > 5) completenessScore += 2
  
  // Summary completeness
  const summaryText = summary?.text || ''
  if (summaryText.length > 50) {
    completenessScore += 5
    if (summaryText.length > 150) completenessScore += 3
    if (summaryText.length > 300) suggestions.push('Consider shortening your summary (keep it under 4 lines)')
  } else {
    suggestions.push('Add a professional summary (at least 2-3 sentences)')
  }

  // Skills completeness
  const skillsText = skills?.skills || ''
  const skillsArray = skillsText.split(/[,;]/).filter((s: string) => s.trim().length > 0)
  if (skillsArray.length >= 5) {
    completenessScore += 5
    if (skillsArray.length >= 10) completenessScore += 3
  } else {
    suggestions.push('Add more skills (aim for at least 5-10 relevant skills)')
  }

  // Experience completeness
  const experienceItems = experience?.items || []
  if (experienceItems.length > 0) {
    completenessScore += 5
    if (experienceItems.length >= 2) completenessScore += 3
    
    let missingDetails = false
    experienceItems.forEach((item: any) => {
      if (!item.achievements && !item.description) missingDetails = true
    })
    if (missingDetails) suggestions.push('Add achievements/descriptions to all experience entries')
  } else {
    suggestions.push('Add your work experience')
  }

  // Education completeness
  const educationItems = education?.items || []
  if (educationItems.length > 0) {
    completenessScore += 4
  } else {
    suggestions.push('Add your educational background')
  }

  // Projects completeness
  const projectItems = projects?.items || []
  if (projectItems.length > 0) {
    completenessScore += 4
    if (projectItems.length >= 2) completenessScore += 2
  }

  // Normalize completeness to 100
  completenessScore = Math.min(100, Math.round((completenessScore / 40) * 100))

  // Impact scoring (action verbs, quantified achievements)
  const allText = [
    summaryText,
    ...experienceItems.map((e: any) => e.achievements || e.description || ''),
    ...projectItems.map((p: any) => p.description || ''),
  ].join(' ')

  const actionVerbs = [
    'achieved', 'accelerated', 'accomplished', 'delivered', 'developed', 'designed',
    'implemented', 'improved', 'increased', 'launched', 'led', 'managed', 'optimized',
    'reduced', 'streamlined', 'spearheaded', 'transformed', 'built', 'created', 'established'
  ]
  const actionVerbCount = actionVerbs.filter(verb => 
    allText.toLowerCase().includes(verb)
  ).length

  if (actionVerbCount >= 5) impactScore += 40
  else if (actionVerbCount >= 3) impactScore += 25
  else if (actionVerbCount >= 1) impactScore += 10
  else suggestions.push('Use more action verbs (achieved, implemented, developed, etc.)')

  // Quantified achievements (numbers, percentages)
  const quantifiedMatches = allText.match(/\d+%|\$\d+|\d+\+|\d+ ?(users|clients|projects|years|months)/gi) || []
  if (quantifiedMatches.length >= 5) impactScore += 40
  else if (quantifiedMatches.length >= 3) impactScore += 25
  else if (quantifiedMatches.length >= 1) impactScore += 10
  else suggestions.push('Quantify your achievements (e.g., "increased sales by 25%")')

  // Bullet points/achievements formatting
  const bulletPoints = (allText.match(/[•\-\*]/g) || []).length
  if (bulletPoints >= 5) impactScore += 20
  else impactScore += bulletPoints * 3

  impactScore = Math.min(100, impactScore)

  // Keywords scoring (technical terms, industry keywords)
  const technicalKeywords = [
    'api', 'database', 'cloud', 'aws', 'azure', 'react', 'node', 'python', 'java',
    'agile', 'scrum', 'devops', 'ci/cd', 'machine learning', 'ai', 'data', 'analytics',
    'security', 'performance', 'scalable', 'microservices', 'kubernetes', 'docker'
  ]
  const keywordCount = technicalKeywords.filter(kw => 
    allText.toLowerCase().includes(kw) || skillsText.toLowerCase().includes(kw)
  ).length

  if (keywordCount >= 10) keywordsScore = 100
  else if (keywordCount >= 7) keywordsScore = 85
  else if (keywordCount >= 5) keywordsScore = 70
  else if (keywordCount >= 3) keywordsScore = 55
  else keywordsScore = Math.max(30, keywordCount * 15)

  if (keywordCount < 5) suggestions.push('Include more industry-relevant keywords in your CV')

  // Formatting scoring
  formattingScore = 60 // Base score
  if (enabledBlocks.length >= 4) formattingScore += 15
  if (enabledBlocks.length >= 6) formattingScore += 10
  
  // Check for consistent structure
  const hasAllEssentials = header && summary && skills && experienceItems.length > 0
  if (hasAllEssentials) formattingScore += 15

  formattingScore = Math.min(100, formattingScore)

  // Readability scoring
  const avgSentenceLength = summaryText.split(/[.!?]/).filter((s: string) => s.trim()).length > 0
    ? summaryText.length / summaryText.split(/[.!?]/).filter((s: string) => s.trim()).length
    : 0
  
  readabilityScore = 70 // Base
  if (avgSentenceLength > 0 && avgSentenceLength < 150) readabilityScore += 15
  if (summaryText.length > 50 && summaryText.length < 500) readabilityScore += 15
  
  readabilityScore = Math.min(100, readabilityScore)

  // ATS scoring
  atsScore = 50 // Base
  if (header?.email) atsScore += 10
  if (header?.phone) atsScore += 10
  if (skillsText.length > 20) atsScore += 15
  if (experienceItems.length > 0) atsScore += 15
  
  // Penalize for potential ATS issues
  if (allText.includes('|') || allText.includes('→')) {
    atsScore -= 5
    suggestions.push('Avoid special characters that may confuse ATS systems')
  }
  
  atsScore = Math.min(100, Math.max(0, atsScore))

  // Language scoring
  languageScore = 70 // Base
  const textLength = allText.length
  if (textLength > 500) languageScore += 10
  if (textLength > 1000) languageScore += 10
  if (actionVerbCount >= 3) languageScore += 10
  
  languageScore = Math.min(100, languageScore)

  // Calculate overall quality as weighted average
  const quality = Math.round(
    (completenessScore * 0.25) +
    (impactScore * 0.2) +
    (keywordsScore * 0.15) +
    (formattingScore * 0.1) +
    (readabilityScore * 0.1) +
    (atsScore * 0.1) +
    (languageScore * 0.1)
  )

  // Limit suggestions to top 5
  const topSuggestions = suggestions.slice(0, 5)

  return {
    quality: Math.min(100, Math.max(0, quality)),
    readability: readabilityScore,
    ats: atsScore,
    language: languageScore,
    completeness: completenessScore,
    impact: impactScore,
    keywords: keywordsScore,
    formatting: formattingScore,
    suggestions: topSuggestions,
  }
}

export default function CVMakerPage() {
  const [blocks, setBlocks] = useState<CVBlock[]>(defaultBlocks)
  const [style, setStyle] = useState<CVStyle>(defaultStyle)
  const [sectionStyles, setSectionStyles] = useState(defaultSectionStyles)
  const [language, setLanguage] = useState('en')
  const [targetLevel, setTargetLevel] = useState('mid')
  const [targetJob, setTargetJob] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('content')
  const [sectionTitles, setSectionTitles] = useState<Record<string, string>>({
    summary: 'Professional Summary',
    skills: 'Technical Skills',
    experience: 'Experience',
    education: 'Education',
    projects: 'Projects',
  })
  const [cvScores, setCvScores] = useState<{
    quality: number
    readability: number
    ats: number
    language: number
    completeness: number
    impact: number
    keywords: number
    formatting: number
    suggestions: string[]
  } | null>(null)
  
  const previewRef = useRef<HTMLDivElement>(null)

  // Validation function for generation
  const canGenerate = useCallback(() => {
    const header = blocks.find(b => b.blockType === 'header')?.content as any
    const experience = blocks.find(b => b.blockType === 'experience')?.content as any
    const skills = blocks.find(b => b.blockType === 'skills')?.content as any
    
    const errors: string[] = []
    
    if (!header?.fullName?.trim()) errors.push('Full Name is required')
    if (!header?.professionalTitle?.trim()) errors.push('Professional Title is required')
    if (!targetJob?.trim()) errors.push('Target Job Title is required')
    if (!skills?.skills?.trim()) errors.push('At least some skills are required')
    if (!experience?.items?.length) errors.push('At least one work experience is required')
    
    return { valid: errors.length === 0, errors }
  }, [blocks, targetJob])

  // Block management
  const toggleBlock = useCallback((id: string) => {
    setBlocks(prev => prev.map(b => 
      b.id === id ? { ...b, isEnabled: !b.isEnabled } : b
    ))
  }, [])

  const updateBlockContent = useCallback((id: string, content: any) => {
    setBlocks(prev => prev.map(b =>
      b.id === id ? { ...b, content: { ...b.content, ...content } } : b
    ))
  }, [])

  const addCustomBlock = useCallback(() => {
    const newBlock: CVBlock = {
      id: `custom-${Date.now()}`,
      blockType: 'custom',
      position: blocks.length,
      isEnabled: true,
      customTitle: 'Custom Section',
      content: { text: '' },
    }
    setBlocks(prev => [...prev, newBlock])
  }, [blocks.length])

  const removeBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id))
  }, [])

  // AI Generation
  const handleGenerate = async () => {
    // Validate required fields
    const validation = canGenerate()
    if (!validation.valid) {
      setGenerationError(validation.errors.join('. '))
      return
    }
    
    setGenerationError(null)
    setIsGenerating(true)
    setGenerationStatus({ phase: 'initializing', message: 'Preparing CV structure...', progress: 0 })

    try {
      // Collect all CV content from blocks
      const cvContent = blocks.reduce((acc, block) => {
        if (!block.isEnabled) return acc
        const content = block.content as any
        
        if (block.blockType === 'header') {
          acc.name = content.fullName || ''
          acc.title = content.professionalTitle || ''
          acc.email = content.email || ''
          acc.phone = content.phone || ''
        } else if (block.blockType === 'summary') {
          acc.summary = content.text || ''
        } else if (block.blockType === 'skills') {
          acc.skills = content.skills || ''
        } else if (block.blockType === 'experience') {
          acc.experience = content.items || []
        } else if (block.blockType === 'education') {
          acc.education = content.items || []
        } else if (block.blockType === 'projects') {
          acc.projects = content.items || []
        } else if (block.blockType === 'custom') {
          if (!acc.custom) acc.custom = []
          acc.custom.push({ title: block.customTitle, text: content.text })
        }
        return acc
      }, {} as any)

      // Add target job to content
      cvContent.targetJob = targetJob

      setGenerationStatus({ phase: 'structuring', currentSection: 'summary', message: 'Enhancing with AI...', progress: 30 })

      // Call the generate API
      const response = await fetch('/api/cv/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: JSON.stringify(cvContent),
          targetLevel,
          targetJob,
          language,
          blocks: blocks.map(b => ({ type: b.blockType, title: b.customTitle, enabled: b.isEnabled })),
        }),
      })

      setGenerationStatus({ phase: 'writing', currentSection: 'experience', message: 'Optimizing experience section...', progress: 60 })

      const data = await response.json()

      if (data.success && data.enhanced) {
        setGenerationStatus({ phase: 'optimizing', message: 'Applying ATS optimization...', progress: 80 })
        
        // Update blocks with enhanced content
        setBlocks(prev => prev.map(b => {
          if (!b.isEnabled) return b
          
          const enhanced = data.enhanced
          
          // Update summary if enhanced
          if (b.blockType === 'summary' && enhanced.summary) {
            const summaryText = typeof enhanced.summary === 'string' 
              ? enhanced.summary 
              : enhanced.summary.text || enhanced.summary
            return { ...b, content: { ...b.content, text: summaryText } }
          }
          
          // Update skills if enhanced
          if (b.blockType === 'skills' && enhanced.skills) {
            const skillsText = typeof enhanced.skills === 'string'
              ? enhanced.skills
              : enhanced.skills.text || enhanced.skills
            return { ...b, content: { ...b.content, skills: skillsText } }
          }
          
          // Update experience if enhanced
          if (b.blockType === 'experience' && enhanced.experience?.items) {
            return { ...b, content: { ...b.content, items: enhanced.experience.items } }
          }
          
          // Update education if enhanced
          if (b.blockType === 'education' && enhanced.education?.items) {
            return { ...b, content: { ...b.content, items: enhanced.education.items } }
          }
          
          // Update projects if enhanced
          if (b.blockType === 'projects' && enhanced.projects?.items) {
            return { ...b, content: { ...b.content, items: enhanced.projects.items } }
          }
          
          return b
        }))
        
        // Set scores - calculate from updated blocks
        setBlocks(prev => {
          // Calculate scores after blocks are updated
          setTimeout(() => {
            setCvScores(calculateCVScores(prev))
          }, 100)
          return prev
        })
      } else {
        // Even without AI enhancement, calculate actual scores
        setCvScores(calculateCVScores(blocks))
      }

      setGenerationStatus({ phase: 'complete', message: 'CV generation complete!', progress: 100 })
    } catch (error) {
      console.error('Generation error:', error)
      setGenerationStatus({ phase: 'complete', message: 'Generation completed with fallback.', progress: 100 })
      
      // Set calculated scores even on error
      setCvScores(calculateCVScores(blocks))
    }

    setIsGenerating(false)
  }

  // Translation
  const handleTranslate = async (targetLanguage: string) => {
    if (targetLanguage === language) return
    
    setIsTranslating(true)
    
    try {
      const response = await fetch('/api/cv/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocks: blocks.filter(b => b.isEnabled).map(b => ({
            id: b.id,
            type: b.blockType,
            content: b.content,
            customTitle: b.customTitle,
          })),
          targetLanguage,
          sourceLanguage: language,
        }),
      })
      
      const data = await response.json()
      
      // Handle both 'blocks' and 'translated' response keys for compatibility
      const translatedBlocks = data.blocks || data.translated
      
      if (data.success && translatedBlocks) {
        // Update blocks with translated content
        setBlocks(prev => prev.map(block => {
          const translated = translatedBlocks.find((tb: any) => tb.id === block.id)
          if (translated) {
            return {
              ...block,
              content: translated.content,
              customTitle: translated.customTitle || block.customTitle,
            }
          }
          return block
        }))
        // Update section titles if provided
        if (data.sectionTitles) {
          setSectionTitles(data.sectionTitles)
        }
        setLanguage(targetLanguage)
      } else {
        console.error('Translation failed:', data.error || 'Unknown error')
      }
    } catch (error) {
      console.error('Translation error:', error)
    }
    
    setIsTranslating(false)
  }

  // Export Functions
  const handleExport = async (format: 'pdf' | 'docx' | 'txt' | 'html') => {
    setIsExporting(true)
    
    try {
      if (format === 'txt') {
        // Plain text export
        let content = ''
        
        blocks.filter(b => b.isEnabled).forEach(block => {
          const blockContent = block.content as any
          
          if (block.blockType === 'header') {
            content += `${blockContent.fullName || 'Your Name'}\n`
            content += `${blockContent.professionalTitle || 'Professional Title'}\n`
            if (blockContent.email || blockContent.phone) {
              content += `${blockContent.email || ''}${blockContent.email && blockContent.phone ? ' | ' : ''}${blockContent.phone || ''}\n`
            }
            if (blockContent.location) {
              content += `${blockContent.location}\n`
            }
            if (blockContent.linkedin || blockContent.website) {
              content += `${blockContent.linkedin || ''}${blockContent.linkedin && blockContent.website ? ' | ' : ''}${blockContent.website || ''}\n`
            }
            content += '\n'
          } else if (block.blockType === 'summary') {
            content += `PROFESSIONAL SUMMARY\n${'─'.repeat(40)}\n${blockContent.text || ''}\n\n`
          } else if (block.blockType === 'skills') {
            content += `SKILLS\n${'─'.repeat(40)}\n${blockContent.skills || ''}\n\n`
          } else if (block.blockType === 'experience') {
            content += `EXPERIENCE\n${'─'.repeat(40)}\n`
            const items = blockContent.items || []
            if (items.length > 0) {
              items.forEach((item: any) => {
                content += `${item.position || 'Position'} at ${item.company || 'Company'}\n`
                content += `${item.startDate || ''} - ${item.endDate || 'Present'}${item.location ? ' | ' + item.location : ''}\n`
                if (item.achievements || item.description) {
                  const achievements = (item.achievements || item.description || '').split('\n')
                  achievements.forEach((achievement: string) => {
                    if (achievement.trim()) {
                      content += `• ${achievement.trim().replace(/^[•\-]\s*/, '')}\n`
                    }
                  })
                }
                content += '\n'
              })
            }
            content += '\n'
          } else if (block.blockType === 'education') {
            content += `EDUCATION\n${'─'.repeat(40)}\n`
            const items = blockContent.items || []
            if (items.length > 0) {
              items.forEach((item: any) => {
                content += `${item.degree || 'Degree'} in ${item.field || 'Field of Study'}\n`
                content += `${item.school || 'University'}\n`
                content += `${item.startDate || ''} - ${item.endDate || ''}\n`
                if (item.gpa) {
                  content += `GPA: ${item.gpa}\n`
                }
                if (item.achievements) {
                  content += `${item.achievements}\n`
                }
                content += '\n'
              })
            }
            content += '\n'
          } else if (block.blockType === 'projects') {
            content += `PROJECTS\n${'─'.repeat(40)}\n`
            const items = blockContent.items || []
            if (items.length > 0) {
              items.forEach((item: any) => {
                content += `${item.name || 'Project Name'}\n`
                if (item.technologies) {
                  content += `Technologies: ${item.technologies}\n`
                }
                if (item.description) {
                  content += `${item.description}\n`
                }
                if (item.link) {
                  content += `Link: ${item.link}\n`
                }
                content += '\n'
              })
            }
            content += '\n'
          } else if (block.blockType === 'custom') {
            content += `${(block.customTitle || 'CUSTOM SECTION').toUpperCase()}\n${'─'.repeat(40)}\n${blockContent.text || ''}\n\n`
          }
        })
        
        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'cv.txt'
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === 'html') {
        // HTML export - just get the preview HTML
        if (previewRef.current) {
          const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CV</title>
  <style>
    body { font-family: ${style.fontFamily}; font-size: ${style.fontSize}pt; line-height: ${style.lineHeight}; margin: 40px; }
    .header { text-align: center; border-bottom: 2px solid ${style.accentColor}; padding-bottom: 16px; margin-bottom: 24px; }
    h1 { color: ${style.primaryColor}; margin: 0; }
    h2 { color: ${style.accentColor}; font-size: 14pt; margin: 16px 0 8px; }
    .section { margin-bottom: ${style.sectionSpacing}px; }
  </style>
</head>
<body>
${previewRef.current.innerHTML}
</body>
</html>`
          const blob = new Blob([html], { type: 'text/html' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'cv.html'
          a.click()
          URL.revokeObjectURL(url)
        }
      } else if (format === 'pdf') {
        // PDF export using canvas
        if (previewRef.current) {
          try {
            // Dynamic import html2canvas and jspdf
            const html2canvas = (await import('html2canvas')).default
            const { jsPDF } = await import('jspdf')
            
            // Clone the element to avoid modifying the original
            const element = previewRef.current
            
            const canvas = await html2canvas(element, {
              scale: 2,
              useCORS: true,
              backgroundColor: '#ffffff',
              logging: false,
              allowTaint: true,
              removeContainer: true,
              windowWidth: element.scrollWidth,
              windowHeight: element.scrollHeight,
            })
            
            const imgData = canvas.toDataURL('image/png', 1.0)
            const pdf = new jsPDF({
              orientation: 'p',
              unit: 'mm',
              format: 'a4',
            })
            
            const imgWidth = 210 // A4 width in mm
            const pageHeight = 297 // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width
            let heightLeft = imgHeight
            let position = 0
            
            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
            heightLeft -= pageHeight
            
            // Add additional pages if needed
            while (heightLeft > 0) {
              position = heightLeft - imgHeight
              pdf.addPage()
              pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
              heightLeft -= pageHeight
            }
            
            pdf.save('cv.pdf')
          } catch (error) {
            console.error('PDF export error:', error)
            alert('Failed to export PDF. Please try again.')
          }
        } else {
          alert('Preview not available. Please wait for the preview to load.')
        }
      } else if (format === 'docx') {
        // DOCX export
        const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = await import('docx')
        
        const docChildren: any[] = []
        
        blocks.filter(b => b.isEnabled).forEach(block => {
          const blockContent = block.content as any
          
          if (block.blockType === 'header') {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: blockContent.fullName || 'Your Name',
                    bold: true,
                    size: sectionStyles.header.fontSize * 2, // Half-points
                    color: sectionStyles.header.color.replace('#', ''),
                  })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: blockContent.professionalTitle || 'Professional Title',
                    size: 24,
                    color: style.accentColor.replace('#', ''),
                  })
                ],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${blockContent.email || 'email@example.com'} | ${blockContent.phone || '+1 234 567 8900'}`,
                    size: 20,
                    color: '666666',
                  })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
              }),
              new Paragraph({
                text: '',
                border: {
                  bottom: { color: style.accentColor.replace('#', ''), space: 1, style: BorderStyle.SINGLE, size: 6 }
                },
                spacing: { after: 300 },
              })
            )
          } else if (block.blockType === 'summary') {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Professional Summary',
                    bold: true,
                    size: sectionStyles.sectionTitle.fontSize * 2,
                    color: sectionStyles.sectionTitle.color.replace('#', ''),
                  })
                ],
                spacing: { before: 200, after: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: blockContent.text || 'Your professional summary will appear here.',
                    size: sectionStyles.content.fontSize * 2,
                    color: sectionStyles.content.color.replace('#', ''),
                  })
                ],
                spacing: { after: 200 },
              })
            )
          } else if (block.blockType === 'skills') {
            const skillsText = blockContent.skills || 'JavaScript, TypeScript, React, Node.js, PostgreSQL'
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Technical Skills',
                    bold: true,
                    size: sectionStyles.sectionTitle.fontSize * 2,
                    color: sectionStyles.sectionTitle.color.replace('#', ''),
                  })
                ],
                spacing: { before: 200, after: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: skillsText,
                    size: sectionStyles.content.fontSize * 2,
                    color: sectionStyles.content.color.replace('#', ''),
                  })
                ],
                spacing: { after: 200 },
              })
            )
          } else if (block.blockType === 'experience') {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Experience',
                    bold: true,
                    size: sectionStyles.sectionTitle.fontSize * 2,
                    color: sectionStyles.sectionTitle.color.replace('#', ''),
                  })
                ],
                spacing: { before: 200, after: 100 },
              })
            )
            // Add experience items if they exist
            const items = blockContent.items || []
            if (items.length > 0) {
              items.forEach((item: any) => {
                docChildren.push(
                  new Paragraph({
                    children: [
                      new TextRun({ text: item.position || 'Position', bold: true, size: 22 }),
                      new TextRun({ text: ' at ', size: 22 }),
                      new TextRun({ text: item.company || 'Company', size: 22 }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: `${item.startDate || 'Start'} - ${item.endDate || 'Present'}`, size: 20, color: '666666' }),
                    ],
                    spacing: { after: 100 },
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: item.achievements || item.description || '', size: 20 }),
                    ],
                    spacing: { after: 200 },
                  })
                )
              })
            } else {
              // Placeholder content
              docChildren.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Senior Software Engineer', bold: true, size: 22 }),
                    new TextRun({ text: ' at ', size: 22 }),
                    new TextRun({ text: 'Tech Company Inc.', size: 22 }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: '2022 - Present', size: 20, color: '666666' }),
                  ],
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: '• Led development of microservices architecture serving 1M+ users', size: 20 }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: '• Reduced API response time by 40% through optimization', size: 20 }),
                  ],
                  spacing: { after: 200 },
                })
              )
            }
          } else if (block.blockType === 'education') {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Education',
                    bold: true,
                    size: sectionStyles.sectionTitle.fontSize * 2,
                    color: sectionStyles.sectionTitle.color.replace('#', ''),
                  })
                ],
                spacing: { before: 200, after: 100 },
              })
            )
            const items = blockContent.items || []
            if (items.length > 0) {
              items.forEach((item: any) => {
                docChildren.push(
                  new Paragraph({
                    children: [
                      new TextRun({ text: `${item.degree || 'Degree'} in ${item.field || 'Field'}`, bold: true, size: 22 }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: item.institution || 'University', size: 20 }),
                      new TextRun({ text: ` | ${item.graduationYear || 'Year'}`, size: 20, color: '666666' }),
                    ],
                    spacing: { after: 200 },
                  })
                )
              })
            } else {
              docChildren.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Bachelor of Science in Computer Science', bold: true, size: 22 }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: 'University of Technology', size: 20 }),
                    new TextRun({ text: ' | 2020', size: 20, color: '666666' }),
                  ],
                  spacing: { after: 200 },
                })
              )
            }
          } else if (block.blockType === 'projects') {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Projects',
                    bold: true,
                    size: sectionStyles.sectionTitle.fontSize * 2,
                    color: sectionStyles.sectionTitle.color.replace('#', ''),
                  })
                ],
                spacing: { before: 200, after: 100 },
              })
            )
            const items = blockContent.items || []
            if (items.length > 0) {
              items.forEach((item: any) => {
                docChildren.push(
                  new Paragraph({
                    children: [
                      new TextRun({ text: item.name || 'Project Name', bold: true, size: 22 }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: item.description || '', size: 20 }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: item.technologies || '', size: 18, color: '666666', italics: true }),
                    ],
                    spacing: { after: 200 },
                  })
                )
              })
            } else {
              docChildren.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Open Source Contribution', bold: true, size: 22 }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Built and maintained popular npm packages with 10k+ weekly downloads.', size: 20 }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: 'React, TypeScript, Node.js', size: 18, color: '666666', italics: true }),
                  ],
                  spacing: { after: 200 },
                })
              )
            }
          } else if (block.blockType === 'custom') {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: block.customTitle || 'Custom Section',
                    bold: true,
                    size: sectionStyles.sectionTitle.fontSize * 2,
                    color: sectionStyles.sectionTitle.color.replace('#', ''),
                  })
                ],
                spacing: { before: 200, after: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: blockContent.text || '',
                    size: sectionStyles.content.fontSize * 2,
                    color: sectionStyles.content.color.replace('#', ''),
                  })
                ],
                spacing: { after: 200 },
              })
            )
          }
        })
        
        const doc = new Document({
          sections: [{
            properties: {},
            children: docChildren,
          }],
        })
        
        const blob = await Packer.toBlob(doc)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'cv.docx'
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Export failed. Please try again or use a different format.')
    }
    
    setIsExporting(false)
  }

  return (
    <div className="min-h-screen bg-grid">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl sticky top-16 z-40">
        <div className="max-w-[1800px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">CV Maker</h1>
              <Badge variant="info">Live Preview</Badge>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={language} onValueChange={handleTranslate}>
                <SelectTrigger className="w-[180px]" disabled={isTranslating}>
                  {isTranslating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Languages className="w-4 h-4 mr-2" />
                  )}
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="mr-2">{lang.flag}</span>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                isLoading={isGenerating}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate CV
              </Button>
              <Select onValueChange={(format: any) => handleExport(format)} disabled={isExporting}>
                <SelectTrigger className="w-[120px]">
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Export
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="docx">DOCX</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="txt">Plain Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="max-w-[1800px] mx-auto">
        <div className="grid lg:grid-cols-2 min-h-[calc(100vh-8rem)]">
          {/* Left Panel - Controls */}
          <div className="border-r border-gray-800 overflow-y-auto max-h-[calc(100vh-8rem)]">
            <div className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
                  <TabsTrigger value="style" className="flex-1">Style</TabsTrigger>
                  <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
                </TabsList>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-4 mt-6">
                  {/* Generation Error */}
                  {generationError && (
                    <Card className="p-4 bg-red-500/10 border-red-500/30">
                      <p className="text-sm text-red-400">{generationError}</p>
                    </Card>
                  )}
                  
                  {/* Target Job & Level */}
                  <Card glass className="p-4 space-y-4">
                    <h3 className="text-sm font-medium text-white flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-indigo-400" />
                      Generation Settings
                    </h3>
                    <Input
                      label="Target Job Title *"
                      placeholder="e.g., Senior Software Engineer, Product Manager..."
                      value={targetJob}
                      onChange={(e) => setTargetJob(e.target.value)}
                      helperText="The job position you're applying for"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Experience Level *</label>
                      <Select value={targetLevel} onValueChange={setTargetLevel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SENIORITY_LEVELS.map(level => (
                            <SelectItem key={level.id} value={level.id}>
                              {level.name} - {level.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>

                  {/* CV Blocks */}
                  <div className="space-y-3">
                    {blocks.map((block) => {
                      const Icon = blockIcons[block.blockType] || FileText
                      const blockConfig = CV_BLOCK_TYPES.find(b => b.id === block.blockType)
                      
                      return (
                        <motion.div
                          key={block.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Card glass className={`${!block.isEnabled && 'opacity-50'}`}>
                            {/* Block Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                              <div className="flex items-center space-x-3">
                                <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                  <Icon className="w-4 h-4 text-indigo-400" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-white">
                                    {block.customTitle || blockConfig?.name || 'Custom Section'}
                                  </h3>
                                  <p className="text-xs text-gray-500">
                                    {blockConfig?.description || 'Custom content'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => toggleBlock(block.id)}
                                  className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                  {block.isEnabled ? (
                                    <Eye className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <EyeOff className="w-4 h-4 text-gray-500" />
                                  )}
                                </button>
                                {block.blockType === 'custom' && (
                                  <button
                                    onClick={() => removeBlock(block.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                  </button>
                                )}
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              </div>
                            </div>

                            {/* Block Content */}
                            {block.isEnabled && (
                              <div className="p-4 space-y-4">
                                {block.blockType === 'header' && (
                                  <>
                                    <Input
                                      label="Full Name"
                                      placeholder="John Doe"
                                      value={(block.content as any).fullName || ''}
                                      onChange={(e) => updateBlockContent(block.id, { fullName: e.target.value })}
                                    />
                                    <Input
                                      label="Professional Title"
                                      placeholder="Senior Software Engineer"
                                      value={(block.content as any).professionalTitle || ''}
                                      onChange={(e) => updateBlockContent(block.id, { professionalTitle: e.target.value })}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                      <Input
                                        label="Email"
                                        placeholder="john@example.com"
                                        value={(block.content as any).email || ''}
                                        onChange={(e) => updateBlockContent(block.id, { email: e.target.value })}
                                      />
                                      <Input
                                        label="Phone"
                                        placeholder="+1 234 567 8900"
                                        value={(block.content as any).phone || ''}
                                        onChange={(e) => updateBlockContent(block.id, { phone: e.target.value })}
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <Input
                                        label="LinkedIn"
                                        placeholder="linkedin.com/in/johndoe"
                                        value={(block.content as any).linkedin || ''}
                                        onChange={(e) => updateBlockContent(block.id, { linkedin: e.target.value })}
                                      />
                                      <Input
                                        label="GitHub"
                                        placeholder="github.com/johndoe"
                                        value={(block.content as any).github || ''}
                                        onChange={(e) => updateBlockContent(block.id, { github: e.target.value })}
                                      />
                                    </div>
                                  </>
                                )}

                                {block.blockType === 'summary' && (
                                  <Textarea
                                    label="Professional Summary"
                                    placeholder="Write a brief summary of your professional background, key skills, and career objectives..."
                                    rows={5}
                                    value={(block.content as any).text || ''}
                                    onChange={(e) => updateBlockContent(block.id, { text: e.target.value })}
                                    helperText="AI will enhance this based on your target level and language"
                                  />
                                )}

                                {block.blockType === 'skills' && (
                                  <div className="space-y-3">
                                    <Textarea
                                      label="Skills (comma-separated)"
                                      placeholder="JavaScript, TypeScript, React, Node.js, PostgreSQL, Docker, AWS..."
                                      rows={3}
                                      value={(block.content as any).skills || ''}
                                      onChange={(e) => updateBlockContent(block.id, { skills: e.target.value })}
                                      helperText="AI will categorize and optimize these for ATS"
                                    />
                                  </div>
                                )}

                                {block.blockType === 'experience' && (
                                  <div className="space-y-4">
                                    {((block.content as any).items || []).map((item: any, idx: number) => (
                                      <Card key={idx} className="bg-gray-800/30 p-4 space-y-3">
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="text-xs text-gray-400">Experience #{idx + 1}</span>
                                          <button
                                            onClick={() => {
                                              const items = [...((block.content as any).items || [])]
                                              items.splice(idx, 1)
                                              updateBlockContent(block.id, { items })
                                            }}
                                            className="p-1 rounded hover:bg-red-500/20"
                                          >
                                            <Trash2 className="w-3 h-3 text-red-400" />
                                          </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                          <Input 
                                            label="Company" 
                                            placeholder="Tech Corp Inc." 
                                            value={item.company || ''}
                                            onChange={(e) => {
                                              const items = [...((block.content as any).items || [])]
                                              items[idx] = { ...items[idx], company: e.target.value }
                                              updateBlockContent(block.id, { items })
                                            }}
                                          />
                                          <Input 
                                            label="Position" 
                                            placeholder="Senior Developer" 
                                            value={item.position || ''}
                                            onChange={(e) => {
                                              const items = [...((block.content as any).items || [])]
                                              items[idx] = { ...items[idx], position: e.target.value }
                                              updateBlockContent(block.id, { items })
                                            }}
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                          <Input 
                                            label="Start Date" 
                                            placeholder="Jan 2022" 
                                            value={item.startDate || ''}
                                            onChange={(e) => {
                                              const items = [...((block.content as any).items || [])]
                                              items[idx] = { ...items[idx], startDate: e.target.value }
                                              updateBlockContent(block.id, { items })
                                            }}
                                          />
                                          <Input 
                                            label="End Date" 
                                            placeholder="Present" 
                                            value={item.endDate || ''}
                                            onChange={(e) => {
                                              const items = [...((block.content as any).items || [])]
                                              items[idx] = { ...items[idx], endDate: e.target.value }
                                              updateBlockContent(block.id, { items })
                                            }}
                                          />
                                        </div>
                                        <Textarea
                                          label="Achievements (one per line)"
                                          placeholder="• Led team of 5 engineers to deliver..."
                                          rows={4}
                                          value={item.achievements || ''}
                                          onChange={(e) => {
                                            const items = [...((block.content as any).items || [])]
                                            items[idx] = { ...items[idx], achievements: e.target.value }
                                            updateBlockContent(block.id, { items })
                                          }}
                                        />
                                      </Card>
                                    ))}
                                    {((block.content as any).items || []).length === 0 && (
                                      <p className="text-xs text-gray-500 text-center py-4">No experience added yet. Click the button below to add your work history.</p>
                                    )}
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full"
                                      onClick={() => {
                                        const items = [...((block.content as any).items || [])]
                                        items.push({ company: '', position: '', startDate: '', endDate: '', achievements: '' })
                                        updateBlockContent(block.id, { items })
                                      }}
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add Experience
                                    </Button>
                                  </div>
                                )}

                                {block.blockType === 'education' && (
                                  <div className="space-y-4">
                                    {((block.content as any).items || []).map((item: any, idx: number) => (
                                      <Card key={idx} className="bg-gray-800/30 p-4 space-y-3">
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="text-xs text-gray-400">Education #{idx + 1}</span>
                                          <button
                                            onClick={() => {
                                              const items = [...((block.content as any).items || [])]
                                              items.splice(idx, 1)
                                              updateBlockContent(block.id, { items })
                                            }}
                                            className="p-1 rounded hover:bg-red-500/20"
                                          >
                                            <Trash2 className="w-3 h-3 text-red-400" />
                                          </button>
                                        </div>
                                        <Input 
                                          label="Institution" 
                                          placeholder="University of Technology" 
                                          value={item.institution || ''}
                                          onChange={(e) => {
                                            const items = [...((block.content as any).items || [])]
                                            items[idx] = { ...items[idx], institution: e.target.value }
                                            updateBlockContent(block.id, { items })
                                          }}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                          <Input 
                                            label="Degree" 
                                            placeholder="Bachelor of Science" 
                                            value={item.degree || ''}
                                            onChange={(e) => {
                                              const items = [...((block.content as any).items || [])]
                                              items[idx] = { ...items[idx], degree: e.target.value }
                                              updateBlockContent(block.id, { items })
                                            }}
                                          />
                                          <Input 
                                            label="Field" 
                                            placeholder="Computer Science" 
                                            value={item.field || ''}
                                            onChange={(e) => {
                                              const items = [...((block.content as any).items || [])]
                                              items[idx] = { ...items[idx], field: e.target.value }
                                              updateBlockContent(block.id, { items })
                                            }}
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                          <Input 
                                            label="Graduation Year" 
                                            placeholder="2020" 
                                            value={item.graduationYear || ''}
                                            onChange={(e) => {
                                              const items = [...((block.content as any).items || [])]
                                              items[idx] = { ...items[idx], graduationYear: e.target.value }
                                              updateBlockContent(block.id, { items })
                                            }}
                                          />
                                          <Input 
                                            label="GPA (optional)" 
                                            placeholder="3.8" 
                                            value={item.gpa || ''}
                                            onChange={(e) => {
                                              const items = [...((block.content as any).items || [])]
                                              items[idx] = { ...items[idx], gpa: e.target.value }
                                              updateBlockContent(block.id, { items })
                                            }}
                                          />
                                        </div>
                                      </Card>
                                    ))}
                                    {((block.content as any).items || []).length === 0 && (
                                      <p className="text-xs text-gray-500 text-center py-4">No education added yet. Click the button below to add your educational background.</p>
                                    )}
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full"
                                      onClick={() => {
                                        const items = [...((block.content as any).items || [])]
                                        items.push({ institution: '', degree: '', field: '', graduationYear: '', gpa: '' })
                                        updateBlockContent(block.id, { items })
                                      }}
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add Education
                                    </Button>
                                  </div>
                                )}

                                {block.blockType === 'projects' && (
                                  <div className="space-y-4">
                                    {((block.content as any).items || []).map((item: any, idx: number) => (
                                      <Card key={idx} className="bg-gray-800/30 p-4 space-y-3">
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="text-xs text-gray-400">Project #{idx + 1}</span>
                                          <button
                                            onClick={() => {
                                              const items = [...((block.content as any).items || [])]
                                              items.splice(idx, 1)
                                              updateBlockContent(block.id, { items })
                                            }}
                                            className="p-1 rounded hover:bg-red-500/20"
                                          >
                                            <Trash2 className="w-3 h-3 text-red-400" />
                                          </button>
                                        </div>
                                        <Input 
                                          label="Project Name" 
                                          placeholder="AI Chat Application" 
                                          value={item.name || ''}
                                          onChange={(e) => {
                                            const items = [...((block.content as any).items || [])]
                                            items[idx] = { ...items[idx], name: e.target.value }
                                            updateBlockContent(block.id, { items })
                                          }}
                                        />
                                        <Textarea
                                          label="Description"
                                          placeholder="Built a real-time chat application with AI-powered responses..."
                                          rows={3}
                                          value={item.description || ''}
                                          onChange={(e) => {
                                            const items = [...((block.content as any).items || [])]
                                            items[idx] = { ...items[idx], description: e.target.value }
                                            updateBlockContent(block.id, { items })
                                          }}
                                        />
                                        <Input 
                                          label="Technologies" 
                                          placeholder="React, Node.js, OpenAI API" 
                                          value={item.technologies || ''}
                                          onChange={(e) => {
                                            const items = [...((block.content as any).items || [])]
                                            items[idx] = { ...items[idx], technologies: e.target.value }
                                            updateBlockContent(block.id, { items })
                                          }}
                                        />
                                        <Input 
                                          label="Link (optional)" 
                                          placeholder="github.com/user/project" 
                                          value={item.link || ''}
                                          onChange={(e) => {
                                            const items = [...((block.content as any).items || [])]
                                            items[idx] = { ...items[idx], link: e.target.value }
                                            updateBlockContent(block.id, { items })
                                          }}
                                        />
                                      </Card>
                                    ))}
                                    {((block.content as any).items || []).length === 0 && (
                                      <p className="text-xs text-gray-500 text-center py-4">No projects added yet. Click the button below to add your projects.</p>
                                    )}
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full"
                                      onClick={() => {
                                        const items = [...((block.content as any).items || [])]
                                        items.push({ name: '', description: '', technologies: '', link: '' })
                                        updateBlockContent(block.id, { items })
                                      }}
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add Project
                                    </Button>
                                  </div>
                                )}

                                {block.blockType === 'custom' && (
                                  <>
                                    <Input
                                      label="Section Title"
                                      value={block.customTitle || ''}
                                      onChange={(e) => setBlocks(prev => prev.map(b =>
                                        b.id === block.id ? { ...b, customTitle: e.target.value } : b
                                      ))}
                                    />
                                    <Textarea
                                      label="Content"
                                      placeholder="Enter custom section content..."
                                      rows={4}
                                      value={(block.content as any).text || ''}
                                      onChange={(e) => updateBlockContent(block.id, { text: e.target.value })}
                                    />
                                  </>
                                )}
                              </div>
                            )}
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>

                  <Button variant="outline" className="w-full" onClick={addCustomBlock}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom Section
                  </Button>
                </TabsContent>

                {/* Style Tab */}
                <TabsContent value="style" className="space-y-6 mt-6">
                  <Card glass className="p-4 space-y-4">
                    <h3 className="text-sm font-medium text-white flex items-center">
                      <Palette className="w-4 h-4 mr-2 text-indigo-400" />
                      Typography
                    </h3>
                    
                    <Select 
                      value={style.fontFamily} 
                      onValueChange={(v) => setStyle(s => ({ ...s, fontFamily: v }))}
                    >
                      <SelectTrigger label="Font Family">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_FAMILIES.map(font => (
                          <SelectItem key={font.id} value={font.id}>
                            {font.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Slider
                      label="Font Size"
                      value={[style.fontSize]}
                      onValueChange={([v]) => setStyle(s => ({ ...s, fontSize: v }))}
                      min={9}
                      max={14}
                      step={0.5}
                      showValue
                    />

                    <Slider
                      label="Line Height"
                      value={[style.lineHeight]}
                      onValueChange={([v]) => setStyle(s => ({ ...s, lineHeight: v }))}
                      min={1.2}
                      max={2}
                      step={0.1}
                      showValue
                    />
                  </Card>

                  <Card glass className="p-4 space-y-4">
                    <h3 className="text-sm font-medium text-white">Colors</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1.5">Primary</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={style.primaryColor}
                            onChange={(e) => setStyle(s => ({ ...s, primaryColor: e.target.value }))}
                            className="w-10 h-10 rounded-lg border border-gray-700 cursor-pointer"
                          />
                          <Input
                            value={style.primaryColor}
                            onChange={(e) => setStyle(s => ({ ...s, primaryColor: e.target.value }))}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-1.5">Accent</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={style.accentColor}
                            onChange={(e) => setStyle(s => ({ ...s, accentColor: e.target.value }))}
                            className="w-10 h-10 rounded-lg border border-gray-700 cursor-pointer"
                          />
                          <Input
                            value={style.accentColor}
                            onChange={(e) => setStyle(s => ({ ...s, accentColor: e.target.value }))}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card glass className="p-4 space-y-4">
                    <h3 className="text-sm font-medium text-white">Layout</h3>
                    
                    <Slider
                      label="Section Spacing"
                      value={[style.sectionSpacing]}
                      onValueChange={([v]) => setStyle(s => ({ ...s, sectionSpacing: v }))}
                      min={8}
                      max={32}
                      step={2}
                      showValue
                    />

                    <Select
                      value={style.bulletStyle}
                      onValueChange={(v: any) => setStyle(s => ({ ...s, bulletStyle: v }))}
                    >
                      <SelectTrigger label="Bullet Style">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disc">• Disc</SelectItem>
                        <SelectItem value="circle">○ Circle</SelectItem>
                        <SelectItem value="square">■ Square</SelectItem>
                        <SelectItem value="dash">– Dash</SelectItem>
                        <SelectItem value="arrow">→ Arrow</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={style.alignment}
                      onValueChange={(v: any) => setStyle(s => ({ ...s, alignment: v }))}
                    >
                      <SelectTrigger label="Text Alignment">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="justified">Justified</SelectItem>
                      </SelectContent>
                    </Select>
                  </Card>

                  {/* Per-Section Styling */}
                  <Card glass className="p-4 space-y-4">
                    <h3 className="text-sm font-medium text-white flex items-center">
                      <Type className="w-4 h-4 mr-2 text-indigo-400" />
                      Section Styles
                    </h3>
                    
                    {/* Header Style */}
                    <div className="p-3 bg-gray-800/30 rounded-lg space-y-3">
                      <p className="text-xs font-medium text-gray-300">Header / Name</p>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setSectionStyles(s => ({ ...s, header: { ...s.header, alignment: 'left' } }))}
                          className={`p-2 rounded ${sectionStyles.header.alignment === 'left' ? 'bg-indigo-500/30' : 'hover:bg-gray-700'}`}
                        >
                          <AlignLeft className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setSectionStyles(s => ({ ...s, header: { ...s.header, alignment: 'center' } }))}
                          className={`p-2 rounded ${sectionStyles.header.alignment === 'center' ? 'bg-indigo-500/30' : 'hover:bg-gray-700'}`}
                        >
                          <AlignCenter className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setSectionStyles(s => ({ ...s, header: { ...s.header, alignment: 'justify' } }))}
                          className={`p-2 rounded ${sectionStyles.header.alignment === 'justify' ? 'bg-indigo-500/30' : 'hover:bg-gray-700'}`}
                        >
                          <AlignJustify className="w-4 h-4" />
                        </button>
                        <div className="flex-1" />
                        <input
                          type="color"
                          value={sectionStyles.header.color}
                          onChange={(e) => setSectionStyles(s => ({ ...s, header: { ...s.header, color: e.target.value } }))}
                          className="w-8 h-8 rounded border border-gray-700 cursor-pointer"
                        />
                        <Select
                          value={String(sectionStyles.header.fontSize)}
                          onValueChange={(v) => setSectionStyles(s => ({ ...s, header: { ...s.header, fontSize: parseInt(v) } }))}
                        >
                          <SelectTrigger className="w-[80px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[12, 14, 16, 18, 20, 24].map(size => (
                              <SelectItem key={size} value={String(size)}>{size}pt</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Section Titles Style */}
                    <div className="p-3 bg-gray-800/30 rounded-lg space-y-3">
                      <p className="text-xs font-medium text-gray-300">Section Titles</p>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setSectionStyles(s => ({ ...s, sectionTitle: { ...s.sectionTitle, alignment: 'left' } }))}
                          className={`p-2 rounded ${sectionStyles.sectionTitle.alignment === 'left' ? 'bg-indigo-500/30' : 'hover:bg-gray-700'}`}
                        >
                          <AlignLeft className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setSectionStyles(s => ({ ...s, sectionTitle: { ...s.sectionTitle, alignment: 'center' } }))}
                          className={`p-2 rounded ${sectionStyles.sectionTitle.alignment === 'center' ? 'bg-indigo-500/30' : 'hover:bg-gray-700'}`}
                        >
                          <AlignCenter className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setSectionStyles(s => ({ ...s, sectionTitle: { ...s.sectionTitle, alignment: 'justify' } }))}
                          className={`p-2 rounded ${sectionStyles.sectionTitle.alignment === 'justify' ? 'bg-indigo-500/30' : 'hover:bg-gray-700'}`}
                        >
                          <AlignJustify className="w-4 h-4" />
                        </button>
                        <div className="flex-1" />
                        <input
                          type="color"
                          value={sectionStyles.sectionTitle.color}
                          onChange={(e) => setSectionStyles(s => ({ ...s, sectionTitle: { ...s.sectionTitle, color: e.target.value } }))}
                          className="w-8 h-8 rounded border border-gray-700 cursor-pointer"
                        />
                        <Select
                          value={String(sectionStyles.sectionTitle.fontSize)}
                          onValueChange={(v) => setSectionStyles(s => ({ ...s, sectionTitle: { ...s.sectionTitle, fontSize: parseInt(v) } }))}
                        >
                          <SelectTrigger className="w-[80px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[10, 11, 12, 14, 16].map(size => (
                              <SelectItem key={size} value={String(size)}>{size}pt</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Content Style */}
                    <div className="p-3 bg-gray-800/30 rounded-lg space-y-3">
                      <p className="text-xs font-medium text-gray-300">Content Text</p>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setSectionStyles(s => ({ ...s, content: { ...s.content, alignment: 'left' } }))}
                          className={`p-2 rounded ${sectionStyles.content.alignment === 'left' ? 'bg-indigo-500/30' : 'hover:bg-gray-700'}`}
                        >
                          <AlignLeft className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setSectionStyles(s => ({ ...s, content: { ...s.content, alignment: 'center' } }))}
                          className={`p-2 rounded ${sectionStyles.content.alignment === 'center' ? 'bg-indigo-500/30' : 'hover:bg-gray-700'}`}
                        >
                          <AlignCenter className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setSectionStyles(s => ({ ...s, content: { ...s.content, alignment: 'justify' } }))}
                          className={`p-2 rounded ${sectionStyles.content.alignment === 'justify' ? 'bg-indigo-500/30' : 'hover:bg-gray-700'}`}
                        >
                          <AlignJustify className="w-4 h-4" />
                        </button>
                        <div className="flex-1" />
                        <input
                          type="color"
                          value={sectionStyles.content.color}
                          onChange={(e) => setSectionStyles(s => ({ ...s, content: { ...s.content, color: e.target.value } }))}
                          className="w-8 h-8 rounded border border-gray-700 cursor-pointer"
                        />
                        <Select
                          value={String(sectionStyles.content.fontSize)}
                          onValueChange={(v) => setSectionStyles(s => ({ ...s, content: { ...s.content, fontSize: parseInt(v) } }))}
                        >
                          <SelectTrigger className="w-[80px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[9, 10, 11, 12, 13, 14].map(size => (
                              <SelectItem key={size} value={String(size)}>{size}pt</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-4 mt-6">
                  <Card glass className="p-4 space-y-4">
                    <h3 className="text-sm font-medium text-white flex items-center">
                      <Settings className="w-4 h-4 mr-2 text-indigo-400" />
                      Generation Settings
                    </h3>
                    
                    <Switch label="ATS Optimization" defaultChecked />
                    <Switch label="Formal Language Enforcement" defaultChecked />
                    <Switch label="Quantify Achievements" defaultChecked />
                    <Switch label="Action Verb Enhancement" defaultChecked />
                  </Card>

                  <Card glass className="p-4 space-y-4">
                    <h3 className="text-sm font-medium text-white">Export Options</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="secondary" 
                        className="justify-start"
                        onClick={() => handleExport('pdf')}
                        disabled={isExporting}
                      >
                        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                        PDF
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="justify-start"
                        onClick={() => handleExport('docx')}
                        disabled={isExporting}
                      >
                        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                        DOCX
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="justify-start"
                        onClick={() => handleExport('html')}
                        disabled={isExporting}
                      >
                        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                        HTML
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="justify-start"
                        onClick={() => handleExport('txt')}
                        disabled={isExporting}
                      >
                        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                        Plain Text
                      </Button>
                    </div>
                  </Card>

                  <Card glass className="p-4">
                    <h3 className="text-sm font-medium text-white mb-3">CV Analysis</h3>
                    <Button 
                      variant="primary" 
                      className="w-full"
                      onClick={() => setCvScores(calculateCVScores(blocks))}
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Analyze CV Quality
                    </Button>
                    <p className="text-xs text-gray-400 mt-2">
                      Get detailed insights about your CV&apos;s quality, ATS compatibility, and improvement suggestions.
                    </p>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="bg-gray-900/30 overflow-y-auto max-h-[calc(100vh-8rem)]">
            <div className="p-6">
              {/* Generation Status */}
              {isGenerating && generationStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <Card glass className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                          <Wand2 className="w-4 h-4 text-indigo-400 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{generationStatus.message}</p>
                          {generationStatus.currentSection && (
                            <p className="text-xs text-gray-400">
                              Working on: {generationStatus.currentSection}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="info">{generationStatus.phase}</Badge>
                    </div>
                    <Progress value={generationStatus.progress} size="sm" />
                  </Card>
                </motion.div>
              )}

              {/* Scores */}
              {cvScores && !isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <Card glass className="p-4">
                    <h3 className="text-sm font-medium text-white mb-4 flex items-center">
                      <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                      CV Quality Analysis
                    </h3>
                    
                    {/* Overall Score */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">Overall Score</span>
                        <span className={`text-lg font-bold ${
                          cvScores.quality >= 80 ? 'text-green-400' : 
                          cvScores.quality >= 60 ? 'text-yellow-400' : 'text-red-400'
                        }`}>{cvScores.quality}%</span>
                      </div>
                      <Progress 
                        value={cvScores.quality} 
                        size="md" 
                        variant={cvScores.quality >= 80 ? 'success' : cvScores.quality >= 60 ? 'default' : 'error'} 
                      />
                    </div>

                    {/* Detailed Scores Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-2 bg-gray-800/50 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">Completeness</span>
                          <span className="text-xs font-medium text-white">{cvScores.completeness}%</span>
                        </div>
                        <Progress value={cvScores.completeness} size="sm" variant={cvScores.completeness >= 70 ? 'success' : 'default'} />
                      </div>
                      <div className="p-2 bg-gray-800/50 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">Impact</span>
                          <span className="text-xs font-medium text-white">{cvScores.impact}%</span>
                        </div>
                        <Progress value={cvScores.impact} size="sm" variant={cvScores.impact >= 70 ? 'success' : 'default'} />
                      </div>
                      <div className="p-2 bg-gray-800/50 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">Keywords</span>
                          <span className="text-xs font-medium text-white">{cvScores.keywords}%</span>
                        </div>
                        <Progress value={cvScores.keywords} size="sm" variant={cvScores.keywords >= 70 ? 'success' : 'default'} />
                      </div>
                      <div className="p-2 bg-gray-800/50 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">Formatting</span>
                          <span className="text-xs font-medium text-white">{cvScores.formatting}%</span>
                        </div>
                        <Progress value={cvScores.formatting} size="sm" variant={cvScores.formatting >= 70 ? 'success' : 'default'} />
                      </div>
                      <div className="p-2 bg-gray-800/50 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">Readability</span>
                          <span className="text-xs font-medium text-white">{cvScores.readability}%</span>
                        </div>
                        <Progress value={cvScores.readability} size="sm" variant={cvScores.readability >= 70 ? 'success' : 'default'} />
                      </div>
                      <div className="p-2 bg-gray-800/50 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">ATS Ready</span>
                          <span className="text-xs font-medium text-white">{cvScores.ats}%</span>
                        </div>
                        <Progress value={cvScores.ats} size="sm" variant={cvScores.ats >= 70 ? 'success' : 'default'} />
                      </div>
                    </div>

                    {/* Suggestions */}
                    {cvScores.suggestions && cvScores.suggestions.length > 0 && (
                      <div className="border-t border-gray-700 pt-3">
                        <h4 className="text-xs font-medium text-gray-400 mb-2 flex items-center">
                          <Wand2 className="w-3 h-3 mr-1" />
                          Improvement Suggestions
                        </h4>
                        <ul className="space-y-1">
                          {cvScores.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="text-xs text-gray-300 flex items-start">
                              <span className="text-yellow-400 mr-2">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              {/* CV Preview */}
              <Card className="bg-white text-gray-900 p-8 shadow-2xl min-h-[800px]">
                <div 
                  ref={previewRef} 
                  className="space-y-6" 
                  style={{ 
                    fontFamily: FONT_FAMILIES.find(f => f.id === style.fontFamily)?.css || 'Inter, sans-serif',
                    fontSize: `${style.fontSize}pt`,
                    lineHeight: style.lineHeight,
                  }}
                >
                  {/* Header Preview */}
                  {blocks.find(b => b.blockType === 'header')?.isEnabled && (
                    <div 
                      className="border-b pb-4" 
                      style={{ 
                        borderColor: style.accentColor,
                        textAlign: sectionStyles.header.alignment 
                      }}
                    >
                      <h1 
                        style={{ 
                          color: sectionStyles.header.color,
                          fontSize: `${sectionStyles.header.fontSize}pt`,
                          fontWeight: sectionStyles.header.fontWeight === 'bold' ? 700 : sectionStyles.header.fontWeight === 'semibold' ? 600 : 400,
                          lineHeight: style.lineHeight,
                        }}
                      >
                        {(blocks.find(b => b.blockType === 'header')?.content as any)?.fullName || 'Your Name'}
                      </h1>
                      <p style={{ color: style.accentColor, fontSize: `${style.fontSize + 2}pt`, lineHeight: style.lineHeight }}>
                        {(blocks.find(b => b.blockType === 'header')?.content as any)?.professionalTitle || 'Professional Title'}
                      </p>
                      <p style={{ color: sectionStyles.content.color, fontSize: `${style.fontSize - 1}pt`, marginTop: '8px' }}>
                        {(blocks.find(b => b.blockType === 'header')?.content as any)?.email || 'email@example.com'} | 
                        {(blocks.find(b => b.blockType === 'header')?.content as any)?.phone || ' +1 234 567 8900'}
                      </p>
                    </div>
                  )}

                  {/* Summary Preview */}
                  {blocks.find(b => b.blockType === 'summary')?.isEnabled && (
                    <div style={{ marginBottom: `${style.sectionSpacing}px` }}>
                      <h2 
                        style={{ 
                          color: sectionStyles.sectionTitle.color,
                          fontSize: `${sectionStyles.sectionTitle.fontSize}pt`,
                          textAlign: sectionStyles.sectionTitle.alignment,
                          fontWeight: 600,
                          marginBottom: '8px',
                        }}
                      >
                        {sectionTitles.summary}
                      </h2>
                      <p 
                        style={{ 
                          lineHeight: style.lineHeight,
                          color: sectionStyles.content.color,
                          fontSize: `${sectionStyles.content.fontSize}pt`,
                          textAlign: sectionStyles.content.alignment
                        }}
                      >
                        {(blocks.find(b => b.blockType === 'summary')?.content as any)?.text || 
                          'Your professional summary will appear here. Describe your experience, skills, and career objectives.'}
                      </p>
                    </div>
                  )}

                  {/* Skills Preview */}
                  {blocks.find(b => b.blockType === 'skills')?.isEnabled && (
                    <div style={{ marginBottom: `${style.sectionSpacing}px` }}>
                      <h2 
                        style={{ 
                          color: sectionStyles.sectionTitle.color,
                          fontSize: `${sectionStyles.sectionTitle.fontSize}pt`,
                          textAlign: sectionStyles.sectionTitle.alignment,
                          fontWeight: 600,
                          marginBottom: '8px',
                        }}
                      >
                        {sectionTitles.skills}
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {((blocks.find(b => b.blockType === 'skills')?.content as any)?.skills?.split(',').map((s: string) => s.trim()).filter(Boolean) || ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL']).map((skill: string) => (
                          <span 
                            key={skill}
                            style={{ 
                              backgroundColor: `${style.accentColor}15`, 
                              color: style.accentColor,
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: `${style.fontSize - 1}pt`,
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience Preview */}
                  {blocks.find(b => b.blockType === 'experience')?.isEnabled && (
                    <div style={{ marginBottom: `${style.sectionSpacing}px` }}>
                      <h2 
                        style={{ 
                          color: sectionStyles.sectionTitle.color,
                          fontSize: `${sectionStyles.sectionTitle.fontSize}pt`,
                          fontWeight: 600,
                          marginBottom: '12px',
                        }}
                      >
                        {sectionTitles.experience}
                      </h2>
                      <div className="space-y-4">
                        {((blocks.find(b => b.blockType === 'experience')?.content as any)?.items || []).length > 0 ? (
                          ((blocks.find(b => b.blockType === 'experience')?.content as any)?.items || []).map((item: any, idx: number) => (
                            <div key={idx}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 style={{ color: style.primaryColor, fontWeight: 600, fontSize: `${style.fontSize}pt` }}>
                                    {item.position || 'Position Title'}
                                  </h3>
                                  <p style={{ color: sectionStyles.content.color, fontSize: `${style.fontSize - 1}pt` }}>
                                    {item.company || 'Company Name'}
                                  </p>
                                </div>
                                <span style={{ color: '#6b7280', fontSize: `${style.fontSize - 1}pt` }}>
                                  {item.startDate || 'Start'} - {item.endDate || 'Present'}
                                </span>
                              </div>
                              {item.achievements && (
                                <ul className="mt-2 space-y-1" style={{ lineHeight: style.lineHeight, fontSize: `${style.fontSize}pt`, color: sectionStyles.content.color }}>
                                  {item.achievements.split('\n').filter((a: string) => a.trim()).map((achievement: string, aIdx: number) => (
                                    <li key={aIdx} className="flex items-start">
                                      <span className="mr-2">{style.bulletStyle === 'disc' ? '•' : style.bulletStyle === 'circle' ? '○' : style.bulletStyle === 'square' ? '■' : style.bulletStyle === 'dash' ? '–' : '→'}</span>
                                      {achievement.replace(/^[•\-\*]\s*/, '')}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))
                        ) : (
                          <p style={{ color: '#9ca3af', fontSize: `${style.fontSize}pt`, fontStyle: 'italic' }}>
                            Add your work experience to see it here...
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Education Preview */}
                  {blocks.find(b => b.blockType === 'education')?.isEnabled && (
                    <div style={{ marginBottom: `${style.sectionSpacing}px` }}>
                      <h2 
                        style={{ 
                          color: sectionStyles.sectionTitle.color,
                          fontSize: `${sectionStyles.sectionTitle.fontSize}pt`,
                          fontWeight: 600,
                          marginBottom: '12px',
                        }}
                      >
                        {sectionTitles.education}
                      </h2>
                      <div className="space-y-3">
                        {((blocks.find(b => b.blockType === 'education')?.content as any)?.items || []).length > 0 ? (
                          ((blocks.find(b => b.blockType === 'education')?.content as any)?.items || []).map((item: any, idx: number) => (
                            <div key={idx}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 style={{ color: style.primaryColor, fontWeight: 600, fontSize: `${style.fontSize}pt` }}>
                                    {item.degree || 'Degree'}{item.field ? ` in ${item.field}` : ''}
                                  </h3>
                                  <p style={{ color: sectionStyles.content.color, fontSize: `${style.fontSize - 1}pt` }}>
                                    {item.institution || 'Institution'}
                                  </p>
                                </div>
                                <span style={{ color: '#6b7280', fontSize: `${style.fontSize - 1}pt` }}>
                                  {item.graduationYear || 'Year'}
                                </span>
                              </div>
                              {item.gpa && (
                                <p style={{ color: sectionStyles.content.color, fontSize: `${style.fontSize - 1}pt`, marginTop: '4px' }}>
                                  GPA: {item.gpa}
                                </p>
                              )}
                            </div>
                          ))
                        ) : (
                          <p style={{ color: '#9ca3af', fontSize: `${style.fontSize}pt`, fontStyle: 'italic' }}>
                            Add your education to see it here...
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Projects Preview */}
                  {blocks.find(b => b.blockType === 'projects')?.isEnabled && (
                    <div style={{ marginBottom: `${style.sectionSpacing}px` }}>
                      <h2 
                        style={{ 
                          color: sectionStyles.sectionTitle.color,
                          fontSize: `${sectionStyles.sectionTitle.fontSize}pt`,
                          fontWeight: 600,
                          marginBottom: '12px',
                        }}
                      >
                        {sectionTitles.projects}
                      </h2>
                      <div className="space-y-4">
                        {((blocks.find(b => b.blockType === 'projects')?.content as any)?.items || []).length > 0 ? (
                          ((blocks.find(b => b.blockType === 'projects')?.content as any)?.items || []).map((item: any, idx: number) => (
                            <div key={idx}>
                              <h3 style={{ color: style.primaryColor, fontWeight: 600, fontSize: `${style.fontSize}pt` }}>
                                {item.name || 'Project Name'}
                              </h3>
                              {item.description && (
                                <p style={{ color: sectionStyles.content.color, fontSize: `${style.fontSize}pt`, marginTop: '4px', lineHeight: style.lineHeight }}>
                                  {item.description}
                                </p>
                              )}
                              {item.technologies && (
                                <p style={{ color: '#6b7280', fontSize: `${style.fontSize - 2}pt`, marginTop: '4px' }}>
                                  {item.technologies}
                                </p>
                              )}
                              {item.link && (
                                <p style={{ color: style.accentColor, fontSize: `${style.fontSize - 2}pt`, marginTop: '2px' }}>
                                  {item.link}
                                </p>
                              )}
                            </div>
                          ))
                        ) : (
                          <p style={{ color: '#9ca3af', fontSize: `${style.fontSize}pt`, fontStyle: 'italic' }}>
                            Add your projects to see them here...
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Custom Sections Preview */}
                  {blocks.filter(b => b.blockType === 'custom' && b.isEnabled).map(block => (
                    <div key={block.id} style={{ marginBottom: `${style.sectionSpacing}px` }}>
                      <h2 
                        style={{ 
                          color: sectionStyles.sectionTitle.color,
                          fontSize: `${sectionStyles.sectionTitle.fontSize}pt`,
                          fontWeight: 600,
                          marginBottom: '12px',
                        }}
                      >
                        {block.customTitle || 'Custom Section'}
                      </h2>
                      <p style={{ color: sectionStyles.content.color, fontSize: `${style.fontSize}pt`, lineHeight: style.lineHeight, whiteSpace: 'pre-wrap' }}>
                        {(block.content as any).text || 'Enter content for this custom section...'}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
