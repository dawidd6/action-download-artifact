import { Utf8View } from '../type.js';
import { BuilderOptions } from '../builder.js';
import { BinaryViewBuilder } from './binaryview.js';
/** @ignore */
export declare class Utf8ViewBuilder<TNull = any> extends BinaryViewBuilder<Utf8View, TNull> {
    constructor(opts: BuilderOptions<Utf8View, TNull>);
    setValue(index: number, value: Utf8View['TValue']): this;
}
