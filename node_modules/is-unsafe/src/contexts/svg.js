/**
 * SVG context patterns.
 *
 * SVG is XML-based but renders in browsers, giving it a unique attack surface
 * that combines XML parser behaviour with browser rendering and JavaScript execution.
 *
 * Many of these vectors bypass HTML sanitizers that don't understand SVG semantics
 * (DOMPurify has documented bypass vulnerabilities specifically in SVG/XML context).
 */

const SVG_PATTERNS = [
  {
    id: 'svg-script-element',
    description: '<script element inside SVG executes JavaScript',
    pattern: /<script[\s>/]/i,
  },
  {
    id: 'svg-xlink-href-javascript',
    description: 'xlink:href with javascript: — classic SVG XSS via <a> or <use>',
    pattern: /xlink\s*:\s*href\s*=\s*["']?\s*javascript\s*:/i,
  },
  {
    id: 'svg-href-javascript',
    description: 'href= with javascript: in SVG context (<a>, <animate>, etc.)',
    pattern: /href\s*=\s*["']?\s*javascript\s*:/i,
  },
  {
    id: 'svg-foreignobject',
    description: '<foreignObject embeds HTML inside SVG — can execute scripts',
    pattern: /<foreignObject[\s>/]/i,
  },
  {
    id: 'svg-use-external',
    description: '<use xlink:href or href pointing to external resource (non-fragment URL)',
    // Match <use with href= where the value starts with a non-# character (external URL)
    // [\"'][^#] catches quoted values not starting with #; [^\"'#\s>] catches unquoted
    pattern: /<use[\s\S]{0,60}(?:xlink\s*:\s*)?href\s*=\s*(?:["'][^#]|[^"'#\s>])/i,
  },
  {
    id: 'svg-animate-href',
    description: '<animate attributeName="href" — can dynamically change href to javascript:',
    pattern: /<animate[\s\S]{0,80}attributeName\s*=\s*["'][\s]*href["']/i,
  },
  {
    id: 'svg-animate-xlinkhref',
    description: '<animate attributeName="xlink:href"',
    pattern: /<animate[\s\S]{0,80}attributeName\s*=\s*["'][\s]*xlink\s*:\s*href["']/i,
  },
  {
    id: 'svg-set-javascript',
    description: '<set to="javascript:..." — sets an attribute to a javascript: URI',
    pattern: /<set[\s\S]{0,80}to\s*=\s*["']?\s*javascript\s*:/i,
  },
  {
    id: 'svg-event-handler',
    description: 'SVG-specific event handler attributes: onload=, onerror=, onactivate=, etc.',
    pattern: /\bon(?:load|error|activate|begin|end|repeat|focus|blur|click|mouse\w{1,20}|key\w{1,20})\s*=/i,
  },
  {
    id: 'svg-handler-generic',
    description: 'Generic on* handler catch-all for SVG attributes',
    pattern: /\bon\w{1,30}\s*=/i,
  },
  {
    id: 'svg-filter-feimage',
    description: '<feImage href= — filter primitive that can load external resources',
    pattern: /<feImage[\s\S]{0,80}(?:xlink\s*:\s*)?href\s*=/i,
  },
  {
    id: 'svg-image-external',
    description: '<image xlink:href with http/https or javascript protocol',
    pattern: /<image[\s\S]{0,80}(?:xlink\s*:\s*)?href\s*=\s*["']?\s*(?:https?|javascript)\s*:/i,
  },
  {
    id: 'svg-style-javascript',
    description: 'style= attribute containing javascript: (e.g. background:url(javascript:...))',
    pattern: /style\s*=[\s\S]{0,60}javascript\s*:/i,
  },
];

export default SVG_PATTERNS;
