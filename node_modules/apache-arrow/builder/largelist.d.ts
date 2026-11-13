import { DataType, LargeList } from '../type.js';
import { OffsetsBufferBuilder } from './buffer.js';
import { Builder, BuilderOptions, VariableWidthBuilder } from '../builder.js';
/** @ignore */
export declare class LargeListBuilder<T extends DataType = any, TNull = any> extends VariableWidthBuilder<LargeList<T>, TNull> {
    protected _offsets: OffsetsBufferBuilder<LargeList<T>>;
    constructor(opts: BuilderOptions<LargeList<T>, TNull>);
    addChild(child: Builder<T>, name?: string): number;
    protected _flushPending(pending: Map<number, T['TValue'] | undefined>): void;
}
