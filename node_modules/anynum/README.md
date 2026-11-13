# anynum

Normalize Unicode decimal digits and minus signs to ASCII.

Converts digits from any script — Devanagari, Arabic-Indic, Thai, Bengali, Fullwidth, and [50+ others](#supported-scripts) — to their ASCII equivalents (`0`–`9`). Also normalizes Unicode minus variants (`−`, `－`, `﹣`) to ASCII `-`.

Pairs naturally with [`strnum`](https://github.com/nicolo-ribaudo/strnum) — use `anynum` to normalize first, then `strnum` to detect the numeric type.

```js
import anynum from 'anynum';

anynum('१२.३४')     // → '12.34'   (Devanagari)
anynum('٣٫١٤')     // → '3.14'    (Arabic-Indic)
anynum('−४२')      // → '-42'     (Unicode minus + Devanagari)
anynum('－９９.５') // → '-99.5'   (Fullwidth minus + Fullwidth digits)
anynum('hello')    // → 'hello'   (no digits — zero allocation)
anynum('100')      // → '100'     (already ASCII — zero allocation)
```

---

## Install

```bash
npm install anynum
```

---

## Usage

```js
// ESM
import anynum from 'anynum';
import { anynum } from 'anynum';

```

### API

```ts
anynum(str: string): string
```

- Accepts a `string`, returns a `string`.
- Non-string values are returned as-is (no throw).
- Non-digit characters pass through unchanged.
- If no conversion is needed, the **original string is returned** (zero allocation).

---

## What gets converted

### Decimal digits

Any Unicode character in category `Nd` (decimal digit) is mapped to its ASCII equivalent. This covers all positional decimal digit scripts — every script whose digits represent `0`–`9` by position.

```js
anynum('๑๒๓')   // Thai        → '123'
anynum('੧੨੩')   // Gurmukhi   → '123'
anynum('᠑᠒᠓')   // Mongolian  → '123'
anynum('𝟏𝟐𝟑')   // Math Bold  → '123'
```

### Unicode minus variants

Three Unicode characters are normalized to ASCII `-` (`U+002D`):

| Code point | Character | Name |
|---|---|---|
| `U+2212` | `−` | MINUS SIGN (mathematical) |
| `U+FF0D` | `－` | FULLWIDTH HYPHEN-MINUS |
| `U+FE63` | `﹣` | SMALL HYPHEN-MINUS |

Dashes used for punctuation — EN DASH (`–`), EM DASH (`—`), HYPHEN (`‐`) — are intentionally **not** converted.

```js
anynum('−42')   // U+2212 MINUS SIGN      → '-42'
anynum('－42')  // U+FF0D FULLWIDTH        → '-42'
anynum('–42')   // U+2013 EN DASH          → '–42'  (unchanged)
```

---

## Use with strnum

`anynum` and `strnum` compose cleanly:

```js
import anynum from 'anynum';
import strnum from 'strnum';

strnum(anynum('१२.३४'))   // → 12.34  (number, float)
strnum(anynum('−४२'))     // → '-42'  (string; strnum handles sign detection)
strnum(anynum('hello'))   // → 'hello'
```

---


## Supported scripts

50+ decimal digit scripts from Unicode `Nd` category, including:

| Script | Zero | Sample |
|---|---|---|
| Devanagari (Hindi/Marathi/Nepali) | `U+0966` | `०१२३४५६७८९` |
| Arabic-Indic | `U+0660` | `٠١٢٣٤٥٦٧٨٩` |
| Extended Arabic-Indic (Urdu/Persian) | `U+06F0` | `۰۱۲۳۴۵۶۷۸۹` |
| Bengali | `U+09E6` | `০১২৩৪৫৬৭৮৯` |
| Gurmukhi | `U+0A66` | `੦੧੨੩੪੫੬੭੮੯` |
| Gujarati | `U+0AE6` | `૦૧૨૩૪૫૬૭૮૯` |
| Odia | `U+0B66` | `୦୧୨୩୪୫୬୭୮୯` |
| Tamil | `U+0BE6` | `௦௧௨௩௪௫௬௭௮௯` |
| Telugu | `U+0C66` | `౦౧౨౩౪౫౬౭౮౯` |
| Kannada | `U+0CE6` | `೦೧೨೩೪೫೬೭೮೯` |
| Malayalam | `U+0D66` | `൦൧൨൩൪൫൬൭൮൯` |
| Thai | `U+0E50` | `๐๑๒๓๔๕๖๗๘๙` |
| Lao | `U+0ED0` | `໐໑໒໓໔໕໖໗໘໙` |
| Tibetan | `U+0F20` | `༠༡༢༣༤༥༦༧༨༩` |
| Myanmar | `U+1040` | `၀၁၂၃၄၅၆၇၈၉` |
| Khmer | `U+17E0` | `០១២៣៤៥៦៧៨៩` |
| Mongolian | `U+1810` | `᠐᠑᠒᠓᠔᠕᠖᠗᠘᠙` |
| Fullwidth (CJK context) | `U+FF10` | `０１２３４５６７８９` |
| Mathematical Bold | `U+1D7CE` | `𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗` |
| Adlam | `U+1E950` | `𞥐𞥑𞥒𞥓𞥔𞥕𞥖𞥗𞥘𞥙` |
| … and 30+ more | | |

---

## What it does NOT convert

- **Kanji/Chinese numeral words** (`三`, `百`, `万`) — these are ideographic numerals, not decimal digits. Each language has its own positional system requiring separate parsing logic.
- **Roman numerals** (`Ⅳ`, `Ⅻ`) — not decimal digits.
- **Punctuation dashes** (`–` EN, `—` EM, `‐` HYPHEN) — not numeric signs.
- **Decimal separators** — commas, periods, Arabic decimal comma (`٫`) are passed through as-is. Separator normalization is the caller's responsibility.

---

## License

MIT