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

import { Schema, Field } from '../schema.js';
import { DataType } from '../type.js';
import { Data } from '../data.js';
import { Vector } from '../vector.js';
import { RecordBatch } from '../recordbatch.js';
import { Table } from '../table.js';

/**
 * Check if a value is an Arrow Schema from any version of the library.
 */
export function isArrowSchema(x: any): x is Schema {
    return Schema.isSchema(x);
}

/**
 * Check if a value is an Arrow Field from any version of the library.
 */
export function isArrowField(x: any): x is Field {
    return Field.isField(x);
}

/**
 * Check if a value is an Arrow DataType from any version of the library.
 */
export function isArrowDataType(x: any): x is DataType {
    return DataType.isDataType(x);
}

/**
 * Check if a value is an Arrow Data from any version of the library.
 */
export function isArrowData(x: any): x is Data {
    return Data.isData(x);
}

/**
 * Check if a value is an Arrow Vector from any version of the library.
 */
export function isArrowVector(x: any): x is Vector {
    return Vector.isVector(x);
}

/**
 * Check if a value is an Arrow RecordBatch from any version of the library.
 */
export function isArrowRecordBatch(x: any): x is RecordBatch {
    return RecordBatch.isRecordBatch(x);
}

/**
 * Check if a value is an Arrow Table from any version of the library.
 */
export function isArrowTable(x: any): x is Table {
    return Table.isTable(x);
}
