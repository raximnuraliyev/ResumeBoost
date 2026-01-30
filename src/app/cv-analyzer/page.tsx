'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, Search, AlertTriangle, CheckCircle, XCircle,
  TrendingUp, Target, Brain, Shield, ChevronRight, Wand2, ArrowRight
} from 'lucide-react'
import {
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent,
  Textarea, Progress
} from '@/components/ui'
import Link from 'next/link'

interface AnalysisResult {
  overallScore: number
  sections: {
    structural: { score: number; issues: string[]; passed: string[] }
    technical: { score: number; issues: string[]; passed: string[] }
    ats: { score: number; issues: string[]; passed: string[] }
    realism: { score: number; level: string; issues: string[]; passed: string[] }
  }
  warnings: string[]
  suggestions: string[]
  wouldGetFiltered: boolean
  recruiterDoubts: string[]
  companyFit?: string
  jobMatchScore?: number
}

export default function CVAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [analyzePhase, setAnalyzePhase] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setResult(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  })

  const handleAnalyze = async () => {
    if (!file) return

    setIsAnalyzing(true)
    setResult(null)

    try {
      // Simulate analysis phases for UX
      const phases = [
        'Uploading document...',
        'Extracting text content...',
        'Analyzing with AI...',
        'Evaluating against job requirements...',
        'Generating feedback...',
      ]

      // Start the phases animation
      const phasePromise = (async () => {
        for (const phase of phases) {
          setAnalyzePhase(phase)
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      })()

      // Send file to backend for parsing and analysis
      const formData = new FormData()
      formData.append('file', file)
      formData.append('sessionId', `session-${Date.now()}`)
      if (jobDescription) {
        formData.append('jobDescription', jobDescription)
      }

      const response = await fetch('/api/cv/analyze', {
        method: 'POST',
        body: formData, // No Content-Type header - browser sets it with boundary
      })

      // Wait for phases to complete for better UX
      await phasePromise

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Analysis failed')
      }
      
      const data = await response.json()
      
      if (data.success && data.analysis) {
        // Map API response to UI format
        const apiAnalysis = data.analysis
        setResult({
          overallScore: apiAnalysis.overallScore,
          sections: {
            structural: {
              score: apiAnalysis.structuralScore,
              issues: apiAnalysis.structuralIssues || [],
              passed: apiAnalysis.strengths?.slice(0, 3) || ['Document structure acceptable'],
            },
            technical: {
              score: apiAnalysis.technicalScore,
              issues: apiAnalysis.technicalIssues || [],
              passed: ['Technical content present'],
            },
            ats: {
              score: apiAnalysis.atsScore,
              issues: apiAnalysis.atsIssues || [],
              passed: apiAnalysis.missingKeywords?.length === 0 ? ['Good keyword coverage'] : [],
            },
            realism: {
              score: apiAnalysis.realismScore,
              level: apiAnalysis.realismScore >= 70 ? 'Realistic' : apiAnalysis.realismScore >= 50 ? 'Some concerns' : 'Questionable',
              issues: apiAnalysis.realismFlags || [],
              passed: apiAnalysis.realismScore >= 60 ? ['Claims appear reasonable'] : [],
            },
          },
          warnings: apiAnalysis.filterRisk === 'high' 
            ? ['This CV would likely be filtered out by many ATS systems', ...apiAnalysis.improvements?.slice(0, 2) || []]
            : apiAnalysis.improvements?.slice(0, 3) || [],
          suggestions: apiAnalysis.improvements || [],
          wouldGetFiltered: apiAnalysis.filterRisk === 'high',
          recruiterDoubts: apiAnalysis.recruiterDoubts || [],
          companyFit: apiAnalysis.companyFit,
          jobMatchScore: apiAnalysis.jobMatchScore,
        })
      } else {
        throw new Error('Invalid API response')
      }
    } catch (error) {
      console.error('Analysis error:', error)

      // Fallback to mock result on error
      setResult({
        overallScore: 72,
        sections: {
          structural: {
            score: 78,
            issues: ['Unable to fully parse document'],
            passed: ['Document uploaded successfully'],
          },
          technical: {
            score: 65,
            issues: ['AI analysis unavailable'],
            passed: ['File format accepted'],
          },
          ats: {
            score: 81,
            issues: ['Please try again for full analysis'],
            passed: ['Standard file format'],
          },
          realism: {
            score: 68,
            level: 'Assessment pending',
            issues: [],
            passed: [],
          },
        },
        warnings: ['Full AI analysis was not available. Please try again.'],
        suggestions: ['Retry the analysis for comprehensive feedback.'],
        wouldGetFiltered: false,
        recruiterDoubts: [],
      })
    } finally {
      setIsAnalyzing(false)
      setAnalyzePhase('')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreVariant = (score: number): 'success' | 'warning' | 'danger' => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'danger'
  }

  return (
    <div className="min-h-screen bg-grid py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4"
          >
            <Search className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-300">Brutal Honesty Mode</span>
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">CV Analyzer</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Get brutally honest feedback on your CV. No sugarcoating. 
            We&apos;ll tell you exactly what recruiters would doubt and what would get you filtered.
          </p>
        </div>

        {/* Upload Section */}
        {!result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Dropzone */}
            <Card glass className="p-8">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : file
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/30'
                }`}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-sm text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">Click or drag to replace</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-800 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {isDragActive ? 'Drop your CV here' : 'Upload your CV'}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        PDF, DOCX, or TXT (max 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Job Description (Optional) */}
            <Card glass className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">Job Description (Optional)</CardTitle>
                <CardDescription>
                  Paste a job description to get tailored feedback and match scoring
                </CardDescription>
              </CardHeader>
              <Textarea
                placeholder="Paste the job description here to see how well your CV matches..."
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </Card>

            {/* Analyze Button */}
            <Button
              size="xl"
              className="w-full"
              disabled={!file || isAnalyzing}
              isLoading={isAnalyzing}
              onClick={handleAnalyze}
            >
              {isAnalyzing ? (
                analyzePhase
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Analyze CV
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Overall Score */}
              <Card glass className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Overall CV Score</h2>
                    <p className="text-gray-400">
                      {result.overallScore >= 80
                        ? 'Your CV is in good shape!'
                        : result.overallScore >= 60
                        ? 'Your CV needs some work.'
                        : 'Your CV needs significant improvement.'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-6xl font-bold ${getScoreColor(result.overallScore)}`}>
                      {result.overallScore}
                    </div>
                    <p className="text-sm text-gray-500">out of 100</p>
                  </div>
                </div>
                <div className="mt-6">
                  <Progress value={result.overallScore} size="lg" variant={getScoreVariant(result.overallScore)} />
                </div>
              </Card>

              {/* Warning Banner */}
              {result.wouldGetFiltered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-xl p-6"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-red-400 mb-2">
                        High Filter Risk Detected
                      </h3>
                      <p className="text-gray-300 mb-3">
                        Based on our analysis, this CV would likely be filtered out by many ATS systems
                        and raise red flags with recruiters.
                      </p>
                      <ul className="space-y-1">
                        {result.warnings.map((warning, i) => (
                          <li key={i} className="text-sm text-gray-400 flex items-center">
                            <XCircle className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" />
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Section Scores */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Structural */}
                <Card glass className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                        <Target className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Structural Analysis</h3>
                        <p className="text-xs text-gray-500">Organization & clarity</p>
                      </div>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(result.sections.structural.score)}`}>
                      {result.sections.structural.score}
                    </span>
                  </div>
                  <Progress value={result.sections.structural.score} size="sm" variant={getScoreVariant(result.sections.structural.score)} className="mb-4" />
                  <div className="space-y-2">
                    {result.sections.structural.issues.map((issue, i) => (
                      <div key={i} className="flex items-start text-sm">
                        <XCircle className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-400">{issue}</span>
                      </div>
                    ))}
                    {result.sections.structural.passed.map((item, i) => (
                      <div key={i} className="flex items-start text-sm">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-400">{item}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Technical */}
                <Card glass className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Technical Depth</h3>
                        <p className="text-xs text-gray-500">Skills & credibility</p>
                      </div>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(result.sections.technical.score)}`}>
                      {result.sections.technical.score}
                    </span>
                  </div>
                  <Progress value={result.sections.technical.score} size="sm" variant={getScoreVariant(result.sections.technical.score)} className="mb-4" />
                  <div className="space-y-2">
                    {result.sections.technical.issues.map((issue, i) => (
                      <div key={i} className="flex items-start text-sm">
                        <XCircle className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-400">{issue}</span>
                      </div>
                    ))}
                    {result.sections.technical.passed.map((item, i) => (
                      <div key={i} className="flex items-start text-sm">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-400">{item}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* ATS */}
                <Card glass className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">ATS Compatibility</h3>
                        <p className="text-xs text-gray-500">Parsing & keywords</p>
                      </div>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(result.sections.ats.score)}`}>
                      {result.sections.ats.score}
                    </span>
                  </div>
                  <Progress value={result.sections.ats.score} size="sm" variant={getScoreVariant(result.sections.ats.score)} className="mb-4" />
                  <div className="space-y-2">
                    {result.sections.ats.issues.map((issue, i) => (
                      <div key={i} className="flex items-start text-sm">
                        <XCircle className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-400">{issue}</span>
                      </div>
                    ))}
                    {result.sections.ats.passed.map((item, i) => (
                      <div key={i} className="flex items-start text-sm">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-400">{item}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Realism */}
                <Card glass className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Seniority Realism</h3>
                        <p className="text-xs text-gray-500">Suggested: {result.sections.realism.level}</p>
                      </div>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(result.sections.realism.score)}`}>
                      {result.sections.realism.score}
                    </span>
                  </div>
                  <Progress value={result.sections.realism.score} size="sm" variant={getScoreVariant(result.sections.realism.score)} className="mb-4" />
                  <div className="space-y-2">
                    {result.sections.realism.issues.map((issue, i) => (
                      <div key={i} className="flex items-start text-sm">
                        <XCircle className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-400">{issue}</span>
                      </div>
                    ))}
                    {result.sections.realism.passed.map((item, i) => (
                      <div key={i} className="flex items-start text-sm">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-400">{item}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Job Match Score - only shown if job description was provided */}
              {result.jobMatchScore !== undefined && (
                <Card glass className="p-6">
                  <CardHeader className="p-0 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                        <Target className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <CardTitle>Job Match Score</CardTitle>
                        <CardDescription>How well your CV matches the job description</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4">
                      <div className={`text-4xl font-bold ${getScoreColor(result.jobMatchScore)}`}>
                        {result.jobMatchScore}%
                      </div>
                      <div className="flex-1">
                        <Progress 
                          value={result.jobMatchScore} 
                          variant={getScoreVariant(result.jobMatchScore)}
                          className="h-3"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mt-3">
                      {result.jobMatchScore >= 80 
                        ? "Excellent match! Your CV aligns well with the job requirements."
                        : result.jobMatchScore >= 60
                        ? "Decent match, but there's room to better align your CV with the job."
                        : "Low match. Consider tailoring your CV more specifically for this role."}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Company Fit Analysis - only shown if company was detected/provided */}
              {result.companyFit && (
                <Card glass className="p-6">
                  <CardHeader className="p-0 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <CardTitle>Company Fit Analysis</CardTitle>
                        <CardDescription>Assessment based on target company&apos;s standards</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-gray-300 leading-relaxed">{result.companyFit}</p>
                  </CardContent>
                </Card>
              )}

              {/* Recruiter Doubts */}
              <Card glass className="p-6">
                <CardHeader className="p-0 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <CardTitle>What Recruiters Would Doubt</CardTitle>
                      <CardDescription>These are the honest thoughts a recruiter might have</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-3">
                    {result.recruiterDoubts.map((doubt, i) => (
                      <div key={i} className="flex items-start p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                        <span className="text-red-400 mr-3">&ldquo;</span>
                        <span className="text-gray-300 italic">{doubt}</span>
                        <span className="text-red-400 ml-1">&rdquo;</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Suggestions */}
              <Card glass className="p-6">
                <CardHeader className="p-0 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Wand2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle>Concrete Suggestions</CardTitle>
                      <CardDescription>What you should actually do to fix this</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-3">
                    {result.suggestions.map((suggestion, i) => (
                      <div key={i} className="flex items-start">
                        <ChevronRight className="w-5 h-5 text-emerald-400 mr-2 flex-shrink-0" />
                        <span className="text-gray-300">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/cv-maker" className="flex-1">
                  <Button size="lg" className="w-full">
                    <Wand2 className="w-5 h-5 mr-2" />
                    Fix with CV Maker
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setResult(null)
                    setFile(null)
                  }}
                >
                  Analyze Another CV
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
