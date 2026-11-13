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
import { BN } from '../util/bn.mjs';
import { Vector } from '../vector.mjs';
import { Visitor } from '../visitor.mjs';
import { BufferType, IntervalUnit } from '../enum.mjs';
import { UnionMode, DateUnit, TimeUnit } from '../enum.mjs';
import { BitIterator, getBit, getBool } from '../util/bit.mjs';
import { toIntervalDayTimeObjects, toIntervalMonthDayNanoObjects } from '../util/interval.mjs';
import { DataType, } from '../type.mjs';
/** @ignore */
export class JSONVectorAssembler extends Visitor {
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
        const type = DataType.isDictionary(data.type) ? data.type.indices : data.type;
        const buffers = Object.assign([], data.buffers, { [BufferType.VALIDITY]: undefined });
        return Object.assign({ 'name': name, 'count': length, 'VALIDITY': (DataType.isNull(type) || DataType.isUnion(type))
                ? undefined
                : nullCount <= 0 ? Array.from({ length }, () => 1)
                    : [...new BitIterator(nullBitmap, offset, length, null, getBit)] }, super.visit(data.clone(type, offset, length, 0, buffers)));
    }
    visitNull() { return {}; }
    visitBool({ values, offset, length }) {
        return { 'DATA': [...new BitIterator(values, offset, length, null, getBool)] };
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
        return { 'DATA': [...new Vector([data])], 'OFFSET': [...data.valueOffsets] };
    }
    visitLargeUtf8(data) {
        return { 'DATA': [...new Vector([data])], 'OFFSET': [...bigNumsToStrings(data.valueOffsets, 2)] };
    }
    visitBinary(data) {
        return { 'DATA': [...binaryToString(new Vector([data]))], 'OFFSET': [...data.valueOffsets] };
    }
    visitLargeBinary(data) {
        return { 'DATA': [...binaryToString(new Vector([data]))], 'OFFSET': [...bigNumsToStrings(data.valueOffsets, 2)] };
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
        return { 'DATA': [...binaryToString(new Vector([data]))] };
    }
    visitDate(data) {
        return {
            'DATA': data.type.unit === DateUnit.DAY
                ? [...data.values]
                : [...bigNumsToStrings(data.values, 2)]
        };
    }
    visitTimestamp(data) {
        return { 'DATA': [...bigNumsToStrings(data.values, 2)] };
    }
    visitTime(data) {
        return {
            'DATA': data.type.unit < TimeUnit.MICROSECOND
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
            'OFFSET': data.type.mode === UnionMode.Dense ? [...data.valueOffsets] : undefined,
            'children': this.visitMany(data.type.children, data.children)
        };
    }
    visitInterval(data) {
        switch (data.type.unit) {
            case IntervalUnit.YEAR_MONTH:
                return { 'DATA': [...data.values] };
            case IntervalUnit.DAY_TIME:
                return { 'DATA': toIntervalDayTimeObjects(data.values) };
            case IntervalUnit.MONTH_DAY_NANO:
                return { 'DATA': toIntervalMonthDayNanoObjects(data.values, true) };
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
/** @ignore */
function* binaryToString(vector) {
    for (const octets of vector) {
        yield octets.reduce((str, byte) => {
            return `${str}${('0' + (byte & 0xFF).toString(16)).slice(-2)}`;
        }, '').toUpperCase();
    }
}
/** @ignore */
export function* bigNumsToStrings(values, stride) {
    const u32s = new Uint32Array(values.buffer, values.byteOffset, values.byteLength / Uint32Array.BYTES_PER_ELEMENT);
    for (let i = -1, n = u32s.length / stride; ++i < n;) {
        yield `${BN.new(u32s.subarray((i + 0) * stride, (i + 1) * stride), false)}`;
    }
}
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

//# sourceMappingURL=jsonvectorassembler.mjs.map
