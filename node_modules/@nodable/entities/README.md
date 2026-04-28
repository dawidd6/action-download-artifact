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
const enc = new EntityEncoder();
enc.encode('Hello © 2024 & <stuff>');
// → 'Hello &copy; 2024 &amp; &lt;stuff&gt;'

// Decode: entity references → plain text
const dec = new EntityDecoder({ namedEntities: ALL_ENTITIES });
dec.decode('Hello &copy; 2024 &amp; &lt;stuff&gt;');
// → 'Hello © 2024 & <stuff>'
```

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