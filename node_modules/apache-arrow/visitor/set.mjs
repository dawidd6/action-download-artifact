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
import { Vector } from '../vector.mjs';
import { Visitor } from '../visitor.mjs';
import { bigIntToNumber } from '../util/bigint.mjs';
import { encodeUtf8 } from '../util/utf8.mjs';
import { float64ToUint16 } from '../util/math.mjs';
import { UnionMode, Precision, DateUnit, TimeUnit, IntervalUnit } from '../enum.mjs';
import { BinaryView, } from '../type.mjs';
/** @ignore */
export class SetVisitor extends Visitor {
}
/** @ignore */
function wrapSet(fn) {
    return (data, _1, _2) => {
        if (data.setValid(_1, _2 != null)) {
            return fn(data, _1, _2);
        }
    };
}
/** @ignore */
export const setEpochMsToDays = (data, index, epochMs) => { data[index] = Math.floor(epochMs / 86400000); };
/** @ignore */
export const setVariableWidthBytes = (values, valueOffsets, index, value) => {
    if (index + 1 < valueOffsets.length) {
        const x = bigIntToNumber(valueOffsets[index]);
        const y = bigIntToNumber(valueOffsets[index + 1]);
        values.set(value.subarray(0, y - x), x);
    }
};
/** @ignore */
const setBool = ({ offset, values }, index, val) => {
    const idx = offset + index;
    val ? (values[idx >> 3] |= (1 << (idx % 8))) // true
        : (values[idx >> 3] &= ~(1 << (idx % 8))); // false
};
/** @ignore */
export const setInt = ({ values }, index, value) => { values[index] = value; };
/** @ignore */
export const setFloat = ({ values }, index, value) => { values[index] = value; };
/** @ignore */
export const setFloat16 = ({ values }, index, value) => { values[index] = float64ToUint16(value); };
/* istanbul ignore next */
/** @ignore */
export const setAnyFloat = (data, index, value) => {
    switch (data.type.precision) {
        case Precision.HALF:
            return setFloat16(data, index, value);
        case Precision.SINGLE:
        case Precision.DOUBLE:
            return setFloat(data, index, value);
    }
};
/** @ignore */
export const setDateDay = ({ values }, index, value) => { setEpochMsToDays(values, index, value.valueOf()); };
/** @ignore */
export const setDateMillisecond = ({ values }, index, value) => { values[index] = BigInt(value); };
/** @ignore */
export const setFixedSizeBinary = ({ stride, values }, index, value) => { values.set(value.subarray(0, stride), stride * index); };
/** @ignore */
const setBinary = ({ values, valueOffsets }, index, value) => setVariableWidthBytes(values, valueOffsets, index, value);
/** @ignore */
const ensureWritableVariadicBuffers = (data) => {
    let buffers = data.variadicBuffers;
    if (!Array.isArray(buffers) || Object.isFrozen(buffers)) {
        buffers = Array.from(buffers);
        data.variadicBuffers = buffers;
    }
    return buffers;
};
/** @ignore */
const setBinaryViewBytes = (data, index, bytes) => {
    var _a, _b, _c, _d;
    const views = data.values;
    if (!views) {
        throw new Error('BinaryView data is missing view buffer');
    }
    const elementWidth = BinaryView.ELEMENT_WIDTH;
    const viewOffset = index * elementWidth;
    const end = viewOffset + elementWidth;
    if (viewOffset < 0 || end > views.length) {
        throw new RangeError(`BinaryView index ${index} out of bounds`);
    }
    views.fill(0, viewOffset, end);
    const view = new DataView(views.buffer, views.byteOffset + viewOffset, elementWidth);
    const length = bytes.length;
    view.setInt32(BinaryView.LENGTH_OFFSET, length, true);
    if (length <= BinaryView.INLINE_CAPACITY) {
        views.set(bytes, viewOffset + BinaryView.INLINE_OFFSET);
        return;
    }
    const prefix = ((_a = bytes[0]) !== null && _a !== void 0 ? _a : 0) |
        (((_b = bytes[1]) !== null && _b !== void 0 ? _b : 0) << 8) |
        (((_c = bytes[2]) !== null && _c !== void 0 ? _c : 0) << 16) |
        (((_d = bytes[3]) !== null && _d !== void 0 ? _d : 0) << 24);
    view.setUint32(BinaryView.INLINE_OFFSET, prefix >>> 0, true);
    const buffers = ensureWritableVariadicBuffers(data);
    const copy = bytes.slice();
    const bufferIndex = buffers.push(copy) - 1;
    view.setInt32(BinaryView.BUFFER_INDEX_OFFSET, bufferIndex, true);
    view.setInt32(BinaryView.BUFFER_OFFSET_OFFSET, 0, true);
};
/** @ignore */
const setBinaryView = (data, index, value) => {
    const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
    setBinaryViewBytes(data, index, bytes);
};
/** @ignore */
const setUtf8 = ({ values, valueOffsets }, index, value) => setVariableWidthBytes(values, valueOffsets, index, encodeUtf8(value));
/** @ignore */
const setUtf8View = (data, index, value) => {
    const bytes = encodeUtf8(value);
    setBinaryViewBytes(data, index, bytes);
};
/* istanbul ignore next */
export const setDate = (data, index, value) => {
    data.type.unit === DateUnit.DAY
        ? setDateDay(data, index, value)
        : setDateMillisecond(data, index, value);
};
/** @ignore */
export const setTimestampSecond = ({ values }, index, value) => { values[index] = BigInt(value / 1000); };
/** @ignore */
export const setTimestampMillisecond = ({ values }, index, value) => { values[index] = BigInt(value); };
/** @ignore */
export const setTimestampMicrosecond = ({ values }, index, value) => { values[index] = BigInt(value * 1000); };
/** @ignore */
export const setTimestampNanosecond = ({ values }, index, value) => { values[index] = BigInt(value * 1000000); };
/* istanbul ignore next */
/** @ignore */
export const setTimestamp = (data, index, value) => {
    switch (data.type.unit) {
        case TimeUnit.SECOND: return setTimestampSecond(data, index, value);
        case TimeUnit.MILLISECOND: return setTimestampMillisecond(data, index, value);
        case TimeUnit.MICROSECOND: return setTimestampMicrosecond(data, index, value);
        case TimeUnit.NANOSECOND: return setTimestampNanosecond(data, index, value);
    }
};
/** @ignore */
export const setTimeSecond = ({ values }, index, value) => { values[index] = value; };
/** @ignore */
export const setTimeMillisecond = ({ values }, index, value) => { values[index] = value; };
/** @ignore */
export const setTimeMicrosecond = ({ values }, index, value) => { values[index] = value; };
/** @ignore */
export const setTimeNanosecond = ({ values }, index, value) => { values[index] = value; };
/* istanbul ignore next */
/** @ignore */
export const setTime = (data, index, value) => {
    switch (data.type.unit) {
        case TimeUnit.SECOND: return setTimeSecond(data, index, value);
        case TimeUnit.MILLISECOND: return setTimeMillisecond(data, index, value);
        case TimeUnit.MICROSECOND: return setTimeMicrosecond(data, index, value);
        case TimeUnit.NANOSECOND: return setTimeNanosecond(data, index, value);
    }
};
/** @ignore */
export const setDecimal = ({ values, stride }, index, value) => { values.set(value.subarray(0, stride), stride * index); };
/** @ignore */
const setList = (data, index, value) => {
    const values = data.children[0];
    const valueOffsets = data.valueOffsets;
    const set = instance.getVisitFn(values);
    const begin = bigIntToNumber(valueOffsets[index]);
    const end = bigIntToNumber(valueOffsets[index + 1]);
    if (Array.isArray(value)) {
        for (let idx = -1, itr = begin; itr < end;) {
            set(values, itr++, value[++idx]);
        }
    }
    else {
        for (let idx = -1, itr = begin; itr < end;) {
            set(values, itr++, value.get(++idx));
        }
    }
};
/** @ignore */
const setMap = (data, index, value) => {
    const values = data.children[0];
    const { valueOffsets } = data;
    const set = instance.getVisitFn(values);
    let { [index]: idx, [index + 1]: end } = valueOffsets;
    const entries = value instanceof Map ? value.entries() : Object.entries(value);
    for (const val of entries) {
        set(values, idx, val);
        if (++idx >= end)
            break;
    }
};
/** @ignore */ const _setStructArrayValue = (o, v) => (set, c, _, i) => c && set(c, o, v[i]);
/** @ignore */ const _setStructVectorValue = (o, v) => (set, c, _, i) => c && set(c, o, v.get(i));
/** @ignore */ const _setStructMapValue = (o, v) => (set, c, f, _) => c && set(c, o, v.get(f.name));
/** @ignore */ const _setStructObjectValue = (o, v) => (set, c, f, _) => c && set(c, o, v[f.name]);
/** @ignore */
const setStruct = (data, index, value) => {
    const childSetters = data.type.children.map((f) => instance.getVisitFn(f.type));
    const set = value instanceof Map ? _setStructMapValue(index, value) :
        value instanceof Vector ? _setStructVectorValue(index, value) :
            Array.isArray(value) ? _setStructArrayValue(index, value) :
                _setStructObjectValue(index, value);
    // eslint-disable-next-line unicorn/no-array-for-each
    data.type.children.forEach((f, i) => set(childSetters[i], data.children[i], f, i));
};
/* istanbul ignore next */
/** @ignore */
const setUnion = (data, index, value) => {
    data.type.mode === UnionMode.Dense ?
        setDenseUnion(data, index, value) :
        setSparseUnion(data, index, value);
};
/** @ignore */
const setDenseUnion = (data, index, value) => {
    const childIndex = data.type.typeIdToChildIndex[data.typeIds[index]];
    const child = data.children[childIndex];
    instance.visit(child, data.valueOffsets[index], value);
};
/** @ignore */
const setSparseUnion = (data, index, value) => {
    const childIndex = data.type.typeIdToChildIndex[data.typeIds[index]];
    const child = data.children[childIndex];
    instance.visit(child, index, value);
};
/** @ignore */
const setDictionary = (data, index, value) => {
    var _a;
    (_a = data.dictionary) === null || _a === void 0 ? void 0 : _a.set(data.values[index], value);
};
/* istanbul ignore next */
/** @ignore */
export const setIntervalValue = (data, index, value) => {
    switch (data.type.unit) {
        case IntervalUnit.YEAR_MONTH: return setIntervalYearMonth(data, index, value);
        case IntervalUnit.DAY_TIME: return setIntervalDayTime(data, index, value);
        case IntervalUnit.MONTH_DAY_NANO: return setIntervalMonthDayNano(data, index, value);
    }
};
/** @ignore */
export const setIntervalDayTime = ({ values }, index, value) => { values.set(value.subarray(0, 2), 2 * index); };
/** @ignore */
export const setIntervalYearMonth = ({ values }, index, value) => { values[index] = (value[0] * 12) + (value[1] % 12); };
/** @ignore */
export const setIntervalMonthDayNano = ({ values, stride }, index, value) => { values.set(value.subarray(0, stride), stride * index); };
/** @ignore */
export const setDurationSecond = ({ values }, index, value) => { values[index] = value; };
/** @ignore */
export const setDurationMillisecond = ({ values }, index, value) => { values[index] = value; };
/** @ignore */
export const setDurationMicrosecond = ({ values }, index, value) => { values[index] = value; };
/** @ignore */
export const setDurationNanosecond = ({ values }, index, value) => { values[index] = value; };
/* istanbul ignore next */
/** @ignore */
export const setDuration = (data, index, value) => {
    switch (data.type.unit) {
        case TimeUnit.SECOND: return setDurationSecond(data, index, value);
        case TimeUnit.MILLISECOND: return setDurationMillisecond(data, index, value);
        case TimeUnit.MICROSECOND: return setDurationMicrosecond(data, index, value);
        case TimeUnit.NANOSECOND: return setDurationNanosecond(data, index, value);
    }
};
/** @ignore */
const setFixedSizeList = (data, index, value) => {
    const { stride } = data;
    const child = data.children[0];
    const set = instance.getVisitFn(child);
    if (Array.isArray(value)) {
        for (let idx = -1, offset = index * stride; ++idx < stride;) {
            set(child, offset + idx, value[idx]);
        }
    }
    else {
        for (let idx = -1, offset = index * stride; ++idx < stride;) {
            set(child, offset + idx, value.get(idx));
        }
    }
};
SetVisitor.prototype.visitBool = wrapSet(setBool);
SetVisitor.prototype.visitInt = wrapSet(setInt);
SetVisitor.prototype.visitInt8 = wrapSet(setInt);
SetVisitor.prototype.visitInt16 = wrapSet(setInt);
SetVisitor.prototype.visitInt32 = wrapSet(setInt);
SetVisitor.prototype.visitInt64 = wrapSet(setInt);
SetVisitor.prototype.visitUint8 = wrapSet(setInt);
SetVisitor.prototype.visitUint16 = wrapSet(setInt);
SetVisitor.prototype.visitUint32 = wrapSet(setInt);
SetVisitor.prototype.visitUint64 = wrapSet(setInt);
SetVisitor.prototype.visitFloat = wrapSet(setAnyFloat);
SetVisitor.prototype.visitFloat16 = wrapSet(setFloat16);
SetVisitor.prototype.visitFloat32 = wrapSet(setFloat);
SetVisitor.prototype.visitFloat64 = wrapSet(setFloat);
SetVisitor.prototype.visitUtf8 = wrapSet(setUtf8);
SetVisitor.prototype.visitLargeUtf8 = wrapSet(setUtf8);
SetVisitor.prototype.visitUtf8View = wrapSet(setUtf8View);
SetVisitor.prototype.visitBinary = wrapSet(setBinary);
SetVisitor.prototype.visitLargeBinary = wrapSet(setBinary);
SetVisitor.prototype.visitBinaryView = wrapSet(setBinaryView);
SetVisitor.prototype.visitFixedSizeBinary = wrapSet(setFixedSizeBinary);
SetVisitor.prototype.visitDate = wrapSet(setDate);
SetVisitor.prototype.visitDateDay = wrapSet(setDateDay);
SetVisitor.prototype.visitDateMillisecond = wrapSet(setDateMillisecond);
SetVisitor.prototype.visitTimestamp = wrapSet(setTimestamp);
SetVisitor.prototype.visitTimestampSecond = wrapSet(setTimestampSecond);
SetVisitor.prototype.visitTimestampMillisecond = wrapSet(setTimestampMillisecond);
SetVisitor.prototype.visitTimestampMicrosecond = wrapSet(setTimestampMicrosecond);
SetVisitor.prototype.visitTimestampNanosecond = wrapSet(setTimestampNanosecond);
SetVisitor.prototype.visitTime = wrapSet(setTime);
SetVisitor.prototype.visitTimeSecond = wrapSet(setTimeSecond);
SetVisitor.prototype.visitTimeMillisecond = wrapSet(setTimeMillisecond);
SetVisitor.prototype.visitTimeMicrosecond = wrapSet(setTimeMicrosecond);
SetVisitor.prototype.visitTimeNanosecond = wrapSet(setTimeNanosecond);
SetVisitor.prototype.visitDecimal = wrapSet(setDecimal);
SetVisitor.prototype.visitList = wrapSet(setList);
SetVisitor.prototype.visitLargeList = wrapSet(setList);
SetVisitor.prototype.visitStruct = wrapSet(setStruct);
SetVisitor.prototype.visitUnion = wrapSet(setUnion);
SetVisitor.prototype.visitDenseUnion = wrapSet(setDenseUnion);
SetVisitor.prototype.visitSparseUnion = wrapSet(setSparseUnion);
SetVisitor.prototype.visitDictionary = wrapSet(setDictionary);
SetVisitor.prototype.visitInterval = wrapSet(setIntervalValue);
SetVisitor.prototype.visitIntervalDayTime = wrapSet(setIntervalDayTime);
SetVisitor.prototype.visitIntervalYearMonth = wrapSet(setIntervalYearMonth);
SetVisitor.prototype.visitIntervalMonthDayNano = wrapSet(setIntervalMonthDayNano);
SetVisitor.prototype.visitDuration = wrapSet(setDuration);
SetVisitor.prototype.visitDurationSecond = wrapSet(setDurationSecond);
SetVisitor.prototype.visitDurationMillisecond = wrapSet(setDurationMillisecond);
SetVisitor.prototype.visitDurationMicrosecond = wrapSet(setDurationMicrosecond);
SetVisitor.prototype.visitDurationNanosecond = wrapSet(setDurationNanosecond);
SetVisitor.prototype.visitFixedSizeList = wrapSet(setFixedSizeList);
SetVisitor.prototype.visitMap = wrapSet(setMap);
/** @ignore */
export const instance = new SetVisitor();

//# sourceMappingURL=set.mjs.map
