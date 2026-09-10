export interface ResumeProjectData {
  name: string;
  slug: string;
  subtitle: string;
  technologies: string[];
  description: string;
  architectureOverview: string;
  dataFlowMermaid: string;
  keyHighlights: string[];
  deepDiveQuestions: {
    question: string;
    focusArea: string;
    modelAnswerGuide: string;
    interviewerFollowUp: string;
  }[];
}

export const SEED_RESUME_PROJECTS: ResumeProjectData[] = [
  {
    name: "WealthServ 2.0 — AIF/PMS Investor Onboarding Platform",
    slug: "wealthserv-2",
    subtitle: "Enterprise Multi-Tenant Alternative Investment & Portfolio Management Onboarding Platform",
    technologies: ["NestJS", "Next.js", "PostgreSQL", "Prisma", "Redis", "BullMQ", "NATS", "JWT", "Argon2id", "Leegality", "TypeScript"],
    description: "End-to-end digital onboarding engine handling 6-stage investor lifecycles (KYC, Bank validation, Nominee, Scheme details, Review, Contract generation, e-Sign, RTA submission). Built with multi-tenant isolation via CLS, rotating refresh token security, and state machine workflows.",
    architectureOverview: "Modular NestJS backend orchestrating asynchronous document generation and third-party verification microservices via BullMQ and NATS. Multi-tenancy is enforced through AsyncLocalStorage context binding and Prisma query extensions. State machine pattern guards lifecycle transitions preventing illegal skips.",
    dataFlowMermaid: `sequenceDiagram
    autonumber
    participant Investor as Investor / Advisor
    participant Web as Next.js Web App
    participant API as NestJS Gateway
    participant State as Onboarding State Machine
    participant Queue as BullMQ (Redis)
    participant Worker as DocGen & eSign Worker
    participant Leegality as Leegality eSign Gateway
    participant RTA as CAMS / KFintech RTA

    Investor->>Web: Submit Scheme & Nominee Details
    Web->>API: POST /api/v1/onboarding/stage/submit
    API->>State: transition(caseId, DRAFT -> IN_REVIEW)
    State-->>API: Validated Transition
    API->>Queue: Enqueue "GENERATE_CONTRACT" job
    Queue->>Worker: Process PDF Field Mapping & Stamping
    Worker->>Leegality: Initialize eSign Request with HMAC Webhook
    Leegality-->>Worker: Return Doc Invitee URL
    Worker->>API: Update Case Status -> READY_FOR_ESIGN
    Investor->>Leegality: Complete Aadhaar OTP eSign
    Leegality->>API: Webhook (HMAC-SHA256 verified)
    API->>State: transition(caseId, ESIGNED -> RTA_SUBMITTED)
    API->>RTA: Dispatch Signed Package to Fund Registrar`,
    keyHighlights: [
      "6-stage onboarding lifecycle with deterministic state machine transitions",
      "Multi-tenant data isolation via Node.js AsyncLocalStorage (CLS) and Prisma extensions",
      "High-security authentication: Argon2id password hashing, rotating refresh tokens, reuse detection, and revocable sessions",
      "Adapter pattern for third-party integrations (Leegality, CKYC, DigiLocker)",
      "Circuit breaker protection for third-party verification dependencies",
      "Asynchronous contract generation and field mapping pipeline"
    ],
    deepDiveQuestions: [
      {
        question: "Explain the architecture of your 6-stage onboarding lifecycle. Why did you use a State Machine?",
        focusArea: "State Machine & Lifecycle",
        modelAnswerGuide: "Explain that an investor onboarding process consists of distinct legal phases (KYC, Bank, Nominee, Scheme, Review, eSign). Without a state machine, validation code becomes scattered across controllers, allowing race conditions and invalid transitions (e.g. signing a contract before KYC approval). The state machine defines valid transition matrices, entry/exit guards, and audit logs.",
        interviewerFollowUp: "What happens if a user submits step 4 while an asynchronous webhook for step 2 (KYC) fails in the background?"
      },
      {
        question: "How did you implement multi-tenant isolation, and why did you choose AsyncLocalStorage (CLS)?",
        focusArea: "Multi-Tenancy & CLS",
        modelAnswerGuide: "In WealthServ 2.0, multiple wealth management firms share the application. To avoid parameter drilling tenantId across every function, AsyncLocalStorage binds the resolved tenant context to the execution tree. A Prisma client extension automatically injects where: { tenantId } on all database queries.",
        interviewerFollowUp: "How do you ensure tenant isolation remains intact in asynchronous BullMQ workers where no HTTP request context exists?"
      },
      {
        question: "Walk me through your token rotation and reuse detection implementation.",
        focusArea: "Security & Authentication",
        modelAnswerGuide: "Access tokens are short-lived (15 minutes). Refresh tokens are single-use with a 7-day TTL and grouped into a 'family'. When a refresh token is presented, it is rotated. If an already-used token is received, reuse is detected, and all tokens in that family are immediately revoked.",
        interviewerFollowUp: "How do you handle parallel concurrent refresh requests triggered by multiple frontend tabs?"
      }
    ]
  },
  {
    name: "MF Investor Onboarding Platform — Barjeel",
    slug: "barjeel-mf-onboarding",
    subtitle: "Digital Mutual Fund KYC & Compliance Verification Gateway",
    technologies: ["Next.js", "NestJS", "PostgreSQL", "Prisma", "AWS S3", "DigiLocker", "CKYC", "KwikID"],
    description: "Automated mutual fund onboarding platform featuring government registry integrations (DigiLocker, CKYC, KwikID video KYC) and secure S3 document vaulting with time-limited pre-signed URLs.",
    architectureOverview: "Integrates directly with government and identity repositories. Incoming identity documents are validated via external adapters, encrypted, and vaulted in private AWS S3 buckets accessed strictly via temporary pre-signed URLs. Compliance back-office approval matrix enforces segregation of duties.",
    dataFlowMermaid: `graph LR
    User([Investor]) --> NextApp[Next.js App]
    NextApp --> NestAPI[NestJS API Gateway]
    NestAPI --> DigiLocker[DigiLocker API]
    NestAPI --> CKYC[Central KYC Registry]
    NestAPI --> S3[(AWS S3 Document Vault)]
    NestAPI --> BackOffice[Compliance Reviewer Portal]`,
    keyHighlights: [
      "DigiLocker & CKYC automated document retrieval and PAN-Aadhaar verification",
      "Direct-to-S3 secure uploads using time-limited pre-signed URLs with KMS encryption",
      "Role-Based Access Control (RBAC) with maker-checker compliance approval workflows",
      "Zero plain-document exposure to client browser"
    ],
    deepDiveQuestions: [
      {
        question: "How did you design secure document storage with AWS S3 pre-signed URLs?",
        focusArea: "Cloud Security & Storage",
        modelAnswerGuide: "Documents never route through the application server memory. The backend generates a short-lived (15-minute) PUT pre-signed URL with cryptographic signature. The client uploads directly to S3. For viewing, a GET pre-signed URL is issued only after verifying the user's RBAC permissions.",
        interviewerFollowUp: "How do you prevent malicious users from uploading arbitrary malicious executable files using the pre-signed URL?"
      }
    ]
  },
  {
    name: "Foreign Custody Account Creation",
    slug: "foreign-custody-account",
    subtitle: "Cross-Border NRI Investor Onboarding & Compliance Engine",
    technologies: ["Next.js", "NestJS", "PostgreSQL", "Prisma", "NSDL eSign", "ICICI Bank API"],
    description: "Cross-border custodial account automation for Non-Resident Indians (NRIs) featuring dynamic compliance forms, automated PAN/AML/LEI validation, and NSDL Aadhaar digital signatures.",
    architectureOverview: "Dynamic JSON-schema-driven form engine adapting to NRI tax jurisdictions (FATCA/CRS). Integrates with ICICI banking APIs for account funding and NSDL digital signature gateways.",
    dataFlowMermaid: `graph TD
    NRI[NRI Investor] --> DynamicForm[Dynamic Form Engine]
    DynamicForm --> AMLValidation[AML & LEI Verification]
    AMLValidation --> BankIntegration[ICICI Custody API]
    BankIntegration --> NSDL[NSDL Aadhaar eSign]`,
    keyHighlights: [
      "Dynamic form engine generating country-specific compliance fields",
      "Automated AML and LEI validation against global watchlists",
      "Aadhaar-based remote digital contract signing for international investors",
      "End-to-end auditability and compliance reporting"
    ],
    deepDiveQuestions: [
      {
        question: "How did your dynamic form engine validate jurisdiction-specific fields (e.g. FATCA vs CRS)?",
        focusArea: "Architecture & Data Modeling",
        modelAnswerGuide: "Explain schema-driven JSON form models validated on both client (React Hook Form / Zod) and server (NestJS Class-Validator). Jurisdictional rules dynamically activated based on country of tax residence.",
        interviewerFollowUp: "How did you handle database schema migrations when new regulatory questions were added?"
      }
    ]
  },
  {
    name: "Reusable eSign Platform",
    slug: "reusable-esign-platform",
    subtitle: "High-Throughput Digital Signature Microservice",
    technologies: ["J2EE", "Spring Boot", "Hibernate", "JPA", "MSSQL", "OAuth2", "AWS", "NSDL eSign"],
    description: "Enterprise eSign microservice providing reusable digital signature orchestration, dynamic PDF template watermarking, and Aadhaar OTP verification across internal applications.",
    architectureOverview: "Spring Boot microservice utilizing JPA/Hibernate and MSSQL with high-throughput callback processing and OAuth2 security. Standardized REST APIs allow any internal enterprise system to trigger digital contract execution.",
    dataFlowMermaid: `graph LR
    Service[Enterprise App] -->|OAuth2 REST| eSignCore[Spring Boot eSign Service]
    eSignCore --> DocStamper[Dynamic PDF Stamper]
    eSignCore --> NSDLGateway[NSDL eSign Gateway]
    NSDLGateway --> Callback[Webhook / Callback Processor]`,
    keyHighlights: [
      "Reusable microservice architecture consumed by multiple enterprise divisions",
      "Dynamic PDF watermarking, stamp duty calculation, and field placement",
      "NSDL Aadhaar OTP verification callback processing",
      "Spring Security OAuth2 resource server protection"
    ],
    deepDiveQuestions: [
      {
        question: "How did you ensure reliable processing of asynchronous eSign callbacks under heavy load?",
        focusArea: "Reliability & Idempotency",
        modelAnswerGuide: "Callback endpoints must be strictly idempotent. When NSDL posts an eSign completion webhook, the payload signature is verified, an idempotency lock is acquired in Redis/database, and duplicate notifications are acknowledged with 200 OK without re-executing business logic.",
        interviewerFollowUp: "How do you handle out-of-order callback deliveries where the 'completed' webhook arrives before the 'in-progress' webhook?"
      }
    ]
  },
  {
    name: "Workflow Management System & Ticketing",
    slug: "workflow-management-system",
    subtitle: "Configurable Multi-Step Task Resolution Engine",
    technologies: ["Spring Boot", "JPA", "PostgreSQL", "Redis", "WebSocket"],
    description: "Enterprise workflow engine supporting multi-step resolution workflows, dynamic task assignment, SLA tracking, and real-time status broadcasting.",
    architectureOverview: "Event-driven workflow engine with dynamic routing rules, escalation timers, and WebSocket push notifications for operational desks.",
    dataFlowMermaid: `graph TD
    Ticket[Task / Ticket] --> Router[Dynamic Routing Engine]
    Router --> Assignment[Multi-User Assignment Matrix]
    Assignment --> SLAEngine[Redis SLA Timer]
    SLAEngine --> WebSocket[Real-Time Status Broadcast]`,
    keyHighlights: [
      "Dynamic routing rules based on skill, team, and current backlog",
      "Redis-backed SLA countdown timers and automated escalation triggers",
      "WebSocket real-time state synchronization",
      "Complete historical audit trail of all status transitions"
    ],
    deepDiveQuestions: [
      {
        question: "How did you design the SLA escalation timer for thousands of concurrent open tickets?",
        focusArea: "Distributed Systems & Timers",
        modelAnswerGuide: "Instead of polling the database every second, we utilized Redis Sorted Sets (ZSET) where the score is the UNIX epoch timestamp of the deadline. A lightweight worker polls ZREVRANGEBYSCORE to instantly fetch tickets that breached their SLA in O(log N) time.",
        interviewerFollowUp: "What happens if the SLA worker crashes right after fetching the expired tickets?"
      }
    ]
  },
  {
    name: "UPEX / IESCMS — Enterprise Microservices Platform",
    slug: "upex-iescms",
    subtitle: "High-Scalability Approval Workflow & Integration Engine",
    technologies: ["J2EE", "Spring Boot", "Microservices", "Hibernate", "MySQL", "Docker", "Spring Security", "OAuth2", "GitLab CI/CD"],
    description: "Enterprise-grade microservices platform providing automated multi-tiered approval workflows, high-throughput message processing, and containerized CI/CD deployments.",
    architectureOverview: "Decomposed legacy monolithic services into Spring Boot microservices deployed on Docker containers with automated GitLab CI/CD pipelines, secured via Spring Security and OAuth2.",
    dataFlowMermaid: `graph LR
    Client[Enterprise Client] --> Gateway[API Gateway / OAuth2]
    Gateway --> ApprovalService[Approval Workflow Service]
    Gateway --> IntegrationService[Integration Service]
    ApprovalService --> MySQL[(MySQL Cluster)]
    IntegrationService --> MessageBroker[Message Queue]`,
    keyHighlights: [
      "Decomposition of enterprise monolithic workflows into scalable microservices",
      "Multi-tiered approval matrix with conditional routing and audit logs",
      "Containerized deployment using multi-stage Docker builds and GitLab CI/CD",
      "Comprehensive OpenAPI / Swagger contract documentation"
    ],
    deepDiveQuestions: [
      {
        question: "How did you decompose the legacy enterprise application into microservices without breaking data consistency?",
        focusArea: "Microservices & Migration",
        modelAnswerGuide: "Used the Strangler Fig pattern. Identified service boundaries around business domains (Approvals, Integrations). Shared database tables were initially read via database views before being cleanly separated into domain-owned schemas.",
        interviewerFollowUp: "How did you handle distributed transactions between the Approval service and downstream ledger services?"
      }
    ]
  }
];
