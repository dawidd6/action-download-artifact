"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.bigNumsToStrings = exports.JSONVectorAssembler = void 0;
const bn_js_1 = require("../util/bn.js");
const vector_js_1 = require("../vector.js");
const visitor_js_1 = require("../visitor.js");
const enum_js_1 = require("../enum.js");
const enum_js_2 = require("../enum.js");
const bit_js_1 = require("../util/bit.js");
const interval_js_1 = require("../util/interval.js");
const type_js_1 = require("../type.js");
/** @ignore */
class JSONVectorAssembler extends visitor_js_1.Visitor {
    /** @nocollapse */
    static assemble(...batches) {
        const assembler = new JSONVectorAssembler();
        return batches.map(({ schema, data }) => {
            return assembler.visitMany(schema.fields, data.children);
        });
    }
    visit({ name }, data) {
        const { length } = data;
        const { offset, nullCount, nullBitmap } = data;
        const type = type_js_1.DataType.isDictionary(data.type) ? data.type.indices : data.type;
        const buffers = Object.assign([], data.buffers, { [enum_js_1.BufferType.VALIDITY]: undefined });
        return Object.assign({ 'name': name, 'count': length, 'VALIDITY': (type_js_1.DataType.isNull(type) || type_js_1.DataType.isUnion(type))
                ? undefined
                : nullCount <= 0 ? Array.from({ length }, () => 1)
                    : [...new bit_js_1.BitIterator(nullBitmap, offset, length, null, bit_js_1.getBit)] }, super.visit(data.clone(type, offset, length, 0, buffers)));
    }
    visitNull() { return {}; }
    visitBool({ values, offset, length }) {
        return { 'DATA': [...new bit_js_1.BitIterator(values, offset, length, null, bit_js_1.getBool)] };
    }
    visitInt(data) {
        return {
            'DATA': data.type.bitWidth < 64
                ? [...data.values]
                : [...bigNumsToStrings(data.values, 2)]
        };
    }
    visitFloat(data) {
        return { 'DATA': [...data.values] };
    }
    visitUtf8(data) {
        return { 'DATA': [...new vector_js_1.Vector([data])], 'OFFSET': [...data.valueOffsets] };
    }
    visitLargeUtf8(data) {
        return { 'DATA': [...new vector_js_1.Vector([data])], 'OFFSET': [...bigNumsToStrings(data.valueOffsets, 2)] };
    }
    visitBinary(data) {
        return { 'DATA': [...binaryToString(new vector_js_1.Vector([data]))], 'OFFSET': [...data.valueOffsets] };
    }
    visitLargeBinary(data) {
        return { 'DATA': [...binaryToString(new vector_js_1.Vector([data]))], 'OFFSET': [...bigNumsToStrings(data.valueOffsets, 2)] };
    }
    visitBinaryView(data) {
        return binaryViewDataToJSON(data, (bytes) => Array.from(bytes)
            .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2))
            .join('')
            .toUpperCase());
    }
    visitUtf8View(data) {
        return binaryViewDataToJSON(data, (bytes) => Array.from(bytes).map(b => String.fromCodePoint(b)).join(''));
    }
    visitFixedSizeBinary(data) {
        return { 'DATA': [...binaryToString(new vector_js_1.Vector([data]))] };
    }
    visitDate(data) {
        return {
            'DATA': data.type.unit === enum_js_2.DateUnit.DAY
                ? [...data.values]
                : [...bigNumsToStrings(data.values, 2)]
        };
    }
    visitTimestamp(data) {
        return { 'DATA': [...bigNumsToStrings(data.values, 2)] };
    }
    visitTime(data) {
        return {
            'DATA': data.type.unit < enum_js_2.TimeUnit.MICROSECOND
                ? [...data.values]
                : [...bigNumsToStrings(data.values, 2)]
        };
    }
    visitDecimal(data) {
        return { 'DATA': [...bigNumsToStrings(data.values, 4)] };
    }
    visitList(data) {
        return {
            'OFFSET': [...data.valueOffsets],
            'children': this.visitMany(data.type.children, data.children)
        };
    }
    visitLargeList(data) {
        return {
            'OFFSET': [...bigNumsToStrings(data.valueOffsets, 2)],
            'children': this.visitMany(data.type.children, data.children)
        };
    }
    visitStruct(data) {
        return {
            'children': this.visitMany(data.type.children, data.children)
        };
    }
    visitUnion(data) {
        return {
            'TYPE_ID': [...data.typeIds],
            'OFFSET': data.type.mode === enum_js_2.UnionMode.Dense ? [...data.valueOffsets] : undefined,
            'children': this.visitMany(data.type.children, data.children)
        };
    }
    visitInterval(data) {
        switch (data.type.unit) {
            case enum_js_1.IntervalUnit.YEAR_MONTH:
                return { 'DATA': [...data.values] };
            case enum_js_1.IntervalUnit.DAY_TIME:
                return { 'DATA': (0, interval_js_1.toIntervalDayTimeObjects)(data.values) };
            case enum_js_1.IntervalUnit.MONTH_DAY_NANO:
                return { 'DATA': (0, interval_js_1.toIntervalMonthDayNanoObjects)(data.values, true) };
        }
    }
    visitDuration(data) {
        return { 'DATA': [...bigNumsToStrings(data.values, 2)] };
    }
    visitFixedSizeList(data) {
        return {
            'children': this.visitMany(data.type.children, data.children)
        };
    }
    visitMap(data) {
        return {
            'OFFSET': [...data.valueOffsets],
            'children': this.visitMany(data.type.children, data.children)
        };
    }
}
exports.JSONVectorAssembler = JSONVectorAssembler;
/** @ignore */
function* binaryToString(vector) {
    for (const octets of vector) {
        yield octets.reduce((str, byte) => {
            return `${str}${('0' + (byte & 0xFF).toString(16)).slice(-2)}`;
        }, '').toUpperCase();
    }
}
/** @ignore */
function* bigNumsToStrings(values, stride) {
    const u32s = new Uint32Array(values.buffer, values.byteOffset, values.byteLength / Uint32Array.BYTES_PER_ELEMENT);
    for (let i = -1, n = u32s.length / stride; ++i < n;) {
        yield `${bn_js_1.BN.new(u32s.subarray((i + 0) * stride, (i + 1) * stride), false)}`;
    }
}
exports.bigNumsToStrings = bigNumsToStrings;
/** @ignore */
function binaryViewDataToJSON(data, formatInlined) {
    const INLINE_SIZE = 12;
    const viewsData = data.values;
    const dataView = new DataView(viewsData.buffer, viewsData.byteOffset, viewsData.byteLength);
    const numViews = viewsData.byteLength / 16;
    const bytesToHex = (bytes) => Array.from(bytes)
        .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2))
        .join('')
        .toUpperCase();
    const parsedViews = Array.from({ length: numViews }, (_, i) => {
        const offset = i * 16;
        const size = dataView.getInt32(offset, true);
        return [offset, size];
    }).map(([offset, size]) => (size > INLINE_SIZE) ? {
        'SIZE': size,
        'PREFIX_HEX': bytesToHex(viewsData.subarray(offset + 4, offset + 8)),
        'BUFFER_INDEX': dataView.getInt32(offset + 8, true),
        'OFFSET': dataView.getInt32(offset + 12, true)
    } : {
        'SIZE': size,
        'INLINED': formatInlined(viewsData.subarray(offset + 4, offset + 4 + size))
    });
    const uniqueBufferIndices = [...new Set(parsedViews
            .map(v => v['BUFFER_INDEX'])
            .filter((idx) => idx !== undefined))];
    const variadicBuffers = uniqueBufferIndices.map(bufferIndex => bytesToHex(data.variadicBuffers[bufferIndex]));
    const bufferIndexMap = new Map(uniqueBufferIndices.map((bufferIndex, outputIndex) => [bufferIndex, outputIndex]));
    // Remap buffer indices in views
    const views = parsedViews.map(v => v['BUFFER_INDEX'] !== undefined
        ? Object.assign(Object.assign({}, v), { 'BUFFER_INDEX': bufferIndexMap.get(v['BUFFER_INDEX']) }) : v);
    return { 'VIEWS': views, 'VARIADIC_DATA_BUFFERS': variadicBuffers };
}

//# sourceMappingURL=jsonvectorassembler.js.map
