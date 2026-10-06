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
exports.isArrowTable = exports.isArrowRecordBatch = exports.isArrowVector = exports.isArrowData = exports.isArrowDataType = exports.isArrowField = exports.isArrowSchema = void 0;
/**
 * Type guards for Apache Arrow types that work across different instances
 * of the Arrow library. These functions use Symbol.for() based markers
 * to identify Arrow types, making them reliable when multiple versions
 * or instances of the library are loaded.
 *
 * @example
 * ```ts
 * import { isArrowSchema, isArrowTable } from 'apache-arrow';
 *
 * // Works even with different Arrow library instances
 * if (isArrowSchema(maybeSchema)) {
 *     console.log('This is a Schema from any Arrow version');
 * }
 *
 * if (isArrowTable(maybeTable)) {
 *     console.log('This is a Table from any Arrow version');
 * }
 * ```
 */
const schema_js_1 = require("../schema.js");
const type_js_1 = require("../type.js");
const data_js_1 = require("../data.js");
const vector_js_1 = require("../vector.js");
const recordbatch_js_1 = require("../recordbatch.js");
const table_js_1 = require("../table.js");
/**
 * Check if a value is an Arrow Schema from any version of the library.
 */
function isArrowSchema(x) {
    return schema_js_1.Schema.isSchema(x);
}
exports.isArrowSchema = isArrowSchema;
/**
 * Check if a value is an Arrow Field from any version of the library.
 */
function isArrowField(x) {
    return schema_js_1.Field.isField(x);
}
exports.isArrowField = isArrowField;
/**
 * Check if a value is an Arrow DataType from any version of the library.
 */
function isArrowDataType(x) {
    return type_js_1.DataType.isDataType(x);
}
exports.isArrowDataType = isArrowDataType;
/**
 * Check if a value is an Arrow Data from any version of the library.
 */
function isArrowData(x) {
    return data_js_1.Data.isData(x);
}
exports.isArrowData = isArrowData;
/**
 * Check if a value is an Arrow Vector from any version of the library.
 */
function isArrowVector(x) {
    return vector_js_1.Vector.isVector(x);
}
exports.isArrowVector = isArrowVector;
/**
 * Check if a value is an Arrow RecordBatch from any version of the library.
 */
function isArrowRecordBatch(x) {
    return recordbatch_js_1.RecordBatch.isRecordBatch(x);
}
exports.isArrowRecordBatch = isArrowRecordBatch;
/**
 * Check if a value is an Arrow Table from any version of the library.
 */
function isArrowTable(x) {
    return table_js_1.Table.isTable(x);
}
exports.isArrowTable = isArrowTable;

//# sourceMappingURL=typecheck.js.map
