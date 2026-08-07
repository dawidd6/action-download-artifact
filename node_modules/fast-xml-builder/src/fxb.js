'use strict';
//parse Empty Node as self closing node
import buildFromOrderedJs from './orderedJs2Xml.js';
import getIgnoreAttributesFn from "./ignoreAttributes.js";
import { Expression, Matcher } from 'path-expression-matcher';
import { safeComment, safeCdata, escapeAttribute } from './util.js';
import { qName } from 'xml-naming';

const defaultOptions = {
  attributeNamePrefix: '@_',
  attributesGroupName: false,
  textNodeName: '#text',
  ignoreAttributes: true,
  cdataPropName: false,
  format: false,
  indentBy: '  ',
  suppressEmptyNode: false,
  suppressUnpairedNode: true,
  suppressBooleanAttributes: true,
  tagValueProcessor: function (key, a) {
    return a;
  },
  attributeValueProcessor: function (attrName, a) {
    return a;
  },
  preserveOrder: false,
  commentPropName: false,
  unpairedTags: [],
  entities: [
    { regex: new RegExp("&", "g"), val: "&amp;" },//it must be on top
    { regex: new RegExp(">", "g"), val: "&gt;" },
    { regex: new RegExp("<", "g"), val: "&lt;" },
    { regex: new RegExp("\'", "g"), val: "&apos;" },
    { regex: new RegExp("\"", "g"), val: "&quot;" }
  ],
  processEntities: true,
  stopNodes: [],
  // transformTagName: false,
  // transformAttributeName: false,
  oneListGroup: false,
  maxNestedTags: 100,
  jPath: true,  // When true, callbacks receive string jPath; when false, receive Matcher instance
  sanitizeName: false  // false = allow all names as-is (default, backward-compatible).
  // Set to a function (name, { isAttribute, matcher }) => string to
  // validate/sanitize tag and attribute names. Throw inside the function
  // to reject an invalid name.
};

export default function Builder(options) {
  this.options = Object.assign({}, defaultOptions, options);

  // Convert old-style stopNodes for backward compatibility
  // Old syntax: "*.tag" meant "tag anywhere in tree"
  // New syntax: "..tag" means "tag anywhere in tree"
  if (this.options.stopNodes && Array.isArray(this.options.stopNodes)) {
    this.options.stopNodes = this.options.stopNodes.map(node => {
      if (typeof node === 'string' && node.startsWith('*.')) {
        // Convert old wildcard syntax to deep wildcard
        return '..' + node.substring(2);
      }
      return node;
    });
  }

  // Pre-compile stopNode expressions for pattern matching
  this.stopNodeExpressions = [];
  if (this.options.stopNodes && Array.isArray(this.options.stopNodes)) {
    for (let i = 0; i < this.options.stopNodes.length; i++) {
      const node = this.options.stopNodes[i];
      if (typeof node === 'string') {
        this.stopNodeExpressions.push(new Expression(node));
      } else if (node instanceof Expression) {
        this.stopNodeExpressions.push(node);
      }
    }
  }

  if (this.options.ignoreAttributes === true || this.options.attributesGroupName) {
    this.isAttribute = function (/*a*/) {
      return false;
    };
  } else {
    this.ignoreAttributesFn = getIgnoreAttributesFn(this.options.ignoreAttributes)
    this.attrPrefixLen = this.options.attributeNamePrefix.length;
    this.isAttribute = isAttribute;
  }

  this.processTextOrObjNode = processTextOrObjNode

  if (this.options.format) {
    this.indentate = indentate;
    this.tagEndChar = '>\n';
    this.newLine = '\n';
  } else {
    this.indentate = function () {
      return '';
    };
    this.tagEndChar = '>';
    this.newLine = '';
  }
}

/**
 * Detect XML version from the ?xml declaration at the root of a plain-object input.
 * Checks both attributesGroupName and flat attribute forms.
 * Returns '1.0' if no declaration is found.
 */
function detectXmlVersionFromObj(jObj, options) {
  const decl = jObj['?xml'];
  if (decl && typeof decl === 'object') {
    // attributesGroupName path e.g. { '$$': { '@_version': '1.1' } }
    if (options.attributesGroupName && decl[options.attributesGroupName]) {
      const v = decl[options.attributesGroupName][options.attributeNamePrefix + 'version'];
      if (v) return v;
    }
    // flat attribute path e.g. { '@_version': '1.1' }
    const v = decl[options.attributeNamePrefix + 'version'];
    if (v) return v;
  }
  return '1.0';
}

/**
 * Resolve a tag or attribute name through sanitizeName if configured.
 * Validation via xml-naming's qName is performed first; the sanitizeName
 * callback is invoked only when the name is invalid. If sanitizeName is
 * false (default), no validation occurs and the name is used as-is.
 *
 * @param {string}  name        - raw name from the JS object
 * @param {boolean} isAttribute - true when resolving an attribute name
 * @param {object}  options
 * @param {Matcher} matcher     - current matcher state (readonly from callback perspective)
 * @param {string}  xmlVersion  - '1.0' or '1.1', forwarded to xml-naming
 */
function resolveTagName(name, isAttribute, options, matcher, xmlVersion) {
  if (!options.sanitizeName) return name;
  if (qName(name, { xmlVersion })) return name;
  return options.sanitizeName(name, { isAttribute, matcher: matcher.readOnly() });
}

Builder.prototype.build = function (jObj) {
  if (this.options.preserveOrder) {
    return buildFromOrderedJs(jObj, this.options);
  } else {
    if (Array.isArray(jObj) && this.options.arrayNodeName && this.options.arrayNodeName.length > 1) {
      jObj = {
        [this.options.arrayNodeName]: jObj
      }
    }
    // Initialize matcher for path tracking
    const matcher = new Matcher();
    const xmlVersion = detectXmlVersionFromObj(jObj, this.options);
    return this.j2x(jObj, 0, matcher, xmlVersion).val;
  }
};

Builder.prototype.j2x = function (jObj, level, matcher, xmlVersion) {
  let attrStr = '';
  let val = '';
  if (this.options.maxNestedTags && matcher.getDepth() >= this.options.maxNestedTags) {
    throw new Error("Maximum nested tags exceeded");
  }
  // Get jPath based on option: string for backward compatibility, or Matcher for new features
  const jPath = this.options.jPath ? matcher.toString() : matcher;

  // Check if current node is a stopNode (will be used for attribute encoding)
  const isCurrentStopNode = this.checkStopNode(matcher);

  for (let key in jObj) {
    if (!Object.prototype.hasOwnProperty.call(jObj, key)) continue;

    // Resolve the key through sanitizeName before any use.
    // Special keys (textNodeName, cdataPropName, commentPropName, attributeNamePrefix,
    // attributesGroupName, "?" PI tags) are exempt — they are builder-internal conventions,
    // not user-supplied XML names.
    const isSpecialKey = key === this.options.textNodeName
      || key === this.options.cdataPropName
      || key === this.options.commentPropName
      || (this.options.attributesGroupName && key === this.options.attributesGroupName)
      || this.isAttribute(key)
      || key[0] === '?';

    const resolvedKey = isSpecialKey
      ? key
      : resolveTagName(key, false, this.options, matcher, xmlVersion);

    if (typeof jObj[key] === 'undefined') {
      // supress undefined node only if it is not an attribute
      if (this.isAttribute(key)) {
        val += '';
      }
    } else if (jObj[key] === null) {
      // null attribute should be ignored by the attribute list, but should not cause the tag closing
      if (this.isAttribute(key)) {
        val += '';
      } else if (resolvedKey === this.options.cdataPropName || resolvedKey === this.options.commentPropName) {
        val += '';
      } else if (resolvedKey[0] === '?') {
        val += this.indentate(level) + '<' + resolvedKey + '?' + this.tagEndChar;
      } else {
        val += this.indentate(level) + '<' + resolvedKey + '/' + this.tagEndChar;
      }
    } else if (jObj[key] instanceof Date) {
      val += this.buildTextValNode(jObj[key], resolvedKey, '', level, matcher);
    } else if (typeof jObj[key] !== 'object') {
      //premitive type
      const attr = this.isAttribute(key);
      if (attr && !this.ignoreAttributesFn(attr, jPath)) {
        // Resolve the attribute name through sanitizeName
        const resolvedAttr = resolveTagName(attr, true, this.options, matcher, xmlVersion);
        attrStr += this.buildAttrPairStr(resolvedAttr, '' + jObj[key], isCurrentStopNode);
      } else if (!attr) {
        //tag value
        if (key === this.options.textNodeName) {
          let newval = this.options.tagValueProcessor(key, '' + jObj[key]);
          val += this.replaceEntitiesValue(newval);
        } else {
          // Check if this is a stopNode before building
          matcher.push(resolvedKey);
          const isStopNode = this.checkStopNode(matcher);
          matcher.pop();

          if (isStopNode) {
            // Build as raw content without encoding
            const textValue = '' + jObj[key];
            if (textValue === '') {
              val += this.indentate(level) + '<' + resolvedKey + this.closeTag(resolvedKey) + this.tagEndChar;
            } else {
              val += this.indentate(level) + '<' + resolvedKey + '>' + textValue + '</' + resolvedKey + this.tagEndChar;
            }
          } else {
            val += this.buildTextValNode(jObj[key], resolvedKey, '', level, matcher);
          }
        }
      }
    } else if (Array.isArray(jObj[key])) {
      //repeated nodes
      const arrLen = jObj[key].length;
      let listTagVal = "";
      let listTagAttr = "";
      for (let j = 0; j < arrLen; j++) {
        const item = jObj[key][j];
        if (typeof item === 'undefined') {
          // supress undefined node
        } else if (item === null) {
          if (resolvedKey[0] === "?") val += this.indentate(level) + '<' + resolvedKey + '?' + this.tagEndChar;
          else val += this.indentate(level) + '<' + resolvedKey + '/' + this.tagEndChar;
        } else if (typeof item === 'object') {
          if (this.options.oneListGroup) {
            // Push tag to matcher before recursive call
            matcher.push(resolvedKey);
            const result = this.j2x(item, level + 1, matcher, xmlVersion);
            // Pop tag from matcher after recursive call
            matcher.pop();

            listTagVal += result.val;
            if (this.options.attributesGroupName && item.hasOwnProperty(this.options.attributesGroupName)) {
              listTagAttr += result.attrStr
            }
          } else {
            listTagVal += this.processTextOrObjNode(item, resolvedKey, level, matcher, xmlVersion)
          }
        } else {
          if (this.options.oneListGroup) {
            let textValue = this.options.tagValueProcessor(resolvedKey, item);
            textValue = this.replaceEntitiesValue(textValue);
            listTagVal += textValue;
          } else {
            // Check if this is a stopNode before building
            matcher.push(resolvedKey);
            const isStopNode = this.checkStopNode(matcher);
            matcher.pop();

            if (isStopNode) {
              // Build as raw content without encoding
              const textValue = '' + item;
              if (textValue === '') {
                listTagVal += this.indentate(level) + '<' + resolvedKey + this.closeTag(resolvedKey) + this.tagEndChar;
              } else {
                listTagVal += this.indentate(level) + '<' + resolvedKey + '>' + textValue + '</' + resolvedKey + this.tagEndChar;
              }
            } else {
              listTagVal += this.buildTextValNode(item, resolvedKey, '', level, matcher);
            }
          }
        }
      }
      if (this.options.oneListGroup) {
        listTagVal = this.buildObjectNode(listTagVal, resolvedKey, listTagAttr, level);
      }
      val += listTagVal;
    } else {
      //nested node
      if (this.options.attributesGroupName && key === this.options.attributesGroupName) {
        const Ks = Object.keys(jObj[key]);
        const L = Ks.length;
        for (let j = 0; j < L; j++) {
          // Resolve attribute names inside attributesGroupName
          const resolvedAttr = resolveTagName(Ks[j], true, this.options, matcher, xmlVersion);
          attrStr += this.buildAttrPairStr(resolvedAttr, '' + jObj[key][Ks[j]], isCurrentStopNode);
        }
      } else {
        val += this.processTextOrObjNode(jObj[key], resolvedKey, level, matcher, xmlVersion)
      }
    }
  }
  return { attrStr: attrStr, val: val };
};

Builder.prototype.buildAttrPairStr = function (attrName, val, isStopNode) {
  if (!isStopNode) {
    val = this.options.attributeValueProcessor(attrName, '' + val);
    val = this.replaceEntitiesValue(val);
  }
  if (this.options.suppressBooleanAttributes && val === "true") {
    return ' ' + attrName;
  } else return ' ' + attrName + '="' + escapeAttribute(val) + '"';
}

function processTextOrObjNode(object, key, level, matcher, xmlVersion) {
  // Extract attributes to pass to matcher
  const attrValues = this.extractAttributes(object);

  // Push tag to matcher before recursion WITH attributes
  matcher.push(key, attrValues);

  // Check if this entire node is a stopNode
  const isStopNode = this.checkStopNode(matcher);

  if (isStopNode) {
    // For stopNodes, build raw content without entity encoding
    const rawContent = this.buildRawContent(object);
    const attrStr = this.buildAttributesForStopNode(object);
    matcher.pop();
    return this.buildObjectNode(rawContent, key, attrStr, level);
  }

  const result = this.j2x(object, level + 1, matcher, xmlVersion);
  // Pop tag from matcher after recursion
  matcher.pop();

  // PI/XML-declaration tags must never emit text content — route through
  // buildTextValNode which correctly ignores the text node for "?" tags.
  if (key[0] === '?') {
    return this.buildTextValNode('', key, result.attrStr, level, matcher);
  } else if (object[this.options.textNodeName] !== undefined && Object.keys(object).length === 1) {
    return this.buildTextValNode(object[this.options.textNodeName], key, result.attrStr, level, matcher);
  } else {
    return this.buildObjectNode(result.val, key, result.attrStr, level);
  }
}

// Helper method to extract attributes from an object
Builder.prototype.extractAttributes = function (obj) {
  if (!obj || typeof obj !== 'object') return null;

  const attrValues = {};
  let hasAttrs = false;

  // Check for attributesGroupName (when attributes are grouped)
  if (this.options.attributesGroupName && obj[this.options.attributesGroupName]) {
    const attrGroup = obj[this.options.attributesGroupName];
    for (let attrKey in attrGroup) {
      if (!Object.prototype.hasOwnProperty.call(attrGroup, attrKey)) continue;
      // Remove attribute prefix if present
      const cleanKey = attrKey.startsWith(this.options.attributeNamePrefix)
        ? attrKey.substring(this.options.attributeNamePrefix.length)
        : attrKey;
      attrValues[cleanKey] = escapeAttribute(attrGroup[attrKey]);
      hasAttrs = true;
    }
  } else {
    // Look for individual attributes (prefixed with attributeNamePrefix)
    for (let key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      const attr = this.isAttribute(key);
      if (attr) {
        attrValues[attr] = escapeAttribute(obj[key]);
        hasAttrs = true;
      }
    }
  }

  return hasAttrs ? attrValues : null;
};

// Build raw content for stopNode without entity encoding
Builder.prototype.buildRawContent = function (obj) {
  if (typeof obj === 'string') {
    return obj; // Already a string, return as-is
  }

  if (typeof obj !== 'object' || obj === null) {
    return String(obj);
  }

  // Check if this is a stopNode data from parser: { "#text": "raw xml", "@_attr": "val" }
  if (obj[this.options.textNodeName] !== undefined) {
    return obj[this.options.textNodeName]; // Return raw text without encoding
  }

  // Build raw XML from nested structure
  let content = '';

  for (let key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    // Skip attributes
    if (this.isAttribute(key)) continue;
    if (this.options.attributesGroupName && key === this.options.attributesGroupName) continue;

    const value = obj[key];

    if (key === this.options.textNodeName) {
      content += value; // Raw text
    } else if (Array.isArray(value)) {
      // Array of same tag
      for (let item of value) {
        if (typeof item === 'string' || typeof item === 'number') {
          content += `<${key}>${item}</${key}>`;
        } else if (typeof item === 'object' && item !== null) {
          const nestedContent = this.buildRawContent(item);
          const nestedAttrs = this.buildAttributesForStopNode(item);
          if (nestedContent === '') {
            content += `<${key}${nestedAttrs}/>`;
          } else {
            content += `<${key}${nestedAttrs}>${nestedContent}</${key}>`;
          }
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      // Nested object
      const nestedContent = this.buildRawContent(value);
      const nestedAttrs = this.buildAttributesForStopNode(value);
      if (nestedContent === '') {
        content += `<${key}${nestedAttrs}/>`;
      } else {
        content += `<${key}${nestedAttrs}>${nestedContent}</${key}>`;
      }
    } else {
      // Primitive value
      content += `<${key}>${value}</${key}>`;
    }
  }

  return content;
};

// Build attribute string for stopNode (no entity encoding)
Builder.prototype.buildAttributesForStopNode = function (obj) {
  if (!obj || typeof obj !== 'object') return '';

  let attrStr = '';

  // Check for attributesGroupName (when attributes are grouped)
  if (this.options.attributesGroupName && obj[this.options.attributesGroupName]) {
    const attrGroup = obj[this.options.attributesGroupName];
    for (let attrKey in attrGroup) {
      if (!Object.prototype.hasOwnProperty.call(attrGroup, attrKey)) continue;
      const cleanKey = attrKey.startsWith(this.options.attributeNamePrefix)
        ? attrKey.substring(this.options.attributeNamePrefix.length)
        : attrKey;
      const val = attrGroup[attrKey];
      if (val === true && this.options.suppressBooleanAttributes) {
        attrStr += ' ' + cleanKey;
      } else {
        attrStr += ' ' + cleanKey + '="' + val + '"'; // No encoding for stopNode
      }
    }
  } else {
    // Look for individual attributes
    for (let key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      const attr = this.isAttribute(key);
      if (attr) {
        const val = obj[key];
        if (val === true && this.options.suppressBooleanAttributes) {
          attrStr += ' ' + attr;
        } else {
          attrStr += ' ' + attr + '="' + val + '"'; // No encoding for stopNode
        }
      }
    }
  }

  return attrStr;
};

Builder.prototype.buildObjectNode = function (val, key, attrStr, level) {
  if (val === "") {
    if (key[0] === "?") return this.indentate(level) + '<' + key + attrStr + '?' + this.tagEndChar;
    else {
      return this.indentate(level) + '<' + key + attrStr + this.closeTag(key) + this.tagEndChar;
    }
  } else if (key[0] === "?") {
    // PI/XML-declaration tags never have body content — treat them like empty.
    return this.indentate(level) + '<' + key + attrStr + '?' + this.tagEndChar;
  } else {
    let tagEndExp = '</' + key + this.tagEndChar;
    let piClosingChar = "";

    if (key[0] === "?") {
      piClosingChar = "?";
      tagEndExp = "";
    }

    // attrStr is an empty string in case the attribute came as undefined or null
    if ((attrStr || attrStr === '') && val.indexOf('<') === -1) {
      return (this.indentate(level) + '<' + key + attrStr + piClosingChar + '>' + val + tagEndExp);
    } else if (this.options.commentPropName !== false && key === this.options.commentPropName && piClosingChar.length === 0) {
      return this.indentate(level) + `<!--${val}-->` + this.newLine;
    } else {
      return (
        this.indentate(level) + '<' + key + attrStr + piClosingChar + this.tagEndChar +
        val +
        this.indentate(level) + tagEndExp);
    }
  }
}

Builder.prototype.closeTag = function (key) {
  let closeTag = "";
  if (this.options.unpairedTags.indexOf(key) !== -1) { //unpaired
    if (!this.options.suppressUnpairedNode) closeTag = "/"
  } else if (this.options.suppressEmptyNode) { //empty
    closeTag = "/";
  } else {
    closeTag = `></${key}`
  }
  return closeTag;
}

Builder.prototype.checkStopNode = function (matcher) {
  if (!this.stopNodeExpressions || this.stopNodeExpressions.length === 0) return false;

  for (let i = 0; i < this.stopNodeExpressions.length; i++) {
    if (matcher.matches(this.stopNodeExpressions[i])) {
      return true;
    }
  }
  return false;
}

function buildEmptyObjNode(val, key, attrStr, level) {
  if (val !== '') {
    return this.buildObjectNode(val, key, attrStr, level);
  } else {
    if (key[0] === "?") return this.indentate(level) + '<' + key + attrStr + '?' + this.tagEndChar;
    else {
      return this.indentate(level) + '<' + key + attrStr + '/' + this.tagEndChar;
    }
  }
}

Builder.prototype.buildTextValNode = function (val, key, attrStr, level, matcher) {
  if (this.options.cdataPropName !== false && key === this.options.cdataPropName) {
    const safeVal = safeCdata(val);
    return this.indentate(level) + `<![CDATA[${safeVal}]]>` + this.newLine;
  } else if (this.options.commentPropName !== false && key === this.options.commentPropName) {
    const safeVal = safeComment(val);
    return this.indentate(level) + `<!--${safeVal}-->` + this.newLine;
  } else if (key[0] === "?") {//PI tag
    return this.indentate(level) + '<' + key + attrStr + '?' + this.tagEndChar;
  } else {
    // Normal processing: apply tagValueProcessor and entity replacement
    let textValue = this.options.tagValueProcessor(key, val);
    textValue = this.replaceEntitiesValue(textValue);

    if (textValue === '') {
      return this.indentate(level) + '<' + key + attrStr + this.closeTag(key) + this.tagEndChar;
    } else {
      return this.indentate(level) + '<' + key + attrStr + '>' +
        textValue +
        '</' + key + this.tagEndChar;
    }
  }
}

Builder.prototype.replaceEntitiesValue = function (textValue) {
  if (textValue && textValue.length > 0 && this.options.processEntities) {
    for (let i = 0; i < this.options.entities.length; i++) {
      const entity = this.options.entities[i];
      textValue = textValue.replace(entity.regex, entity.val);
    }
  }
  return textValue;
}

function indentate(level) {
  return this.options.indentBy.repeat(level);
}

function isAttribute(name /*, options*/) {
  if (name.startsWith(this.options.attributeNamePrefix) && name !== this.options.textNodeName) {
    return name.substr(this.attrPrefixLen);
  } else {
    return false;
  }
}