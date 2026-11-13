/**
 * SQL context patterns — high-precision rules only.
 *
 * These rules have very low false-positive risk and are safe to apply to
 * general user text (names, descriptions, search queries, etc.).
 * All patterns are ReDoS-safe — unlike the `sql-injection` npm package
 * which has an active CVE on its own detection regexes.
 *
 * For exhaustive coverage including noisier heuristics (comment sequences,
 * hex literals, stacked queries with semicolons), use 'SQL-STRICT' instead.
 * Apply 'SQL-STRICT' only to strings that are specifically SQL fragments,
 * not to general free-text fields.
 */

const SQL_PATTERNS = [
  {
    id: 'sql-block-comment-open',
    description: 'SQL block comment open: /* ... */ — unusual in legitimate user text',
    pattern: /\/\*/,
  },
  {
    id: 'sql-union-select',
    description: 'UNION SELECT — most common SQL injection aggregation attack',
    pattern: /\bUNION\s{1,20}(?:ALL\s{1,20})?SELECT\b/i,
  },
  {
    id: 'sql-drop-table',
    description: 'DROP TABLE — destructive DDL injection',
    pattern: /\bDROP\s{1,20}TABLE\b/i,
  },
  {
    id: 'sql-drop-database',
    description: 'DROP DATABASE — destructive DDL injection',
    pattern: /\bDROP\s{1,20}DATABASE\b/i,
  },
  {
    id: 'sql-insert-into',
    description: 'INSERT INTO — data injection',
    pattern: /\bINSERT\s{1,20}INTO\b/i,
  },
  {
    id: 'sql-delete-from',
    description: 'DELETE FROM — data deletion injection',
    pattern: /\bDELETE\s{1,20}FROM\b/i,
  },
  {
    id: 'sql-update-set',
    description: 'UPDATE ... SET — data modification injection',
    // Allows arbitrary content between UPDATE and SET (table name, alias, etc.)
    pattern: /\bUPDATE\b[\s\S]{1,60}\bSET\b/i,
  },
  {
    id: 'sql-exec-xp',
    description: 'EXEC xp_ — MSSQL extended stored procedure execution',
    pattern: /\bEXEC(?:UTE)?\s{1,20}xp_/i,
  },
  {
    id: 'sql-tautology-string',
    description: "Classic string tautology: ' OR '1'='1 or \" OR \"1\"=\"1\"",
    // Last quote is optional — injection may truncate it: ' OR '1'='1--
    pattern: /'\s{0,10}OR\s{0,10}'[^']{0,20}'\s*=\s*'[^']{0,20}/i,
  },
  {
    id: 'sql-tautology-numeric',
    description: 'Numeric tautology: OR 1=1',
    pattern: /\bOR\s{1,10}1\s*=\s*1\b/i,
  },
  {
    id: 'sql-always-true-zero',
    description: 'Numeric tautology: OR 0=0',
    pattern: /\bOR\s{1,10}0\s*=\s*0\b/i,
  },
  {
    id: 'sql-sleep-benchmark',
    description: 'Time-based blind injection: SLEEP() or BENCHMARK()',
    pattern: /\b(?:SLEEP|BENCHMARK)\s*\(/i,
  },
  {
    id: 'sql-waitfor-delay',
    description: 'MSSQL time-based blind injection: WAITFOR DELAY',
    pattern: /\bWAITFOR\s{1,20}DELAY\b/i,
  },
  {
    id: 'sql-char-function',
    description: 'CHAR() function — used to obfuscate injected strings',
    pattern: /\bCHAR\s*\(\s*\d{1,3}/i,
  },
  {
    id: 'sql-information-schema',
    description: 'INFORMATION_SCHEMA — reconnaissance query for table/column enumeration',
    pattern: /\bINFORMATION_SCHEMA\b/i,
  },
];

export default SQL_PATTERNS;
