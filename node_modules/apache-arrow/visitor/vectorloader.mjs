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
import { makeData } from '../data.mjs';
import { Field } from '../schema.mjs';
import { DataType } from '../type.mjs';
import { Visitor } from '../visitor.mjs';
import { packBools } from '../util/bit.mjs';
import { encodeUtf8 } from '../util/utf8.mjs';
import { Int64, Int128 } from '../util/int.mjs';
import { UnionMode, DateUnit, MetadataVersion, IntervalUnit } from '../enum.mjs';
import { toArrayBufferView } from '../util/buffer.mjs';
import { toIntervalDayTimeInt32Array, toIntervalMonthDayNanoInt32Array } from '../util/interval.mjs';
/** @ignore */
export class VectorLoader extends Visitor {
    constructor(bytes, nodes, buffers, dictionaries, metadataVersion = MetadataVersion.V5, variadicBufferCounts = []) {
        super();
        this.nodesIndex = -1;
        this.buffersIndex = -1;
        this.variadicBufferIndex = -1;
        this.bytes = bytes;
        this.nodes = nodes;
        this.buffers = buffers;
        this.dictionaries = dictionaries;
        this.metadataVersion = metadataVersion;
        this.variadicBufferCounts = variadicBufferCounts;
    }
    visit(node) {
        return super.visit(node instanceof Field ? node.type : node);
    }
    visitNull(type, { length } = this.nextFieldNode()) {
        return makeData({ type, length });
    }
    visitBool(type, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    visitInt(type, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    visitFloat(type, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    visitUtf8(type, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), data: this.readData(type) });
    }
    visitLargeUtf8(type, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), data: this.readData(type) });
    }
    visitUtf8View(type, { length, nullCount } = this.nextFieldNode()) {
        const nullBitmap = this.readNullBitmap(type, nullCount);
        const views = this.readData(type);
        const variadicBuffers = this.readVariadicBuffers(this.nextVariadicBufferCount());
        return makeData({
            type,
            length,
            nullCount,
            nullBitmap,
            ['views']: views,
            ['variadicBuffers']: variadicBuffers
        });
    }
    visitBinary(type, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), data: this.readData(type) });
    }
    visitLargeBinary(type, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), data: this.readData(type) });
    }
    visitBinaryView(type, { length, nullCount } = this.nextFieldNode()) {
        const nullBitmap = this.readNullBitmap(type, nullCount);
        const views = this.readData(type);
        const variadicBuffers = this.readVariadicBuffers(this.nextVariadicBufferCount());
        return makeData({
            type,
            length,
            nullCount,
            nullBitmap,
            ['views']: views,
            ['variadicBuffers']: variadicBuffers
        });
    }
    visitFixedSizeBinary(type, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    visitDate(type, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    visitTimestamp(type, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    visitTime(type, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    visitDecimal(type, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    visitList(type, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), 'child': this.visit(type.children[0]) });
    }
    visitLargeList(type, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), 'child': this.visit(type.children[0]) });
    }
    visitStruct(type, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), children: this.visitMany(type.children) });
    }
    visitUnion(type, { length, nullCount } = this.nextFieldNode()) {
        if (this.metadataVersion < MetadataVersion.V5) {
            this.readNullBitmap(type, nullCount);
        }
        return type.mode === UnionMode.Sparse
            ? this.visitSparseUnion(type, { length, nullCount })
            : this.visitDenseUnion(type, { length, nullCount });
    }
    visitDenseUnion(type, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, typeIds: this.readTypeIds(type), valueOffsets: this.readOffsets(type), children: this.visitMany(type.children) });
    }
    visitSparseUnion(type, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, typeIds: this.readTypeIds(type), children: this.visitMany(type.children) });
    }
    visitDictionary(type, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type.indices), dictionary: this.readDictionary(type) });
    }
    visitInterval(type, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    visitDuration(type, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    visitFixedSizeList(type, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), 'child': this.visit(type.children[0]) });
    }
    visitMap(type, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), 'child': this.visit(type.children[0]) });
    }
    nextFieldNode() { return this.nodes[++this.nodesIndex]; }
    nextBufferRange() { return this.buffers[++this.buffersIndex]; }
    readNullBitmap(type, nullCount, buffer = this.nextBufferRange()) {
        return nullCount > 0 && this.readData(type, buffer) || new Uint8Array(0);
    }
    readOffsets(type, buffer) { return this.readData(type, buffer); }
    readTypeIds(type, buffer) { return this.readData(type, buffer); }
    readData(_type, { length, offset } = this.nextBufferRange()) {
        return this.bytes.subarray(offset, offset + length);
    }
    readVariadicBuffers(length) {
        return Array.from({ length }, () => this.readData(null));
    }
    nextVariadicBufferCount() {
        var _a;
        return (_a = this.variadicBufferCounts[++this.variadicBufferIndex]) !== null && _a !== void 0 ? _a : 0;
    }
    readDictionary(type) {
        return this.dictionaries.get(type.id);
    }
}
/** @ignore */
export class JSONVectorLoader extends VectorLoader {
    constructor(sources, nodes, buffers, dictionaries, metadataVersion, variadicBufferCounts = []) {
        super(new Uint8Array(0), nodes, buffers, dictionaries, metadataVersion, variadicBufferCounts);
        this.sources = sources;
    }
    readNullBitmap(_type, nullCount, { offset } = this.nextBufferRange()) {
        return nullCount <= 0 ? new Uint8Array(0) : packBools(this.sources[offset]);
    }
    readOffsets(_type, { offset } = this.nextBufferRange()) {
        return toArrayBufferView(Uint8Array, toArrayBufferView(_type.OffsetArrayType, this.sources[offset]));
    }
    readTypeIds(type, { offset } = this.nextBufferRange()) {
        return toArrayBufferView(Uint8Array, toArrayBufferView(type.ArrayType, this.sources[offset]));
    }
    readData(type, { offset } = this.nextBufferRange()) {
        const { sources } = this;
        if (DataType.isTimestamp(type)) {
            return toArrayBufferView(Uint8Array, Int64.convertArray(sources[offset]));
        }
        else if ((DataType.isInt(type) || DataType.isTime(type)) && type.bitWidth === 64 || DataType.isDuration(type)) {
            return toArrayBufferView(Uint8Array, Int64.convertArray(sources[offset]));
        }
        else if (DataType.isDate(type) && type.unit === DateUnit.MILLISECOND) {
            return toArrayBufferView(Uint8Array, Int64.convertArray(sources[offset]));
        }
        else if (DataType.isDecimal(type)) {
            return toArrayBufferView(Uint8Array, Int128.convertArray(sources[offset]));
        }
        else if (DataType.isBinary(type) || DataType.isLargeBinary(type) || DataType.isFixedSizeBinary(type)) {
            return binaryDataFromJSON(sources[offset]);
        }
        else if (DataType.isBinaryView(type)) {
            return binaryViewDataFromJSON(sources[offset]);
        }
        else if (DataType.isUtf8View(type)) {
            return utf8ViewDataFromJSON(sources[offset]);
        }
        else if (DataType.isBool(type)) {
            return packBools(sources[offset]);
        }
        else if (DataType.isUtf8(type) || DataType.isLargeUtf8(type)) {
            return encodeUtf8(sources[offset].join(''));
        }
        else if (DataType.isInterval(type)) {
            switch (type.unit) {
                case IntervalUnit.DAY_TIME:
                    return toIntervalDayTimeInt32Array(sources[offset]);
                case IntervalUnit.MONTH_DAY_NANO:
                    return toIntervalMonthDayNanoInt32Array(sources[offset]);
                default:
                    break;
            }
        }
        return toArrayBufferView(Uint8Array, toArrayBufferView(type.ArrayType, sources[offset].map((x) => +x)));
    }
    readVariadicBuffers(length) {
        // Per Arrow C++ reference implementation (cpp/src/arrow/ipc/reader.cc),
        // each variadic buffer is stored as a separate buffer region, matching
        // the IPC format where each is accessed via separate GetBuffer() calls.
        // VARIADIC_DATA_BUFFERS in JSON is an array, but flattenDataSources spreads
        // it so each hex string gets its own sources entry, maintaining 1:1
        // correspondence with BufferRegion entries.
        const buffers = [];
        for (let i = 0; i < length; i++) {
            const { offset } = this.nextBufferRange();
            // sources[offset] is 'any[]' but for variadic buffers it's actually a string
            // after spreading in flattenDataSources. Cast necessary due to heterogeneous
            // sources array structure (most fields are arrays, variadic elements are strings).
            const hexString = this.sources[offset];
            buffers.push(hexStringToBytes(hexString));
        }
        return buffers;
    }
}
/** @ignore */
function hexStringToBytes(hexString) {
    // Parse hex string per Arrow JSON integration format (uppercase hex encoding).
    // Used for: VARIADIC_DATA_BUFFERS elements, Binary DATA (after join),
    // BinaryView PREFIX_HEX and INLINED fields.
    const data = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
        data[i >> 1] = Number.parseInt(hexString.slice(i, i + 2), 16);
    }
    return data;
}
/** @ignore */
function binaryDataFromJSON(values) {
    // Arrow JSON Binary/LargeBinary/FixedSizeBinary format:
    // "DATA": ["49BC7D5B6C47D2","3F5FB6D9322026"] (array of hex strings, one per value)
    // Join all values into one continuous hex string, then parse to bytes.
    return hexStringToBytes(values.join(''));
}
/** @ignore */
function parseViewDataFromJSON(views, parseInlined) {
    // Each view is a 16-byte struct: [length: i32, prefix/inlined: 12 bytes, buffer_index: i32, offset: i32]
    const data = new Uint8Array(views.length * 16);
    const dataView = new DataView(data.buffer);
    for (const [i, view] of views.entries()) {
        const offset = i * 16;
        const size = view['SIZE'];
        // Write size (int32 at byte 0)
        dataView.setInt32(offset, size, true);
        if (view['INLINED'] !== undefined) {
            // Inline view: parse INLINED field using provided callback
            const bytes = parseInlined(view['INLINED']);
            for (let j = 0; j < bytes.length && j < 12; j++) {
                data[offset + 4 + j] = bytes[j];
            }
        }
        else {
            // Out-of-line view: write prefix, buffer_index, offset
            const prefix = view['PREFIX_HEX'];
            // Write 4-byte prefix at bytes 4-7
            for (let j = 0; j < 8 && j < prefix.length; j += 2) {
                data[offset + 4 + (j >> 1)] = Number.parseInt(prefix.slice(j, j + 2), 16);
            }
            // Write buffer_index (int32 at byte 8)
            dataView.setInt32(offset + 8, view['BUFFER_INDEX'], true);
            // Write offset (int32 at byte 12)
            dataView.setInt32(offset + 12, view['OFFSET'], true);
        }
    }
    return data;
}
/** @ignore */
function binaryViewDataFromJSON(views) {
    return parseViewDataFromJSON(views, (inlined) => {
        // BinaryView: INLINED is hex-encoded string
        const bytes = new Uint8Array(inlined.length / 2);
        for (let i = 0; i < inlined.length; i += 2) {
            bytes[i >> 1] = Number.parseInt(inlined.slice(i, i + 2), 16);
        }
        return bytes;
    });
}
/** @ignore */
function utf8ViewDataFromJSON(views) {
    return parseViewDataFromJSON(views, (inlined) => {
        // Utf8View: INLINED is UTF-8 string - encode to bytes
        const encoder = new TextEncoder();
        return encoder.encode(inlined);
    });
}
export class CompressedVectorLoader extends VectorLoader {
    constructor(bodyChunks, nodes, buffers, dictionaries, metadataVersion, variadicBufferCounts = []) {
        super(new Uint8Array(0), nodes, buffers, dictionaries, metadataVersion, variadicBufferCounts);
        this.bodyChunks = bodyChunks;
    }
    readData(_type, _buffer = this.nextBufferRange()) {
        return this.bodyChunks[this.buffersIndex];
    }
}

//# sourceMappingURL=vectorloader.mjs.map
