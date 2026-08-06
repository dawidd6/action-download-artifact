import { Expression, Matcher } from 'path-expression-matcher';
import { safeComment, safeCdata, escapeAttribute } from "./util.js";
import { qName } from 'xml-naming';

const EOL = "\n";

/**
 * Detect XML version from the first element of the ordered array input.
 * The first element must be a ?xml processing instruction with a version attribute.
 * Returns '1.0' if not found.
 *
 * @param {array}  jArray
 * @param {object} options
 */
function detectXmlVersionFromArray(jArray, options) {
    if (!Array.isArray(jArray) || jArray.length === 0) return '1.0';
    const first = jArray[0];
    const firstKey = propName(first);
    if (firstKey === '?xml') {
        const attrs = first[':@'];
        if (attrs) {
            const versionKey = options.attributeNamePrefix + 'version';
            if (attrs[versionKey]) return attrs[versionKey];
        }
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

/**
 * @param {array} jArray
 * @param {any} options
 * @returns
 */
export default function toXml(jArray, options) {
    let indentation = "";
    if (options.format) {
        indentation = EOL;
    }

    // Pre-compile stopNode expressions for pattern matching
    const stopNodeExpressions = [];
    if (options.stopNodes && Array.isArray(options.stopNodes)) {
        for (let i = 0; i < options.stopNodes.length; i++) {
            const node = options.stopNodes[i];
            if (typeof node === 'string') {
                stopNodeExpressions.push(new Expression(node));
            } else if (node instanceof Expression) {
                stopNodeExpressions.push(node);
            }
        }
    }

    // Detect XML version for use in name validation
    const xmlVersion = detectXmlVersionFromArray(jArray, options);

    // Initialize matcher for path tracking
    const matcher = new Matcher();

    return arrToStr(jArray, options, indentation, matcher, stopNodeExpressions, xmlVersion);
}

function arrToStr(arr, options, indentation, matcher, stopNodeExpressions, xmlVersion) {
    let xmlStr = "";
    let isPreviousElementTag = false;

    if (options.maxNestedTags && matcher.getDepth() > options.maxNestedTags) {
        throw new Error("Maximum nested tags exceeded");
    }

    if (!Array.isArray(arr)) {
        // Non-array values (e.g. string tag values) should be treated as text content
        if (arr !== undefined && arr !== null) {
            let text = arr.toString();
            text = replaceEntitiesValue(text, options);
            return text;
        }
        return "";
    }

    for (let i = 0; i < arr.length; i++) {
        const tagObj = arr[i];
        const rawTagName = propName(tagObj);
        if (rawTagName === undefined) continue;

        // Special names are exempt from sanitizeName: internal conventions and PI tags
        // are not user-supplied XML element names.
        const isSpecialName = rawTagName === options.textNodeName
            || rawTagName === options.cdataPropName
            || rawTagName === options.commentPropName
            || rawTagName[0] === '?';

        // Resolve tag name (may transform it; may throw for invalid names)
        const tagName = isSpecialName
            ? rawTagName
            : resolveTagName(rawTagName, false, options, matcher, xmlVersion);

        // Extract attributes from ":@" property
        const attrValues = extractAttributeValues(tagObj[":@"], options);

        // Push resolved tag to matcher WITH attributes
        matcher.push(tagName, attrValues);

        // Check if this is a stop node using Expression matching
        const isStopNode = checkStopNode(matcher, stopNodeExpressions);

        if (tagName === options.textNodeName) {
            let tagText = tagObj[rawTagName];
            if (!isStopNode) {
                tagText = options.tagValueProcessor(tagName, tagText);
                tagText = replaceEntitiesValue(tagText, options);
            }
            if (isPreviousElementTag) {
                xmlStr += indentation;
            }
            xmlStr += tagText;
            isPreviousElementTag = false;
            matcher.pop();
            continue;
        } else if (tagName === options.cdataPropName) {
            if (isPreviousElementTag) {
                xmlStr += indentation;
            }
            const val = tagObj[rawTagName][0][options.textNodeName];
            const safeVal = safeCdata(val);
            xmlStr += `<![CDATA[${safeVal}]]>`;
            isPreviousElementTag = false;
            matcher.pop();
            continue;
        } else if (tagName === options.commentPropName) {
            const val = tagObj[rawTagName][0][options.textNodeName];
            const safeVal = safeComment(val);
            xmlStr += indentation + `<!--${safeVal}-->`;
            isPreviousElementTag = true;
            matcher.pop();
            continue;
        } else if (tagName[0] === "?") {
            const attStr = attr_to_str(tagObj[":@"], options, isStopNode, matcher, xmlVersion);
            const tempInd = tagName === "?xml" ? "" : indentation;
            // Text node content on PI/XML declaration tags is intentionally ignored.
            // Only attributes are valid on these tags per the XML spec.
            xmlStr += tempInd + `<${tagName}${attStr}?>`;
            isPreviousElementTag = true;
            matcher.pop();
            continue;
        }

        let newIdentation = indentation;
        if (newIdentation !== "") {
            newIdentation += options.indentBy;
        }

        // Pass isStopNode to attr_to_str so attributes are also not processed for stopNodes
        const attStr = attr_to_str(tagObj[":@"], options, isStopNode, matcher, xmlVersion);
        const tagStart = indentation + `<${tagName}${attStr}`;

        // If this is a stopNode, get raw content without processing
        let tagValue;
        if (isStopNode) {
            tagValue = getRawContent(tagObj[rawTagName], options);
        } else {
            tagValue = arrToStr(tagObj[rawTagName], options, newIdentation, matcher, stopNodeExpressions, xmlVersion);
        }

        if (options.unpairedTags.indexOf(tagName) !== -1) {
            if (options.suppressUnpairedNode) xmlStr += tagStart + ">";
            else xmlStr += tagStart + "/>";
        } else if ((!tagValue || tagValue.length === 0) && options.suppressEmptyNode) {
            xmlStr += tagStart + "/>";
        } else if (tagValue && tagValue.endsWith(">")) {
            xmlStr += tagStart + `>${tagValue}${indentation}</${tagName}>`;
        } else {
            xmlStr += tagStart + ">";
            if (tagValue && indentation !== "" && (tagValue.includes("/>") || tagValue.includes("</"))) {
                xmlStr += indentation + options.indentBy + tagValue + indentation;
            } else {
                xmlStr += tagValue;
            }
            xmlStr += `</${tagName}>`;
        }
        isPreviousElementTag = true;

        // Pop tag from matcher
        matcher.pop();
    }

    return xmlStr;
}

/**
 * Extract attribute values from the ":@" object and return as plain object
 * for passing to matcher.push()
 */
function extractAttributeValues(attrMap, options) {
    if (!attrMap || options.ignoreAttributes) return null;

    const attrValues = {};
    let hasAttrs = false;

    for (let attr in attrMap) {
        if (!Object.prototype.hasOwnProperty.call(attrMap, attr)) continue;
        // Remove the attribute prefix to get clean attribute name
        const cleanAttrName = attr.startsWith(options.attributeNamePrefix)
            ? attr.substr(options.attributeNamePrefix.length)
            : attr;
        attrValues[cleanAttrName] = escapeAttribute(attrMap[attr]);
        hasAttrs = true;
    }

    return hasAttrs ? attrValues : null;
}

/**
 * Extract raw content from a stopNode without any processing
 * This preserves the content exactly as-is, including special characters
 */
function getRawContent(arr, options) {
    if (!Array.isArray(arr)) {
        // Non-array values return as-is
        if (arr !== undefined && arr !== null) {
            return arr.toString();
        }
        return "";
    }

    let content = "";
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const tagName = propName(item);

        if (tagName === options.textNodeName) {
            // Raw text content - NO processing, NO entity replacement
            content += item[tagName];
        } else if (tagName === options.cdataPropName) {
            // CDATA content
            content += item[tagName][0][options.textNodeName];
        } else if (tagName === options.commentPropName) {
            // Comment content
            content += item[tagName][0][options.textNodeName];
        } else if (tagName && tagName[0] === "?") {
            // Processing instruction - skip for stopNodes
            continue;
        } else if (tagName) {
            // Nested tags within stopNode — no sanitizeName, content is raw
            const attStr = attr_to_str_raw(item[":@"], options);
            const nestedContent = getRawContent(item[tagName], options);

            if (!nestedContent || nestedContent.length === 0) {
                content += `<${tagName}${attStr}/>`;
            } else {
                content += `<${tagName}${attStr}>${nestedContent}</${tagName}>`;
            }
        }
    }
    return content;
}

/**
 * Build attribute string for stopNodes - NO entity replacement
 */
function attr_to_str_raw(attrMap, options) {
    let attrStr = "";
    if (attrMap && !options.ignoreAttributes) {
        for (let attr in attrMap) {
            if (!Object.prototype.hasOwnProperty.call(attrMap, attr)) continue;
            // For stopNodes, use raw value without processing
            let attrVal = attrMap[attr];
            if (attrVal === true && options.suppressBooleanAttributes) {
                attrStr += ` ${attr.substr(options.attributeNamePrefix.length)}`;
            } else {
                attrStr += ` ${attr.substr(options.attributeNamePrefix.length)}="${escapeAttribute(attrVal)}"`;
            }
        }
    }
    return attrStr;
}

function propName(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        if (key !== ":@") return key;
    }
}

/**
 * Build attribute string, resolving attribute names through sanitizeName when configured.
 * Accepts matcher so the callback has path context.
 */
function attr_to_str(attrMap, options, isStopNode, matcher, xmlVersion) {
    let attrStr = "";
    if (attrMap && !options.ignoreAttributes) {
        for (let attr in attrMap) {
            if (!Object.prototype.hasOwnProperty.call(attrMap, attr)) continue;

            // Strip prefix to get the clean XML attribute name, then optionally sanitize it
            const cleanAttrName = attr.substr(options.attributeNamePrefix.length);
            const resolvedAttrName = isStopNode
                ? cleanAttrName  // stopNodes are raw — skip sanitizeName for attr names too
                : resolveTagName(cleanAttrName, true, options, matcher, xmlVersion);

            let attrVal;
            if (isStopNode) {
                // For stopNodes, use raw value without any processing
                attrVal = attrMap[attr];
            } else {
                // Normal processing: apply attributeValueProcessor and entity replacement
                attrVal = options.attributeValueProcessor(attr, attrMap[attr]);
                attrVal = replaceEntitiesValue(attrVal, options);
            }

            if (attrVal === true && options.suppressBooleanAttributes) {
                attrStr += ` ${resolvedAttrName}`;
            } else {
                attrStr += ` ${resolvedAttrName}="${escapeAttribute(attrVal)}"`;
            }
        }
    }
    return attrStr;
}

function checkStopNode(matcher, stopNodeExpressions) {
    if (!stopNodeExpressions || stopNodeExpressions.length === 0) return false;

    for (let i = 0; i < stopNodeExpressions.length; i++) {
        if (matcher.matches(stopNodeExpressions[i])) {
            return true;
        }
    }
    return false;
}

function replaceEntitiesValue(textValue, options) {
    if (textValue && textValue.length > 0 && options.processEntities) {
        for (let i = 0; i < options.entities.length; i++) {
            const entity = options.entities[i];
            textValue = textValue.replace(entity.regex, entity.val);
        }
    }
    return textValue;
}