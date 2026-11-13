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

import { parseArgs, type ParseArgsConfig } from 'node:util';

export interface OptionSpec {
    name: string;
    alias?: string;
    type: StringConstructor | BooleanConstructor | NumberConstructor;
    multiple?: boolean;
    defaultValue?: unknown;
    description?: string;
    typeLabel?: string;
    // Accepted for source-compat with the previous command-line-args specs; ignored.
    optional?: boolean;
    default?: unknown;
}

export function parseCliArgs(spec: OptionSpec[], args: string[]) {
    const options: NonNullable<ParseArgsConfig['options']> = {};
    for (const o of spec) {
        options[o.name] = {
            type: o.type === Boolean ? 'boolean' : 'string',
            ...(o.alias && { short: o.alias }),
            ...(o.multiple && { multiple: true }),
            ...(o.defaultValue !== undefined && { default: o.defaultValue as never }),
        };
    }

    const { values, tokens } = parseArgs({
        options, args, strict: false, allowPositionals: true, tokens: true,
    });

    // `parseArgs` only honours repeated multi-flags (`-s a -s b`). To match
    // command-line-args' greedy behaviour (`-s a b c`), walk the token stream
    // and route positionals to the most recently seen `multiple: true` flag
    // until another option appears.
    const multi = new Set(spec.filter((o) => o.multiple).map((o) => o.name));
    const out = values as Record<string, unknown>;
    const positionals: string[] = [];
    let owner: string | null = null;
    for (const tok of tokens) {
        if (tok.kind === 'option') {
            owner = multi.has(tok.name) ? tok.name : null;
        } else if (tok.kind === 'option-terminator') {
            owner = null;
        } else if (tok.kind === 'positional') {
            if (owner) {
                const list = (out[owner] as string[] | undefined) ?? [];
                out[owner] = [...list, tok.value];
            } else {
                positionals.push(tok.value);
            }
        }
    }

    // Coerce Number-typed values; parseArgs only parses as string or boolean.
    for (const o of spec) {
        if (o.type !== Number) continue;
        const v = out[o.name];
        if (Array.isArray(v)) out[o.name] = v.map(Number);
        else if (typeof v === 'string') out[o.name] = Number(v);
    }

    return { values: out, positionals };
}

export interface UsageSection {
    header: string;
    content?: string | string[];
    optionList?: OptionSpec[];
}

// Drops the {bold ...} / {underline ...} chalk markup that command-line-usage
// recognised, so existing call sites can keep their content strings unchanged.
const stripStyles = (s: string) => s.replaceAll(/\{(?:bold|underline)\s+(.*?)\}/g, '$1');

// Match command-line-usage's option-line layout: `-s, --schema columns`
// (uses the explicit `typeLabel`) or `-f, --file string[]` (synthesised when
// no `typeLabel` was provided for a string option). Boolean options get no
// trailing label. Options without an `alias` are left-flush; aliased ones get
// the `-x, ` prefix.
const formatOptionHead = (o: OptionSpec) => {
    const flag = `${o.alias ? `-${o.alias}, --` : '--'}${o.name}`;
    if (o.typeLabel) return `${flag} ${stripStyles(o.typeLabel)}`;
    if (o.type === Boolean) return flag;
    return `${flag} ${o.multiple ? 'string[]' : 'string'}`;
};

export function formatUsage(sections: UsageSection[]): string {
    const out: string[] = [];
    for (const s of sections) {
        out.push('', stripStyles(s.header), '');
        const content = typeof s.content === 'string' ? [s.content] : s.content ?? [];
        for (const line of content) out.push('  ' + stripStyles(line));
        if (s.optionList?.length) {
            const heads = s.optionList.map((o) => formatOptionHead(o));
            const width = Math.max(...heads.map((h) => h.length));
            for (const [i, o] of s.optionList.entries()) {
                out.push('  ' + heads[i].padEnd(width + 3) + (o.description ?? ''));
            }
        }
    }
    out.push('');
    return out.join('\n');
}
