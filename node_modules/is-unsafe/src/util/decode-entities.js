/**
 * Decode the HTML character references that matter for markup-context
 * detection.
 *
 * Browsers decode character references in attribute values before they
 * interpret a URL, so `javascript&#58;alert(1)` in an href is the
 * `javascript:` scheme. The HTML/XML/SVG rules match literal characters, so
 * without this step such payloads slip through.
 *
 * Deliberately NOT a full entity decoder. It decodes only:
 *   - decimal refs  &#58;  &#058;  &#00000058;  &#58   (any leading zeros,
 *                   trailing ; optional — browsers accept both)
 *   - hex refs      &#x3a; &#X3A; &#x0000003a; &#x3a   (same)
 *   - named refs    &colon;  &Tab;  &NewLine;
 *       Named refs are CASE-SENSITIVE and REQUIRE the trailing ';', exactly
 *       like a browser (so `&COLON;` and `&colon` are not decoded).
 *       &Tab; / &NewLine; matter because the URL parser strips tab/newline,
 *       so `java&Tab;script:` is still a javascript: URL.
 *
 * It does NOT decode &amp; (single pass only), so double-encoded text such as
 * "&amp;lt;script&amp;gt;" stays literal — a browser renders that as text.
 *
 * All quantifiers are bounded; no ReDoS risk.
 *
 * @param {string} input
 * @returns {string}
 */
const NAMED = Object.freeze({
  colon: ':',
  Tab: '\t',
  NewLine: '\n',
});

const ENTITY_RE =
  /&(?:#[xX]0*([0-9a-fA-F]{1,6});?|#0*([0-9]{1,7});?|([a-zA-Z][a-zA-Z0-9]{1,15});)/g;

export default function decodeEntities(input) {
  if (input.indexOf('&') === -1) return input;

  return input.replace(ENTITY_RE, (match, hex, dec, name) => {
    if (name !== undefined) {
      return Object.prototype.hasOwnProperty.call(NAMED, name) ? NAMED[name] : match;
    }
    const cp = hex !== undefined ? parseInt(hex, 16) : parseInt(dec, 10);
    if (!Number.isFinite(cp) || cp > 0x10ffff) return match;
    return String.fromCodePoint(cp);
  });
}
