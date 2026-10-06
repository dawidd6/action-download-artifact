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
exports.toIntervalMonthDayNanoObjects = exports.toIntervalDayTimeObjects = exports.toIntervalMonthDayNanoInt32Array = exports.toIntervalDayTimeInt32Array = void 0;
function toIntervalDayTimeInt32Array(objects) {
    var _a, _b;
    const length = objects.length;
    const array = new Int32Array(length * 2);
    for (let oi = 0, ai = 0; oi < length; oi++) {
        const interval = objects[oi];
        array[ai++] = (_a = interval['days']) !== null && _a !== void 0 ? _a : 0;
        array[ai++] = (_b = interval['milliseconds']) !== null && _b !== void 0 ? _b : 0;
    }
    return array;
}
exports.toIntervalDayTimeInt32Array = toIntervalDayTimeInt32Array;
function toIntervalMonthDayNanoInt32Array(objects) {
    var _a, _b;
    const length = objects.length;
    const data = new Int32Array(length * 4);
    for (let oi = 0, ai = 0; oi < length; oi++) {
        const interval = objects[oi];
        data[ai++] = (_a = interval['months']) !== null && _a !== void 0 ? _a : 0;
        data[ai++] = (_b = interval['days']) !== null && _b !== void 0 ? _b : 0;
        const nanoseconds = interval['nanoseconds'];
        if (nanoseconds) {
            const ns = BigInt(nanoseconds);
            // Convert to unsigned 32-bit integers to avoid precision loss
            data[ai++] = Number(ns & BigInt(0xFFFFFFFF)) >>> 0;
            data[ai++] = Number(ns >> BigInt(32)) >>> 0;
        }
        else {
            ai += 2;
        }
    }
    return data;
}
exports.toIntervalMonthDayNanoInt32Array = toIntervalMonthDayNanoInt32Array;
function toIntervalDayTimeObjects(array) {
    const length = array.length;
    const objects = new Array(length / 2);
    for (let ai = 0, oi = 0; ai < length; ai += 2) {
        objects[oi++] = {
            'days': array[ai],
            'milliseconds': array[ai + 1]
        };
    }
    return objects;
}
exports.toIntervalDayTimeObjects = toIntervalDayTimeObjects;
/** @ignore */
function toIntervalMonthDayNanoObjects(array, stringifyNano) {
    const length = array.length;
    const objects = new Array(length / 4);
    for (let ai = 0, oi = 0; ai < length; ai += 4) {
        const nanoseconds = (BigInt(array[ai + 3]) << BigInt(32)) | BigInt(array[ai + 2] >>> 0);
        objects[oi++] = {
            'months': array[ai],
            'days': array[ai + 1],
            'nanoseconds': (stringifyNano ? `${nanoseconds}` : nanoseconds),
        };
    }
    return objects;
}
exports.toIntervalMonthDayNanoObjects = toIntervalMonthDayNanoObjects;

//# sourceMappingURL=interval.js.map
