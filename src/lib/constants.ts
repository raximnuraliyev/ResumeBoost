// Supported languages with formal CV conventions
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', icon: 'US' },
  { code: 'ru', name: 'Russian', icon: 'RU' },
  { code: 'de', name: 'German', icon: 'DE' },
  { code: 'fr', name: 'French', icon: 'FR' },
  { code: 'nl', name: 'Dutch', icon: 'NL' },
  { code: 'lt', name: 'Lithuanian', icon: 'LT' },
  { code: 'uz', name: 'Uzbek', icon: 'UZ' },
  { code: 'zh', name: 'Mandarin (Simplified)', icon: 'CN' },
  { code: 'ko', name: 'Korean', icon: 'KR' },
  { code: 'es', name: 'Spanish', icon: 'ES' },
  { code: 'pt', name: 'Portuguese', icon: 'PT' },
  { code: 'el', name: 'Greek', icon: 'GR' },
  { code: 'uk', name: 'Ukrainian', icon: 'UA' },
  { code: 'ar', name: 'Arabic', icon: 'SA' },
] as const

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code']

// CV Block types
export const CV_BLOCK_TYPES = [
  { id: 'header', name: 'Header', description: 'Name and professional title', icon: 'User' },
  { id: 'summary', name: 'Summary / Profile', description: 'Professional summary', icon: 'FileText' },
  { id: 'skills', name: 'Skills', description: 'Technical and soft skills', icon: 'Code' },
  { id: 'experience', name: 'Experience', description: 'Work history', icon: 'Briefcase' },
  { id: 'education', name: 'Education', description: 'Academic background', icon: 'GraduationCap' },
  { id: 'projects', name: 'Projects', description: 'Personal and professional projects', icon: 'Folder' },
  { id: 'certifications', name: 'Certifications', description: 'Professional certifications', icon: 'Award' },
  { id: 'publications', name: 'Publications', description: 'Research and articles', icon: 'BookOpen' },
  { id: 'competitions', name: 'Competitions', description: 'Hackathons and contests', icon: 'Trophy' },
  { id: 'volunteering', name: 'Volunteering', description: 'Volunteer work', icon: 'Heart' },
  { id: 'awards', name: 'Awards', description: 'Recognition and honors', icon: 'Medal' },
  { id: 'languages', name: 'Languages', description: 'Language proficiency', icon: 'Globe' },
  { id: 'references', name: 'References', description: 'Professional references', icon: 'Users' },
] as const

export type CVBlockType = typeof CV_BLOCK_TYPES[number]['id']

// Seniority levels
export const SENIORITY_LEVELS = [
  { id: 'junior', name: 'Junior', description: '0-2 years experience' },
  { id: 'strong-junior', name: 'Strong Junior', description: '1-3 years experience' },
  { id: 'mid', name: 'Middle', description: '2-4 years experience' },
  { id: 'strong-mid', name: 'Strong Middle', description: '3-5 years experience' },
  { id: 'senior', name: 'Senior', description: '5+ years experience' },
  { id: 'strong-senior', name: 'Strong Senior', description: '7+ years experience' },
  { id: 'pm', name: 'Technical PM', description: 'Project/Product Management' },
] as const

export type SeniorityLevel = typeof SENIORITY_LEVELS[number]['id']

// Interview focus areas
export const INTERVIEW_FOCUS_AREAS = [
  { id: 'algorithms', name: 'Algorithms & Data Structures', icon: 'Binary' },
  { id: 'system-design', name: 'System Design', icon: 'Network' },
  { id: 'frontend', name: 'Frontend Development', icon: 'Layout' },
  { id: 'backend', name: 'Backend Development', icon: 'Server' },
  { id: 'databases', name: 'Databases', icon: 'Database' },
  { id: 'devops', name: 'DevOps & Infrastructure', icon: 'Cloud' },
  { id: 'security', name: 'Cybersecurity', icon: 'Shield' },
  { id: 'leadership', name: 'Leadership & Management', icon: 'Users' },
  { id: 'behavioral', name: 'Behavioral Questions', icon: 'MessageCircle' },
] as const

export type InterviewFocus = typeof INTERVIEW_FOCUS_AREAS[number]['id']

// IT Job Roles for Interview Practice (Top 50 - 2026)
export const IT_JOB_ROLES = [
  // Executive & Leadership (10-15 years experience)
  { id: 'ciso', name: 'Chief Information Security Officer (CISO)', category: 'Executive', experience: '10-15 years', salary: '$205k - $292k', focusAreas: ['security', 'leadership', 'system-design'] },
  { id: 'cto', name: 'Chief Technology Officer (CTO)', category: 'Executive', experience: '10-15 years', salary: '$150k - $270k', focusAreas: ['system-design', 'leadership', 'backend'] },
  { id: 'cio', name: 'Chief Information Officer (CIO)', category: 'Executive', experience: '10-15 years', salary: '$150k - $300k', focusAreas: ['system-design', 'leadership', 'databases'] },
  { id: 'vp-engineering', name: 'VP / Director of Engineering', category: 'Executive', experience: '8-12 years', salary: '$180k - $295k', focusAreas: ['leadership', 'system-design', 'backend'] },
  
  // Architecture & Design (5-10 years experience)
  { id: 'cloud-architect', name: 'Enterprise Cloud Architect', category: 'Architecture', experience: '7-10 years', salary: '$154k - $201k', focusAreas: ['system-design', 'devops', 'security'] },
  { id: 'solutions-architect', name: 'Solutions Architect', category: 'Architecture', experience: '5-7 years', salary: '$120k - $270k', focusAreas: ['system-design', 'backend', 'databases'] },
  { id: 'systems-architect', name: 'Systems Architect', category: 'Architecture', experience: '5-7 years', salary: '$140k - $190k', focusAreas: ['system-design', 'backend', 'devops'] },
  { id: 'network-architect', name: 'Network Architect', category: 'Architecture', experience: '5-8 years', salary: '$100k - $130k', focusAreas: ['system-design', 'security', 'devops'] },
  { id: 'iot-architect', name: 'IoT Solutions Architect', category: 'Architecture', experience: '5-8 years', salary: '$125k - $180k', focusAreas: ['system-design', 'security', 'backend'] },
  
  // Management (5-8 years experience)
  { id: 'ai-ml-manager', name: 'AI / Machine-Learning Engineering Manager', category: 'Management', experience: '6-8 years', salary: '$164k - $189k', focusAreas: ['algorithms', 'system-design', 'leadership'] },
  { id: 'cybersecurity-manager', name: 'Cybersecurity Manager / Director', category: 'Management', experience: '6-8 years', salary: '$120k - $149k', focusAreas: ['security', 'leadership', 'system-design'] },
  { id: 'software-eng-manager', name: 'Software Engineering Manager', category: 'Management', experience: '5-8 years', salary: '$150k - $190k', focusAreas: ['backend', 'leadership', 'system-design'] },
  { id: 'it-program-manager', name: 'IT Program/Portfolio Manager', category: 'Management', experience: '7-10 years', salary: '$125k - $155k', focusAreas: ['leadership', 'system-design', 'behavioral'] },
  { id: 'it-service-manager', name: 'IT Service Delivery Manager', category: 'Management', experience: '5-8 years', salary: '$100k - $165k', focusAreas: ['leadership', 'devops', 'behavioral'] },
  { id: 'it-compliance-manager', name: 'IT Compliance Manager', category: 'Management', experience: '5-7 years', salary: '$105k - $150k', focusAreas: ['security', 'leadership', 'behavioral'] },
  { id: 'it-procurement-manager', name: 'IT Procurement Manager', category: 'Management', experience: '5-7 years', salary: '$110k - $160k', focusAreas: ['leadership', 'behavioral', 'system-design'] },
  
  // Data & AI (4-8 years experience)
  { id: 'lead-data-scientist', name: 'Lead Data Scientist', category: 'Data & AI', experience: '5-8 years', salary: '$146k - $210k', focusAreas: ['algorithms', 'databases', 'system-design'] },
  { id: 'senior-data-engineer', name: 'Senior Data Engineer', category: 'Data & AI', experience: '4-6 years', salary: '$115k - $160k', focusAreas: ['databases', 'backend', 'system-design'] },
  { id: 'big-data-engineer', name: 'Big Data Engineer', category: 'Data & AI', experience: '4-6 years', salary: '$110k - $170k', focusAreas: ['databases', 'system-design', 'backend'] },
  { id: 'bi-engineer', name: 'Business Intelligence (BI) Engineer', category: 'Data & AI', experience: '3-5 years', salary: '$115k - $150k', focusAreas: ['databases', 'backend', 'algorithms'] },
  { id: 'data-viz-engineer', name: 'Data Visualization Engineer', category: 'Data & AI', experience: '3-5 years', salary: '$120k - $150k', focusAreas: ['frontend', 'databases', 'algorithms'] },
  
  // Security (3-6 years experience)
  { id: 'cloud-security-engineer', name: 'Cloud Security Engineer', category: 'Security', experience: '4-6 years', salary: '$120k - $165k', focusAreas: ['security', 'devops', 'system-design'] },
  { id: 'senior-security-analyst', name: 'Senior Security Analyst', category: 'Security', experience: '4-6 years', salary: '$120k - $160k', focusAreas: ['security', 'system-design', 'algorithms'] },
  { id: 'pen-tester', name: 'Penetration Tester (Ethical Hacker)', category: 'Security', experience: '3-5 years', salary: '$80k - $135k', focusAreas: ['security', 'backend', 'algorithms'] },
  { id: 'soc-analyst', name: 'Security Operations Center (SOC) Analyst', category: 'Security', experience: '2-4 years', salary: '$75k - $105k', focusAreas: ['security', 'system-design', 'behavioral'] },
  
  // Engineering (3-6 years experience)
  { id: 'devops-engineer', name: 'DevOps Engineer', category: 'Engineering', experience: '3-5 years', salary: '$118k - $150k', focusAreas: ['devops', 'system-design', 'backend'] },
  { id: 'sre', name: 'Site Reliability Engineer (SRE)', category: 'Engineering', experience: '4-6 years', salary: '$120k - $185k', focusAreas: ['devops', 'system-design', 'backend'] },
  { id: 'platform-engineer', name: 'Platform Engineer', category: 'Engineering', experience: '4-6 years', salary: '$120k - $185k', focusAreas: ['devops', 'system-design', 'backend'] },
  { id: 'blockchain-engineer', name: 'Blockchain Engineer', category: 'Engineering', experience: '3-5 years', salary: '$105k - $145k', focusAreas: ['backend', 'security', 'algorithms'] },
  { id: 'full-stack-dev', name: 'Full-Stack Developer', category: 'Engineering', experience: '3-5 years', salary: '$100k - $130k', focusAreas: ['frontend', 'backend', 'databases'] },
  { id: 'mobile-dev', name: 'Mobile Application Developer', category: 'Engineering', experience: '2-4 years', salary: '$95k - $115k', focusAreas: ['frontend', 'backend', 'algorithms'] },
  { id: 'game-dev', name: 'Game Developer', category: 'Engineering', experience: '2-4 years', salary: '$80k - $145k', focusAreas: ['algorithms', 'backend', 'frontend'] },
  { id: 'ar-vr-dev', name: 'AR/VR Developer', category: 'Engineering', experience: '3-5 years', salary: '$100k - $160k', focusAreas: ['algorithms', 'frontend', 'backend'] },
  { id: 'rpa-dev', name: 'RPA Developer', category: 'Engineering', experience: '2-4 years', salary: '$75k - $105k', focusAreas: ['backend', 'algorithms', 'behavioral'] },
  
  // Infrastructure (2-5 years experience)
  { id: 'network-engineer', name: 'Network Engineer', category: 'Infrastructure', experience: '3-5 years', salary: '$90k - $135k', focusAreas: ['system-design', 'security', 'devops'] },
  { id: 'systems-admin', name: 'Systems Administrator', category: 'Infrastructure', experience: '2-4 years', salary: '$80k - $120k', focusAreas: ['devops', 'security', 'system-design'] },
  { id: 'dba', name: 'Database Administrator (DBA)', category: 'Infrastructure', experience: '3-5 years', salary: '$80k - $120k', focusAreas: ['databases', 'backend', 'system-design'] },
  { id: 'cloud-consultant', name: 'Cloud Consultant', category: 'Infrastructure', experience: '4-6 years', salary: '$115k - $170k', focusAreas: ['system-design', 'devops', 'security'] },
  
  // Product & Design (3-7 years experience)
  { id: 'technical-pm', name: 'Technical Product Manager (IT)', category: 'Product', experience: '5-7 years', salary: '$110k - $195k', focusAreas: ['system-design', 'leadership', 'behavioral'] },
  { id: 'ux-ui-designer', name: 'UX / UI Designer', category: 'Design', experience: '3-5 years', salary: '$95k - $135k', focusAreas: ['frontend', 'behavioral', 'algorithms'] },
  { id: 'crm-consultant', name: 'CRM Technical Consultant', category: 'Consulting', experience: '3-5 years', salary: '$95k - $150k', focusAreas: ['backend', 'databases', 'system-design'] },
  { id: 'tech-account-manager', name: 'Technical Account Manager', category: 'Consulting', experience: '3-5 years', salary: '$85k - $125k', focusAreas: ['behavioral', 'system-design', 'leadership'] },
  
  // Research & Specialized (3-5 years experience)
  { id: 'research-scientist', name: 'Computer & Information Research Scientist', category: 'Research', experience: '3-5 years', salary: '$105k - $140k', focusAreas: ['algorithms', 'system-design', 'backend'] },
  { id: 'gis-specialist', name: 'GIS Specialist', category: 'Specialized', experience: '2-4 years', salary: '$70k - $85k', focusAreas: ['databases', 'algorithms', 'backend'] },
  { id: 'informatics-nurse', name: 'Informatics Nurse (Healthcare IT)', category: 'Specialized', experience: '3-5 years', salary: '$105k - $150k', focusAreas: ['databases', 'system-design', 'behavioral'] },
  
  // Entry & Support (1-4 years experience)
  { id: 'qa-engineer', name: 'Quality Assurance (QA) Engineer', category: 'Engineering', experience: '2-4 years', salary: '$80k - $160k', focusAreas: ['algorithms', 'backend', 'frontend'] },
  { id: 'it-auditor', name: 'IT Auditor', category: 'Governance', experience: '3-5 years', salary: '$60k - $95k', focusAreas: ['security', 'behavioral', 'databases'] },
  { id: 'info-systems-analyst', name: 'Information Systems Analyst', category: 'Analysis', experience: '2-4 years', salary: '$65k - $80k', focusAreas: ['databases', 'system-design', 'behavioral'] },
  { id: 'tech-writer', name: 'Technical Writer - IT', category: 'Documentation', experience: '3-5 years', salary: '$70k - $115k', focusAreas: ['behavioral', 'system-design', 'backend'] },
  { id: 'help-desk', name: 'Help Desk Technician', category: 'Support', experience: '1-3 years', salary: '$45k - $60k', focusAreas: ['behavioral', 'system-design', 'security'] },
] as const

export type ITJobRole = typeof IT_JOB_ROLES[number]['id']

// Job role categories for filtering
export const JOB_ROLE_CATEGORIES = [
  'All',
  'Executive',
  'Architecture',
  'Management',
  'Data & AI',
  'Security',
  'Engineering',
  'Infrastructure',
  'Product',
  'Design',
  'Consulting',
  'Research',
  'Specialized',
  'Governance',
  'Analysis',
  'Documentation',
  'Support',
] as const

// Font options for CV
export const FONT_FAMILIES = [
  { id: 'inter', name: 'Inter', css: 'Inter, sans-serif' },
  { id: 'roboto', name: 'Roboto', css: 'Roboto, sans-serif' },
  { id: 'open-sans', name: 'Open Sans', css: '"Open Sans", sans-serif' },
  { id: 'lato', name: 'Lato', css: 'Lato, sans-serif' },
  { id: 'georgia', name: 'Georgia', css: 'Georgia, serif' },
  { id: 'times', name: 'Times New Roman', css: '"Times New Roman", serif' },
] as const

// Issue severities
export const ISSUE_SEVERITIES = [
  { id: 'low', name: 'Low', color: 'text-blue-400' },
  { id: 'medium', name: 'Medium', color: 'text-yellow-400' },
  { id: 'high', name: 'High', color: 'text-orange-400' },
  { id: 'critical', name: 'Critical', color: 'text-red-400' },
] as const

// Issue statuses
export const ISSUE_STATUSES = [
  { id: 'open', name: 'Open', color: 'bg-blue-500' },
  { id: 'in-progress', name: 'In Progress', color: 'bg-yellow-500' },
  { id: 'resolved', name: 'Resolved', color: 'bg-green-500' },
  { id: 'closed', name: 'Closed', color: 'bg-gray-500' },
] as const

// Features for tracking
export const FEATURES = [
  { id: 'cv-maker', name: 'CV Maker' },
  { id: 'cv-analyzer', name: 'CV Analyzer' },
  { id: 'interview', name: 'Interview Ready Checker' },
] as const
