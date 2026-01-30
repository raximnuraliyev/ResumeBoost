// Comprehensive Interview Questions Database for 50 IT Roles
// Questions are organized by job role and difficulty level

export interface InterviewQuestion {
  id: string
  question: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  expectedDuration: number // minutes
  tips: string[]
  sampleAnswer?: string
  followUps: string[]
}

// Real interview questions for each job role
export const JOB_ROLE_QUESTIONS: Record<string, InterviewQuestion[]> = {
  // CISO - Chief Information Security Officer
  'ciso': [
    {
      id: 'ciso-1',
      question: 'How would you develop and implement a comprehensive cybersecurity strategy for an organization that is undergoing rapid digital transformation?',
      category: 'Strategy',
      difficulty: 'expert',
      expectedDuration: 10,
      tips: [
        'Discuss risk assessment frameworks (NIST, ISO 27001)',
        'Address zero-trust architecture implementation',
        'Mention stakeholder alignment and board communication',
        'Include metrics and KPIs for measuring success'
      ],
      followUps: [
        'How would you prioritize investments given limited budget?',
        'How do you balance security with business enablement?'
      ]
    },
    {
      id: 'ciso-2',
      question: 'Describe how you would handle a major data breach affecting millions of customer records. Walk me through your incident response process.',
      category: 'Incident Response',
      difficulty: 'expert',
      expectedDuration: 12,
      tips: [
        'Cover the incident response lifecycle: Preparation, Detection, Containment, Eradication, Recovery, Lessons Learned',
        'Discuss communication strategies (legal, PR, customers, regulators)',
        'Mention regulatory compliance (GDPR, CCPA notification requirements)',
        'Address post-incident improvements'
      ],
      followUps: [
        'How would you communicate this to the board?',
        'What metrics would you track post-incident?'
      ]
    },
    {
      id: 'ciso-3',
      question: 'How do you approach third-party risk management and vendor security assessments in a cloud-first environment?',
      category: 'Risk Management',
      difficulty: 'hard',
      expectedDuration: 8,
      tips: [
        'Discuss vendor risk assessment frameworks',
        'Mention continuous monitoring vs point-in-time assessments',
        'Address contractual security requirements and SLAs',
        'Talk about supply chain security (SolarWinds-type attacks)'
      ],
      followUps: [
        'How do you handle shadow IT?',
        'What about vendors that refuse to complete assessments?'
      ]
    },
    {
      id: 'ciso-4',
      question: 'What is your approach to building and retaining a high-performing security team in today\'s competitive talent market?',
      category: 'Leadership',
      difficulty: 'hard',
      expectedDuration: 8,
      tips: [
        'Discuss diverse hiring pipelines',
        'Mention training and certification programs',
        'Address career progression paths',
        'Talk about culture and burnout prevention'
      ],
      followUps: [
        'How do you measure team effectiveness?',
        'What\'s your view on managed security services vs in-house?'
      ]
    },
    {
      id: 'ciso-5',
      question: 'How would you implement a zero-trust architecture in a legacy enterprise environment?',
      category: 'Architecture',
      difficulty: 'expert',
      expectedDuration: 10,
      tips: [
        'Define zero-trust principles: verify explicitly, least privilege, assume breach',
        'Discuss phased implementation approach',
        'Address identity as the new perimeter',
        'Mention micro-segmentation strategies'
      ],
      followUps: [
        'How do you handle legacy systems that can\'t support modern auth?',
        'What\'s the ROI conversation with the CFO?'
      ]
    },
  ],

  // CTO - Chief Technology Officer
  'cto': [
    {
      id: 'cto-1',
      question: 'How would you evaluate and decide whether to adopt emerging technologies like AI/ML, blockchain, or quantum computing for the organization?',
      category: 'Technology Strategy',
      difficulty: 'expert',
      expectedDuration: 10,
      tips: [
        'Discuss framework for technology evaluation (maturity, fit, cost, risk)',
        'Mention proof-of-concept approaches',
        'Address build vs buy vs partner decisions',
        'Talk about avoiding hype-driven decisions'
      ],
      followUps: [
        'How do you handle executive pressure to adopt trendy technologies?',
        'Give an example of a technology bet that didn\'t work out'
      ]
    },
    {
      id: 'cto-2',
      question: 'Describe how you would lead a major platform modernization from a monolithic architecture to microservices while maintaining business continuity.',
      category: 'Architecture',
      difficulty: 'expert',
      expectedDuration: 12,
      tips: [
        'Discuss strangler fig pattern and incremental migration',
        'Address domain-driven design and service boundaries',
        'Mention observability and deployment strategies',
        'Talk about team organization (Conway\'s Law)'
      ],
      followUps: [
        'How do you handle data migration and consistency?',
        'What metrics indicate the modernization is successful?'
      ]
    },
    {
      id: 'cto-3',
      question: 'How do you establish engineering excellence and culture in a rapidly scaling engineering organization?',
      category: 'Leadership',
      difficulty: 'hard',
      expectedDuration: 8,
      tips: [
        'Discuss engineering principles and standards',
        'Mention code review practices and quality gates',
        'Address technical debt management',
        'Talk about mentorship and knowledge sharing'
      ],
      followUps: [
        'How do you balance speed with quality?',
        'How do you handle teams that resist change?'
      ]
    },
    {
      id: 'cto-4',
      question: 'What\'s your approach to technical due diligence during M&A activities, and how do you handle post-acquisition technology integration?',
      category: 'Strategy',
      difficulty: 'expert',
      expectedDuration: 10,
      tips: [
        'Discuss technical debt assessment',
        'Mention architecture compatibility evaluation',
        'Address talent retention strategies',
        'Talk about integration roadmap development'
      ],
      followUps: [
        'How do you value technical assets?',
        'What are the biggest integration pitfalls?'
      ]
    },
    {
      id: 'cto-5',
      question: 'How do you communicate complex technical concepts to non-technical board members and investors?',
      category: 'Communication',
      difficulty: 'hard',
      expectedDuration: 6,
      tips: [
        'Use analogies and business outcomes',
        'Focus on risk and opportunity, not technical details',
        'Prepare for questions with data and benchmarks',
        'Practice storytelling techniques'
      ],
      followUps: [
        'How do you handle pushback on technical investments?',
        'Give an example of a successful pitch'
      ]
    },
  ],

  // DevOps Engineer
  'devops-engineer': [
    {
      id: 'devops-1',
      question: 'Design a CI/CD pipeline for a microservices application with multiple teams contributing. How would you ensure reliability and fast feedback loops?',
      category: 'CI/CD',
      difficulty: 'medium',
      expectedDuration: 8,
      tips: [
        'Discuss trunk-based development vs GitFlow',
        'Mention automated testing strategies (unit, integration, e2e)',
        'Address deployment strategies (blue-green, canary, rolling)',
        'Talk about artifact management and versioning'
      ],
      followUps: [
        'How do you handle database migrations in the pipeline?',
        'What metrics do you track for pipeline health?'
      ]
    },
    {
      id: 'devops-2',
      question: 'How would you implement infrastructure as code for a multi-cloud environment? What tools would you choose and why?',
      category: 'Infrastructure',
      difficulty: 'medium',
      expectedDuration: 8,
      tips: [
        'Compare Terraform, Pulumi, CloudFormation',
        'Discuss state management and locking',
        'Address module design and reusability',
        'Mention testing IaC (Terratest, Checkov)'
      ],
      followUps: [
        'How do you handle drift detection?',
        'What\'s your strategy for managing secrets?'
      ]
    },
    {
      id: 'devops-3',
      question: 'Explain how you would set up comprehensive monitoring and alerting for a production system. What tools and metrics would you prioritize?',
      category: 'Observability',
      difficulty: 'medium',
      expectedDuration: 8,
      tips: [
        'Discuss the three pillars: metrics, logs, traces',
        'Mention SLIs, SLOs, and error budgets',
        'Address alert fatigue and on-call practices',
        'Talk about tools like Prometheus, Grafana, Datadog'
      ],
      followUps: [
        'How do you handle alert storms?',
        'What\'s your approach to post-incident reviews?'
      ]
    },
    {
      id: 'devops-4',
      question: 'A deployment just went wrong and is affecting 50% of users. Walk me through your incident response and rollback procedure.',
      category: 'Incident Response',
      difficulty: 'hard',
      expectedDuration: 8,
      tips: [
        'Prioritize: detect, mitigate, communicate, resolve',
        'Discuss rollback strategies and feature flags',
        'Mention runbooks and automation',
        'Talk about blameless post-mortems'
      ],
      followUps: [
        'How do you prevent similar incidents?',
        'When would you NOT rollback?'
      ]
    },
    {
      id: 'devops-5',
      question: 'How would you implement GitOps for Kubernetes deployments? What are the benefits and challenges?',
      category: 'Kubernetes',
      difficulty: 'hard',
      expectedDuration: 6,
      tips: [
        'Explain GitOps principles (declarative, versioned, automated)',
        'Compare ArgoCD, Flux, and alternatives',
        'Address secrets management in GitOps',
        'Discuss multi-cluster and multi-environment strategies'
      ],
      followUps: [
        'How do you handle emergency fixes?',
        'What about stateful applications?'
      ]
    },
  ],

  // Site Reliability Engineer (SRE)
  'sre': [
    {
      id: 'sre-1',
      question: 'Explain how you would define and implement SLOs for a customer-facing API service. How do you use error budgets in practice?',
      category: 'SRE Fundamentals',
      difficulty: 'hard',
      expectedDuration: 10,
      tips: [
        'Define SLI, SLO, SLA relationships',
        'Discuss meaningful metrics (availability, latency percentiles)',
        'Explain error budget policies and consequences',
        'Talk about negotiating SLOs with product teams'
      ],
      followUps: [
        'What happens when error budget is exhausted?',
        'How do you handle external dependencies affecting your SLOs?'
      ]
    },
    {
      id: 'sre-2',
      question: 'Design a chaos engineering program for testing system resilience. What experiments would you start with?',
      category: 'Resilience',
      difficulty: 'hard',
      expectedDuration: 8,
      tips: [
        'Start with steady-state hypothesis',
        'Discuss progressive complexity (from simple to complex failures)',
        'Mention tools like Chaos Monkey, Litmus, Gremlin',
        'Address safety and blast radius control'
      ],
      followUps: [
        'How do you get buy-in for chaos engineering?',
        'What\'s the scariest failure you\'ve tested?'
      ]
    },
    {
      id: 'sre-3',
      question: 'How would you approach capacity planning for a system with unpredictable traffic patterns (like viral social media)?',
      category: 'Capacity Planning',
      difficulty: 'hard',
      expectedDuration: 8,
      tips: [
        'Discuss baseline measurements and trend analysis',
        'Mention auto-scaling strategies and limits',
        'Address cost optimization vs preparedness',
        'Talk about load testing and stress testing'
      ],
      followUps: [
        'How do you handle sudden 100x traffic spikes?',
        'What\'s your approach to cost optimization?'
      ]
    },
    {
      id: 'sre-4',
      question: 'Walk me through how you would eliminate toil in an operations workflow. Give specific examples.',
      category: 'Automation',
      difficulty: 'medium',
      expectedDuration: 6,
      tips: [
        'Define toil (manual, repetitive, automatable work)',
        'Discuss measuring and tracking toil',
        'Give examples of automation projects',
        'Address the 50% rule for toil vs engineering work'
      ],
      followUps: [
        'How do you prioritize automation projects?',
        'What automation projects have failed?'
      ]
    },
    {
      id: 'sre-5',
      question: 'Your service is experiencing latency issues but there are no obvious errors. How do you investigate?',
      category: 'Troubleshooting',
      difficulty: 'hard',
      expectedDuration: 10,
      tips: [
        'Start with high-level metrics (request rate, latency percentiles)',
        'Use distributed tracing to identify slow spans',
        'Check for resource contention (CPU, memory, network, disk)',
        'Consider external dependencies and caching behavior'
      ],
      followUps: [
        'How do you handle issues that appear intermittently?',
        'What tools do you rely on most?'
      ]
    },
  ],

  // Full-Stack Developer
  'full-stack-dev': [
    {
      id: 'fs-1',
      question: 'Design and implement a real-time collaborative document editing feature (like Google Docs). What technologies and architecture would you use?',
      category: 'System Design',
      difficulty: 'hard',
      expectedDuration: 12,
      tips: [
        'Discuss conflict resolution (OT vs CRDT)',
        'Mention WebSocket for real-time updates',
        'Address scalability and persistence',
        'Talk about cursor synchronization and presence'
      ],
      followUps: [
        'How do you handle offline editing?',
        'What about concurrent edits to the same line?'
      ]
    },
    {
      id: 'fs-2',
      question: 'Explain your approach to state management in a complex React application. When would you use different solutions?',
      category: 'Frontend',
      difficulty: 'medium',
      expectedDuration: 6,
      tips: [
        'Compare local state, Context, Redux, Zustand, Jotai',
        'Discuss server state management (React Query, SWR)',
        'Address performance implications',
        'Talk about state colocation'
      ],
      followUps: [
        'How do you handle form state?',
        'What about authentication state?'
      ]
    },
    {
      id: 'fs-3',
      question: 'How would you optimize the performance of a slow-loading web application? Walk me through your debugging process.',
      category: 'Performance',
      difficulty: 'medium',
      expectedDuration: 8,
      tips: [
        'Use Lighthouse and Chrome DevTools',
        'Address Core Web Vitals (LCP, FID, CLS)',
        'Discuss code splitting and lazy loading',
        'Mention caching strategies and CDN'
      ],
      followUps: [
        'How do you balance bundle size with features?',
        'What about mobile performance?'
      ]
    },
    {
      id: 'fs-4',
      question: 'Design a RESTful API for an e-commerce platform. Cover authentication, resource modeling, and error handling.',
      category: 'Backend',
      difficulty: 'medium',
      expectedDuration: 10,
      tips: [
        'Follow REST conventions (resource naming, HTTP methods)',
        'Discuss authentication (JWT, OAuth)',
        'Address pagination, filtering, and rate limiting',
        'Mention API versioning strategies'
      ],
      followUps: [
        'When would you use GraphQL instead?',
        'How do you handle inventory updates during high traffic?'
      ]
    },
    {
      id: 'fs-5',
      question: 'Explain the difference between authentication and authorization. How would you implement a role-based access control system?',
      category: 'Security',
      difficulty: 'medium',
      expectedDuration: 6,
      tips: [
        'Define AuthN vs AuthZ clearly',
        'Discuss JWT structure and claims',
        'Address RBAC vs ABAC',
        'Mention principle of least privilege'
      ],
      followUps: [
        'How do you handle token refresh?',
        'What about service-to-service authentication?'
      ]
    },
  ],

  // Data Scientist
  'lead-data-scientist': [
    {
      id: 'ds-1',
      question: 'Explain how you would approach a problem where traditional ML models underperform compared to human judgment. What techniques would you try?',
      category: 'Methodology',
      difficulty: 'hard',
      expectedDuration: 10,
      tips: [
        'Investigate feature engineering gaps',
        'Consider ensemble methods and stacking',
        'Discuss data augmentation and collection',
        'Mention human-in-the-loop approaches'
      ],
      followUps: [
        'How do you validate that your model is actually useful?',
        'When would you recommend not using ML?'
      ]
    },
    {
      id: 'ds-2',
      question: 'Describe your approach to dealing with imbalanced datasets in classification problems.',
      category: 'Algorithms',
      difficulty: 'medium',
      expectedDuration: 8,
      tips: [
        'Discuss sampling techniques (SMOTE, undersampling)',
        'Mention cost-sensitive learning',
        'Address evaluation metrics (F1, PR-AUC, ROC-AUC)',
        'Talk about business context for threshold selection'
      ],
      followUps: [
        'When is class imbalance not a problem?',
        'How do you handle multi-class imbalance?'
      ]
    },
    {
      id: 'ds-3',
      question: 'How would you design and execute an A/B test to measure the impact of a new recommendation algorithm?',
      category: 'Experimentation',
      difficulty: 'hard',
      expectedDuration: 10,
      tips: [
        'Define clear hypothesis and metrics',
        'Discuss sample size calculation and power analysis',
        'Address novelty effects and user behavior',
        'Talk about statistical significance vs practical significance'
      ],
      followUps: [
        'How do you handle multiple testing problems?',
        'What about network effects in A/B tests?'
      ]
    },
    {
      id: 'ds-4',
      question: 'Explain the bias-variance tradeoff and how you address it in practice when building models.',
      category: 'ML Fundamentals',
      difficulty: 'medium',
      expectedDuration: 6,
      tips: [
        'Define bias and variance with examples',
        'Discuss regularization techniques',
        'Mention cross-validation strategies',
        'Talk about ensemble methods to reduce variance'
      ],
      followUps: [
        'How do you diagnose whether you have high bias or variance?',
        'What about deep learning models?'
      ]
    },
    {
      id: 'ds-5',
      question: 'How would you explain a complex ML model\'s predictions to business stakeholders who don\'t have technical backgrounds?',
      category: 'Communication',
      difficulty: 'medium',
      expectedDuration: 6,
      tips: [
        'Use interpretability tools (SHAP, LIME)',
        'Create visualizations and dashboards',
        'Develop business-relevant narratives',
        'Address model limitations honestly'
      ],
      followUps: [
        'How do you handle requests for impossible explanations?',
        'What about regulatory requirements for explainability?'
      ]
    },
  ],

  // Cloud Security Engineer
  'cloud-security-engineer': [
    {
      id: 'cse-1',
      question: 'How would you design a least-privilege IAM strategy for a large AWS organization with multiple accounts and teams?',
      category: 'Identity & Access',
      difficulty: 'hard',
      expectedDuration: 10,
      tips: [
        'Discuss AWS Organizations and SCPs',
        'Mention permission boundaries and policy conditions',
        'Address identity federation and SSO',
        'Talk about just-in-time access patterns'
      ],
      followUps: [
        'How do you audit and review permissions?',
        'What about service accounts?'
      ]
    },
    {
      id: 'cse-2',
      question: 'Describe how you would implement automated security scanning and guardrails in a CI/CD pipeline.',
      category: 'DevSecOps',
      difficulty: 'medium',
      expectedDuration: 8,
      tips: [
        'Discuss SAST, DAST, and SCA tools',
        'Mention container image scanning',
        'Address IaC security scanning',
        'Talk about blocking vs alerting approaches'
      ],
      followUps: [
        'How do you handle false positives?',
        'What about scanning speed vs coverage?'
      ]
    },
    {
      id: 'cse-3',
      question: 'A developer reports their API keys were accidentally committed to a public GitHub repository. What\'s your incident response?',
      category: 'Incident Response',
      difficulty: 'medium',
      expectedDuration: 8,
      tips: [
        'Immediate: rotate the compromised credentials',
        'Investigate: audit logs for unauthorized access',
        'Remediate: implement secrets scanning',
        'Prevent: educate and add pre-commit hooks'
      ],
      followUps: [
        'How do you prevent this from happening again?',
        'What if the keys were used maliciously?'
      ]
    },
    {
      id: 'cse-4',
      question: 'Explain how you would secure a Kubernetes cluster running sensitive workloads in production.',
      category: 'Container Security',
      difficulty: 'hard',
      expectedDuration: 10,
      tips: [
        'Discuss network policies and service mesh',
        'Mention pod security standards',
        'Address secrets management (external secrets operator)',
        'Talk about runtime security and policy enforcement'
      ],
      followUps: [
        'How do you handle node security?',
        'What about multi-tenancy?'
      ]
    },
    {
      id: 'cse-5',
      question: 'How do you approach threat modeling for a new cloud-native application?',
      category: 'Threat Modeling',
      difficulty: 'hard',
      expectedDuration: 8,
      tips: [
        'Use frameworks like STRIDE or PASTA',
        'Identify trust boundaries and data flows',
        'Prioritize threats by risk and likelihood',
        'Develop mitigation strategies and testing plans'
      ],
      followUps: [
        'How often should threat models be updated?',
        'How do you involve developers in the process?'
      ]
    },
  ],

  // Penetration Tester
  'pen-tester': [
    {
      id: 'pt-1',
      question: 'Walk me through your methodology for performing a web application penetration test from start to finish.',
      category: 'Methodology',
      difficulty: 'medium',
      expectedDuration: 10,
      tips: [
        'Cover phases: reconnaissance, scanning, exploitation, post-exploitation, reporting',
        'Mention OWASP Top 10 vulnerabilities',
        'Discuss tools (Burp Suite, OWASP ZAP)',
        'Address scoping and rules of engagement'
      ],
      followUps: [
        'How do you prioritize vulnerabilities for testing?',
        'What do you do if you find a critical issue mid-test?'
      ]
    },
    {
      id: 'pt-2',
      question: 'Explain how you would test for and exploit an SQL injection vulnerability.',
      category: 'Technical',
      difficulty: 'medium',
      expectedDuration: 8,
      tips: [
        'Discuss detection methods (error-based, blind, time-based)',
        'Mention tools like sqlmap',
        'Address common bypass techniques',
        'Talk about prevention recommendations'
      ],
      followUps: [
        'How do you handle parameterized queries that still fail?',
        'What about NoSQL injection?'
      ]
    },
    {
      id: 'pt-3',
      question: 'You\'ve gained initial access to a Windows domain. Describe your approach to privilege escalation and lateral movement.',
      category: 'Red Team',
      difficulty: 'hard',
      expectedDuration: 10,
      tips: [
        'Discuss common privilege escalation vectors',
        'Mention tools (Mimikatz, BloodHound)',
        'Address detection evasion techniques',
        'Talk about documenting the attack path'
      ],
      followUps: [
        'How do you avoid triggering security tools?',
        'What if there\'s EDR on the machines?'
      ]
    },
    {
      id: 'pt-4',
      question: 'How do you write a penetration test report that both technical teams and executives can understand?',
      category: 'Reporting',
      difficulty: 'medium',
      expectedDuration: 6,
      tips: [
        'Include executive summary with business impact',
        'Provide technical details with reproduction steps',
        'Use CVSS scoring and risk ratings',
        'Offer clear remediation recommendations'
      ],
      followUps: [
        'How do you handle disagreements about severity?',
        'What about re-testing after fixes?'
      ]
    },
    {
      id: 'pt-5',
      question: 'Describe a challenging penetration test where standard techniques didn\'t work. How did you approach it?',
      category: 'Problem Solving',
      difficulty: 'hard',
      expectedDuration: 8,
      tips: [
        'Show creativity and persistence',
        'Discuss research and learning new techniques',
        'Mention collaboration with team members',
        'Address knowing when to pivot approaches'
      ],
      followUps: [
        'What did you learn from that experience?',
        'How do you stay current with new attack techniques?'
      ]
    },
  ],

  // QA Engineer
  'qa-engineer': [
    {
      id: 'qa-1',
      question: 'Design a test automation strategy for a mobile application with frequent releases. What frameworks and tools would you choose?',
      category: 'Test Strategy',
      difficulty: 'medium',
      expectedDuration: 8,
      tips: [
        'Discuss testing pyramid (unit, integration, e2e)',
        'Mention mobile-specific tools (Appium, Detox, XCUITest)',
        'Address device/OS fragmentation',
        'Talk about CI integration'
      ],
      followUps: [
        'How do you handle flaky tests?',
        'What about testing on physical devices vs emulators?'
      ]
    },
    {
      id: 'qa-2',
      question: 'Explain the difference between regression testing and smoke testing. When would you use each?',
      category: 'Test Types',
      difficulty: 'easy',
      expectedDuration: 5,
      tips: [
        'Define each testing type clearly',
        'Discuss scope and depth differences',
        'Address timing in the release cycle',
        'Mention automation opportunities'
      ],
      followUps: [
        'How do you select tests for smoke testing?',
        'What about sanity testing?'
      ]
    },
    {
      id: 'qa-3',
      question: 'How would you test a payment processing feature that integrates with third-party payment providers?',
      category: 'Integration Testing',
      difficulty: 'hard',
      expectedDuration: 8,
      tips: [
        'Discuss test environments and sandboxes',
        'Mention mocking and stubbing strategies',
        'Address edge cases (timeouts, failures, retries)',
        'Talk about security and compliance testing'
      ],
      followUps: [
        'How do you test production payment flows?',
        'What about testing different currencies?'
      ]
    },
    {
      id: 'qa-4',
      question: 'Describe your approach to writing effective bug reports that help developers fix issues quickly.',
      category: 'Communication',
      difficulty: 'easy',
      expectedDuration: 5,
      tips: [
        'Include clear steps to reproduce',
        'Provide expected vs actual results',
        'Attach relevant screenshots/logs',
        'Specify environment and version'
      ],
      followUps: [
        'How do you prioritize bugs?',
        'What if you can\'t reproduce a bug?'
      ]
    },
    {
      id: 'qa-5',
      question: 'How do you ensure test coverage is adequate without over-testing? What metrics do you use?',
      category: 'Test Coverage',
      difficulty: 'medium',
      expectedDuration: 6,
      tips: [
        'Discuss code coverage limitations',
        'Mention risk-based testing approaches',
        'Address requirement traceability',
        'Talk about mutation testing'
      ],
      followUps: [
        'Is 100% code coverage a good goal?',
        'How do you handle legacy code with no tests?'
      ]
    },
  ],

  // Database Administrator
  'dba': [
    {
      id: 'dba-1',
      question: 'A critical production database is experiencing slow query performance. Walk me through your investigation process.',
      category: 'Performance Tuning',
      difficulty: 'hard',
      expectedDuration: 10,
      tips: [
        'Start with query execution plans',
        'Check for missing or unused indexes',
        'Investigate locking and blocking',
        'Review resource utilization (CPU, memory, I/O)'
      ],
      followUps: [
        'How do you prioritize which queries to optimize?',
        'What about application-level changes?'
      ]
    },
    {
      id: 'dba-2',
      question: 'Explain the ACID properties and how they are implemented in a relational database.',
      category: 'Fundamentals',
      difficulty: 'medium',
      expectedDuration: 6,
      tips: [
        'Define each property (Atomicity, Consistency, Isolation, Durability)',
        'Discuss transaction logs and checkpoints',
        'Mention isolation levels and their trade-offs',
        'Talk about distributed transactions'
      ],
      followUps: [
        'When would you sacrifice ACID for performance?',
        'How do NoSQL databases handle this differently?'
      ]
    },
    {
      id: 'dba-3',
      question: 'Design a backup and disaster recovery strategy for a database that processes financial transactions.',
      category: 'High Availability',
      difficulty: 'hard',
      expectedDuration: 10,
      tips: [
        'Discuss RPO and RTO requirements',
        'Mention backup types (full, differential, transaction log)',
        'Address geographic redundancy',
        'Talk about testing recovery procedures'
      ],
      followUps: [
        'How do you test backups without impacting production?',
        'What about point-in-time recovery?'
      ]
    },
    {
      id: 'dba-4',
      question: 'How would you handle a database migration from on-premises to a cloud-managed service with minimal downtime?',
      category: 'Migration',
      difficulty: 'hard',
      expectedDuration: 8,
      tips: [
        'Discuss replication-based migration',
        'Address schema and compatibility checks',
        'Mention cutover planning and rollback strategies',
        'Talk about application connection changes'
      ],
      followUps: [
        'What about data validation after migration?',
        'How do you handle legacy features not supported in cloud?'
      ]
    },
    {
      id: 'dba-5',
      question: 'Explain database normalization. When might denormalization be appropriate?',
      category: 'Design',
      difficulty: 'medium',
      expectedDuration: 6,
      tips: [
        'Explain normal forms (1NF through 3NF)',
        'Discuss trade-offs with denormalization',
        'Mention read-heavy vs write-heavy workloads',
        'Talk about reporting and analytics use cases'
      ],
      followUps: [
        'How do you maintain consistency in denormalized data?',
        'What about OLAP vs OLTP databases?'
      ]
    },
  ],

  // Help Desk Technician
  'help-desk': [
    {
      id: 'hd-1',
      question: 'A user calls in frustrated because their computer is "slow." How do you troubleshoot and resolve this issue?',
      category: 'Troubleshooting',
      difficulty: 'easy',
      expectedDuration: 6,
      tips: [
        'Ask clarifying questions to understand "slow"',
        'Check resource usage (Task Manager/Activity Monitor)',
        'Look for recent changes or updates',
        'Consider common causes (disk space, startup programs, malware)'
      ],
      followUps: [
        'What if the user is impatient?',
        'How do you document the resolution?'
      ]
    },
    {
      id: 'hd-2',
      question: 'Explain your approach to handling a user who is angry about a recurring IT issue that hasn\'t been fixed.',
      category: 'Customer Service',
      difficulty: 'medium',
      expectedDuration: 6,
      tips: [
        'Listen actively and empathize',
        'Don\'t make excuses or blame others',
        'Take ownership and provide concrete next steps',
        'Follow up proactively'
      ],
      followUps: [
        'What if you can\'t actually fix the issue?',
        'How do you escalate appropriately?'
      ]
    },
    {
      id: 'hd-3',
      question: 'A user has forgotten their password and needs access urgently for a meeting. How do you verify their identity and help them?',
      category: 'Security',
      difficulty: 'easy',
      expectedDuration: 5,
      tips: [
        'Follow established identity verification procedures',
        'Never share or view actual passwords',
        'Document the request and resolution',
        'Suggest preventive measures'
      ],
      followUps: [
        'What if the user can\'t answer security questions?',
        'How do you balance security with urgency?'
      ]
    },
    {
      id: 'hd-4',
      question: 'Describe how you prioritize multiple support tickets when all users think their issue is urgent.',
      category: 'Prioritization',
      difficulty: 'medium',
      expectedDuration: 5,
      tips: [
        'Use ticket severity and impact criteria',
        'Consider VIP users or critical systems',
        'Communicate expected wait times',
        'Escalate when appropriate'
      ],
      followUps: [
        'How do you handle users who try to game the system?',
        'What metrics should help desk track?'
      ]
    },
    {
      id: 'hd-5',
      question: 'How would you explain a technical concept (like why rebooting fixes problems) to a non-technical user?',
      category: 'Communication',
      difficulty: 'easy',
      expectedDuration: 5,
      tips: [
        'Use simple analogies',
        'Avoid jargon',
        'Be patient and check for understanding',
        'Provide documentation for future reference'
      ],
      followUps: [
        'How do you handle users who want deep technical explanations?',
        'What about users who don\'t want any explanation?'
      ]
    },
  ],
}

// Default questions for roles not yet defined
export const DEFAULT_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'default-1',
    question: 'Tell me about a challenging project you worked on. What was your role and how did you contribute to its success?',
    category: 'Behavioral',
    difficulty: 'medium',
    expectedDuration: 6,
    tips: [
      'Use STAR method (Situation, Task, Action, Result)',
      'Be specific about your contributions',
      'Quantify results where possible',
      'Show what you learned'
    ],
    followUps: [
      'What would you do differently?',
      'How did you handle disagreements?'
    ]
  },
  {
    id: 'default-2',
    question: 'How do you stay current with technology trends and continue learning in your field?',
    category: 'Professional Development',
    difficulty: 'easy',
    expectedDuration: 5,
    tips: [
      'Mention specific resources (blogs, conferences, courses)',
      'Discuss hands-on practice projects',
      'Talk about community involvement',
      'Show genuine curiosity'
    ],
    followUps: [
      'What technology are you currently learning?',
      'How do you decide what to learn next?'
    ]
  },
  {
    id: 'default-3',
    question: 'Describe a time when you had to work with a difficult team member. How did you handle the situation?',
    category: 'Behavioral',
    difficulty: 'medium',
    expectedDuration: 6,
    tips: [
      'Focus on the behavior, not the person',
      'Describe your approach to resolution',
      'Show empathy and professionalism',
      'Highlight the positive outcome'
    ],
    followUps: [
      'What did you learn about yourself?',
      'Would you handle it differently now?'
    ]
  },
  {
    id: 'default-4',
    question: 'What interests you about this role and our company?',
    category: 'Motivation',
    difficulty: 'easy',
    expectedDuration: 4,
    tips: [
      'Research the company beforehand',
      'Connect your skills to the role',
      'Show genuine enthusiasm',
      'Avoid generic answers'
    ],
    followUps: [
      'Where do you see yourself in 3-5 years?',
      'What other companies are you considering?'
    ]
  },
  {
    id: 'default-5',
    question: 'Describe your problem-solving process when faced with an unfamiliar technical challenge.',
    category: 'Problem Solving',
    difficulty: 'medium',
    expectedDuration: 6,
    tips: [
      'Break down the problem into smaller parts',
      'Discuss research and resource utilization',
      'Mention collaboration and asking for help',
      'Show iterative approach'
    ],
    followUps: [
      'Can you give a specific example?',
      'How do you know when to ask for help?'
    ]
  },
]

// Function to get questions for a specific role
export function getQuestionsForRole(roleId: string, difficulty: number): InterviewQuestion[] {
  const roleQuestions = JOB_ROLE_QUESTIONS[roleId] || []
  const allQuestions = [...roleQuestions, ...DEFAULT_QUESTIONS]
  
  // Filter by difficulty based on the slider value
  const filteredQuestions = allQuestions.filter(q => {
    if (difficulty <= 25) return q.difficulty === 'easy'
    if (difficulty <= 50) return q.difficulty === 'easy' || q.difficulty === 'medium'
    if (difficulty <= 75) return q.difficulty !== 'expert'
    return true // All difficulties for expert
  })
  
  // Shuffle questions
  return filteredQuestions.sort(() => Math.random() - 0.5)
}

// Calculate number of questions based on difficulty
export function calculateQuestionCount(difficulty: number): { min: number; max: number; recommended: number } {
  if (difficulty <= 25) {
    return { min: 5, max: 8, recommended: 6 } // ~15-20 min interview
  } else if (difficulty <= 50) {
    return { min: 6, max: 10, recommended: 8 } // ~25-35 min interview
  } else if (difficulty <= 75) {
    return { min: 8, max: 12, recommended: 10 } // ~35-45 min interview
  } else {
    return { min: 10, max: 15, recommended: 12 } // ~45-60 min interview
  }
}
