/**
 * LOG context patterns.
 *
 * Detects injection vectors that are dangerous when a string is written
 * to a log file, passed to a logging framework, or interpolated into
 * a log message that will be parsed or displayed.
 *
 * Attack categories:
 *   1. CRLF injection — injects fake log lines by embedding newlines
 *   2. Log4Shell (CVE-2021-44228) — ${jndi:...} triggers JNDI lookup in Log4j
 *   3. SSTI in log templates — {{...}}, #{...} trigger template evaluation
 *      if the log message is passed through a template engine
 *   4. Null byte injection — truncates log entries in some implementations
 *   5. ANSI escape injection — manipulates terminal output when logs are
 *      tailed in a terminal (colour codes, cursor movement, etc.)
 *
 * Note: Newline characters (\n, \r) will produce false positives for
 * multi-line legitimate values. Use this context only for single-line
 * log field values (usernames, IDs, request parameters, etc.).
 */

const LOG_PATTERNS = [
  // ─── CRLF / newline injection ─────────────────────────────────────────────
  {
    id: 'log-crlf-injection',
    description: 'CRLF injection: literal \\r or \\n embeds fake log lines',
    pattern: /[\r\n]/,
  },
  {
    id: 'log-url-encoded-crlf',
    description: 'URL-encoded CRLF: %0d, %0a, %0D, %0A — decoded by some log parsers',
    pattern: /%0[dDaA]/,
  },
  {
    id: 'log-unicode-newline',
    description: 'Unicode newline variants: U+2028 (line separator), U+2029 (paragraph separator)',
    pattern: /[\u2028\u2029]/,
  },

  // ─── Log4Shell / JNDI injection (CVE-2021-44228) ─────────────────────────
  {
    id: 'log-log4shell-jndi',
    description: 'Log4Shell: ${jndi:...} triggers remote code execution in Apache Log4j',
    pattern: /\$\{jndi\s*:/i,
  },
  {
    id: 'log-log4shell-obfuscated',
    description: 'Obfuscated Log4Shell: ${::-j}... lookup-bypass prefix used to evade WAF detection',
    // ${::- is the Log4j lookup-bypass escape sequence; presence alone is suspicious
    pattern: /\$\{::-/,
  },
  {
    id: 'log-log4j-lookup',
    description: 'Log4j lookup syntax: ${env:...}, ${sys:...}, ${ctx:...} — data exfiltration',
    pattern: /\$\{(?:env|sys|ctx|main|map|sd|web|docker|k8s|spring)\s*:/i,
  },

  // ─── Server-Side Template Injection (SSTI) in log messages ───────────────
  {
    id: 'log-ssti-double-brace',
    description: 'SSTI double-brace: {{expression}} — Jinja2, Twig, Handlebars, etc.',
    pattern: /\{\{[\s\S]{0,80}\}\}/,
  },
  {
    id: 'log-ssti-hash-brace',
    description: 'SSTI hash-brace: #{expression} — Thymeleaf, Velocity, Ruby ERB',
    pattern: /#\{[\s\S]{0,80}\}/,
  },
  {
    id: 'log-ssti-dollar-brace',
    description: 'SSTI/EL injection: ${expression with operators or method calls} — JSP EL, Freemarker, SpEL',
    // Require that the ${...} content looks like an expression, not a plain variable name.
    // Flags if the content contains: . ( * + operators, or known SSTI keywords.
    // This avoids flagging ${PATH}, ${HOME} etc. (plain shell variables).
    pattern: /\$\{[^}]*(?:\.|\(|\*|\+|\bclass\b|\bruntime\b|\bprocess\b|\bexec\b)[^}]{0,80}\}/i,
  },
  {
    id: 'log-ssti-percent-tag',
    description: 'SSTI ERB/ASP tag: <%= expression %> — Ruby ERB, ASP',
    pattern: /<%=[\s\S]{0,80}%>/,
  },

  // ─── Null byte ────────────────────────────────────────────────────────────
  {
    id: 'log-null-byte',
    description: 'Null byte: \\x00 or %00 — can truncate log entries in C-backed loggers',
    pattern: /\x00|%00/,
  },

  // ─── ANSI escape injection ────────────────────────────────────────────────
  {
    id: 'log-ansi-escape',
    description: 'ANSI escape sequence: ESC[ — can manipulate terminal output when logs are tailed',
    pattern: /\x1b\[/,
  },
];

export default LOG_PATTERNS;
