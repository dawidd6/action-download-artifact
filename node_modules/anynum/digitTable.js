/**
 * Flat lookup table: maps Unicode code point → ASCII digit (0-9).
 * Only decimal digit characters (Unicode category Nd) are included.
 *
 * Strategy: Int32Array of size (maxCodePoint - minCodePoint + 1).
 * Value 0xFF means "not a digit". Value 0-9 is the ASCII digit value.
 * This gives O(1) lookup with no branching, no bisect, no loop.
 *
 * Memory: range is 0x0660 to 0x1FBF0 → ~129,936 entries × 1 byte = ~127 KB.
 * Acceptable for a one-time init; lookup is a single array index.
 */

// All known Unicode Nd (decimal digit) script zero code points.
// Each script has exactly 10 consecutive digits: zero+0 .. zero+9.
const SCRIPT_ZEROS = [
  // Basic Latin (ASCII) — included for completeness / pass-through
  0x0030, // 0-9

  // Arabic scripts
  0x0660, // Arabic-Indic ٠١٢٣٤٥٦٧٨٩
  0x06F0, // Extended Arabic-Indic (Urdu/Persian/Sindhi) ۰۱۲۳

  // Indic scripts
  0x0966, // Devanagari ०१२३४५६७८९
  0x09E6, // Bengali ০১২৩৪৫৬৭৮৯
  0x0A66, // Gurmukhi ੦੧੨੩੪੫੬੭੮੯
  0x0AE6, // Gujarati ૦૧૨૩૪૫૬૭૮૯
  0x0B66, // Odia ୦୧୨୩୪୫୬୭୮୯
  0x0BE6, // Tamil ௦௧௨௩௪௫௬௭௮௯
  0x0C66, // Telugu ౦౧౨౩౪౫౬౭౮౯
  0x0CE6, // Kannada ೦೧೨೩೪೫೬೭೮೯
  0x0D66, // Malayalam ൦൧൨൩൪൫൬൭൮൯
  0x0DE6, // Sinhala Archaic ෦෧෨෩෪෫෬෭෮෯

  // Southeast Asian scripts
  0x0E50, // Thai ๐๑๒๓๔๕๖๗๘๙
  0x0ED0, // Lao ໐໑໒໓໔໕໖໗໘໙
  0x0F20, // Tibetan ༠༡༢༣༤༥༦༧༨༩
  0x1040, // Myanmar ၀၁၂၃၄၅၆၇၈၉
  0x1090, // Myanmar Shan ႐႑႒႓႔႕႖႗႘႙
  0x17E0, // Khmer ០១២៣៤៥៦៧៨៩
  0x1810, // Mongolian ᠐᠑᠒᠓᠔᠕᠖᠗᠘᠙
  0x1946, // Limbu ᥆᥇᥈᥉᥊᥋᥌᥍᥎᥏
  0x19D0, // New Tai Lue ᧐᧑᧒᧓᧔᧕᧖᧗᧘᧙
  0x1A80, // Tai Tham Hora ᪀᪁᪂᪃᪄᪅᪆᪇᪈᪉
  0x1A90, // Tai Tham Tham ᪐᪑᪒᪓᪔᪕᪖᪗᪘᪙
  0x1B50, // Balinese ᭐᭑᭒᭓᭔᭕᭖᭗᭘᭙
  0x1BB0, // Sundanese ᮰᮱᮲᮳᮴᮵᮶᮷᮸᮹
  0x1C40, // Lepcha ᱀᱁᱂᱃᱄᱅᱆᱇᱈᱉
  0x1C50, // Ol Chiki ᱐᱑᱒᱓᱔᱕᱖᱗᱘᱙

  // Fullwidth (CJK context)
  0xFF10, // Fullwidth ０１２３４５６７８９

  // Mathematical digit variants (Unicode math block)
  0x1D7CE, // Mathematical Bold
  0x1D7D8, // Mathematical Double-Struck
  0x1D7E2, // Mathematical Sans-Serif
  0x1D7EC, // Mathematical Sans-Serif Bold
  0x1D7F6, // Mathematical Monospace

  // Other scripts
  0x104A0, // Osmanya 𐒠𐒡𐒢𐒣𐒤𐒥𐒦𐒧𐒨𐒩
  0x10D30, // Hanifi Rohingya 𐴰𐴱𐴲𐴳𐴴𐴵𐴶𐴷𐴸𐴹
  0x11066, // Brahmi 𑁦𑁧𑁨𑁩𑁪𑁫𑁬𑁭𑁮𑁯
  0x110F0, // Sora Sompeng 𑃰𑃱𑃲𑃳𑃴𑃵𑃶𑃷𑃸𑃹
  0x11136, // Chakma 𑄶𑄷𑄸𑄹𑄺𑄻𑄼𑄽𑄾𑄿
  0x111D0, // Sharada 𑇐𑇑𑇒𑇓𑇔𑇕𑇖𑇗𑇘𑇙
  0x112F0, // Khudawadi 𑋰𑋱𑋲𑋳𑋴𑋵𑋶𑋷𑋸𑋹
  0x11450, // Newa 𑑐𑑑𑑒𑑓𑑔𑑕𑑖𑑗𑑘𑑙
  0x114D0, // Tirhuta 𑓐𑓑𑓒𑓓𑓔𑓕𑓖𑓗𑓘𑓙
  0x11650, // Modi 𑙐𑙑𑙒𑙓𑙔𑙕𑙖𑙗𑙘𑙙
  0x116C0, // Takri 𑛀𑛁𑛂𑛃𑛄𑛅𑛆𑛇𑛈𑛉
  0x11730, // Ahom 𑜰𑜱𑜲𑜳𑜴𑜵𑜶𑜷𑜸𑜹
  0x118E0, // Warang Citi 𑣠𑣡𑣢𑣣𑣤𑣥𑣦𑣧𑣨𑣩
  0x11950, // Dives Akuru 𑥐𑥑𑥒𑥓𑥔𑥕𑥖𑥗𑥘𑥙
  0x11BF0, // Khitan Small Script 𑯰𑯱𑯲𑯳𑯴𑯵𑯶𑯷𑯸𑯹
  0x11C50, // Bhaiksuki 𑱐𑱑𑱒𑱓𑱔𑱕𑱖𑱗𑱘𑱙
  0x11D50, // Masaram Gondi 𑵐𑵑𑵒𑵓𑵔𑵕𑵖𑵗𑵘𑵙
  0x11DA0, // Gunjala Gondi 𑶠𑶡𑶢𑶣𑶤𑶥𑶦𑶧𑶨𑶩
  0x11F50, // Kawi 𑽐𑽑𑽒𑽓𑽔𑽕𑽖𑽗𑽘𑽙
  0x16A60, // Mro 𖩠𖩡𖩢𖩣𖩤𖩥𖩦𖩧𖩨𖩩
  0x16AC0, // Tangsa 𖫀𖫁𖫂𖫃𖫄𖫅𖫆𖫇𖫈𖫉
  0x16B50, // Pahawh Hmong 𖭐𖭑𖭒𖭓𖭔𖭕𖭖𖭗𖭘𖭙
  0x1E140, // Nyiakeng Puachue Hmong 𞅀𞅁𞅂𞅃𞅄𞅅𞅆𞅇𞅈𞅉
  0x1E2F0, // Wancho 𞋰𞋱𞋲𞋳𞋴𞋵𞋶𞋷𞋸𞋹
  0x1E4F0, // Nag Mundari 𞓰𞓱𞓲𞓳𞓴𞓵𞓶𞓷𞓸𞓹
  0x1E950, // Adlam 𞥐𞥑𞥒𞥓𞥔𞥕𞥖𞥗𞥘𞥙
  0x1FBF0, // Segmented digit symbols 🯰🯱🯲🯳🯴🯵🯶🯷🯸🯹
];

// Build a sparse Map for scripts above 0xFFFF (surrogate-pair range).
// These can't go into a flat Uint8Array indexed by code point efficiently.
const NOT_DIGIT = 0xFF;
const HIGH_MAP = new Map(); // codePoint → digit value (0-9)

const LOW_MAX = 0xFFFF;
const LOW_MIN = 0x0660; // first non-ASCII digit script

// Flat Uint8Array covering 0x0660 .. 0xFFFF
const TABLE_OFFSET = LOW_MIN;
const TABLE_SIZE = LOW_MAX - LOW_MIN + 1;
const TABLE = new Uint8Array(TABLE_SIZE).fill(NOT_DIGIT);

for (const zero of SCRIPT_ZEROS) {
  for (let d = 0; d < 10; d++) {
    const cp = zero + d;
    if (cp <= LOW_MAX) {
      TABLE[cp - TABLE_OFFSET] = d;
    } else {
      HIGH_MAP.set(cp, d);
    }
  }
}

export { TABLE, TABLE_OFFSET, HIGH_MAP, NOT_DIGIT };
