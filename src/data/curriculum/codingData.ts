export interface CodingProblemData {
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  description: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
  starterCodeJava: string;
  starterCodeTs: string;
  starterCodeSql: string;
  testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
  optimalSolution: string;
  timeComplexity: string;
  spaceComplexity: string;
}

export const SEED_CODING_PROBLEMS: CodingProblemData[] = [
  {
    title: "LRU Cache with TTL Eviction",
    slug: "lru-cache-with-ttl",
    difficulty: "HARD",
    description: `Design and implement a thread-safe Least Recently Used (LRU) Cache supporting Time-To-Live (TTL) expiration per key, commonly used in financial token caching and investor profile caches.
Implement the class:
- \`LRUCache(int capacity)\`: Initialize the cache with maximum capacity.
- \`int get(int key)\`: Return value of key if it exists and has not expired; otherwise return -1. Accessing a key refreshes its recency.
- \`void put(int key, int value, long ttlMillis)\`: Set or insert key/value with expiration. If keys exceed capacity, evict the least recently used unexpired item.`,
    constraints: `1 <= capacity <= 1000\n0 <= key <= 10^5\n0 <= value <= 10^6\n1 <= ttlMillis <= 10^7\nAt most 2 * 10^5 calls to get and put.`,
    sampleInput: `["LRUCache", "put", "put", "get", "put", "get"]\n[[2], [1, 10, 5000], [2, 20, 5000], [1], [3, 30, 5000], [2]]`,
    sampleOutput: `[null, null, null, 10, null, -1]`,
    starterCodeJava: `class LRUCache {\n    public LRUCache(int capacity) {\n        // Your code here\n    }\n    \n    public int get(int key) {\n        return -1;\n    }\n    \n    public void put(int key, int value, long ttlMillis) {\n        // Your code here\n    }\n}`,
    starterCodeTs: `class LRUCache {\n  constructor(capacity: number) {}\n  get(key: number): number { return -1; }\n  put(key: number, value: number, ttlMillis: number): void {}\n}`,
    starterCodeSql: `-- N/A for this problem`,
    testCases: [
      { input: "LRUCache(2); put(1, 10, 10000); put(2, 20, 10000); get(1);", expectedOutput: "10", isHidden: false },
      { input: "put(3, 30, 10000); get(2);", expectedOutput: "-1", isHidden: false },
      { input: "put(4, 40, 10000); get(1);", expectedOutput: "-1", isHidden: true }
    ],
    optimalSolution: `Use a Doubly-Linked List + HashMap<Integer, Node> combined with a PriorityQueue or timestamp verification. HashMap gives O(1) lookup. Doubly-linked list allows O(1) removal and moving accessed nodes to the head. Before returning from get(), check if System.currentTimeMillis() > node.expiry; if expired, remove node immediately and return -1.`,
    timeComplexity: "O(1) for both get and put operations",
    spaceComplexity: "O(capacity) space in memory"
  },
  {
    title: "Investor Portfolio Running Balance & Lead/Lag",
    slug: "sql-investor-running-balance",
    difficulty: "MEDIUM",
    description: `Given an investor transactions table \`transactions (id, investor_id, amount, transaction_date, type)\`, write an optimized SQL query that calculates:
1. The running cumulative portfolio balance for each investor ordered by transaction_date.
2. The previous transaction amount using LAG().
3. The percentage change between current and previous transaction.`,
    constraints: `Table contains up to 5,000,000 rows. Query must use window functions and execute within 200ms using composite index on (investor_id, transaction_date).`,
    sampleInput: `SELECT * FROM transactions WHERE investor_id = 'INV_001';`,
    sampleOutput: `investor_id | transaction_date | amount | running_balance | prev_amount | pct_change`,
    starterCodeJava: `// N/A for SQL problem`,
    starterCodeTs: `// N/A for SQL problem`,
    starterCodeSql: `SELECT \n    investor_id,\n    transaction_date,\n    amount,\n    -- Calculate running balance here\n    -- Calculate prev_amount here\nFROM transactions\nORDER BY investor_id, transaction_date;`,
    testCases: [
      { input: "Transactions for INV_001: [+10000, +5000, -2000]", expectedOutput: "Running balances: [10000, 15000, 13000]", isHidden: false },
      { input: "Transactions for INV_002: [+50000, +25000]", expectedOutput: "Running balances: [50000, 75000]", isHidden: true }
    ],
    optimalSolution: `SELECT \n    investor_id,\n    transaction_date,\n    amount,\n    SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE -amount END) \n        OVER (PARTITION BY investor_id ORDER BY transaction_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_balance,\n    LAG(amount, 1) OVER (PARTITION BY investor_id ORDER BY transaction_date) AS prev_amount,\n    ROUND(100.0 * (amount - LAG(amount, 1) OVER (PARTITION BY investor_id ORDER BY transaction_date)) / NULLIF(LAG(amount, 1) OVER (PARTITION BY investor_id ORDER BY transaction_date), 0), 2) AS pct_change\nFROM transactions\nORDER BY investor_id, transaction_date;`,
    timeComplexity: "O(N log N) dominated by window sort; O(N) when index (investor_id, transaction_date) is present",
    spaceComplexity: "O(1) auxiliary memory using streaming window buffers"
  }
];
