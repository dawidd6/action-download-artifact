import * as flatbuffers from 'flatbuffers';
import { BodyCompression } from './body-compression.js';
import { Buffer } from './buffer.js';
import { FieldNode } from './field-node.js';
/**
 * A data header describing the shared memory layout of a "record" or "row"
 * batch. Some systems call this a "row batch" internally and others a "record
 * batch".
 */
export declare class RecordBatch {
    bb: flatbuffers.ByteBuffer | null;
    bb_pos: number;
    __init(i: number, bb: flatbuffers.ByteBuffer): RecordBatch;
    static getRootAsRecordBatch(bb: flatbuffers.ByteBuffer, obj?: RecordBatch): RecordBatch;
    static getSizePrefixedRootAsRecordBatch(bb: flatbuffers.ByteBuffer, obj?: RecordBatch): RecordBatch;
    /**
     * number of records / rows. The arrays in the batch should all have this
     * length
     */
    length(): bigint;
    /**
     * Nodes correspond to the pre-ordered flattened logical schema
     */
    nodes(index: number, obj?: FieldNode): FieldNode | null;
    nodesLength(): number;
    /**
     * Buffers correspond to the pre-ordered flattened buffer tree
     *
     * The number of buffers appended to this list depends on the schema. For
     * example, most primitive arrays will have 2 buffers, 1 for the validity
     * bitmap and 1 for the values. For struct arrays, there will only be a
     * single buffer for the validity (nulls) bitmap
     */
    buffers(index: number, obj?: Buffer): Buffer | null;
    buffersLength(): number;
    /**
     * Optional compression of the message body
     */
    compression(obj?: BodyCompression): BodyCompression | null;
    /**
     * Some types such as Utf8View are represented using a variable number of buffers.
     * For each such Field in the pre-ordered flattened logical schema, there will be
     * an entry in variadicBufferCounts to indicate the number of number of variadic
     * buffers which belong to that Field in the current RecordBatch.
     *
     * For example, the schema
     *     col1: Struct<alpha: Int32, beta: BinaryView, gamma: Float64>
     *     col2: Utf8View
     * contains two Fields with variadic buffers so variadicBufferCounts will have
     * two entries, the first counting the variadic buffers of `col1.beta` and the
     * second counting `col2`'s.
     *
     * This field may be omitted if and only if the schema contains no Fields with
     * a variable number of buffers, such as BinaryView and Utf8View.
     */
    variadicBufferCounts(index: number): bigint | null;
    variadicBufferCountsLength(): number;
    static startRecordBatch(builder: flatbuffers.Builder): void;
    static addLength(builder: flatbuffers.Builder, length: bigint): void;
    static addNodes(builder: flatbuffers.Builder, nodesOffset: flatbuffers.Offset): void;
    static startNodesVector(builder: flatbuffers.Builder, numElems: number): void;
    static addBuffers(builder: flatbuffers.Builder, buffersOffset: flatbuffers.Offset): void;
    static startBuffersVector(builder: flatbuffers.Builder, numElems: number): void;
    static addCompression(builder: flatbuffers.Builder, compressionOffset: flatbuffers.Offset): void;
    static addVariadicBufferCounts(builder: flatbuffers.Builder, variadicBufferCountsOffset: flatbuffers.Offset): void;
    static createVariadicBufferCountsVector(builder: flatbuffers.Builder, data: bigint[]): flatbuffers.Offset;
    static startVariadicBufferCountsVector(builder: flatbuffers.Builder, numElems: number): void;
    static endRecordBatch(builder: flatbuffers.Builder): flatbuffers.Offset;
}
