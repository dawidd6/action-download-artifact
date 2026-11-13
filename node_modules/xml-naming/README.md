# xml-naming
[![xml-naming downloads](https://img.shields.io/npm/dw/xml-naming.svg)](https://npm-compare.com/xml-naming) 
[![xml-naming version](https://img.shields.io/npm/v/xml-naming.svg)](https://www.npmjs.com/package/xml-naming)
[![xml-naming license](https://img.shields.io/npm/l/xml-naming.svg)](https://github.com/NaturalIntelligence/xml-naming)

Validates XML name productions as defined in the [XML 1.0](https://www.w3.org/TR/xml/) and [XML 1.1](https://www.w3.org/TR/xml11/) specifications.

Covers all five productions:

| Production | Description | Colon | Digit/hyphen start |
|---|---|---|---|
| `Name` | General XML name | ✅ | ❌ |
| `NCName` | Non-Colonized name | ❌ | ❌ |
| `QName` | Namespace-qualified name (`prefix:local`) | ✅ (one only) | ❌ |
| `NMToken` | Name token (relaxed start) | ✅ | ✅ |
| `NMTokens` | Whitespace-separated NMToken list | ✅ | ✅ |

Used internally by [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser), [fast-xml-validator](https://github.com/NaturalIntelligence/fast-xml-validator), [@nodable\flexible-xml-parser](https://github.com/nodable/flexible-xml-parser)  and [fast-svg-parser](https://github.com/amitguptagwl/fast-svg-parser).

---

## Install

```bash
npm install xml-naming
```

---

## Usage

### Boolean validators

```js
import { name, ncName, qName, nmToken, nmTokens } from 'xml-naming';

// Name — colon allowed anywhere, used for DOCTYPE entity names
name('foo')          // true
name('a:b:c')        // true  ← multiple colons fine for Name
name('1foo')         // false ← digit start invalid

// NCName — no colon, used for SVG id attributes, namespace prefixes
ncName('my-id')      // true
ncName('xlink:href') // false ← colon not allowed

// QName — exactly one colon as prefix separator, used for element/attribute names
qName('svg:circle')  // true
qName('foo')         // true  ← unprefixed QName is valid
qName('a:b:c')       // false ← only one colon allowed
qName(':foo')        // false ← cannot start with colon

// NMToken — any NameChar at start, used for DTD NMTOKEN attributes
nmToken('123')       // true  ← digit start is fine
nmToken('-bar')      // true
nmToken('foo bar')   // false ← space not allowed

// NMTokens — whitespace-separated NMToken list
nmTokens('tok1 tok2 -foo 123')  // true
```

### XML version option

All validators accept an optional `{ xmlVersion }` option:

```js
import { name } from 'xml-naming';

name('\u0085', { xmlVersion: '1.0' })  // false — NEL (Next Line), not in 1.0 ranges
name('\u0085', { xmlVersion: '1.1' })  // true  — explicitly allowed in 1.1

name('\uD800\uDC00', { xmlVersion: '1.0' })  // false
name('\uD800\uDC00', { xmlVersion: '1.1' })  // true
```

---

### ASCII-only fast path

All validators, `validate`, `validateAll`, and `sanitize` also accept `{ asciiOnly: true }`.
When set, matching is restricted to the ASCII subset of the NameStartChar/NameChar
productions and skips unicode-aware regex matching entirely — no `\u00C0-\uFFFD`-style
ranges, and (for XML 1.1) no `/u` regex flag. Unicode-aware regexes are measurably slower
than plain ASCII matching in JS engines, so this is a real performance win when you know
your input is ASCII-only, which is the common case for HTML/SVG ids and most XML tags.

**This is opt-in and defaults to `false`** for backward compatibility: turning it on
changes behavior, since it rejects legitimate non-ASCII XML names that would otherwise be
valid. Only enable it when you control the input and know it's ASCII (e.g. internal
identifiers, machine-generated names), not for validating arbitrary user- or
externally-supplied XML/SVG content.

```js
import { name, sanitize } from 'xml-naming';

name('café', { asciiOnly: true })   // false — 'é' is not ASCII, even though it's
name('café')                        //  true    a valid XML 1.0/1.1 NameChar

sanitize('café', 'name', { asciiOnly: true })  // 'caf_' — non-ASCII replaced too
sanitize('café', 'name')                       // 'café' — left untouched by default
```

---

### Memoized validator (`createValidator`)

Real documents tend to reuse a small vocabulary of tag/attribute names across many
siblings (`id`, `class`, `href`, ... repeated across hundreds of elements). Calling the
plain boolean validators re-runs the regex on every call, even for names seen before.

`createValidator(production, opts)` returns a memoized validator function: `xmlVersion`
and `asciiOnly` are fixed at creation time (so the regex is resolved once, not per call),
and repeated inputs after the first are served from an internal cache instead of
re-matching the regex.

```js
import { createValidator } from 'xml-naming';

const isQName = createValidator('qName', { xmlVersion: '1.0' });

isQName('sku');   // false → regex test (cache miss), result cached
isQName('sku');   // false → cache hit, no regex run
```

Use one instance per document/parse (or reuse across a session — your choice), rather
than creating one per call:

```js
// e.g. inside a parser, once per parse call:
const isValidTag = createValidator('qName', { asciiOnly: true });

for (const tagName of tagNames) {
  if (!isValidTag(tagName)) throw new Error(`Invalid tag name: ${tagName}`);
}
```

Because the validator is a plain function, this loop already gets short-circuit
behaviour (via `break`/`throw` on first failure) and zero extra allocation on the happy
path — no separate "bulk" API is needed for that.

**Cache bound:** the internal cache is capped by `maxCacheSize` (default `2048`). Once
the cap is reached, new distinct strings are still validated correctly, they're just no
longer cached — existing cached entries keep being served. This keeps memory bounded
even against high-cardinality or adversarial input (e.g. externally-supplied names that
never repeat), without the cost of a full LRU or the perf cliff of reset-and-refill.

Call `.reset()` on the returned function to clear the cache manually, e.g. between
unrelated parse calls if you're reusing one validator instance across a long-running
process:

```js
isQName.reset();
```

The cache is private to each `createValidator()` instance — there's no shared/global
cache, so unrelated callers never interfere with each other.

---

### Diagnostic validation

```js
import { validate } from 'xml-naming';

validate('svg:circle', 'qName')
// { valid: true, production: 'qName', input: 'svg:circle' }

validate('1foo', 'ncName')
// {
//   valid: false,
//   production: 'ncName',
//   input: '1foo',
//   reason: 'First character "1" is not a valid NameStartChar',
//   position: 0
// }

validate('foo:bar', 'ncName')
// {
//   valid: false,
//   production: 'ncName',
//   input: 'foo:bar',
//   reason: 'Colon is not allowed in NCName',
//   position: 3
// }

validate('a:b:c', 'qName')
// {
//   valid: false,
//   production: 'qName',
//   input: 'a:b:c',
//   reason: 'QName can have at most one colon',
//   position: 3
// }
```

---

### Batch validation

```js
import { validateAll } from 'xml-naming';

validateAll(['svg', 'circle', '123bad', 'xlink:href'], 'ncName')
// [
//   { valid: true,  production: 'ncName', input: 'svg' },
//   { valid: true,  production: 'ncName', input: 'circle' },
//   { valid: false, production: 'ncName', input: '123bad',    reason: '...', position: 0 },
//   { valid: false, production: 'ncName', input: 'xlink:href',reason: '...', position: 5 }
// ]
```

---

### Sanitize / auto-fix

Useful when generating XML/SVG programmatically from user-supplied strings:

```js
import { sanitize } from 'xml-naming';

sanitize('123abc',    'ncName')  // '_123abc'   ← digit start fixed
sanitize('my element','name')   // 'my_element' ← space replaced
sanitize('foo:bar',   'ncName') // 'foobar'     ← colon stripped
sanitize('hello!',    'name')   // 'hello_'     ← illegal char replaced

// Custom replacement character
sanitize('my element', 'name', { replacement: '-' })  // 'my-element'
```

---

## Which production should I use?

| Context | Production |
|---|---|
| XML element/attribute names (namespace-aware) | `qName` |
| SVG `id` attribute values | `ncName` |
| Namespace prefix alone | `ncName` |
| DOCTYPE `<!ENTITY name ...>` | `name` |
| DOCTYPE `<!NOTATION name ...>` | `name` |
| DTD `NMTOKEN` attribute values | `nmToken` |
| DTD `NMTOKENS` attribute values | `nmTokens` |

> **Note:** DOCTYPE entity and notation names must use `Name`, not `QName`. Colons carry no namespace meaning in the DTD subset.

---

## API

### `name(str, opts?)` → `boolean`
### `ncName(str, opts?)` → `boolean`
### `qName(str, opts?)` → `boolean`
### `nmToken(str, opts?)` → `boolean`
### `nmTokens(str, opts?)` → `boolean`

`opts`:
- `xmlVersion`: `'1.0'` (default) | `'1.1'`
- `asciiOnly`: boolean (default `false`) — ASCII-only fast path, see above

### `createValidator(production, opts?)` → memoized `(str) => boolean`, with `.reset()`

`opts`:
- `xmlVersion`: `'1.0'` (default) | `'1.1'`
- `asciiOnly`: boolean (default `false`)
- `maxCacheSize`: number (default `2048`) — cache stops accepting new entries once reached; existing entries keep serving hits

### `validate(str, production, opts?)` → `ValidationResult`

`production`: `'name'` | `'ncName'` | `'qName'` | `'nmToken'` | `'nmTokens'`

`opts`: same as boolean validators (`xmlVersion`, `asciiOnly`)

### `validateAll(strings[], production, opts?)` → `ValidationResult[]`

`opts`: same as `validate`

### `sanitize(str, production?, opts?)` → `string`

`opts`:
- `xmlVersion`: `'1.0'` | `'1.1'`
- `replacement`: string (default `'_'`)
- `asciiOnly`: boolean (default `false`) — also replaces non-ASCII characters, not just XML-illegal ones

---

## License

MIT
