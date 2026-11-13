# @nodable/entities

Fast, zero-dependency XML/HTML entity encoder and decoder for Node.js.

## Install

```bash
npm install @nodable/entities
```

## Quick start

```js
import { EntityEncoder, EntityDecoder, ALL_ENTITIES } from '@nodable/entities';

// Encode: plain text → entity references
// v3 requires an explicit entity set when encoding named (non‑ASCII) characters
const enc = new EntityEncoder({ namedEntities: ALL_ENTITIES });
enc.encode('Hello © 2024 & <stuff>');
// → 'Hello &copy; 2024 &amp; &lt;stuff&gt;'

// Decode: entity references → plain text
const dec = new EntityDecoder({ namedEntities: ALL_ENTITIES });
dec.decode('Hello &copy; 2024 &amp; &lt;stuff&gt;');
// → 'Hello © 2024 & <stuff>'
```

If you only need to encode XML‑unsafe characters (`&`, `<`, `>`, `"`, `'`), you can disable named‑entity encoding entirely and avoid importing any entity set:

```js
const enc = new EntityEncoder({ encodeAllNamed: false });
enc.encode('© <stuff>'); // → '© &lt;stuff&gt;'  (copyright stays literal)
```

To encode only a specific subset of characters (e.g. common HTML entities), pass a custom map:

```js
import { EntityEncoder, COMMON_HTML, CURRENCY } from '@nodable/entities';

const enc = new EntityEncoder({ namedEntities: { ...COMMON_HTML, ...CURRENCY } });
enc.encode('Price: 10 © 2024'); // only COMMON_HTML/CURRENCY entities are recognized
```

---

## Migration from v2 to v3

**Breaking change:**  
In v2, `new EntityEncoder()` automatically used the full built‑in entity set to encode non‑ASCII characters (like `©` → `&copy;`). This caused poor tree‑shaking: every consumer paid the cost of the entire entity table, even if they never used it.

In v3, **`EntityEncoder` no longer includes a default entity set**.  
If you pass no options and `encodeAllNamed` is `true` (the default), the constructor will **throw an error**:

```js
const enc = new EntityEncoder(); // throws: "encodeAllNamed is true but no `namedEntities` was provided"
```

### How to update

| What you need | v2 code | v3 code |
|---------------|---------|---------|
| **Full built‑in set** (same as v2) | `new EntityEncoder()` | `import { ALL_ENTITIES } from '@nodable/entities';`<br>`new EntityEncoder({ namedEntities: ALL_ENTITIES })` |
| **Only XML‑unsafe chars** (no named entities) | `new EntityEncoder({ encodeAllNamed: false })` | **Same** – no change |
| **Custom subset** | `new EntityEncoder({ namedEntities: myMap })` | **Same** – but now your map is required for named‑entity encoding |

This change allows bundlers to tree‑shake unused entity categories – you only pay for the characters you actually encode.

### Upgrading step‑by‑step

1. Update to `@nodable/entities@3.0.0`.
2. Find all `new EntityEncoder()` calls in your project.
3. Decide:
   - If you need the full set: import `ALL_ENTITIES` and pass it as `namedEntities`.
   - If you only need XML‑unsafe escaping: add `{ encodeAllNamed: false }`.
   - If you used a custom set: keep it as‑is – it already worked.
4. Run your tests – the encoder should now behave as before, but with better bundle size.

## Performance

|  | encode | decode |
|---|---|---|
| `entities` (npm) | 3.65 M req/s | 1.76 M req/s |
| `@nodable/entities` | 3.33 M req/s | **5.19 M req/s** |

## Documentation

- [EntityEncoder](docs/EntityEncoder.md) — options, API, recipes
- [EntityDecoder](docs/EntityDecoder.md) — options, API, security limits, entity sets

## License

MIT