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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DenseUnion = exports.Union = exports.Struct = exports.LargeList = exports.List = exports.DurationNanosecond = exports.DurationMicrosecond = exports.DurationMillisecond = exports.DurationSecond = exports.Duration = exports.IntervalMonthDayNano = exports.IntervalYearMonth = exports.IntervalDayTime = exports.Interval = exports.TimestampNanosecond = exports.TimestampMicrosecond = exports.TimestampMillisecond = exports.TimestampSecond = exports.Timestamp = exports.TimeNanosecond = exports.TimeMicrosecond = exports.TimeMillisecond = exports.TimeSecond = exports.Time = exports.DateMillisecond = exports.DateDay = exports.Date_ = exports.Decimal = exports.Bool = exports.LargeUtf8 = exports.Utf8View = exports.Utf8 = exports.LargeBinary = exports.BinaryView = exports.Binary = exports.Float64 = exports.Float32 = exports.Float16 = exports.Float = exports.Uint64 = exports.Uint32 = exports.Uint16 = exports.Uint8 = exports.Int64 = exports.Int32 = exports.Int16 = exports.Int8 = exports.Int = exports.Null = exports.DataType = void 0;
exports.strideForType = exports.Dictionary = exports.Map_ = exports.FixedSizeList = exports.FixedSizeBinary = exports.SparseUnion = void 0;
const bigint_js_1 = require("./util/bigint.js");
const enum_js_1 = require("./enum.js");
/** @ignore */
const kDataTypeSymbol = Symbol.for('apache-arrow/DataType');
/**
 * An abstract base class for classes that encapsulate metadata about each of
 * the logical types that Arrow can represent.
 */
class DataType {
    /**
     * Check if an object is an instance of DataType.
     * This works across different instances of the Arrow library.
     *
     * Note: We intentionally do NOT implement Symbol.hasInstance here because
     * it would break instanceof checks for subclasses like Struct, Dictionary, etc.
     * Use DataType.isDataType() for cross-library type checking instead.
     * @nocollapse
     */
    static isDataType(x) {
        return (x === null || x === void 0 ? void 0 : x[kDataTypeSymbol]) === true;
    }
    /** @nocollapse */ static isNull(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.Null; }
    /** @nocollapse */ static isInt(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.Int; }
    /** @nocollapse */ static isFloat(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.Float; }
    /** @nocollapse */ static isBinary(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.Binary; }
    /** @nocollapse */ static isBinaryView(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.BinaryView; }
    /** @nocollapse */ static isLargeBinary(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.LargeBinary; }
    /** @nocollapse */ static isUtf8(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.Utf8; }
    /** @nocollapse */ static isUtf8View(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.Utf8View; }
    /** @nocollapse */ static isLargeUtf8(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.LargeUtf8; }
    /** @nocollapse */ static isBool(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.Bool; }
    /** @nocollapse */ static isDecimal(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.Decimal; }
    /** @nocollapse */ static isDate(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.Date; }
    /** @nocollapse */ static isTime(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.Time; }
    /** @nocollapse */ static isTimestamp(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.Timestamp; }
    /** @nocollapse */ static isInterval(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.Interval; }
    /** @nocollapse */ static isDuration(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.Duration; }
    /** @nocollapse */ static isList(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.List; }
    /** @nocollapse */ static isLargeList(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.LargeList; }
    // TODO: Implement ListView type
    //     /** @nocollapse */ static isListView(x: any): x is ListView { return x?.typeId === Type.ListView; }
    /** @nocollapse */ static isStruct(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.Struct; }
    /** @nocollapse */ static isUnion(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.Union; }
    /** @nocollapse */ static isFixedSizeBinary(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.FixedSizeBinary; }
    /** @nocollapse */ static isFixedSizeList(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.FixedSizeList; }
    /** @nocollapse */ static isMap(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.Map; }
    /** @nocollapse */ static isDictionary(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === enum_js_1.Type.Dictionary; }
    /** @nocollapse */ static isDenseUnion(x) { return DataType.isUnion(x) && x.mode === enum_js_1.UnionMode.Dense; }
    /** @nocollapse */ static isSparseUnion(x) { return DataType.isUnion(x) && x.mode === enum_js_1.UnionMode.Sparse; }
    constructor(typeId) {
        this.typeId = typeId;
    }
}
exports.DataType = DataType;
_a = Symbol.toStringTag;
DataType[_a] = ((proto) => {
    proto.children = null;
    proto.ArrayType = Array;
    proto.OffsetArrayType = Int32Array;
    proto[kDataTypeSymbol] = true;
    return proto[Symbol.toStringTag] = 'DataType';
})(DataType.prototype);
/** @ignore */
class Null extends DataType {
    constructor() {
        super(enum_js_1.Type.Null);
    }
    toString() { return `Null`; }
}
exports.Null = Null;
_b = Symbol.toStringTag;
Null[_b] = ((proto) => proto[Symbol.toStringTag] = 'Null')(Null.prototype);
/** @ignore */
class Int_ extends DataType {
    constructor(isSigned, bitWidth) {
        super(enum_js_1.Type.Int);
        this.isSigned = isSigned;
        this.bitWidth = bitWidth;
    }
    get ArrayType() {
        switch (this.bitWidth) {
            case 8: return this.isSigned ? Int8Array : Uint8Array;
            case 16: return this.isSigned ? Int16Array : Uint16Array;
            case 32: return this.isSigned ? Int32Array : Uint32Array;
            case 64: return this.isSigned ? BigInt64Array : BigUint64Array;
        }
        throw new Error(`Unrecognized ${this[Symbol.toStringTag]} type`);
    }
    toString() { return `${this.isSigned ? `I` : `Ui`}nt${this.bitWidth}`; }
}
exports.Int = Int_;
_c = Symbol.toStringTag;
Int_[_c] = ((proto) => {
    proto.isSigned = null;
    proto.bitWidth = null;
    return proto[Symbol.toStringTag] = 'Int';
})(Int_.prototype);
/** @ignore */
class Int8 extends Int_ {
    constructor() { super(true, 8); }
    get ArrayType() { return Int8Array; }
}
exports.Int8 = Int8;
/** @ignore */
class Int16 extends Int_ {
    constructor() { super(true, 16); }
    get ArrayType() { return Int16Array; }
}
exports.Int16 = Int16;
/** @ignore */
class Int32 extends Int_ {
    constructor() { super(true, 32); }
    get ArrayType() { return Int32Array; }
}
exports.Int32 = Int32;
/** @ignore */
class Int64 extends Int_ {
    constructor() { super(true, 64); }
    get ArrayType() { return BigInt64Array; }
}
exports.Int64 = Int64;
/** @ignore */
class Uint8 extends Int_ {
    constructor() { super(false, 8); }
    get ArrayType() { return Uint8Array; }
}
exports.Uint8 = Uint8;
/** @ignore */
class Uint16 extends Int_ {
    constructor() { super(false, 16); }
    get ArrayType() { return Uint16Array; }
}
exports.Uint16 = Uint16;
/** @ignore */
class Uint32 extends Int_ {
    constructor() { super(false, 32); }
    get ArrayType() { return Uint32Array; }
}
exports.Uint32 = Uint32;
/** @ignore */
class Uint64 extends Int_ {
    constructor() { super(false, 64); }
    get ArrayType() { return BigUint64Array; }
}
exports.Uint64 = Uint64;
Object.defineProperty(Int8.prototype, 'ArrayType', { value: Int8Array });
Object.defineProperty(Int16.prototype, 'ArrayType', { value: Int16Array });
Object.defineProperty(Int32.prototype, 'ArrayType', { value: Int32Array });
Object.defineProperty(Int64.prototype, 'ArrayType', { value: BigInt64Array });
Object.defineProperty(Uint8.prototype, 'ArrayType', { value: Uint8Array });
Object.defineProperty(Uint16.prototype, 'ArrayType', { value: Uint16Array });
Object.defineProperty(Uint32.prototype, 'ArrayType', { value: Uint32Array });
Object.defineProperty(Uint64.prototype, 'ArrayType', { value: BigUint64Array });
/** @ignore */
class Float extends DataType {
    constructor(precision) {
        super(enum_js_1.Type.Float);
        this.precision = precision;
    }
    get ArrayType() {
        switch (this.precision) {
            case enum_js_1.Precision.HALF: return Uint16Array;
            case enum_js_1.Precision.SINGLE: return Float32Array;
            case enum_js_1.Precision.DOUBLE: return Float64Array;
        }
        // @ts-ignore
        throw new Error(`Unrecognized ${this[Symbol.toStringTag]} type`);
    }
    toString() { return `Float${(this.precision << 5) || 16}`; }
}
exports.Float = Float;
_d = Symbol.toStringTag;
Float[_d] = ((proto) => {
    proto.precision = null;
    return proto[Symbol.toStringTag] = 'Float';
})(Float.prototype);
/** @ignore */
class Float16 extends Float {
    constructor() { super(enum_js_1.Precision.HALF); }
}
exports.Float16 = Float16;
/** @ignore */
class Float32 extends Float {
    constructor() { super(enum_js_1.Precision.SINGLE); }
}
exports.Float32 = Float32;
/** @ignore */
class Float64 extends Float {
    constructor() { super(enum_js_1.Precision.DOUBLE); }
}
exports.Float64 = Float64;
Object.defineProperty(Float16.prototype, 'ArrayType', { value: Uint16Array });
Object.defineProperty(Float32.prototype, 'ArrayType', { value: Float32Array });
Object.defineProperty(Float64.prototype, 'ArrayType', { value: Float64Array });
/** @ignore */
class Binary extends DataType {
    constructor() {
        super(enum_js_1.Type.Binary);
    }
    toString() { return `Binary`; }
}
exports.Binary = Binary;
_e = Symbol.toStringTag;
Binary[_e] = ((proto) => {
    proto.ArrayType = Uint8Array;
    return proto[Symbol.toStringTag] = 'Binary';
})(Binary.prototype);
/** @ignore */
class BinaryView extends DataType {
    constructor() {
        super(enum_js_1.Type.BinaryView);
    }
    toString() { return `BinaryView`; }
}
exports.BinaryView = BinaryView;
_f = Symbol.toStringTag;
BinaryView.ELEMENT_WIDTH = 16;
BinaryView.INLINE_CAPACITY = 12;
BinaryView.LENGTH_OFFSET = 0;
BinaryView.INLINE_OFFSET = 4;
BinaryView.BUFFER_INDEX_OFFSET = 8;
BinaryView.BUFFER_OFFSET_OFFSET = 12;
BinaryView[_f] = ((proto) => {
    proto.ArrayType = Uint8Array;
    return proto[Symbol.toStringTag] = 'BinaryView';
})(BinaryView.prototype);
/** @ignore */
class LargeBinary extends DataType {
    constructor() {
        super(enum_js_1.Type.LargeBinary);
    }
    toString() { return `LargeBinary`; }
}
exports.LargeBinary = LargeBinary;
_g = Symbol.toStringTag;
LargeBinary[_g] = ((proto) => {
    proto.ArrayType = Uint8Array;
    proto.OffsetArrayType = BigInt64Array;
    return proto[Symbol.toStringTag] = 'LargeBinary';
})(LargeBinary.prototype);
/** @ignore */
class Utf8 extends DataType {
    constructor() {
        super(enum_js_1.Type.Utf8);
    }
    toString() { return `Utf8`; }
}
exports.Utf8 = Utf8;
_h = Symbol.toStringTag;
Utf8[_h] = ((proto) => {
    proto.ArrayType = Uint8Array;
    return proto[Symbol.toStringTag] = 'Utf8';
})(Utf8.prototype);
/** @ignore */
class Utf8View extends DataType {
    constructor() {
        super(enum_js_1.Type.Utf8View);
    }
    toString() { return `Utf8View`; }
}
exports.Utf8View = Utf8View;
_j = Symbol.toStringTag;
Utf8View.ELEMENT_WIDTH = BinaryView.ELEMENT_WIDTH;
Utf8View.INLINE_CAPACITY = BinaryView.INLINE_CAPACITY;
Utf8View[_j] = ((proto) => {
    proto.ArrayType = Uint8Array;
    return proto[Symbol.toStringTag] = 'Utf8View';
})(Utf8View.prototype);
/** @ignore */
class LargeUtf8 extends DataType {
    constructor() {
        super(enum_js_1.Type.LargeUtf8);
    }
    toString() { return `LargeUtf8`; }
}
exports.LargeUtf8 = LargeUtf8;
_k = Symbol.toStringTag;
LargeUtf8[_k] = ((proto) => {
    proto.ArrayType = Uint8Array;
    proto.OffsetArrayType = BigInt64Array;
    return proto[Symbol.toStringTag] = 'LargeUtf8';
})(LargeUtf8.prototype);
/** @ignore */
class Bool extends DataType {
    constructor() {
        super(enum_js_1.Type.Bool);
    }
    toString() { return `Bool`; }
}
exports.Bool = Bool;
_l = Symbol.toStringTag;
Bool[_l] = ((proto) => {
    proto.ArrayType = Uint8Array;
    return proto[Symbol.toStringTag] = 'Bool';
})(Bool.prototype);
/** @ignore */
class Decimal extends DataType {
    constructor(scale, precision, bitWidth = 128) {
        super(enum_js_1.Type.Decimal);
        this.scale = scale;
        this.precision = precision;
        this.bitWidth = bitWidth;
    }
    toString() { return `Decimal[${this.precision}e${this.scale > 0 ? `+` : ``}${this.scale}]`; }
}
exports.Decimal = Decimal;
_m = Symbol.toStringTag;
Decimal[_m] = ((proto) => {
    proto.scale = null;
    proto.precision = null;
    proto.ArrayType = Uint32Array;
    return proto[Symbol.toStringTag] = 'Decimal';
})(Decimal.prototype);
/** @ignore */
class Date_ extends DataType {
    constructor(unit) {
        super(enum_js_1.Type.Date);
        this.unit = unit;
    }
    toString() { return `Date${(this.unit + 1) * 32}<${enum_js_1.DateUnit[this.unit]}>`; }
    get ArrayType() {
        return this.unit === enum_js_1.DateUnit.DAY ? Int32Array : BigInt64Array;
    }
}
exports.Date_ = Date_;
_o = Symbol.toStringTag;
Date_[_o] = ((proto) => {
    proto.unit = null;
    return proto[Symbol.toStringTag] = 'Date';
})(Date_.prototype);
/** @ignore */
class DateDay extends Date_ {
    constructor() { super(enum_js_1.DateUnit.DAY); }
}
exports.DateDay = DateDay;
/**
 * A signed 64-bit date representing the elapsed time since UNIX epoch (1970-01-01) in milliseconds.
 * According to the specification, this should be treated as the number of days, in milliseconds,  since the UNIX epoch.
 * Therefore, values must be evenly divisible by `86_400_000` (the number of milliseconds in a standard day).
 *
 * Practically, validation that values of this type are evenly divisible by `86_400_000` is not enforced by this library
 * for performance and usability reasons.
 *
 * Users should prefer to use {@link DateDay} to cleanly represent the number of days. For JS dates,
 * {@link TimestampMillisecond} is the preferred type.
 *
 * @ignore
 */
class DateMillisecond extends Date_ {
    constructor() { super(enum_js_1.DateUnit.MILLISECOND); }
}
exports.DateMillisecond = DateMillisecond;
/** @ignore */
class Time_ extends DataType {
    constructor(unit, bitWidth) {
        super(enum_js_1.Type.Time);
        this.unit = unit;
        this.bitWidth = bitWidth;
    }
    toString() { return `Time${this.bitWidth}<${enum_js_1.TimeUnit[this.unit]}>`; }
    get ArrayType() {
        switch (this.bitWidth) {
            case 32: return Int32Array;
            case 64: return BigInt64Array;
        }
        // @ts-ignore
        throw new Error(`Unrecognized ${this[Symbol.toStringTag]} type`);
    }
}
exports.Time = Time_;
_p = Symbol.toStringTag;
Time_[_p] = ((proto) => {
    proto.unit = null;
    proto.bitWidth = null;
    return proto[Symbol.toStringTag] = 'Time';
})(Time_.prototype);
/** @ignore */
class TimeSecond extends Time_ {
    constructor() { super(enum_js_1.TimeUnit.SECOND, 32); }
}
exports.TimeSecond = TimeSecond;
/** @ignore */
class TimeMillisecond extends Time_ {
    constructor() { super(enum_js_1.TimeUnit.MILLISECOND, 32); }
}
exports.TimeMillisecond = TimeMillisecond;
/** @ignore */
class TimeMicrosecond extends Time_ {
    constructor() { super(enum_js_1.TimeUnit.MICROSECOND, 64); }
}
exports.TimeMicrosecond = TimeMicrosecond;
/** @ignore */
class TimeNanosecond extends Time_ {
    constructor() { super(enum_js_1.TimeUnit.NANOSECOND, 64); }
}
exports.TimeNanosecond = TimeNanosecond;
/** @ignore */
class Timestamp_ extends DataType {
    constructor(unit, timezone) {
        super(enum_js_1.Type.Timestamp);
        this.unit = unit;
        this.timezone = timezone;
    }
    toString() { return `Timestamp<${enum_js_1.TimeUnit[this.unit]}${this.timezone ? `, ${this.timezone}` : ``}>`; }
}
exports.Timestamp = Timestamp_;
_q = Symbol.toStringTag;
Timestamp_[_q] = ((proto) => {
    proto.unit = null;
    proto.timezone = null;
    proto.ArrayType = BigInt64Array;
    return proto[Symbol.toStringTag] = 'Timestamp';
})(Timestamp_.prototype);
/** @ignore */
class TimestampSecond extends Timestamp_ {
    constructor(timezone) { super(enum_js_1.TimeUnit.SECOND, timezone); }
}
exports.TimestampSecond = TimestampSecond;
/** @ignore */
class TimestampMillisecond extends Timestamp_ {
    constructor(timezone) { super(enum_js_1.TimeUnit.MILLISECOND, timezone); }
}
exports.TimestampMillisecond = TimestampMillisecond;
/** @ignore */
class TimestampMicrosecond extends Timestamp_ {
    constructor(timezone) { super(enum_js_1.TimeUnit.MICROSECOND, timezone); }
}
exports.TimestampMicrosecond = TimestampMicrosecond;
/** @ignore */
class TimestampNanosecond extends Timestamp_ {
    constructor(timezone) { super(enum_js_1.TimeUnit.NANOSECOND, timezone); }
}
exports.TimestampNanosecond = TimestampNanosecond;
/** @ignore */
class Interval_ extends DataType {
    constructor(unit) {
        super(enum_js_1.Type.Interval);
        this.unit = unit;
    }
    toString() { return `Interval<${enum_js_1.IntervalUnit[this.unit]}>`; }
}
exports.Interval = Interval_;
_r = Symbol.toStringTag;
Interval_[_r] = ((proto) => {
    proto.unit = null;
    proto.ArrayType = Int32Array;
    return proto[Symbol.toStringTag] = 'Interval';
})(Interval_.prototype);
/** @ignore */
class IntervalDayTime extends Interval_ {
    constructor() { super(enum_js_1.IntervalUnit.DAY_TIME); }
}
exports.IntervalDayTime = IntervalDayTime;
/** @ignore */
class IntervalYearMonth extends Interval_ {
    constructor() { super(enum_js_1.IntervalUnit.YEAR_MONTH); }
}
exports.IntervalYearMonth = IntervalYearMonth;
/** @ignore */
class IntervalMonthDayNano extends Interval_ {
    constructor() { super(enum_js_1.IntervalUnit.MONTH_DAY_NANO); }
}
exports.IntervalMonthDayNano = IntervalMonthDayNano;
/** @ignore */
class Duration extends DataType {
    constructor(unit) {
        super(enum_js_1.Type.Duration);
        this.unit = unit;
    }
    toString() { return `Duration<${enum_js_1.TimeUnit[this.unit]}>`; }
}
exports.Duration = Duration;
_s = Symbol.toStringTag;
Duration[_s] = ((proto) => {
    proto.unit = null;
    proto.ArrayType = BigInt64Array;
    return proto[Symbol.toStringTag] = 'Duration';
})(Duration.prototype);
/** @ignore */
class DurationSecond extends Duration {
    constructor() { super(enum_js_1.TimeUnit.SECOND); }
}
exports.DurationSecond = DurationSecond;
/** @ignore */
class DurationMillisecond extends Duration {
    constructor() { super(enum_js_1.TimeUnit.MILLISECOND); }
}
exports.DurationMillisecond = DurationMillisecond;
/** @ignore */
class DurationMicrosecond extends Duration {
    constructor() { super(enum_js_1.TimeUnit.MICROSECOND); }
}
exports.DurationMicrosecond = DurationMicrosecond;
/** @ignore */
class DurationNanosecond extends Duration {
    constructor() { super(enum_js_1.TimeUnit.NANOSECOND); }
}
exports.DurationNanosecond = DurationNanosecond;
/** @ignore */
class List extends DataType {
    constructor(child) {
        super(enum_js_1.Type.List);
        this.children = [child];
    }
    toString() { return `List<${this.valueType}>`; }
    get valueType() { return this.children[0].type; }
    get valueField() { return this.children[0]; }
    get ArrayType() { return this.valueType.ArrayType; }
}
exports.List = List;
_t = Symbol.toStringTag;
List[_t] = ((proto) => {
    proto.children = null;
    return proto[Symbol.toStringTag] = 'List';
})(List.prototype);
/**
 * Like `List`, but with 64-bit value offsets — use this when a list column's
 * cumulative child-element count would exceed `List`'s 32-bit offset ceiling
 * of `2^31 - 1`. Otherwise prefer `List`.
 *
 * Values round-trip losslessly through Arrow IPC at any 64-bit offset magnitude.
 * In-process JavaScript APIs (`.get(i)`, slicing, builders) narrow offsets to a
 * JS `number` and are therefore bounded by `Number.MAX_SAFE_INTEGER`
 * (`2^53 - 1`, about 9×10^15) cumulative child elements per column. If an
 * operation would cross that ceiling, it throws a `TypeError` rather than
 * silently returning data at a truncated index. This matches the behavior of
 * `LargeUtf8` and `LargeBinary`.
 *
 * @ignore
 */
class LargeList extends DataType {
    constructor(child) {
        super(enum_js_1.Type.LargeList);
        this.children = [child];
    }
    toString() { return `LargeList<${this.valueType}>`; }
    get valueType() { return this.children[0].type; }
    get valueField() { return this.children[0]; }
    get ArrayType() { return this.valueType.ArrayType; }
}
exports.LargeList = LargeList;
_u = Symbol.toStringTag;
LargeList[_u] = ((proto) => {
    proto.children = null;
    proto.OffsetArrayType = BigInt64Array;
    return proto[Symbol.toStringTag] = 'LargeList';
})(LargeList.prototype);
/** @ignore */
class Struct extends DataType {
    constructor(children) {
        super(enum_js_1.Type.Struct);
        this.children = children;
    }
    toString() { return `Struct<{${this.children.map((f) => `${f.name}:${f.type}`).join(`, `)}}>`; }
}
exports.Struct = Struct;
_v = Symbol.toStringTag;
Struct[_v] = ((proto) => {
    proto.children = null;
    return proto[Symbol.toStringTag] = 'Struct';
})(Struct.prototype);
/** @ignore */
class Union_ extends DataType {
    constructor(mode, typeIds, children) {
        super(enum_js_1.Type.Union);
        this.mode = mode;
        this.children = children;
        this.typeIds = typeIds = Int32Array.from(typeIds);
        this.typeIdToChildIndex = typeIds.reduce((typeIdToChildIndex, typeId, idx) => (typeIdToChildIndex[typeId] = idx) && typeIdToChildIndex || typeIdToChildIndex, Object.create(null));
    }
    toString() {
        return `${this[Symbol.toStringTag]}<${this.children.map((x) => `${x.type}`).join(` | `)}>`;
    }
}
exports.Union = Union_;
_w = Symbol.toStringTag;
Union_[_w] = ((proto) => {
    proto.mode = null;
    proto.typeIds = null;
    proto.children = null;
    proto.typeIdToChildIndex = null;
    proto.ArrayType = Int8Array;
    return proto[Symbol.toStringTag] = 'Union';
})(Union_.prototype);
/** @ignore */
class DenseUnion extends Union_ {
    constructor(typeIds, children) {
        super(enum_js_1.UnionMode.Dense, typeIds, children);
    }
}
exports.DenseUnion = DenseUnion;
/** @ignore */
class SparseUnion extends Union_ {
    constructor(typeIds, children) {
        super(enum_js_1.UnionMode.Sparse, typeIds, children);
    }
}
exports.SparseUnion = SparseUnion;
/** @ignore */
class FixedSizeBinary extends DataType {
    constructor(byteWidth) {
        super(enum_js_1.Type.FixedSizeBinary);
        this.byteWidth = byteWidth;
    }
    toString() { return `FixedSizeBinary[${this.byteWidth}]`; }
}
exports.FixedSizeBinary = FixedSizeBinary;
_x = Symbol.toStringTag;
FixedSizeBinary[_x] = ((proto) => {
    proto.byteWidth = null;
    proto.ArrayType = Uint8Array;
    return proto[Symbol.toStringTag] = 'FixedSizeBinary';
})(FixedSizeBinary.prototype);
/** @ignore */
class FixedSizeList extends DataType {
    constructor(listSize, child) {
        super(enum_js_1.Type.FixedSizeList);
        this.listSize = listSize;
        this.children = [child];
    }
    get valueType() { return this.children[0].type; }
    get valueField() { return this.children[0]; }
    get ArrayType() { return this.valueType.ArrayType; }
    toString() { return `FixedSizeList[${this.listSize}]<${this.valueType}>`; }
}
exports.FixedSizeList = FixedSizeList;
_y = Symbol.toStringTag;
FixedSizeList[_y] = ((proto) => {
    proto.children = null;
    proto.listSize = null;
    return proto[Symbol.toStringTag] = 'FixedSizeList';
})(FixedSizeList.prototype);
/** @ignore */
class Map_ extends DataType {
    constructor(entries, keysSorted = false) {
        var _1, _2, _3;
        super(enum_js_1.Type.Map);
        this.children = [entries];
        this.keysSorted = keysSorted;
        // ARROW-8716
        // https://github.com/apache/arrow/issues/17168
        if (entries) {
            entries['name'] = 'entries';
            if ((_1 = entries === null || entries === void 0 ? void 0 : entries.type) === null || _1 === void 0 ? void 0 : _1.children) {
                const key = (_2 = entries === null || entries === void 0 ? void 0 : entries.type) === null || _2 === void 0 ? void 0 : _2.children[0];
                if (key) {
                    key['name'] = 'key';
                }
                const val = (_3 = entries === null || entries === void 0 ? void 0 : entries.type) === null || _3 === void 0 ? void 0 : _3.children[1];
                if (val) {
                    val['name'] = 'value';
                }
            }
        }
    }
    get keyType() { return this.children[0].type.children[0].type; }
    get valueType() { return this.children[0].type.children[1].type; }
    get childType() { return this.children[0].type; }
    toString() { return `Map<{${this.children[0].type.children.map((f) => `${f.name}:${f.type}`).join(`, `)}}>`; }
}
exports.Map_ = Map_;
_z = Symbol.toStringTag;
Map_[_z] = ((proto) => {
    proto.children = null;
    proto.keysSorted = null;
    return proto[Symbol.toStringTag] = 'Map_';
})(Map_.prototype);
/** @ignore */
const getId = ((atomicDictionaryId) => () => ++atomicDictionaryId)(-1);
/** @ignore */
class Dictionary extends DataType {
    constructor(dictionary, indices, id, isOrdered) {
        super(enum_js_1.Type.Dictionary);
        this.indices = indices;
        this.dictionary = dictionary;
        this.isOrdered = isOrdered || false;
        this.id = id == null ? getId() : (0, bigint_js_1.bigIntToNumber)(id);
    }
    get children() { return this.dictionary.children; }
    get valueType() { return this.dictionary; }
    get ArrayType() { return this.dictionary.ArrayType; }
    toString() { return `Dictionary<${this.indices}, ${this.dictionary}>`; }
}
exports.Dictionary = Dictionary;
_0 = Symbol.toStringTag;
Dictionary[_0] = ((proto) => {
    proto.id = null;
    proto.indices = null;
    proto.isOrdered = null;
    proto.dictionary = null;
    return proto[Symbol.toStringTag] = 'Dictionary';
})(Dictionary.prototype);
/** @ignore */
function strideForType(type) {
    const t = type;
    switch (type.typeId) {
        case enum_js_1.Type.Decimal: return type.bitWidth / 32;
        case enum_js_1.Type.Interval: {
            if (t.unit === enum_js_1.IntervalUnit.MONTH_DAY_NANO) {
                return 4;
            }
            return 1 + t.unit;
        }
        // case Type.Int: return 1 + +((t as Int_).bitWidth > 32);
        // case Type.Time: return 1 + +((t as Time_).bitWidth > 32);
        case enum_js_1.Type.BinaryView:
        case enum_js_1.Type.Utf8View: return 16;
        case enum_js_1.Type.FixedSizeList: return t.listSize;
        case enum_js_1.Type.FixedSizeBinary: return t.byteWidth;
        default: return 1;
    }
}
exports.strideForType = strideForType;

//# sourceMappingURL=type.js.map
