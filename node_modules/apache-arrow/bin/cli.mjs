// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// Thin wrapper over `node:util.parseArgs` for the apache-arrow bin scripts.
// Replaces `command-line-args` + `command-line-usage` to drop two runtime deps
// (and their transitive trees) from the published package.
import { parseArgs } from 'node:util';
export function parseCliArgs(spec, args) {
    var _a;
    const options = {};
    for (const o of spec) {
        options[o.name] = Object.assign(Object.assign(Object.assign({ type: o.type === Boolean ? 'boolean' : 'string' }, (o.alias && { short: o.alias })), (o.multiple && { multiple: true })), (o.defaultValue !== undefined && { default: o.defaultValue }));
    }
    const { values, tokens } = parseArgs({
        options, args, strict: false, allowPositionals: true, tokens: true,
    });
    // `parseArgs` only honours repeated multi-flags (`-s a -s b`). To match
    // command-line-args' greedy behaviour (`-s a b c`), walk the token stream
    // and route positionals to the most recently seen `multiple: true` flag
    // until another option appears.
    const multi = new Set(spec.filter((o) => o.multiple).map((o) => o.name));
    const out = values;
    const positionals = [];
    let owner = null;
    for (const tok of tokens) {
        if (tok.kind === 'option') {
            owner = multi.has(tok.name) ? tok.name : null;
        }
        else if (tok.kind === 'option-terminator') {
            owner = null;
        }
        else if (tok.kind === 'positional') {
            if (owner) {
                const list = (_a = out[owner]) !== null && _a !== void 0 ? _a : [];
                out[owner] = [...list, tok.value];
            }
            else {
                positionals.push(tok.value);
            }
        }
    }
    // Coerce Number-typed values; parseArgs only parses as string or boolean.
    for (const o of spec) {
        if (o.type !== Number)
            continue;
        const v = out[o.name];
        if (Array.isArray(v))
            out[o.name] = v.map(Number);
        else if (typeof v === 'string')
            out[o.name] = Number(v);
    }
    return { values: out, positionals };
}
// Drops the {bold ...} / {underline ...} chalk markup that command-line-usage
// recognised, so existing call sites can keep their content strings unchanged.
const stripStyles = (s) => s.replaceAll(/\{(?:bold|underline)\s+(.*?)\}/g, '$1');
// Match command-line-usage's option-line layout: `-s, --schema columns`
// (uses the explicit `typeLabel`) or `-f, --file string[]` (synthesised when
// no `typeLabel` was provided for a string option). Boolean options get no
// trailing label. Options without an `alias` are left-flush; aliased ones get
// the `-x, ` prefix.
const formatOptionHead = (o) => {
    const flag = `${o.alias ? `-${o.alias}, --` : '--'}${o.name}`;
    if (o.typeLabel)
        return `${flag} ${stripStyles(o.typeLabel)}`;
    if (o.type === Boolean)
        return flag;
    return `${flag} ${o.multiple ? 'string[]' : 'string'}`;
};
export function formatUsage(sections) {
    var _a, _b, _c;
    const out = [];
    for (const s of sections) {
        out.push('', stripStyles(s.header), '');
        const content = typeof s.content === 'string' ? [s.content] : (_a = s.content) !== null && _a !== void 0 ? _a : [];
        for (const line of content)
            out.push('  ' + stripStyles(line));
        if ((_b = s.optionList) === null || _b === void 0 ? void 0 : _b.length) {
            const heads = s.optionList.map((o) => formatOptionHead(o));
            const width = Math.max(...heads.map((h) => h.length));
            for (const [i, o] of s.optionList.entries()) {
                out.push('  ' + heads[i].padEnd(width + 3) + ((_c = o.description) !== null && _c !== void 0 ? _c : ''));
            }
        }
    }
    out.push('');
    return out.join('\n');
}
