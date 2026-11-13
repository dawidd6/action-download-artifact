// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export { AvroReader } from "./AvroReader.js";
export { AvroReadable } from "./AvroReadable.js";
export { AvroReadableFromBlob } from "./AvroReadableFromBlob.js";
import { AvroReadable } from "./AvroReadable.js";
export class AvroReadableFromStream extends AvroReadable {
    get position() {
        return 0;
    }
    constructor(_readable) {
        super();
        throw new Error("AvroReadableFromStream is not supported in the browser.");
    }
    async read(_size, _options) {
        throw new Error("AvroReadableFromStream is not supported in the browser.");
    }
}
//# sourceMappingURL=index.js.map