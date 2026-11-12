/**
 * XML context patterns.
 *
 * Detects injection vectors that are specifically dangerous when a string
 * is inserted into an XML document (not HTML rendering context).
 *
 * Key distinction from HTML: these patterns target parser-level attacks —
 * things that can confuse or subvert an XML parser, trigger external entity
 * resolution, or inject DTD content. HTML rendering concerns (XSS) belong
 * in the HTML context.
 */

const XML_PATTERNS = [
  {
    id: 'xml-cdata-injection',
    description: 'CDATA section injection: <![CDATA[ breaks out of text node context',
    pattern: /<!\[CDATA\[/i,
  },
  {
    id: 'xml-cdata-close',
    description: 'CDATA close sequence: ]]> can terminate an enclosing CDATA section',
    pattern: /\]\]>/,
  },
  {
    id: 'xml-processing-instruction',
    description: 'XML processing instruction: <?xml-stylesheet or <?php etc.',
    pattern: /<\?(?:xml[\- ]|php|asp)/i,
  },
  {
    id: 'xml-doctype-injection',
    description: 'DOCTYPE declaration embedded in content — can define entities',
    // Match <!DOCTYPE followed by end-of-string, whitespace, or [ (internal subset)
    pattern: /<!DOCTYPE(?:[\s[]|$)/i,
  },
  {
    id: 'xml-entity-system',
    description: 'SYSTEM keyword — used in external entity declarations (XXE)',
    pattern: /\bSYSTEM\s+["']/i,
  },
  {
    id: 'xml-entity-public',
    description: 'PUBLIC keyword — used in external entity declarations (XXE)',
    pattern: /\bPUBLIC\s+["']/i,
  },
  {
    id: 'xml-entity-declaration',
    description: '<!ENTITY declaration — defines entities, potential XXE or entity expansion',
    pattern: /<!ENTITY[\s%]/i,
  },
  {
    id: 'xml-billion-laughs',
    description: 'Entity reference chaining / billion laughs: repeated &eX; style references',
    // Heuristic: 3+ consecutive entity refs suggests expansion attack
    pattern: /(?:&\w{1,20};){3,}/,
  },
  {
    id: 'xml-namespace-confusion',
    description: 'xmlns: attribute injection — can redefine namespaces to confuse parsers',
    // pattern: /\bxmlns\s*(?::\w{1,40})?\s*=/i,
    pattern: /\bxmlns(?::\w{1,40})?\s*=/i,
  },
  {
    id: 'xml-comment-injection',
    description: '<!-- comment injection — can hide content from some parsers',
    pattern: /<!--/,
  },
  {
    id: 'xml-comment-close',
    description: '--> closes an enclosing XML comment',
    pattern: /-->/,
  },
  {
    id: 'xml-pi-close',
    description: '?> closes an enclosing processing instruction',
    pattern: /\?>/,
  },
];

export default XML_PATTERNS;
