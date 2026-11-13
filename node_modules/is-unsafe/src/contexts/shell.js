/**
 * SHELL context patterns.
 *
 * Detects shell injection vectors and path traversal patterns.
 * Designed for use when a string will be passed to a shell command,
 * used as a file path, or interpolated into OS-level operations.
 */

const SHELL_PATTERNS = [
  {
    id: 'shell-path-traversal-unix',
    description: 'Unix path traversal: ../  — climbing the directory tree',
    pattern: /\.\.\//,
  },
  {
    id: 'shell-path-traversal-windows',
    description: 'Windows path traversal: ..\\ — climbing the directory tree',
    pattern: /\.\.\\/,
  },
  {
    id: 'shell-path-traversal-encoded',
    description: 'URL-encoded path traversal: %2e%2e or %2f variants',
    pattern: /%2e%2e|%2f\.\.|\.\.%2f/i,
  },
  {
    id: 'shell-null-byte',
    description: 'Null byte injection: \\x00 or %00 — truncates strings in C-backed functions',
    pattern: /\x00|%00/,
  },
  {
    id: 'shell-semicolon',
    description: 'Semicolon command separator: cmd1; cmd2',
    pattern: /;/,
  },
  {
    id: 'shell-pipe',
    description: 'Pipe operator: cmd1 | cmd2',
    pattern: /\|/,
  },
  {
    id: 'shell-and-operator',
    description: 'AND operator: cmd1 && cmd2',
    pattern: /&&/,
  },
  {
    id: 'shell-or-operator',
    description: 'OR operator: cmd1 || cmd2',
    pattern: /\|\|/,
  },
  {
    id: 'shell-backtick',
    description: 'Backtick command substitution: `cmd`',
    pattern: /`/,
  },
  {
    id: 'shell-dollar-paren',
    description: 'Dollar-paren command substitution: $(cmd)',
    pattern: /\$\(/,
  },
  {
    id: 'shell-dollar-brace',
    description: 'Dollar-brace variable expansion: ${var} — can be abused for injection',
    pattern: /\$\{/,
  },
  {
    id: 'shell-redirect-out',
    description: 'Output redirection: cmd > file or cmd >> file',
    pattern: />{1,2}/,
  },
  {
    id: 'shell-redirect-in',
    description: 'Input redirection: cmd < file',
    pattern: /</,
  },
  {
    id: 'shell-newline-injection',
    description: 'Newline injection: \\n or \\r — can inject new shell commands',
    pattern: /[\n\r]/,
  },
  {
    id: 'shell-glob-star',
    description: 'Glob expansion: * or ? — can expand to unintended files',
    // Only flag when combined with path separators to reduce false positives
    pattern: /[/\\][*?]/,
  },
  {
    id: 'shell-absolute-root',
    description: 'Absolute root path injection: string starting with / or \\ (Windows UNC)',
    pattern: /^(?:\/|\\\\)/,
  },
  {
    id: 'shell-windows-drive',
    description: 'Windows drive letter path injection: C:\\ or D:/',
    pattern: /^[a-zA-Z]:[/\\]/,
  },
  {
    id: 'shell-curl-wget',
    description: 'curl/wget with URL or flags — can exfiltrate data or download payloads',
    // Require a URL scheme (http/https/ftp) or a flag (-) to reduce false positives
    // "curl is a tool" won't match; "curl http://..." or "curl -s ..." will
    pattern: /\b(?:curl|wget)\s+(?:https?:\/\/|ftp:\/\/|-)/i,
  },
];

export default SHELL_PATTERNS;
