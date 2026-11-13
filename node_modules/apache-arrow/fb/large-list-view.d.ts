import * as flatbuffers from 'flatbuffers';
/**
 * Same as ListView, but with 64-bit offsets and sizes, allowing to represent
 * extremely large data values.
 */
export declare class LargeListView {
    bb: flatbuffers.ByteBuffer | null;
    bb_pos: number;
    __init(i: number, bb: flatbuffers.ByteBuffer): LargeListView;
    static getRootAsLargeListView(bb: flatbuffers.ByteBuffer, obj?: LargeListView): LargeListView;
    static getSizePrefixedRootAsLargeListView(bb: flatbuffers.ByteBuffer, obj?: LargeListView): LargeListView;
    static startLargeListView(builder: flatbuffers.Builder): void;
    static endLargeListView(builder: flatbuffers.Builder): flatbuffers.Offset;
    static createLargeListView(builder: flatbuffers.Builder): flatbuffers.Offset;
}
