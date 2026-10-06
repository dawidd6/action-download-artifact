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
export declare function isArrowSchema(x: any): x is Schema;
/**
 * Check if a value is an Arrow Field from any version of the library.
 */
export declare function isArrowField(x: any): x is Field;
/**
 * Check if a value is an Arrow DataType from any version of the library.
 */
export declare function isArrowDataType(x: any): x is DataType;
/**
 * Check if a value is an Arrow Data from any version of the library.
 */
export declare function isArrowData(x: any): x is Data;
/**
 * Check if a value is an Arrow Vector from any version of the library.
 */
export declare function isArrowVector(x: any): x is Vector;
/**
 * Check if a value is an Arrow RecordBatch from any version of the library.
 */
export declare function isArrowRecordBatch(x: any): x is RecordBatch;
/**
 * Check if a value is an Arrow Table from any version of the library.
 */
export declare function isArrowTable(x: any): x is Table;
