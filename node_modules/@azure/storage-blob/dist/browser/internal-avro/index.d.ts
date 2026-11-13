export { AvroReader, type AvroParseOptions } from "./AvroReader.js";
export { AvroReadable } from "./AvroReadable.js";
export { AvroReadableFromBlob } from "./AvroReadableFromBlob.js";
import type { AvroReadableReadOptions } from "./AvroReadable.js";
import { AvroReadable } from "./AvroReadable.js";
export declare class AvroReadableFromStream extends AvroReadable {
    get position(): number;
    constructor(_readable: NodeJS.ReadableStream);
    read(_size: number, _options?: AvroReadableReadOptions): Promise<Uint8Array>;
}
//# sourceMappingURL=index.d.ts.map