export interface ConceptData {
  topicSlug: string;
  order: number;
  title: string;
  slug: string;
  summary: string;
  whyExists: string;
  howItWorks: string;
  internalFlowMermaid: string;
  fintechExample: string;
  codeSnippet: string;
  codeLanguage: string;
  codeWalkthrough: string;
  commonMistakes: string[];
  interviewQuestions: {
    question: string;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    idealAnswer: string;
  }[];
  followUpQuestions: string[];
  quickRevision: string[];
  relatedTopics: string[];
}

export const SEED_CONCEPTS: ConceptData[] = [
  {
    topicSlug: "hashmap-internal-implementation",
    order: 1,
    title: "HashMap Internal Implementation, Treeification & Hash Collisions",
    slug: "hashmap-internals-treeification",
    summary: "Complete mechanical breakdown of Java's HashMap: array of Node<K,V>, bitwise hash spreading, table doubling resize, treeification into Red-Black Tree (TreeNode) when threshold 8 is exceeded, and un-treeification at 6.",
    whyExists: "In high-throughput enterprise systems, storing and retrieving millions of records by unique identifiers (e.g., investor PAN, KYC documents, session tokens) must achieve average O(1) time complexity. Without a hash map, lookups in unsorted arrays degrade to O(N) and binary search trees require O(log N) while demanding strictly ordered keys.",
    howItWorks: `HashMap maintains an internal table array \`Node<K,V>[] table\` whose length is always a power of 2 (default 16). 
1. **Hash Spreading**: Computes \`(key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16)\` to fold high 16 bits into low 16 bits, preventing collisions when table capacity is small.
2. **Bucket Indexing**: Computed as \`index = (table.length - 1) & hash\`. Because length is $2^n$, this bitwise AND is mathematically equivalent to \`hash % length\` but executes in a single CPU instruction.
3. **Collision Handling**: If two distinct keys map to the same bucket:
   - Prior to threshold: elements form a singly-linked list via \`Node.next\`.
   - **Treeification**: When bucket linked list length reaches \`TREEIFY_THRESHOLD = 8\` AND overall capacity is at least \`MIN_TREEIFY_CAPACITY = 64\`, the bucket converts into a balanced Red-Black Tree (\`TreeNode<K,V>\`), reducing search from O(N) worst-case to O(log N).
   - If capacity is < 64, HashMap prefers resizing over treeification.
4. **Resizing**: When \`size > capacity * loadFactor\` (default 0.75), capacity doubles. In Java 8+, re-indexing avoids recomputing hash: nodes are partitioned into 'low' and 'high' chains based on whether \`(hash & oldCap) == 0\`, maintaining relative order without rehashing.`,
    internalFlowMermaid: `sequenceDiagram
    autonumber
    participant Caller as Application / Service
    participant Map as HashMap.put(K, V)
    participant Hash as Bitwise Hash Spreader
    participant Table as Node<K,V>[] Buckets
    participant Tree as Red-Black Tree (TreeNode)

    Caller->>Map: put("INVESTOR_PAN_9921", DocumentData)
    Map->>Hash: hash(key.hashCode()) -> (h ^ (h >>> 16))
    Hash-->>Map: 32-bit Spread Hash
    Map->>Table: Calculate Index = (capacity - 1) & hash
    alt Bucket is Empty (table[index] == null)
        Map->>Table: Direct insert new Node(hash, key, val, null)
    else Bucket has collision
        alt First node key matches
            Map->>Table: Overwrite existing value & return oldVal
        else Bucket is TreeNode
            Map->>Tree: putTreeVal(...) [O(log N) Red-Black insert]
        else Bucket is LinkedList
            loop Traverse Node.next
                Map->>Table: Compare (node.hash == hash && node.key.equals(key))
                alt Found existing key
                    Map->>Table: Overwrite value
                else Reached tail (binCount >= 8)
                    Map->>Table: Append new Node at tail
                    Map->>Tree: treeifyBin(tab, index) [Convert to Red-Black Tree]
                end
            end
        end
    end
    alt size > threshold (capacity * 0.75)
        Map->>Table: resize() -> Double capacity (2x) & split chains (lo/hi)
    end
    Map-->>Caller: Returns previous value or null`,
    fintechExample: "In the WealthServ 2.0 onboarding engine, incoming KYC verification payloads contain dynamic investor fields. Before persisting to PostgreSQL via Prisma, an in-memory batch mapping cache uses HashMap to correlate verification provider responses (Leegality, CKYC, DigiLocker) by composite key `(tenantId + '_' + investorPan)`. High collision resilience prevents latency spikes during bulk fund onboarding campaigns.",
    codeSnippet: `package com.prepforge.collections;

import java.util.Objects;

/**
 * Production Demonstration: Safe HashMap Key Design
 * Demonstrates proper immutability and equals/hashCode contract
 * to prevent silent memory leaks and unretrievable values in HashMaps.
 */
public final class InvestorCacheKey {
    private final String tenantId;
    private final String panNumber;
    private final int cachedHashCode; // Precomputed for high-frequency map lookups

    public InvestorCacheKey(String tenantId, String panNumber) {
        if (tenantId == null || panNumber == null) {
            throw new IllegalArgumentException("Tenant ID and PAN cannot be null");
        }
        this.tenantId = tenantId.trim().toUpperCase();
        this.panNumber = panNumber.trim().toUpperCase();
        this.cachedHashCode = calculateHashCode();
    }

    private int calculateHashCode() {
        int result = 17;
        result = 31 * result + tenantId.hashCode();
        result = 31 * result + panNumber.hashCode();
        return result;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof InvestorCacheKey)) return false;
        InvestorCacheKey other = (InvestorCacheKey) o;
        return this.cachedHashCode == other.cachedHashCode &&
               this.tenantId.equals(other.tenantId) &&
               this.panNumber.equals(other.panNumber);
    }

    @Override
    public int hashCode() {
        return this.cachedHashCode;
    }

    public String getTenantId() { return tenantId; }
    public String getPanNumber() { return panNumber; }
}`,
    codeLanguage: "java",
    codeWalkthrough: `1. \`final class\` and \`final\` fields ensure immutability. If key state mutates after insertion into a HashMap, its hashCode changes, making it impossible to locate the bucket on subsequent .get() calls.
2. \`cachedHashCode\` is precomputed in the constructor. For high-throughput caching in fintech gateways, caching hash code removes string hashing overhead on repetitive map operations.
3. In \`equals()\`, quick checks \`this == o\` and \`this.cachedHashCode == other.cachedHashCode\` short-circuit before executing character-by-character string comparisons.`,
    commonMistakes: [
      "Using mutable objects as HashMap keys (e.g. updating a field on an existing key object causes .get() to return null despite the entry existing in memory).",
      "Overriding equals() without overriding hashCode(), violating the contract that equal objects must have identical hash codes.",
      "Assuming HashMap is thread-safe. Concurrent writes in Java 7 caused infinite loop cycles during resize; in Java 8+ it causes data loss and broken tree structures.",
      "Setting initialCapacity too low for known large datasets, triggering repetitive, expensive array resize operations."
    ],
    interviewQuestions: [
      {
        question: "Why was the treeification threshold chosen as 8 and un-treeification chosen as 6 in HashMap?",
        difficulty: "EXPERT",
        idealAnswer: "Under random hash distributions, the Poisson distribution probability of a bucket reaching length 8 is less than 1 in 10 million (P(k=8) = 0.00000006). Thus, treeification only occurs when hash codes are poorly distributed or malicious collisions (HashDOS attacks) occur. The un-treeification threshold is set to 6 (not 7 or 8) to provide hysteresis—preventing expensive, repetitive bouncing between LinkedList and TreeNode during alternating insertions and deletions."
      },
      {
        question: "How does HashMap calculate bucket index without using the expensive modulo operator?",
        difficulty: "ADVANCED",
        idealAnswer: "Because HashMap capacity is strictly enforced to be a power of 2 ($2^n$), the formula (capacity - 1) produces a bitmask of all 1s (e.g., 16 - 1 = 15 = 0b00001111). Performing a bitwise AND (hash & (capacity - 1)) preserves only the lowest n bits, which is mathematically identical to (hash % capacity) while executing in 1 CPU cycle instead of a division instruction."
      },
      {
        question: "What is the difference between HashMap and ConcurrentHashMap in handling concurrency?",
        difficulty: "ADVANCED",
        idealAnswer: "HashMap provides zero synchronization. ConcurrentHashMap uses lock-free Compare-And-Swap (CAS) for inserting into empty bins, and per-bin synchronized monitor locking on the bucket root node for collision resolution, permitting multiple threads to write to distinct buckets simultaneously without global lock contention."
      }
    ],
    followUpQuestions: [
      "What happens if your key class's hashCode() method always returns 42?",
      "How does ConcurrentHashMap handle resizing when multiple threads are reading and writing simultaneously?",
      "Can you explain the difference between Java 7 Segmented Locking and Java 8 CAS + Synchronized bin locking in ConcurrentHashMap?"
    ],
    quickRevision: [
      "Default initial capacity is 16, default load factor is 0.75.",
      "Capacity is always a power of 2; bucket index is (capacity - 1) & hash.",
      "Bitwise hash spread (h ^ (h >>> 16)) folds high 16 bits into low 16 bits.",
      "Converts from LinkedList to Red-Black Tree when binCount >= 8 AND capacity >= 64.",
      "Reverts from Red-Black Tree back to LinkedList when binCount <= 6 during resize.",
      "Not thread-safe; use ConcurrentHashMap in multi-threaded environments.",
      "Keys MUST be immutable with consistent equals() and hashCode() implementations."
    ],
    relatedTopics: ["ConcurrentHashMap Internals", "equals() and hashCode() Contract", "Collections Framework", "Red-Black Tree Algorithms"]
  },
  {
    topicSlug: "jwt-rotating-refresh-token-reuse",
    order: 1,
    title: "JWT Access Token & Rotating Refresh Token Architecture with Reuse Detection",
    slug: "jwt-rotating-refresh-tokens-reuse-detection",
    summary: "Production security architecture for stateless authentication: short-lived JWT access tokens (15m), cryptographic rotating refresh tokens (7d), refresh token families, replay attack detection, and immediate family revocation.",
    whyExists: "Stateless JWT access tokens cannot be easily invalidated before expiration without centralized blocklists that destroy scalability. Long-lived access tokens pose catastrophic risk if intercepted via XSS or MITM. Rotating refresh tokens with reuse detection provide instant revocation of compromised credentials without querying a database on every API request.",
    howItWorks: `1. **Client Authentication**: User logs in with email + password (verified via Argon2id) and MFA OTP.
2. **Token Issuance**:
   - Access Token: Short-lived (15 minutes), signed via RS256 or HS256, carrying \`userId\`, \`tenantId\`, and \`roles\`.
   - Refresh Token: Cryptographically secure random UUID or signed token (7 days), stored hashed in Redis/PostgreSQL with a \`familyId\`, \`generation\`, and \`isRevoked\` flag.
3. **Token Rotation Lifecycle**:
   - When access token expires, client issues \`POST /auth/refresh\` with current refresh token.
   - Server looks up token:
     - **Normal Flow**: Token is valid and unused $\rightarrow$ mark current token as \`used: true\`, issue new Access Token + new Refresh Token in the same \`familyId\` with \`generation + 1\`.
     - **Replay Attack / Reuse Detection**: If a token with \`used == true\` is presented, a compromise has occurred! An attacker or victim is attempting to use an already-rotated token.
     - **Defensive Action**: Server immediately revokes the ENTIRE \`familyId\`, invalidates all active sessions for that user, and emits an urgent security audit alert.`,
    internalFlowMermaid: `sequenceDiagram
    autonumber
    participant Client as Frontend (Next.js / Browser)
    participant Auth as Auth Service (NestJS / Spring)
    participant DB as Redis / Postgres (Token Store)
    participant Attacker as Malicious Actor (Stolen Token)

    Note over Client,Auth: Phase 1: Normal Token Rotation
    Client->>Auth: POST /auth/refresh { refreshToken: "RT_GEN_1" }
    Auth->>DB: Find RT_GEN_1 in Family "FAM_98"
    DB-->>Auth: Record: { isUsed: false, familyId: "FAM_98", generation: 1 }
    Auth->>DB: Update RT_GEN_1 -> { isUsed: true }
    Auth->>DB: Insert RT_GEN_2 -> { isUsed: false, familyId: "FAM_98", generation: 2 }
    Auth-->>Client: Returns { accessToken: "AT_NEW", refreshToken: "RT_GEN_2" }

    Note over Attacker,Auth: Phase 2: Attacker Attempts Replay of Stolen RT_GEN_1
    Attacker->>Auth: POST /auth/refresh { refreshToken: "RT_GEN_1" }
    Auth->>DB: Find RT_GEN_1 in Family "FAM_98"
    DB-->>Auth: Record: { isUsed: true, familyId: "FAM_98" } !! ALERT: REUSE DETECTED !!
    Auth->>DB: UPDATE ALL Tokens in "FAM_98" SET isRevoked = true
    Auth->>DB: Invalidate User Session Cache & Emit Security Audit
    Auth-->>Attacker: 401 Unauthorized { error: "SECURITY_BREACH_REUSE_DETECTED" }
    
    Note over Client,Auth: Phase 3: Legitimate User Attempts Next Refresh
    Client->>Auth: POST /auth/refresh { refreshToken: "RT_GEN_2" }
    Auth->>DB: Find RT_GEN_2
    DB-->>Auth: Record: { isRevoked: true }
    Auth-->>Client: 401 Unauthorized -> Force Re-Authentication with MFA`,
    fintechExample: "In WealthServ 2.0 AIF/PMS Onboarding, financial advisors and compliance officers handle sensitive high-net-worth investor documents. The rotating refresh token mechanism ensures that if an advisor's laptop refresh cookie is intercepted on a public network, the first rotation immediately terminates all tokens in that family, requiring hardware email OTP MFA to re-establish access.",
    codeSnippet: `package com.prepforge.security;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.UUID;

@Service
public class TokenRotationService {
    private final RefreshTokenRepository tokenRepo;
    private final JwtTokenProvider jwtProvider;
    private final AuditLogService auditLogger;

    public TokenRotationService(RefreshTokenRepository tokenRepo, JwtTokenProvider jwtProvider, AuditLogService auditLogger) {
        this.tokenRepo = tokenRepo;
        this.jwtProvider = jwtProvider;
        this.auditLogger = auditLogger;
    }

    @Transactional
    public TokenResponse rotateRefreshToken(String rawRefreshToken) {
        RefreshToken token = tokenRepo.findByTokenHash(hash(rawRefreshToken))
            .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        // REUSE DETECTION: If already used or revoked, compromise detected!
        if (token.isUsed() || token.isRevoked() || token.getExpiresAt().isBefore(Instant.now())) {
            // Revoke entire token family to protect user
            tokenRepo.revokeEntireFamily(token.getFamilyId());
            auditLogger.logSecurityAlert("TOKEN_REUSE_DETECTED", token.getUserId(), token.getFamilyId());
            throw new SecurityBreachException("Refresh token reuse detected. All sessions terminated.");
        }

        // Mark current token as consumed
        token.setUsed(true);
        tokenRepo.save(token);

        // Issue new child refresh token in same family
        String newRawRefreshToken = UUID.randomUUID().toString();
        RefreshToken childToken = new RefreshToken();
        childToken.setFamilyId(token.getFamilyId());
        childToken.setUserId(token.getUserId());
        childToken.setGeneration(token.getGeneration() + 1);
        childToken.setTokenHash(hash(newRawRefreshToken));
        childToken.setExpiresAt(Instant.now().plusSeconds(7 * 24 * 3600)); // 7 days
        tokenRepo.save(childToken);

        String newAccessToken = jwtProvider.generateAccessToken(token.getUserId(), token.getTenantId());
        return new TokenResponse(newAccessToken, newRawRefreshToken);
    }

    private String hash(String raw) {
        // Cryptographic SHA-256 hash before storage to prevent DB leak attacks
        return org.apache.commons.codec.digest.DigestUtils.sha256Hex(raw);
    }
}`,
    codeLanguage: "java",
    codeWalkthrough: `1. \`findByTokenHash\`: Refresh tokens are never stored in plaintext. If the database is compromised, the attacker cannot forge refresh requests without the raw UUIDs.
2. \`token.isUsed() || token.isRevoked()\`: The heart of reuse detection. If an attacker replays a previously used token, both victim and attacker are protected by invalidating the entire family.
3. \`revokeEntireFamily(token.getFamilyId())\`: Immediately flips all active tokens belonging to that session group to revoked.
4. \`generation + 1\`: Tracks lineage for security forensics.`,
    commonMistakes: [
      "Storing refresh tokens in plaintext in PostgreSQL or Redis instead of hashing them (e.g. SHA-256).",
      "Failing to implement atomicity / transaction isolation on token rotation, leading to race conditions where two simultaneous API calls both rotate the token and trigger false-positive reuse detection.",
      "Using long access token expiry (e.g. 24 hours). Access tokens should never exceed 15-30 minutes.",
      "Storing JWTs in browser localStorage where they are vulnerable to XSS; tokens should be stored in HttpOnly, Secure, SameSite=Strict cookies."
    ],
    interviewQuestions: [
      {
        question: "How do you handle the race condition where a legitimate user triggers two parallel requests right when the access token expires, causing one request to fail with token reuse?",
        difficulty: "EXPERT",
        idealAnswer: "We implement a short grace period (e.g., 10–30 seconds) on rotated refresh tokens in Redis. When a token is rotated, it is marked with its rotation timestamp and child token ID. If another request arrives with the exact same parent token within the 10-second grace window, the server returns the already-generated child token rather than revoking the family. If an attempt arrives after 30 seconds, it is treated as a malicious replay attack and triggers immediate family revocation."
      },
      {
        question: "What is the difference between RS256 (asymmetric) and HS256 (symmetric) signing in JWTs?",
        difficulty: "ADVANCED",
        idealAnswer: "HS256 uses a single shared secret key for both signing and verifying tokens. Every microservice that needs to validate the token must have the secret, meaning a leak in any downstream service compromises the entire system. RS256 uses an asymmetric key pair: the Auth server signs tokens with a Private Key, and all downstream microservices verify tokens using only the Public Key, preventing downstream services from forging tokens."
      }
    ],
    followUpQuestions: [
      "How do you enforce immediate logout across all microservices when access tokens are stateless and valid for 15 minutes?",
      "Why is Argon2id preferred over BCrypt and PBKDF2 for password hashing in enterprise fintech systems?"
    ],
    quickRevision: [
      "Access tokens should be short-lived (10–15 minutes), stateless, and verified via public key.",
      "Refresh tokens are long-lived (7 days), single-use, and rotated on every refresh.",
      "Tokens are grouped by a unique 'familyId' per login session.",
      "Replaying an already-used refresh token indicates compromise and revokes the entire family.",
      "Always store refresh tokens hashed (e.g. SHA-256) in storage.",
      "Store client tokens in HttpOnly, Secure, SameSite=Strict cookies to eliminate XSS theft."
    ],
    relatedTopics: ["Spring Security Filter Chain", "OAuth2 & OpenID Connect", "Argon2id Password Hashing", "Web Application Security"]
  },
  {
    topicSlug: "cls-asynclocalstorage-multitenancy",
    order: 1,
    title: "Multi-Tenant Architecture with CLS (AsyncLocalStorage) in NestJS",
    slug: "cls-asynclocalstorage-multitenancy-deepdive",
    summary: "Complete design for multi-tenant SaaS: resolving tenant identity via subdomain, JWT, or custom header, propagating tenant context across asynchronous call chains using Node.js AsyncLocalStorage (CLS), and enforcing tenant isolation in Prisma ORM queries.",
    whyExists: "In enterprise SaaS (e.g. WealthServ 2.0 AIF/PMS onboarding), passing `tenantId` manually through every controller, service, repository, and queue handler leads to fragile parameter drilling, high bug risk, and potential catastrophic cross-tenant data leakage. Continuation-Local Storage (CLS) transparently binds tenant context to the asynchronous execution tree.",
    howItWorks: `1. **Tenant Resolution Middleware / Guard**:
   - Inspects incoming HTTP request: Subdomain (e.g., \`acme.wealthserv.com\`), or Header (\`x-tenant-id\`), or decoded JWT claims (\`req.user.tenantId\`).
   - Validates that the tenant exists, is active, and the authenticated user has access to it.
2. **Context Binding via AsyncLocalStorage**:
   - Node.js \`AsyncLocalStorage.run({ tenantId, userId, correlationId }, () => next())\` encapsulates the entire asynchronous request lifecycle.
   - Any nested async function, service, or repository can call \`TenantContext.getTenantId()\` without receiving it as an argument.
3. **ORM Tenant Isolation (Prisma Middleware / Client Extensions)**:
   - A Prisma client extension intercepts all \`findMany\`, \`findUnique\`, \`create\`, \`update\`, and \`delete\` queries.
   - Automatically injects \`where: { tenantId }\` into query predicates.
   - Guarantees that even if a developer writes \`prisma.investor.findMany()\`, only the active tenant's records are returned.`,
    internalFlowMermaid: `sequenceDiagram
    autonumber
    participant Request as Client HTTP Request
    participant Middleware as TenantResolutionMiddleware
    participant CLS as AsyncLocalStorage<TenantStore>
    participant Service as InvestorService (Domain Logic)
    participant PrismaExt as Prisma Tenant Extension
    participant DB as PostgreSQL Database

    Request->>Middleware: GET /api/v1/investors [Header: x-tenant-id = "tenant_alpha"]
    Middleware->>Middleware: Validate tenant exists & active
    Middleware->>CLS: storage.run({ tenantId: "tenant_alpha", requestId: "req_12" }, callback)
    activate CLS
    CLS->>Service: findAllInvestors() (No tenantId parameter needed!)
    Service->>PrismaExt: prisma.investor.findMany({ where: { status: "ACTIVE" } })
    PrismaExt->>CLS: getStore().tenantId
    CLS-->>PrismaExt: "tenant_alpha"
    PrismaExt->>DB: SELECT * FROM investors WHERE tenant_id = 'tenant_alpha' AND status = 'ACTIVE'
    DB-->>PrismaExt: [Tenant Alpha Investor Records]
    PrismaExt-->>Service: Filtered Results
    Service-->>CLS: Domain DTOs
    CLS-->>Request: 200 OK Response
    deactivate CLS`,
    fintechExample: "In WealthServ 2.0, multiple Wealth Management Firms (AIFs/PMSs) share the same cloud instance. Firm A (e.g. Barjeel Capital) and Firm B (e.g. Axis Wealth) must never see each other's investor applications, KYC records, or bank statements. CLS tenant isolation ensures complete data separation at the ORM layer while maintaining a unified schema and single deployment pipeline.",
    codeSnippet: `import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

export interface TenantStore {
  tenantId: string;
  userId?: string;
  correlationId: string;
}

export const tenantStorage = new AsyncLocalStorage<TenantStore>();

@Injectable()
export class TenantContextService {
  getTenantId(): string {
    const store = tenantStorage.getStore();
    if (!store?.tenantId) {
      throw new UnauthorizedException('Tenant context not established on current execution thread');
    }
    return store.tenantId;
  }
}

/**
 * Prisma Client Extension enforcing strict multi-tenant row isolation
 */
export function createTenantAwarePrisma(basePrisma: PrismaClient, context: TenantContextService) {
  return basePrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const tenantId = context.getTenantId();

          // Automatically inject tenantId into where clause for read/update/delete operations
          if (['findFirst', 'findMany', 'count', 'update', 'updateMany', 'delete', 'deleteMany'].includes(operation)) {
            args.where = { ...args.where, tenantId };
          }

          // Automatically inject tenantId into create payload
          if (operation === 'create') {
            args.data = { ...args.data, tenantId };
          }

          return query(args);
        },
      },
    },
  });
}`,
    codeLanguage: "typescript",
    codeWalkthrough: `1. \`AsyncLocalStorage<TenantStore>\`: Uses Node.js native V8 async hooks to maintain thread-local-like state across promise chains and callbacks without memory leaks.
2. \`createTenantAwarePrisma\`: Prisma client extension that intercepts all model queries. It acts as a mandatory security filter that developers cannot forget to apply.
3. \`args.where = { ...args.where, tenantId }\`: Enforces query-level tenant isolation, ensuring queries never cross tenant boundaries.`,
    commonMistakes: [
      "Using a shared global singleton variable instead of AsyncLocalStorage in Node.js, causing cross-tenant data leaks when multiple requests execute concurrently.",
      "Losing async context inside third-party callbacks or un-awaited promises that break the async execution tree.",
      "Relying solely on frontend headers for tenant resolution without verifying against the authenticated user's JWT permissions.",
      "Failing to add composite database indexes on \`(tenant_id, id)\` and \`(tenant_id, created_at)\`, degrading database performance under multi-tenant scale."
    ],
    interviewQuestions: [
      {
        question: "What are the trade-offs between Database-per-tenant, Schema-per-tenant, and Shared-schema with Row-Level Security in multi-tenant SaaS?",
        difficulty: "EXPERT",
        idealAnswer: "Database-per-tenant offers maximum isolation and easy compliance/restores, but suffers from high infrastructure costs and complex connection pooling at scale. Schema-per-tenant offers good logical isolation in PostgreSQL, but migration scripts become slow and connection pools are stressed when tenant count exceeds thousands. Shared-schema with Tenant ID column offers lowest cost, highest scalability, and easiest cross-tenant operational analytics, but requires rigorous ORM interceptors or PostgreSQL Row-Level Security (RLS) to prevent accidental data leaks."
      },
      {
        question: "How does Node.js AsyncLocalStorage differ from Java's ThreadLocal?",
        difficulty: "ADVANCED",
        idealAnswer: "Java's ThreadLocal binds variables to the executing OS thread. Since Node.js uses a single-threaded event loop with asynchronous non-blocking I/O, multiple concurrent HTTP requests share the exact same thread. AsyncLocalStorage hooks into the V8 async resource lifecycle (init, before, after, destroy) to propagate context across asynchronous operations (Promises, setTimeout, I/O callbacks) rather than OS thread IDs."
      }
    ],
    followUpQuestions: [
      "How do you handle background jobs (e.g. BullMQ / NATS) where no HTTP request exists to provide the tenant context?",
      "How does PostgreSQL Row-Level Security (RLS) compare with application-level Prisma query extensions for tenant isolation?"
    ],
    quickRevision: [
      "AsyncLocalStorage binds context to async call trees, analogous to ThreadLocal in Java.",
      "Tenant resolution hierarchy: JWT claims -> Subdomain -> Verified custom header.",
      "Always enforce tenant isolation at the ORM / query builder layer using client extensions.",
      "Background queue jobs must explicitly carry tenantId in job payloads and re-hydrate CLS context.",
      "Every multi-tenant database table must include a composite index prefixed with tenant_id."
    ],
    relatedTopics: ["NestJS Request Lifecycle", "Node.js Event Loop", "PostgreSQL Row-Level Security", "Microservices Architecture"]
  }
];
