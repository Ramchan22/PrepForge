const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log('[PrepForge Seed] Starting database seeding...');

  // 1. Create Default Users
  const passwordHash = await bcrypt.hash('SeniorEngineer2026!', 10);
  const adminHash = await bcrypt.hash('AdminMaster2026!', 10);

  const ramkumar = await prisma.user.upsert({
    where: { email: 'ram795055@gmail.com' },
    update: {
      streak: 0,
      interviewReadinessScore: 0.0,
    },
    create: {
      email: 'ram795055@gmail.com',
      name: 'Ramkumar',
      passwordHash,
      role: 'USER',
      streak: 0,
      interviewReadinessScore: 0.0,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@prepforge.dev' },
    update: {},
    create: {
      email: 'admin@prepforge.dev',
      name: 'PrepForge Admin',
      passwordHash: adminHash,
      role: 'ADMIN',
      streak: 1,
      interviewReadinessScore: 95.0,
    },
  });

  console.log(`[PrepForge Seed] Created users: ${ramkumar.email} and ${admin.email}`);

  // 2. Default SMTP Config
  await prisma.smtpConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      host: 'smtp.gmail.com',
      port: 587,
      username: 'notifications@prepforge.dev',
      passwordEncrypted: 'demo_password',
      secure: false,
      senderEmail: 'coach@prepforge.dev',
      senderName: 'PrepForge Interview Coach',
    },
  });

  // 3. Load 23 Sessions & Topics from JSON
  const curriculumPath = path.join(__dirname, '..', 'src', 'data', 'curriculum', 'curriculumData.json');
  const curriculumData = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));
  const sessions = curriculumData.sessions;

  console.log(`[PrepForge Seed] Seeding ${sessions.length} Sessions...`);

  const topicMap = {};

  for (const s of sessions) {
    const session = await prisma.session.upsert({
      where: { slug: s.slug },
      update: {
        title: s.title,
        order: s.order,
        description: s.description,
        icon: s.icon,
        estimatedHours: s.estimatedHours,
        isLockedByDefault: s.isLockedByDefault,
      },
      create: {
        title: s.title,
        order: s.order,
        slug: s.slug,
        description: s.description,
        icon: s.icon,
        estimatedHours: s.estimatedHours,
        isLockedByDefault: s.isLockedByDefault,
      },
    });

    // Create session progress for Ramkumar: Session 1 is AVAILABLE, others LOCKED
    await prisma.userSessionProgress.upsert({
      where: {
        userId_sessionId: {
          userId: ramkumar.id,
          sessionId: session.id,
        },
      },
      update: {
        completionPercent: 0.0,
      },
      create: {
        userId: ramkumar.id,
        sessionId: session.id,
        status: s.order === 1 ? 'AVAILABLE' : 'LOCKED',
        completionPercent: 0.0,
      },
    });

    for (const t of s.topics) {
      const topic = await prisma.topic.upsert({
        where: {
          sessionId_slug: {
            sessionId: session.id,
            slug: t.slug,
          },
        },
        update: {
          title: t.title,
          order: t.order,
          description: t.description,
          difficulty: t.difficulty,
        },
        create: {
          sessionId: session.id,
          title: t.title,
          slug: t.slug,
          order: t.order,
          description: t.description,
          difficulty: t.difficulty,
        },
      });

      topicMap[t.slug] = topic.id;
    }
  }

  // 4. Seed Detailed 12-Section Concepts
  console.log(`[PrepForge Seed] Seeding 12-Section Concepts with Mermaid diagrams...`);

  const concepts = [
    {
      topicSlug: "hashmap-internal-implementation",
      order: 1,
      title: "HashMap Internal Implementation, Treeification & Hash Collisions",
      slug: "hashmap-internals-treeification",
      summary: "Complete mechanical breakdown of Java's HashMap: array of Node<K,V>, bitwise hash spreading, table doubling resize, treeification into Red-Black Tree (TreeNode) when threshold 8 is exceeded, and un-treeification at 6.",
      whyExists: "In high-throughput enterprise systems, storing and retrieving millions of records by unique identifiers (e.g., investor PAN, KYC documents, session tokens) must achieve average O(1) time complexity.",
      howItWorks: "HashMap maintains an internal table array Node<K,V>[] table whose length is always a power of 2 (default 16). Computes bitwise hash spread (h ^ (h >>> 16)) and bucket index (capacity - 1) & hash. Converts bucket to Red-Black Tree (TreeNode) at length 8.",
      internalFlowMermaid: `sequenceDiagram\nautonumber\nparticipant Caller as Service\nparticipant Map as HashMap.put(K,V)\nparticipant Hash as Hash Spreader\nparticipant Table as Bucket Array\nparticipant Tree as Red-Black Tree\nCaller->>Map: put("INVESTOR_PAN", DocData)\nMap->>Hash: hash(key.hashCode())\nHash-->>Map: Spread Hash\nMap->>Table: Index = (capacity - 1) & hash\nalt Bucket Empty\nMap->>Table: Direct Insert\nelse Bucket Collision\nalt Tree Node\nMap->>Tree: putTreeVal(O(log N))\nelse LinkedList >= 8\nMap->>Tree: treeifyBin()\nend\nend\nMap-->>Caller: Returns oldVal or null`,
      fintechExample: "In WealthServ 2.0 AIF/PMS onboarding, an in-memory batch mapping cache uses HashMap to correlate verification provider responses (Leegality, CKYC, DigiLocker) by composite key (tenantId + '_' + investorPan).",
      codeSnippet: `package com.prepforge.collections;\n\npublic final class InvestorCacheKey {\n    private final String tenantId;\n    private final String panNumber;\n    private final int cachedHashCode;\n\n    public InvestorCacheKey(String tenantId, String panNumber) {\n        this.tenantId = tenantId.trim().toUpperCase();\n        this.panNumber = panNumber.trim().toUpperCase();\n        this.cachedHashCode = 31 * tenantId.hashCode() + panNumber.hashCode();\n    }\n\n    @Override\n    public boolean equals(Object o) {\n        if (this == o) return true;\n        if (!(o instanceof InvestorCacheKey)) return false;\n        InvestorCacheKey other = (InvestorCacheKey) o;\n        return this.cachedHashCode == other.cachedHashCode &&\n               this.tenantId.equals(other.tenantId) &&\n               this.panNumber.equals(other.panNumber);\n    }\n\n    @Override\n    public int hashCode() { return this.cachedHashCode; }\n}`,
      codeLanguage: "java",
      codeWalkthrough: "1. Final class and immutable fields prevent bucket corruption in HashMaps.\n2. Precomputed cachedHashCode accelerates high-frequency lookups in fintech gateways.\n3. Short-circuit equals() checks cachedHashCode before string comparison.",
      commonMistakes: [
        "Using mutable objects as HashMap keys.",
        "Overriding equals() without overriding hashCode().",
        "Assuming HashMap is thread-safe in multi-threaded code."
      ],
      interviewQuestions: [
        {
          question: "Why was treeification threshold chosen as 8 and untreeification as 6?",
          difficulty: "EXPERT",
          idealAnswer: "Poisson distribution probability of bucket reaching 8 is less than 1 in 10 million under uniform hash. Untreeification at 6 provides hysteresis to prevent rapid thrashing between LinkedList and TreeNode."
        }
      ],
      followUpQuestions: [
        "What happens if key hashCode() always returns 42?",
        "How does ConcurrentHashMap avoid global lock contention during resize?"
      ],
      quickRevision: [
        "Default capacity is 16, load factor is 0.75.",
        "Capacity is always a power of 2; bucket index is (capacity - 1) & hash.",
        "Treeification at 8 when capacity >= 64; un-treeify at 6."
      ],
      relatedTopics: ["ConcurrentHashMap Internals", "equals() and hashCode() Contract"]
    },
    {
      topicSlug: "jwt-rotating-refresh-token-reuse",
      order: 1,
      title: "JWT Access Token & Rotating Refresh Token Architecture with Reuse Detection",
      slug: "jwt-rotating-refresh-tokens-reuse-detection",
      summary: "Production security architecture for stateless authentication: short-lived JWT access tokens (15m), cryptographic rotating refresh tokens (7d), refresh token families, replay attack detection, and immediate family revocation.",
      whyExists: "Stateless JWT access tokens cannot be revoked before expiration without central blocklists. Rotating refresh tokens with reuse detection provide instant revocation of compromised credentials.",
      howItWorks: "User logs in and receives 15-minute access token and 7-day refresh token. Refreshing consumes the old token and issues a new one in the same family. If an already-used token is presented, reuse is detected and the entire family is revoked.",
      internalFlowMermaid: `sequenceDiagram\nautonumber\nparticipant Client as Web App\nparticipant Auth as Auth Service\nparticipant DB as Redis / Postgres\nparticipant Attacker as Malicious Actor\nClient->>Auth: POST /auth/refresh { RT_GEN_1 }\nAuth->>DB: Mark RT_GEN_1 used & issue RT_GEN_2\nAuth-->>Client: Returns AT_NEW + RT_GEN_2\nNote over Attacker,Auth: Attacker replays stolen RT_GEN_1\nAttacker->>Auth: POST /auth/refresh { RT_GEN_1 }\nAuth->>DB: Check RT_GEN_1 -> Already used!\nAuth->>DB: REVOKE ENTIRE FAMILY & Invalidate Session\nAuth-->>Attacker: 401 Unauthorized (Reuse Detected)`,
      fintechExample: "In WealthServ 2.0 AIF/PMS Onboarding, financial advisors handle confidential investor contracts. Token rotation ensures that if an advisor cookie is leaked, the first rotation revokes all tokens, requiring MFA to re-authenticate.",
      codeSnippet: `package com.prepforge.security;\n\n@Service\npublic class TokenRotationService {\n    @Transactional\n    public TokenResponse rotateRefreshToken(String rawToken) {\n        RefreshToken token = tokenRepo.findByHash(sha256(rawToken))\n            .orElseThrow(() -> new UnauthorizedException(\"Invalid token\"));\n        if (token.isUsed() || token.isRevoked()) {\n            tokenRepo.revokeEntireFamily(token.getFamilyId());\n            throw new SecurityBreachException(\"Token reuse detected! Sessions revoked.\");\n        }\n        token.setUsed(true);\n        tokenRepo.save(token);\n        String newRawToken = UUID.randomUUID().toString();\n        // persist child token and return new JWT\n        return new TokenResponse(newAccessToken, newRawToken);\n    }\n}`,
      codeLanguage: "java",
      codeWalkthrough: "1. Refresh tokens are stored hashed (SHA-256).\n2. If already used, token family is revoked immediately.\n3. Issues new child token in the family with incremented generation.",
      commonMistakes: [
        "Storing refresh tokens in plaintext.",
        "Race conditions between parallel requests without grace periods."
      ],
      interviewQuestions: [
        {
          question: "How do you handle parallel concurrent refresh requests from multiple browser tabs?",
          difficulty: "EXPERT",
          idealAnswer: "Implement a 10-second grace period where presentation of the recently rotated parent token returns the newly issued child token rather than triggering a false-positive revocation."
        }
      ],
      followUpQuestions: [
        "Why is Argon2id preferred over BCrypt?",
        "What is the difference between RS256 and HS256?"
      ],
      quickRevision: [
        "Access tokens 15 min, refresh tokens 7 days.",
        "Rotate refresh token on every refresh.",
        "Replay of consumed token revokes entire family."
      ],
      relatedTopics: ["Spring Security Filter Chain", "Argon2id Password Hashing"]
    },
    {
      topicSlug: "cls-asynclocalstorage-multitenancy",
      order: 1,
      title: "Multi-Tenant Architecture with CLS (AsyncLocalStorage) in NestJS",
      slug: "cls-asynclocalstorage-multitenancy-deepdive",
      summary: "Complete design for multi-tenant SaaS: resolving tenant identity via subdomain, JWT, or custom header, propagating tenant context across asynchronous call chains using Node.js AsyncLocalStorage (CLS), and enforcing tenant isolation in Prisma ORM queries.",
      whyExists: "Passing tenantId manually across every service layer leads to parameter drilling and catastrophic data leak bugs. CLS binds tenant context transparently to the asynchronous execution tree.",
      howItWorks: "Tenant middleware extracts tenantId and calls AsyncLocalStorage.run(). Prisma client extension intercepts queries and automatically appends where: { tenantId }.",
      internalFlowMermaid: `sequenceDiagram\nautonumber\nparticipant Req as HTTP Request\nparticipant Mid as TenantMiddleware\nparticipant CLS as AsyncLocalStorage\nparticipant Svc as InvestorService\nparticipant DB as PostgreSQL\nReq->>Mid: GET /investors [x-tenant-id: alpha]\nMid->>CLS: storage.run({ tenantId: 'alpha' })\nCLS->>Svc: findAllInvestors()\nSvc->>DB: prisma.investor.findMany (auto-injected where: { tenantId: 'alpha' })\nDB-->>Svc: Alpha records only\nSvc-->>Req: 200 OK`,
      fintechExample: "In WealthServ 2.0, multiple wealth management firms share the cloud instance. CLS tenant isolation guarantees Firm A never accesses Firm B investor records.",
      codeSnippet: `import { AsyncLocalStorage } from 'async_hooks';\nexport const tenantStorage = new AsyncLocalStorage<{ tenantId: string }>();\n\nexport function createTenantAwarePrisma(basePrisma: PrismaClient) {\n  return basePrisma.$extends({\n    query: {\n      $allModels: {\n        async $allOperations({ operation, args, query }) {\n          const store = tenantStorage.getStore();\n          if (['findMany', 'findFirst', 'update', 'delete'].includes(operation)) {\n            args.where = { ...args.where, tenantId: store?.tenantId };\n          }\n          return query(args);\n        }\n      }\n    }\n  });\n}`,
      codeLanguage: "typescript",
      codeWalkthrough: "1. AsyncLocalStorage preserves context across async boundaries.\n2. Prisma query extension automatically injects tenantId filter.",
      commonMistakes: [
        "Using global variables instead of AsyncLocalStorage in Node.js.",
        "Losing context inside un-awaited promises or external event listeners."
      ],
      interviewQuestions: [
        {
          question: "How does Node.js AsyncLocalStorage differ from Java ThreadLocal?",
          difficulty: "ADVANCED",
          idealAnswer: "Java ThreadLocal binds to OS threads. In Node.js single-threaded event loop, AsyncLocalStorage hooks into V8 async resource lifecycle to bind state to Promise chains across asynchronous callbacks."
        }
      ],
      followUpQuestions: [
        "How do you handle background queue jobs without HTTP context?",
        "What database indexes are mandatory for multi-tenant tables?"
      ],
      quickRevision: [
        "AsyncLocalStorage provides continuation-local storage in Node.js.",
        "Prisma client extension enforces where: { tenantId } on all operations.",
        "Always prefix database indexes with tenant_id."
      ],
      relatedTopics: ["NestJS Request Lifecycle", "Node.js Event Loop"]
    }
  ];

  for (const c of concepts) {
    const topicId = topicMap[c.topicSlug];
    if (topicId) {
      await prisma.concept.upsert({
        where: {
          topicId_slug: {
            topicId,
            slug: c.slug,
          },
        },
        update: {
          title: c.title,
          order: c.order,
          summary: c.summary,
          whyExists: c.whyExists,
          howItWorks: c.howItWorks,
          internalFlowMermaid: c.internalFlowMermaid,
          fintechExample: c.fintechExample,
          codeSnippet: c.codeSnippet,
          codeLanguage: c.codeLanguage,
          codeWalkthrough: c.codeWalkthrough,
          commonMistakesJson: JSON.stringify(c.commonMistakes),
          interviewQuestionsJson: JSON.stringify(c.interviewQuestions),
          followUpQuestionsJson: JSON.stringify(c.followUpQuestions),
          quickRevisionJson: JSON.stringify(c.quickRevision),
          relatedTopicsJson: JSON.stringify(c.relatedTopics),
        },
        create: {
          topicId,
          title: c.title,
          slug: c.slug,
          order: c.order,
          summary: c.summary,
          whyExists: c.whyExists,
          howItWorks: c.howItWorks,
          internalFlowMermaid: c.internalFlowMermaid,
          fintechExample: c.fintechExample,
          codeSnippet: c.codeSnippet,
          codeLanguage: c.codeLanguage,
          codeWalkthrough: c.codeWalkthrough,
          commonMistakesJson: JSON.stringify(c.commonMistakes),
          interviewQuestionsJson: JSON.stringify(c.interviewQuestions),
          followUpQuestionsJson: JSON.stringify(c.followUpQuestions),
          quickRevisionJson: JSON.stringify(c.quickRevision),
          relatedTopicsJson: JSON.stringify(c.relatedTopics),
        },
      });
    }
  }

  // 5. Questions Bank
  console.log(`[PrepForge Seed] Seeding Question Bank...`);
  const questions = [
    {
      title: "HashMap Bitwise Index Calculation",
      type: "MCQ",
      difficulty: "ADVANCED",
      prompt: "In Java's HashMap, why must the table capacity always be an exact power of 2?",
      optionsJson: JSON.stringify([
        { id: "A", text: "To enable computing bucket index via single-cycle bitwise AND `(capacity - 1) & hash` instead of expensive modulo division", isCorrect: true },
        { id: "B", text: "To guarantee that red-black trees remain balanced without color rotations", isCorrect: false },
        { id: "C", text: "Because 64-bit JVMs cannot allocate non-power-of-two memory arrays", isCorrect: false },
        { id: "D", text: "To enforce that hash collisions only occur on odd bucket indices", isCorrect: false }
      ]),
      correctAnswer: "A",
      explanation: "When capacity is 2^n, (capacity - 1) produces a contiguous bitmask of 1s (e.g. 16 - 1 = 15 = 0b1111). Performing `hash & (capacity - 1)` extracts the exact remainder of `hash % capacity` in a single CPU clock cycle while evenly distributing hashes across all bucket slots."
    },
    {
      title: "Spring Security Refresh Token Replay Defense",
      type: "SCENARIO",
      difficulty: "EXPERT",
      prompt: "In a microservices architecture using rotating refresh tokens, an attacker intercepts a victim's refresh token and successfully issues a refresh request. 30 seconds later, the legitimate user's client attempts to refresh using the exact same token. What must the authorization server do?",
      optionsJson: JSON.stringify([
        { id: "A", text: "Detect token reuse, immediately revoke the entire token family, invalidate all active user sessions, and trigger a security audit alert", isCorrect: true },
        { id: "B", text: "Return the existing active access token and silently log a warning", isCorrect: false },
        { id: "C", text: "Block the user's IP address for 15 minutes and issue a new token anyway", isCorrect: false },
        { id: "D", text: "Allow both tokens to coexist until the 7-day TTL expires", isCorrect: false }
      ]),
      correctAnswer: "A",
      explanation: "Under Refresh Token Rotation (RTR) with Reuse Detection (RFC 6749 BCP), any presentation of an already-consumed refresh token signifies that token leakage occurred. The server revokes the entire token family immediately to cut off unauthorized access."
    },
    {
      title: "SQL Index Scan Optimization",
      type: "SQL",
      difficulty: "ADVANCED",
      prompt: "Given a composite index on `(tenant_id, created_at, status)`, why does a query with `WHERE created_at > '2026-01-01' AND status = 'ACTIVE'` fail to utilize the B-Tree index effectively in PostgreSQL?",
      optionsJson: JSON.stringify([
        { id: "A", text: "It violates the Leftmost Prefix rule because `tenant_id` is missing from the WHERE clause, preventing the engine from locating the starting B-Tree root branch", isCorrect: true },
        { id: "B", text: "PostgreSQL B-Tree indexes do not support date range comparisons", isCorrect: false },
        { id: "C", text: "Status must always appear before timestamp in composite index definitions", isCorrect: false },
        { id: "D", text: "PostgreSQL automatically forces a sequential table scan when more than 2 columns are indexed", isCorrect: false }
      ]),
      correctAnswer: "A",
      explanation: "B-Tree composite indexes are sorted hierarchically by column 1, then column 2, then column 3. Omitting the leftmost leading column (tenant_id) means the database cannot perform a directed binary search down the index tree."
    }
  ];

  for (const q of questions) {
    await prisma.question.create({
      data: q,
    });
  }

  // 6. Coding Challenges
  console.log(`[PrepForge Seed] Seeding Coding Challenges...`);
  const codingProblems = [
    {
      title: "LRU Cache with TTL Eviction",
      slug: "lru-cache-with-ttl",
      difficulty: "HARD",
      description: "Design and implement a thread-safe Least Recently Used (LRU) Cache supporting Time-To-Live (TTL) expiration per key, commonly used in financial token caching and investor profile caches.",
      constraints: "1 <= capacity <= 1000\n0 <= key <= 10^5\n0 <= value <= 10^6\n1 <= ttlMillis <= 10^7\nAt most 2 * 10^5 calls to get and put.",
      sampleInput: "LRUCache(2); put(1, 10, 5000); put(2, 20, 5000); get(1); put(3, 30, 5000); get(2);",
      sampleOutput: "[10, -1]",
      starterCodeJava: "class LRUCache {\n    public LRUCache(int capacity) {}\n    public int get(int key) { return -1; }\n    public void put(int key, int value, long ttlMillis) {}\n}",
      starterCodeTs: "class LRUCache {\n  constructor(capacity: number) {}\n  get(key: number): number { return -1; }\n  put(key: number, value: number, ttlMillis: number): void {}\n}",
      starterCodeSql: "-- N/A",
      testCasesJson: JSON.stringify([
        { input: "LRUCache(2); put(1, 10, 10000); put(2, 20, 10000); get(1);", expectedOutput: "10", isHidden: false },
        { input: "put(3, 30, 10000); get(2);", expectedOutput: "-1", isHidden: false }
      ]),
      optimalSolution: "Use a Doubly-Linked List + HashMap<Integer, Node> combined with timestamp verification. HashMap gives O(1) lookup. Doubly-linked list allows O(1) removal and moving accessed nodes to head.",
      timeComplexity: "O(1) for get and put",
      spaceComplexity: "O(capacity) space"
    },
    {
      title: "Investor Portfolio Running Balance & Lead/Lag",
      slug: "sql-investor-running-balance",
      difficulty: "MEDIUM",
      description: "Given transactions (id, investor_id, amount, transaction_date, type), write an optimized SQL query calculating cumulative portfolio balance and previous amount using window functions.",
      constraints: "5,000,000 rows. Must use index on (investor_id, transaction_date) and window functions.",
      sampleInput: "SELECT * FROM transactions WHERE investor_id = 'INV_001';",
      sampleOutput: "investor_id | transaction_date | amount | running_balance | prev_amount",
      starterCodeJava: "// N/A",
      starterCodeTs: "// N/A",
      starterCodeSql: "SELECT \n    investor_id,\n    transaction_date,\n    amount\nFROM transactions\nORDER BY investor_id, transaction_date;",
      testCasesJson: JSON.stringify([
        { input: "Transactions for INV_001", expectedOutput: "Calculated running balance", isHidden: false }
      ]),
      optimalSolution: "SELECT investor_id, transaction_date, amount, SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE -amount END) OVER (PARTITION BY investor_id ORDER BY transaction_date) AS running_balance, LAG(amount, 1) OVER (PARTITION BY investor_id ORDER BY transaction_date) AS prev_amount FROM transactions;",
      timeComplexity: "O(N) with index scan",
      spaceComplexity: "O(1) streaming memory"
    }
  ];

  for (const cp of codingProblems) {
    await prisma.codingProblem.upsert({
      where: { slug: cp.slug },
      update: {},
      create: cp,
    });
  }

  // 7. Candidate Resume Projects
  console.log(`[PrepForge Seed] Seeding Candidate Resume Projects...`);
  const resumeProjects = [
    {
      name: "WealthServ 2.0 — AIF/PMS Investor Onboarding Platform",
      slug: "wealthserv-2",
      subtitle: "Enterprise Multi-Tenant Alternative Investment & Portfolio Management Onboarding Platform",
      technologiesJson: JSON.stringify(["NestJS", "Next.js", "PostgreSQL", "Prisma", "Redis", "BullMQ", "NATS", "JWT", "Argon2id", "Leegality", "TypeScript"]),
      description: "End-to-end digital onboarding engine handling 6-stage investor lifecycles (KYC, Bank validation, Nominee, Scheme details, Review, Contract generation, e-Sign, RTA submission). Built with multi-tenant isolation via CLS, rotating refresh token security, and state machine workflows.",
      architectureOverview: "Modular NestJS backend orchestrating asynchronous document generation and third-party verification microservices via BullMQ and NATS. Multi-tenancy is enforced through AsyncLocalStorage context binding and Prisma query extensions. State machine pattern guards lifecycle transitions preventing illegal skips.",
      dataFlowMermaid: `sequenceDiagram\nautonumber\nparticipant Investor as Investor / Advisor\nparticipant Web as Next.js Web App\nparticipant API as NestJS Gateway\nparticipant State as State Machine\nparticipant Queue as BullMQ (Redis)\nparticipant Leegality as Leegality eSign\nInvestor->>Web: Submit Scheme Details\nWeb->>API: POST /api/v1/onboarding/stage/submit\nAPI->>State: transition(caseId, DRAFT -> IN_REVIEW)\nAPI->>Queue: Enqueue "GENERATE_CONTRACT"\nQueue->>Leegality: Initialize eSign Request\nInvestor->>Leegality: Complete Aadhaar OTP eSign\nLeegality->>API: Webhook (HMAC-SHA256 verified)\nAPI->>State: transition(caseId, ESIGNED -> RTA_SUBMITTED)`,
      keyHighlightsJson: JSON.stringify([
        "6-stage onboarding lifecycle with deterministic state machine transitions",
        "Multi-tenant data isolation via Node.js AsyncLocalStorage (CLS) and Prisma extensions",
        "High-security authentication: Argon2id, rotating refresh tokens, reuse detection",
        "Adapter pattern for third-party integrations (Leegality, CKYC, DigiLocker)",
        "Circuit breaker protection for third-party verification dependencies"
      ]),
      deepDiveQuestionsJson: JSON.stringify([
        {
          question: "Explain the architecture of your 6-stage onboarding lifecycle. Why did you use a State Machine?",
          focusArea: "State Machine & Lifecycle",
          modelAnswerGuide: "Investor onboarding requires legally strict state progression (KYC, Bank, Nominee, Scheme, Review, eSign). The state machine enforces valid transition matrices and entry/exit guards preventing skips.",
          interviewerFollowUp: "What happens if a user submits step 4 while an asynchronous webhook for step 2 (KYC) fails in the background?"
        },
        {
          question: "How did you implement multi-tenant isolation, and why did you choose AsyncLocalStorage (CLS)?",
          focusArea: "Multi-Tenancy & CLS",
          modelAnswerGuide: "To avoid parameter drilling tenantId across every function, AsyncLocalStorage binds the resolved tenant context to the execution tree. A Prisma client extension automatically injects where: { tenantId } on all queries.",
          interviewerFollowUp: "How do you ensure tenant isolation remains intact in asynchronous BullMQ workers where no HTTP request context exists?"
        }
      ])
    },
    {
      name: "MF Investor Onboarding Platform — Barjeel",
      slug: "barjeel-mf-onboarding",
      subtitle: "Digital Mutual Fund KYC & Compliance Verification Gateway",
      technologiesJson: JSON.stringify(["Next.js", "NestJS", "PostgreSQL", "Prisma", "AWS S3", "DigiLocker", "CKYC", "KwikID"]),
      description: "Automated mutual fund onboarding platform featuring government registry integrations (DigiLocker, CKYC, KwikID video KYC) and secure S3 document vaulting with time-limited pre-signed URLs.",
      architectureOverview: "Integrates directly with government and identity repositories. Incoming identity documents are validated via external adapters, encrypted, and vaulted in private AWS S3 buckets accessed strictly via temporary pre-signed URLs.",
      dataFlowMermaid: `graph LR\nUser([Investor]) --> NextApp[Next.js App]\nNextApp --> NestAPI[NestJS API Gateway]\nNestAPI --> DigiLocker[DigiLocker API]\nNestAPI --> CKYC[Central KYC Registry]\nNestAPI --> S3[(AWS S3 Document Vault)]`,
      keyHighlightsJson: JSON.stringify([
        "DigiLocker & CKYC automated document retrieval and PAN-Aadhaar verification",
        "Direct-to-S3 secure uploads using time-limited pre-signed URLs with KMS encryption",
        "RBAC with maker-checker compliance approval workflows"
      ]),
      deepDiveQuestionsJson: JSON.stringify([
        {
          question: "How did you design secure document storage with AWS S3 pre-signed URLs?",
          focusArea: "Cloud Security & Storage",
          modelAnswerGuide: "Documents never route through application server memory. The backend generates a short-lived PUT pre-signed URL with cryptographic signature. Viewing uses GET pre-signed URL after RBAC validation.",
          interviewerFollowUp: "How do you prevent malicious users from uploading executable files via pre-signed URLs?"
        }
      ])
    },
    {
      name: "Foreign Custody Account Creation",
      slug: "foreign-custody-account",
      subtitle: "Cross-Border NRI Investor Onboarding & Compliance Engine",
      technologiesJson: JSON.stringify(["Next.js", "NestJS", "PostgreSQL", "Prisma", "NSDL eSign", "ICICI Bank API"]),
      description: "Cross-border custodial account automation for Non-Resident Indians (NRIs) featuring dynamic compliance forms, automated PAN/AML/LEI validation, and NSDL Aadhaar digital signatures.",
      architectureOverview: "Dynamic JSON-schema-driven form engine adapting to NRI tax jurisdictions (FATCA/CRS). Integrates with ICICI banking APIs for account funding and NSDL digital signature gateways.",
      dataFlowMermaid: `graph TD\nNRI[NRI Investor] --> DynamicForm[Dynamic Form Engine]\nDynamicForm --> AMLValidation[AML & LEI Verification]\nAMLValidation --> BankIntegration[ICICI Custody API]\nBankIntegration --> NSDL[NSDL Aadhaar eSign]`,
      keyHighlightsJson: JSON.stringify([
        "Dynamic form engine generating country-specific compliance fields",
        "Automated AML and LEI validation against global watchlists",
        "Aadhaar-based remote digital contract signing for international investors"
      ]),
      deepDiveQuestionsJson: JSON.stringify([
        {
          question: "How did your dynamic form engine validate jurisdiction-specific fields (e.g. FATCA vs CRS)?",
          focusArea: "Architecture & Data Modeling",
          modelAnswerGuide: "Schema-driven JSON form models validated on client and server. Jurisdictional rules dynamically activated based on country of tax residence.",
          interviewerFollowUp: "How did you handle database schema migrations when new regulatory questions were added?"
        }
      ])
    },
    {
      name: "Reusable eSign Platform",
      slug: "reusable-esign-platform",
      subtitle: "High-Throughput Digital Signature Microservice",
      technologiesJson: JSON.stringify(["J2EE", "Spring Boot", "Hibernate", "JPA", "MSSQL", "OAuth2", "AWS", "NSDL eSign"]),
      description: "Enterprise eSign microservice providing reusable digital signature orchestration, dynamic PDF template watermarking, and Aadhaar OTP verification across internal applications.",
      architectureOverview: "Spring Boot microservice utilizing JPA/Hibernate and MSSQL with high-throughput callback processing and OAuth2 security.",
      dataFlowMermaid: `graph LR\nService[Enterprise App] -->|OAuth2 REST| eSignCore[Spring Boot eSign Service]\neSignCore --> DocStamper[Dynamic PDF Stamper]\neSignCore --> NSDLGateway[NSDL eSign Gateway]\nNSDLGateway --> Callback[Webhook / Callback Processor]`,
      keyHighlightsJson: JSON.stringify([
        "Reusable microservice architecture consumed by multiple enterprise divisions",
        "Dynamic PDF watermarking, stamp duty calculation, and field placement",
        "NSDL Aadhaar OTP verification callback processing"
      ]),
      deepDiveQuestionsJson: JSON.stringify([
        {
          question: "How did you ensure reliable processing of asynchronous eSign callbacks under heavy load?",
          focusArea: "Reliability & Idempotency",
          modelAnswerGuide: "Callback endpoints must be strictly idempotent. When NSDL posts an eSign completion webhook, the payload signature is verified, an idempotency lock is acquired in Redis, and duplicate notifications are acknowledged with 200 OK.",
          interviewerFollowUp: "How do you handle out-of-order callback deliveries where completed webhook arrives before in-progress webhook?"
        }
      ])
    },
    {
      name: "Workflow Management System & Ticketing",
      slug: "workflow-management-system",
      subtitle: "Configurable Multi-Step Task Resolution Engine",
      technologiesJson: JSON.stringify(["Spring Boot", "JPA", "PostgreSQL", "Redis", "WebSocket"]),
      description: "Enterprise workflow engine supporting multi-step resolution workflows, dynamic task assignment, SLA tracking, and real-time status broadcasting.",
      architectureOverview: "Event-driven workflow engine with dynamic routing rules, escalation timers, and WebSocket push notifications.",
      dataFlowMermaid: `graph TD\nTicket[Task / Ticket] --> Router[Dynamic Routing Engine]\nRouter --> Assignment[Multi-User Assignment Matrix]\nAssignment --> SLAEngine[Redis SLA Timer]\nSLAEngine --> WebSocket[Real-Time Status Broadcast]`,
      keyHighlightsJson: JSON.stringify([
        "Dynamic routing rules based on skill, team, and current backlog",
        "Redis-backed SLA countdown timers and automated escalation triggers",
        "WebSocket real-time state synchronization"
      ]),
      deepDiveQuestionsJson: JSON.stringify([
        {
          question: "How did you design the SLA escalation timer for thousands of concurrent open tickets?",
          focusArea: "Distributed Systems & Timers",
          modelAnswerGuide: "Utilized Redis Sorted Sets (ZSET) where score is UNIX epoch of deadline. Lightweight worker polls ZREVRANGEBYSCORE to instantly fetch tickets that breached SLA in O(log N) time.",
          interviewerFollowUp: "What happens if the SLA worker crashes right after fetching expired tickets?"
        }
      ])
    },
    {
      name: "UPEX / IESCMS — Enterprise Microservices Platform",
      slug: "upex-iescms",
      subtitle: "High-Scalability Approval Workflow & Integration Engine",
      technologiesJson: JSON.stringify(["J2EE", "Spring Boot", "Microservices", "Hibernate", "MySQL", "Docker", "Spring Security", "OAuth2", "GitLab CI/CD"]),
      description: "Enterprise-grade microservices platform providing automated multi-tiered approval workflows, high-throughput message processing, and containerized CI/CD deployments.",
      architectureOverview: "Decomposed legacy monolithic services into Spring Boot microservices deployed on Docker containers with automated GitLab CI/CD pipelines, secured via Spring Security and OAuth2.",
      dataFlowMermaid: `graph LR\nClient[Enterprise Client] --> Gateway[API Gateway / OAuth2]\nGateway --> ApprovalService[Approval Workflow Service]\nGateway --> IntegrationService[Integration Service]\nApprovalService --> MySQL[(MySQL Cluster)]`,
      keyHighlightsJson: JSON.stringify([
        "Decomposition of enterprise monolithic workflows into scalable microservices",
        "Multi-tiered approval matrix with conditional routing and audit logs",
        "Containerized deployment using multi-stage Docker builds and GitLab CI/CD"
      ]),
      deepDiveQuestionsJson: JSON.stringify([
        {
          question: "How did you decompose the legacy enterprise application into microservices without breaking data consistency?",
          focusArea: "Microservices & Migration",
          modelAnswerGuide: "Used the Strangler Fig pattern. Identified service boundaries around business domains (Approvals, Integrations). Shared database tables were initially read via database views before being cleanly separated into domain-owned schemas.",
          interviewerFollowUp: "How did you handle distributed transactions between the Approval service and downstream ledger services?"
        }
      ])
    }
  ];

  for (const rp of resumeProjects) {
    await prisma.resumeProject.upsert({
      where: { slug: rp.slug },
      update: {},
      create: rp,
    });
  }

  // 8. Create Default Daily & Weekly Test Templates
  const dailyTest = await prisma.test.upsert({
    where: { id: 'daily-default' },
    update: {},
    create: {
      id: 'daily-default',
      type: 'DAILY',
      title: "Today's Adaptive High-Yield Practice Test",
      totalMarks: 100,
      durationMinutes: 25,
      sectionsJson: JSON.stringify([
        { name: 'Core Architecture MCQs', count: 3 },
        { name: 'Conceptual & Traps', count: 2 },
        { name: 'Coding Challenge', count: 2 },
        { name: 'SQL & Query Optimization', count: 1 },
        { name: 'Debugging Traps', count: 1 },
        { name: 'Real Project Scenario', count: 1 }
      ]),
    },
  });

  console.log(`[PrepForge Seed] Created Daily Test template: ${dailyTest.id}`);
  console.log('[PrepForge Seed] Seeding completed successfully! 🚀');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
