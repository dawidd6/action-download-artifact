# xml-naming

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

### `validate(str, production, opts?)` → `ValidationResult`

`production`: `'name'` | `'ncName'` | `'qName'` | `'nmToken'` | `'nmTokens'`

### `validateAll(strings[], production, opts?)` → `ValidationResult[]`

### `sanitize(str, production?, opts?)` → `string`

`opts`:
- `xmlVersion`: `'1.0'` | `'1.1'`
- `replacement`: string (default `'_'`)

---

## License

MIT