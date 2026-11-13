import { BinaryView, Utf8View } from '../type.js';
import { Builder, BuilderOptions } from '../builder.js';
import { BufferBuilder } from './buffer.js';
/** @ignore */
export declare class BinaryViewBuilder<TType extends BinaryView | Utf8View = BinaryView, TNull = any> extends Builder<TType, TNull> {
    protected _views: BufferBuilder<Uint8Array>;
    protected _variadicBuffers: Uint8Array[];
    protected _currentBuffer: BufferBuilder<Uint8Array> | null;
    protected _currentBufferIndex: number;
    protected _currentBufferOffset: number;
    protected readonly _bufferSize: number;
    constructor(opts: BuilderOptions<TType, TNull>);
    get byteLength(): number;
    setValue(index: number, value: TType['TValue']): this;
    protected writeBinaryValue(index: number, data: Uint8Array): this;
    protected encodeValue(value: TType['TValue']): Uint8Array;
    setValid(index: number, isValid: boolean): boolean;
    clear(): this;
    flush(): import("../data.js").Data<TType>;
    finish(): this;
}
