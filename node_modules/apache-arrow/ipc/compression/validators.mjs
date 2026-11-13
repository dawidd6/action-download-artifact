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
import { CompressionType } from '../../fb/compression-type.mjs';
class Lz4FrameValidator {
    constructor() {
        this.LZ4_FRAME_MAGIC = new Uint8Array([4, 34, 77, 24]);
        this.MIN_HEADER_LENGTH = 7; // 4 (magic) + 2 (FLG + BD) + 1 (header checksum) = 7 min bytes
    }
    isValidCodecEncode(codec) {
        const testData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
        const compressed = codec.encode(testData);
        return this._isValidCompressed(compressed);
    }
    _isValidCompressed(buffer) {
        return (this._hasMinimumLength(buffer) &&
            this._hasValidMagicNumber(buffer) &&
            this._hasValidVersion(buffer));
    }
    _hasMinimumLength(buffer) {
        return buffer.length >= this.MIN_HEADER_LENGTH;
    }
    _hasValidMagicNumber(buffer) {
        return this.LZ4_FRAME_MAGIC.every((byte, i) => buffer[i] === byte);
    }
    _hasValidVersion(buffer) {
        const flg = buffer[4];
        const versionBits = (flg & 0xC0) >> 6;
        return versionBits === 1;
    }
}
class ZstdValidator {
    constructor() {
        this.ZSTD_MAGIC = new Uint8Array([40, 181, 47, 253]);
        this.MIN_HEADER_LENGTH = 6; // 4 (magic) + 2 (min Frame_Header) = 6 min bytes
    }
    isValidCodecEncode(codec) {
        const testData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
        const compressed = codec.encode(testData);
        return this._isValidCompressed(compressed);
    }
    _isValidCompressed(buffer) {
        return (this._hasMinimumLength(buffer) &&
            this._hasValidMagicNumber(buffer));
    }
    _hasMinimumLength(buffer) {
        return buffer.length >= this.MIN_HEADER_LENGTH;
    }
    _hasValidMagicNumber(buffer) {
        return this.ZSTD_MAGIC.every((byte, i) => buffer[i] === byte);
    }
}
export const compressionValidators = {
    [CompressionType.LZ4_FRAME]: new Lz4FrameValidator(),
    [CompressionType.ZSTD]: new ZstdValidator(),
};

//# sourceMappingURL=validators.mjs.map
