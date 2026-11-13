

// String(val)/val.toString() drop the sign of -0 (e.g. String(-0) === '0'), silently
// corrupting a round-tripped negative-zero value. XML has no separate int/float syntax,
// so this is the single place every raw value gets turned into text.
export function valToStr(val) {
  return typeof val === 'number' && Object.is(val, -0) ? '-0' : String(val)
}

export function safeComment(val) {
  return valToStr(val)
    .replace(/--/g, '- -')   // -- is illegal anywhere in comment content
    .replace(/--/g, '- -')   // handle the scenario when 2 consiucative dashes appears 
    .replace(/-$/, '- ');    // trailing - would form -- with the closing -->
}

export function safeCdata(val) {
  return valToStr(val).replace(/\]\]>/g, ']]]]><![CDATA[>')
}

export function escapeAttribute(val) {
  return valToStr(val).replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}