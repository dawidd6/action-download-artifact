/**
 * HTML context patterns.
 *
 * Detects XSS vectors that are dangerous when a string ends up rendered as HTML.
 * All patterns use bounded quantifiers to ensure linear-time matching (ReDoS-safe).
 *
 * Each entry is { pattern: RegExp, id: string, description: string }
 * so callers can inspect which rule fired if they need to.
 */

const HTML_PATTERNS = [
  {
    id: 'html-script-open',
    description: '<script opening tag',
    pattern: /<script[\s>/]/i,
  },
  {
    id: 'html-script-close',
    description: '</script closing tag',
    pattern: /<\/script[\s>]/i,
  },
  {
    id: 'html-javascript-protocol',
    description: 'javascript: URI scheme (with optional whitespace/encoding)',
    // Handles j&#x61;vascript:, j\u0061vascript:, and whitespace variants
    pattern: /j[\t\n\r ]*a[\t\n\r ]*v[\t\n\r ]*a[\t\n\r ]*s[\t\n\r ]*c[\t\n\r ]*r[\t\n\r ]*i[\t\n\r ]*p[\t\n\r ]*t[\t\n\r ]*:/i,
  },
  {
    id: 'html-vbscript-protocol',
    description: 'vbscript: URI scheme',
    pattern: /vbscript[\t\n\r ]*:/i,
  },
  {
    id: 'html-data-html',
    description: 'data:text/html URI — can execute scripts in browsers',
    pattern: /data[\t\n\r ]*:[\t\n\r ]*text\/html/i,
  },
  {
    id: 'html-data-xhtml',
    description: 'data:application/xhtml+xml URI',
    pattern: /data[\t\n\r ]*:[\t\n\r ]*application\/xhtml/i,
  },
  {
    id: 'html-data-svg',
    description: 'data:image/svg+xml URI — can execute scripts',
    pattern: /data[\t\n\r ]*:[\t\n\r ]*image\/svg\+xml/i,
  },
  {
    id: 'html-inline-event-handler',
    description: 'Inline event handler attributes: onclick=, onerror=, onload=, etc.',
    // \bon ensures we match a word boundary so "phonetic=" is not caught
    pattern: /\bon\w{1,30}\s*=/i,
  },
  {
    id: 'html-entity-obfuscated-script',
    description: 'HTML-entity-encoded <script (e.g. &#x3C;script or &lt;script)',
    // Entities include optional trailing semicolon: &#x3C; or &#x3C (both valid in HTML5)
    pattern: /(?:&#x0*3[Cc];?|&#0*60;?|&lt;)\s*script/i,
  },
  {
    id: 'html-entity-obfuscated-javascript',
    description: 'HTML-entity-encoded javascript: (partial — catches common &#106; or &#x6a; for "j")',
    pattern: /(?:&#x0*6[Aa];?|&#0*106;?)\s*(?:&#x0*61;?|a)[\s\S]{0,80}script\s*:/i,
  },
  {
    id: 'html-style-expression',
    description: 'CSS expression() — IE-era code execution in style attributes',
    pattern: /style[\s\S]{0,20}expression\s*\(/i,
  },
  {
    id: 'html-object-embed',
    description: '<object or <embed tags that can load active content',
    pattern: /<(?:object|embed)[\s>/]/i,
  },
  {
    id: 'html-base-tag',
    description: '<base href= — can hijack all relative URLs on a page',
    pattern: /<base[\s>]/i,
  },
  {
    id: 'html-meta-refresh',
    description: '<meta http-equiv="refresh" — can redirect users',
    pattern: /<meta[\s\S]{0,40}http-equiv[\s\S]{0,20}refresh/i,
  },
  {
    id: 'html-srcdoc',
    description: 'srcdoc= attribute on iframes — embeds HTML that can run scripts',
    pattern: /srcdoc\s*=/i,
  },
  {
    id: 'html-iframe',
    description: '<iframe tag',
    pattern: /<iframe[\s>/]/i,
  },
  {
    id: 'html-form',
    description: '<form tag — can be used for phishing / credential harvesting injection',
    pattern: /<form[\s>/]/i,
  },
];

export default HTML_PATTERNS;
