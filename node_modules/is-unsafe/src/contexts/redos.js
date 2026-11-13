/**
 * REDOS context patterns.
 *
 * Detects strings that, if used as regular expressions, could cause
 * catastrophic backtracking (ReDoS — Regular Expression Denial of Service).
 *
 * These patterns detect the structural forms that lead to exponential or
 * polynomial backtracking in NFA-based regex engines (V8, PCRE, Java, etc.).
 *
 * Use this context when user-supplied strings will be compiled into RegExp objects.
 */

const REDOS_PATTERNS = [
  {
    id: 'redos-nested-quantifier-plus',
    description: 'Nested + quantifier inside a group with outer quantifier: (a+)+, (.+b)*, etc.',
    // Matches any group containing a + quantifier, with an outer * or + — catches (a+)+, (.+b)*, etc.
    pattern: /\([^)]*\+[^)]*\)[+*]/,
  },
  {
    id: 'redos-nested-quantifier-star',
    description: 'Nested * quantifier: (a*)* or (a*)+ — catastrophic backtracking',
    pattern: /\([^)]*\*[^)]*\)[*+]/,
  },
  {
    id: 'redos-nested-groups',
    description: 'Doubly nested quantified groups: ((a+)+) — guaranteed catastrophic',
    pattern: /\(\([^)]{0,40}\)[+*]\)[+*]/,
  },
  {
    id: 'redos-alternation-overlap',
    description: 'Overlapping alternation under quantifier: (a|a)+ — ambiguous NFA paths',
    // Detect repeated identical alternatives under a quantifier
    pattern: /\(([^|()]{1,20})\|(?:\1)(?:\|[^|()]{1,20}){0,5}\)[+*?]{1,2}/,
  },
  {
    id: 'redos-star-plus-concat',
    description: '(x*x)+ pattern — triggers super-linear backtracking',
    pattern: /\([^)]{0,10}\*[^)]{0,10}\)[+*]/,
  },
  {
    id: 'redos-dot-star-greedy',
    description: '(.*){n,} or (.+){n,} — repeated greedy dot quantifiers',
    pattern: /\(\.[*+]\)\{?\d/,
  },
  {
    id: 'redos-large-repetition',
    description: 'Very large fixed or range repetition count {1000,} or {1000,n} — denial of service via backtracking',
    // Matches { followed by 4+ digits (≥1000), then optional ,digits }
    pattern: /\{\d{4,}(?:,\d*)?\}/,
  },
  {
    id: 'redos-catastrophic-alternation',
    description: 'Long alternation with many similar branches — polynomial backtracking risk',
    // Heuristic: 10+ pipe-separated alternatives in a single group
    pattern: /\([^)]{0,200}(?:\|[^|)]{0,50}){9,}\)/,
  },
];

export default REDOS_PATTERNS;
