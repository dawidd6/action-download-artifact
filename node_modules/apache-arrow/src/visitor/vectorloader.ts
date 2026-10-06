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

import { Data, makeData } from '../data.js';
import * as type from '../type.js';
import { Field } from '../schema.js';
import { Vector } from '../vector.js';
import { DataType } from '../type.js';
import { Visitor } from '../visitor.js';
import { packBools } from '../util/bit.js';
import { encodeUtf8 } from '../util/utf8.js';
import { Int64, Int128 } from '../util/int.js';
import { UnionMode, DateUnit, MetadataVersion, IntervalUnit } from '../enum.js';
import { toArrayBufferView } from '../util/buffer.js';
import { BufferRegion, FieldNode } from '../ipc/metadata/message.js';
import { toIntervalDayTimeInt32Array, toIntervalMonthDayNanoInt32Array } from '../util/interval.js';

/** @ignore */
export interface VectorLoader extends Visitor {
    visit<T extends DataType>(node: Field<T> | T): Data<T>;
    visitMany<T extends DataType>(nodes: (Field<T> | T)[]): Data<T>[];
}

/** @ignore */
export class VectorLoader extends Visitor {
    private bytes: Uint8Array;
    private nodes: FieldNode[];
    private nodesIndex = -1;
    private buffers: BufferRegion[];
    protected buffersIndex = -1;
    private dictionaries: Map<number, Vector<any>>;
    private readonly metadataVersion: MetadataVersion;
    private variadicBufferCounts: number[];
    private variadicBufferIndex = -1;
    constructor(bytes: Uint8Array, nodes: FieldNode[], buffers: BufferRegion[], dictionaries: Map<number, Vector<any>>, metadataVersion = MetadataVersion.V5, variadicBufferCounts: number[] = []) {
        super();
        this.bytes = bytes;
        this.nodes = nodes;
        this.buffers = buffers;
        this.dictionaries = dictionaries;
        this.metadataVersion = metadataVersion;
        this.variadicBufferCounts = variadicBufferCounts;
    }

    public visit<T extends DataType>(node: Field<T> | T): Data<T> {
        return super.visit(node instanceof Field ? node.type : node);
    }

    public visitNull<T extends type.Null>(type: T, { length } = this.nextFieldNode()) {
        return makeData({ type, length });
    }
    public visitBool<T extends type.Bool>(type: T, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    public visitInt<T extends type.Int>(type: T, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    public visitFloat<T extends type.Float>(type: T, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    public visitUtf8<T extends type.Utf8>(type: T, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), data: this.readData(type) });
    }
    public visitLargeUtf8<T extends type.LargeUtf8>(type: T, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), data: this.readData(type) });
    }
    public visitUtf8View<T extends type.Utf8View>(type: T, { length, nullCount } = this.nextFieldNode()) {
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
    public visitBinary<T extends type.Binary>(type: T, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), data: this.readData(type) });
    }
    public visitLargeBinary<T extends type.LargeBinary>(type: T, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), data: this.readData(type) });
    }
    public visitBinaryView<T extends type.BinaryView>(type: T, { length, nullCount } = this.nextFieldNode()) {
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
    public visitFixedSizeBinary<T extends type.FixedSizeBinary>(type: T, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    public visitDate<T extends type.Date_>(type: T, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    public visitTimestamp<T extends type.Timestamp>(type: T, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    public visitTime<T extends type.Time>(type: T, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    public visitDecimal<T extends type.Decimal>(type: T, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    public visitList<T extends type.List>(type: T, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), 'child': this.visit(type.children[0]) });
    }
    public visitLargeList<T extends type.LargeList>(type: T, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), 'child': this.visit(type.children[0]) });
    }
    public visitStruct<T extends type.Struct>(type: T, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), children: this.visitMany(type.children) });
    }
    public visitUnion<T extends type.Union>(type: T, { length, nullCount } = this.nextFieldNode()) {
        if (this.metadataVersion < MetadataVersion.V5) {
            this.readNullBitmap(type, nullCount);
        }
        return type.mode === UnionMode.Sparse
            ? this.visitSparseUnion(type as type.SparseUnion, { length, nullCount })
            : this.visitDenseUnion(type as type.DenseUnion, { length, nullCount });
    }
    public visitDenseUnion<T extends type.DenseUnion>(type: T, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, typeIds: this.readTypeIds(type), valueOffsets: this.readOffsets(type), children: this.visitMany(type.children) });
    }
    public visitSparseUnion<T extends type.SparseUnion>(type: T, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, typeIds: this.readTypeIds(type), children: this.visitMany(type.children) });
    }
    public visitDictionary<T extends type.Dictionary>(type: T, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type.indices), dictionary: this.readDictionary(type) });
    }
    public visitInterval<T extends type.Interval>(type: T, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    public visitDuration<T extends type.Duration>(type: T, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    public visitFixedSizeList<T extends type.FixedSizeList>(type: T, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), 'child': this.visit(type.children[0]) });
    }
    public visitMap<T extends type.Map_>(type: T, { length, nullCount } = this.nextFieldNode()) {
        return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), 'child': this.visit(type.children[0]) });
    }

    protected nextFieldNode() { return this.nodes[++this.nodesIndex]; }
    protected nextBufferRange() { return this.buffers[++this.buffersIndex]; }
    protected readNullBitmap<T extends DataType>(type: T, nullCount: number, buffer = this.nextBufferRange()) {
        return nullCount > 0 && this.readData(type, buffer) || new Uint8Array(0);
    }
    protected readOffsets<T extends DataType>(type: T, buffer?: BufferRegion) { return this.readData(type, buffer); }
    protected readTypeIds<T extends DataType>(type: T, buffer?: BufferRegion) { return this.readData(type, buffer); }
    protected readData<T extends DataType>(_type: T, { length, offset } = this.nextBufferRange()) {
        return this.bytes.subarray(offset, offset + length);
    }
    protected readVariadicBuffers(length: number) {
        return Array.from({ length }, () => this.readData(null as any));
    }
    protected nextVariadicBufferCount() {
        return this.variadicBufferCounts[++this.variadicBufferIndex] ?? 0;
    }
    protected readDictionary<T extends type.Dictionary>(type: T): Vector<T['dictionary']> {
        return this.dictionaries.get(type.id)!;
    }
}

/** @ignore */
export class JSONVectorLoader extends VectorLoader {
    private sources: any[][];
    constructor(sources: any[][], nodes: FieldNode[], buffers: BufferRegion[], dictionaries: Map<number, Vector<any>>, metadataVersion: MetadataVersion, variadicBufferCounts: number[] = []) {
        super(new Uint8Array(0), nodes, buffers, dictionaries, metadataVersion, variadicBufferCounts);
        this.sources = sources;
    }
    protected readNullBitmap<T extends DataType>(_type: T, nullCount: number, { offset } = this.nextBufferRange()) {
        return nullCount <= 0 ? new Uint8Array(0) : packBools(this.sources[offset]);
    }
    protected readOffsets<T extends DataType>(_type: T, { offset } = this.nextBufferRange()) {
        return toArrayBufferView(Uint8Array, toArrayBufferView(_type.OffsetArrayType, this.sources[offset]));
    }
    protected readTypeIds<T extends DataType>(type: T, { offset } = this.nextBufferRange()) {
        return toArrayBufferView(Uint8Array, toArrayBufferView(type.ArrayType, this.sources[offset]));
    }
    protected readData<T extends DataType>(type: T, { offset } = this.nextBufferRange()) {
        const { sources } = this;
        if (DataType.isTimestamp(type)) {
            return toArrayBufferView(Uint8Array, Int64.convertArray(sources[offset] as string[]));
        } else if ((DataType.isInt(type) || DataType.isTime(type)) && type.bitWidth === 64 || DataType.isDuration(type)) {
            return toArrayBufferView(Uint8Array, Int64.convertArray(sources[offset] as string[]));
        } else if (DataType.isDate(type) && type.unit === DateUnit.MILLISECOND) {
            return toArrayBufferView(Uint8Array, Int64.convertArray(sources[offset] as string[]));
        } else if (DataType.isDecimal(type)) {
            return toArrayBufferView(Uint8Array, Int128.convertArray(sources[offset] as string[]));
        } else if (DataType.isBinary(type) || DataType.isLargeBinary(type) || DataType.isFixedSizeBinary(type)) {
            return binaryDataFromJSON(sources[offset] as string[]);
        } else if (DataType.isBinaryView(type)) {
            return binaryViewDataFromJSON(sources[offset] as any[]);
        } else if (DataType.isUtf8View(type)) {
            return utf8ViewDataFromJSON(sources[offset] as any[]);
        } else if (DataType.isBool(type)) {
            return packBools(sources[offset] as number[]);
        } else if (DataType.isUtf8(type) || DataType.isLargeUtf8(type)) {
            return encodeUtf8((sources[offset] as string[]).join(''));
        } else if (DataType.isInterval(type)) {
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
    protected readVariadicBuffers(length: number) {
        // Per Arrow C++ reference implementation (cpp/src/arrow/ipc/reader.cc),
        // each variadic buffer is stored as a separate buffer region, matching
        // the IPC format where each is accessed via separate GetBuffer() calls.
        // VARIADIC_DATA_BUFFERS in JSON is an array, but flattenDataSources spreads
        // it so each hex string gets its own sources entry, maintaining 1:1
        // correspondence with BufferRegion entries.
        const buffers: Uint8Array[] = [];
        for (let i = 0; i < length; i++) {
            const { offset } = this.nextBufferRange();
            // sources[offset] is 'any[]' but for variadic buffers it's actually a string
            // after spreading in flattenDataSources. Cast necessary due to heterogeneous
            // sources array structure (most fields are arrays, variadic elements are strings).
            const hexString = this.sources[offset] as unknown as string;
            buffers.push(hexStringToBytes(hexString));
        }
        return buffers;
    }
}

/** @ignore */
function hexStringToBytes(hexString: string): Uint8Array {
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
function binaryDataFromJSON(values: string[]): Uint8Array {
    // Arrow JSON Binary/LargeBinary/FixedSizeBinary format:
    // "DATA": ["49BC7D5B6C47D2","3F5FB6D9322026"] (array of hex strings, one per value)
    // Join all values into one continuous hex string, then parse to bytes.
    return hexStringToBytes(values.join(''));
}

/** @ignore */
function parseViewDataFromJSON(views: any[], parseInlined: (inlined: string) => Uint8Array) {
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
        } else {
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
function binaryViewDataFromJSON(views: any[]) {
    return parseViewDataFromJSON(views, (inlined: string) => {
        // BinaryView: INLINED is hex-encoded string
        const bytes = new Uint8Array(inlined.length / 2);
        for (let i = 0; i < inlined.length; i += 2) {
            bytes[i >> 1] = Number.parseInt(inlined.slice(i, i + 2), 16);
        }
        return bytes;
    });
}

/** @ignore */
function utf8ViewDataFromJSON(views: any[]) {
    return parseViewDataFromJSON(views, (inlined: string) => {
        // Utf8View: INLINED is UTF-8 string - encode to bytes
        const encoder = new TextEncoder();
        return encoder.encode(inlined);
    });
}

export class CompressedVectorLoader extends VectorLoader {
    private bodyChunks: Uint8Array[];
    constructor(bodyChunks: Uint8Array[], nodes: FieldNode[], buffers: BufferRegion[], dictionaries: Map<number, Vector<any>>, metadataVersion: MetadataVersion, variadicBufferCounts: number[] = []) {
        super(new Uint8Array(0), nodes, buffers, dictionaries, metadataVersion, variadicBufferCounts);
        this.bodyChunks = bodyChunks;
    }
    protected readData<T extends DataType>(_type: T, _buffer = this.nextBufferRange()) {
        return this.bodyChunks[this.buffersIndex];
    }
}
