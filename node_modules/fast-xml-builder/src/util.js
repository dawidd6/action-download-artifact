

export function safeComment(val) {
  return String(val)
    .replace(/--/g, '- -')   // -- is illegal anywhere in comment content
    .replace(/--/g, '- -')   // handle the scenario when 2 consiucative dashes appears 
    .replace(/-$/, '- ');    // trailing - would form -- with the closing -->
}

export function safeCdata(val) {
  return String(val).replace(/\]\]>/g, ']]]]><![CDATA[>')
}

export function escapeAttribute(val) {
  return String(val).replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}