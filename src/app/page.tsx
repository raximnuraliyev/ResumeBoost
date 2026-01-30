'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FileText, Search, MessageSquare, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'

// Dynamic import for 3D component to avoid SSR issues
const MascotViewer = dynamic(
  () => import('@/components/3d/MascotViewer').then((mod) => mod.MascotViewer),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    )
  }
)

const features = [
  {
    href: '/cv-maker',
    icon: FileText,
    title: 'CV Maker',
    description: 'Build professional CVs with AI-powered generation. Real-time preview, multilingual support, and ATS optimization.',
    gradient: 'from-indigo-500 to-purple-600',
    shadowColor: 'shadow-indigo-500/20',
  },
  {
    href: '/cv-analyzer',
    icon: Search,
    title: 'CV Analyzer',
    description: 'Get brutally honest feedback on your CV. Technical validation, ATS simulation, and seniority realism checks.',
    gradient: 'from-cyan-500 to-blue-600',
    shadowColor: 'shadow-cyan-500/20',
  },
  {
    href: '/interview',
    icon: MessageSquare,
    title: 'Interview Ready',
    description: 'Prepare for technical interviews with adaptive AI. Algorithms, system design, and language-specific challenges.',
    gradient: 'from-orange-500 to-red-600',
    shadowColor: 'shadow-orange-500/20',
  },
]

const highlights = [
  {
    icon: Zap,
    title: 'No Account Needed',
    description: 'Start immediately. No signups, no verification emails.',
  },
  {
    icon: Shield,
    title: 'Session-Based Privacy',
    description: 'Your data lives in your session. We don\'t track you.',
  },
  {
    icon: Sparkles,
    title: 'AI Transparency',
    description: 'See exactly what the AI is doing. No black boxes.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-grid">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-sm text-indigo-300">AI-Powered for Engineers</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-white">Build.</span>{' '}
                <span className="gradient-text">Analyze.</span>{' '}
                <span className="text-white">Prove.</span>
              </h1>
              
              <p className="text-xl text-gray-400 max-w-xl">
                AI-powered CV building and interview preparation designed exclusively for 
                <span className="text-white font-medium"> software engineers</span>. 
                No fluff. No generic HR templates. Just serious tools.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/cv-maker">
                  <Button size="xl" className="w-full sm:w-auto group">
                    Start Building
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/cv-analyzer">
                  <Button size="xl" variant="outline" className="w-full sm:w-auto">
                    Analyze Existing CV
                  </Button>
                </Link>
              </div>
              
              {/* Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-800">
                {highlights.map((item) => (
                  <div key={item.title} className="space-y-2">
                    <item.icon className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-medium text-white">{item.title}</h3>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            
            {/* Right: 3D Model */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[500px] lg:h-[600px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-3xl" />
              <MascotViewer className="rounded-3xl" />
              
              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute bottom-8 left-8 glass rounded-xl px-4 py-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                    <span className="text-lg">✓</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">ATS Optimized</p>
                    <p className="text-xs text-gray-400">Passes 95% of filters</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute top-8 right-8 glass rounded-xl px-4 py-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center">
                    <span className="text-lg">🎯</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">13+ Languages</p>
                    <p className="text-xs text-gray-400">Formal tone enforced</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Three powerful tools designed for technical professionals. 
              No accounts required – just start using them.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={feature.href}>
                  <Card 
                    hover 
                    glass 
                    className={`h-full cursor-pointer group hover:shadow-2xl ${feature.shadowColor}`}
                  >
                    <CardHeader>
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                        <feature.icon className="w-7 h-7 text-white" />
                      </div>
                      <CardTitle className="group-hover:text-indigo-400 transition-colors">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                      <div className="mt-6 flex items-center text-indigo-400 text-sm font-medium group-hover:text-indigo-300">
                        <span>Get Started</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Built Different
              </h2>
              <div className="space-y-4 text-gray-400">
                <p>
                  This isn&apos;t another generic resume builder with fancy templates. 
                  <span className="text-white"> CVEngine is built by engineers, for engineers.</span>
                </p>
                <p>
                  We don&apos;t sugarcoat feedback. Our analyzer will tell you if your CV 
                  would get filtered out by ATS systems. Our interview simulator will 
                  expose knowledge gaps before real interviewers do.
                </p>
                <p>
                  No accounts. No tracking. No BS. Just tools that work.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { label: 'Languages Supported', value: '14' },
                { label: 'ATS Compatibility', value: '95%' },
                { label: 'Interview Topics', value: '50+' },
                { label: 'No Registration', value: '✓' },
              ].map((stat) => (
                <Card key={stat.label} glass className="p-6 text-center">
                  <p className="text-4xl font-bold gradient-text mb-2">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Build Your Career?
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                No signup required. No credit card. Just click and start building 
                your professional CV or preparing for interviews.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/cv-maker">
                  <Button size="xl" className="w-full sm:w-auto">
                    Launch CV Maker
                  </Button>
                </Link>
                <Link href="/interview">
                  <Button size="xl" variant="secondary" className="w-full sm:w-auto">
                    Try Interview Prep
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
