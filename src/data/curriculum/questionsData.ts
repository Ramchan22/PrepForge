export interface QuestionDefinition {
  title: string;
  type: 'MCQ' | 'CODING' | 'SQL' | 'CONCEPTUAL' | 'SCENARIO' | 'DEBUGGING';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  prompt: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  correctAnswer: string;
  explanation: string;
  topicSlug?: string;
  sessionSlug?: string;
}

export const SEED_QUESTIONS: QuestionDefinition[] = [
  {
    title: "HashMap Bitwise Index Calculation",
    type: "MCQ",
    difficulty: "ADVANCED",
    prompt: "In Java's HashMap, why must the table capacity always be an exact power of 2?",
    options: [
      { id: "A", text: "To enable computing bucket index via single-cycle bitwise AND `(capacity - 1) & hash` instead of expensive modulo division", isCorrect: true },
      { id: "B", text: "To guarantee that red-black trees remain balanced without color rotations", isCorrect: false },
      { id: "C", text: "Because 64-bit JVMs cannot allocate non-power-of-two memory arrays", isCorrect: false },
      { id: "D", text: "To enforce that hash collisions only occur on odd bucket indices", isCorrect: false }
    ],
    correctAnswer: "A",
    explanation: "When capacity is 2^n, (capacity - 1) produces a contiguous bitmask of 1s (e.g. 16 - 1 = 15 = 0b1111). Performing `hash & (capacity - 1)` extracts the exact remainder of `hash % capacity` in a single CPU clock cycle while evenly distributing hashes across all bucket slots.",
    sessionSlug: "collections-framework"
  },
  {
    title: "ConcurrentHashMap Treeification Threshold",
    type: "CONCEPTUAL",
    difficulty: "EXPERT",
    prompt: "Why does Java 8 HashMap convert bucket linked lists into Red-Black Trees at length 8, and revert back to linked lists at length 6?",
    options: [],
    correctAnswer: "Treeification at 8 addresses the extreme tail (< 1 in 10 million chance under random distribution) to mitigate HashDOS attacks from O(N) to O(log N). Reversion at 6 provides hysteresis to prevent costly rapid thrashing between TreeNode and Node during alternating insertions and deletions.",
    explanation: "Under uniform hashing, Poisson distribution shows bucket count reaching 8 is less than 0.00000006. Setting untreeify threshold to 6 prevents bouncing between linked lists and trees on edge additions/removals.",
    sessionSlug: "collections-framework"
  },
  {
    title: "Spring Security Refresh Token Replay Defense",
    type: "SCENARIO",
    difficulty: "EXPERT",
    prompt: "In a microservices architecture using rotating refresh tokens, an attacker intercepts a victim's refresh token and successfully issues a refresh request. 30 seconds later, the legitimate user's client attempts to refresh using the exact same token. What must the authorization server do?",
    options: [
      { id: "A", text: "Detect token reuse, immediately revoke the entire token family, invalidate all active user sessions, and trigger a security audit alert", isCorrect: true },
      { id: "B", text: "Return the existing active access token and silently log a warning", isCorrect: false },
      { id: "C", text: "Block the user's IP address for 15 minutes and issue a new token anyway", isCorrect: false },
      { id: "D", text: "Allow both tokens to coexist until the 7-day TTL expires", isCorrect: false }
    ],
    correctAnswer: "A",
    explanation: "Under Refresh Token Rotation (RTR) with Reuse Detection (RFC 6749 BCP), any presentation of an already-consumed refresh token signifies that token leakage occurred. The server cannot know whether the current caller is the attacker or victim; hence, it revokes the entire token family immediately to cut off unauthorized access.",
    sessionSlug: "spring-security"
  },
  {
    title: "SQL Index Scan Optimization",
    type: "SQL",
    difficulty: "ADVANCED",
    prompt: "Given a composite index on `(tenant_id, created_at, status)`, why does a query with `WHERE created_at > '2026-01-01' AND status = 'ACTIVE'` fail to utilize the B-Tree index effectively in PostgreSQL?",
    options: [
      { id: "A", text: "It violates the Leftmost Prefix rule because `tenant_id` is missing from the WHERE clause, preventing the engine from locating the starting B-Tree root branch", isCorrect: true },
      { id: "B", text: "PostgreSQL B-Tree indexes do not support date range comparisons", isCorrect: false },
      { id: "C", text: "Status must always appear before timestamp in composite index definitions", isCorrect: false },
      { id: "D", text: "PostgreSQL automatically forces a sequential table scan when more than 2 columns are indexed", isCorrect: false }
    ],
    correctAnswer: "A",
    explanation: "B-Tree composite indexes are sorted hierarchically by column 1, then column 2, then column 3. Omitting the leftmost leading column (tenant_id) means the database cannot perform a directed binary search down the index tree and must resort to an index skip scan or full table scan.",
    sessionSlug: "sql-database-architecture"
  },
  {
    title: "Distributed Transaction Saga Pivot Step",
    type: "CONCEPTUAL",
    difficulty: "EXPERT",
    prompt: "In a Saga orchestrator managing an investor onboarding workflow (KYC Check -> Bank Verification -> eSign Contract -> RTA Submission), what is the 'Pivot Step'?",
    options: [
      { id: "A", text: "The definitive step after which compensating transactions are no longer possible and subsequent steps MUST execute to completion (or retry until successful)", isCorrect: true },
      { id: "B", text: "The step where all database locks are acquired concurrently across all microservices", isCorrect: false },
      { id: "C", text: "The first step in the saga that validates input parameters", isCorrect: false },
      { id: "D", text: "The fallback step executed when Redis loses network connectivity", isCorrect: false }
    ],
    correctAnswer: "A",
    explanation: "In the Saga pattern, steps are divided into Compensatable Transactions (can be rolled back via undo actions), the Pivot Step (the point of no return, e.g. RTA Submission / payment authorization), and Retriable Transactions (guaranteed to succeed eventually through idempotency and retries).",
    sessionSlug: "microservices"
  },
  {
    title: "Virtual Threads Pinning Traps",
    type: "DEBUGGING",
    difficulty: "EXPERT",
    prompt: "In Java 21 with Virtual Threads (Project Loom), what causes 'carrier thread pinning' and cripples high-concurrency throughput?",
    options: [
      { id: "A", text: "Executing blocking I/O inside a `synchronized` block/method or invoking native JNI methods, preventing the virtual thread from unmounting from its carrier OS thread", isCorrect: true },
      { id: "B", text: "Using `CompletableFuture.supplyAsync()` inside a virtual thread", isCorrect: false },
      { id: "C", text: "Calling `Thread.sleep()` for longer than 1000 milliseconds", isCorrect: false },
      { id: "D", text: "Allocating objects larger than 64KB on the heap", isCorrect: false }
    ],
    correctAnswer: "A",
    explanation: "Virtual threads unmount when performing blocking I/O (sockets, files). However, if blocking occurs while holding a monitor lock (`synchronized` block/method) or inside native code (JNI), the virtual thread is 'pinned' to its carrier OS worker thread, exhausting the underlying ForkJoinPool.",
    sessionSlug: "multithreading-concurrency"
  },
  {
    title: "HMAC Webhook Timing Attack Defense",
    type: "MCQ",
    difficulty: "ADVANCED",
    prompt: "When validating third-party webhooks (e.g. Leegality or Razorpay HMAC-SHA256 signatures), why is `signature.equals(computedSignature)` insecure?",
    options: [
      { id: "A", text: "Standard string equals() terminates early on the first non-matching byte, leaking byte comparison time that attackers can exploit via side-channel timing analysis", isCorrect: true },
      { id: "B", text: "Java String equals() converts UTF-8 strings to ASCII characters automatically", isCorrect: false },
      { id: "C", text: "HMAC signatures in HTTP headers are base64 encoded and cannot be compared directly", isCorrect: false },
      { id: "D", text: "It causes memory leaks in the JVM String constant pool", isCorrect: false }
    ],
    correctAnswer: "A",
    explanation: "Early termination allows an attacker to measure response times down to nanoseconds to guess characters byte-by-byte. Secure systems must use constant-time comparisons like `MessageDigest.isEqual()` or Node.js `crypto.timingSafeEqual()`.",
    sessionSlug: "enterprise-security"
  }
];
