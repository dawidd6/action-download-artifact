"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryViewBuilder = void 0;
const type_js_1 = require("../type.js");
const builder_js_1 = require("../builder.js");
const buffer_js_1 = require("./buffer.js");
const buffer_js_2 = require("../util/buffer.js");
const data_js_1 = require("../data.js");
/** @ignore */
class BinaryViewBuilder extends builder_js_1.Builder {
    constructor(opts) {
        super(opts);
        this._variadicBuffers = [];
        this._currentBuffer = null;
        this._currentBufferIndex = 0;
        this._currentBufferOffset = 0;
        this._bufferSize = 32 * 1024 * 1024; // 32MB per buffer as per spec recommendation
        this._views = new buffer_js_1.BufferBuilder(Uint8Array);
    }
    get byteLength() {
        let size = 0;
        this._views && (size += this._views.byteLength);
        this._nulls && (size += this._nulls.byteLength);
        for (const buffer of this._variadicBuffers) {
            size += buffer.byteLength;
        }
        this._currentBuffer && (size += this._currentBuffer.byteLength);
        return size;
    }
    setValue(index, value) {
        return this.writeBinaryValue(index, this.encodeValue(value));
    }
    writeBinaryValue(index, data) {
        const length = data.length;
        // Ensure views buffer has space up to this index (similar to FixedWidthBuilder)
        const bytesNeeded = (index + 1) * type_js_1.BinaryView.ELEMENT_WIDTH;
        const currentBytes = this._views.length;
        if (bytesNeeded > currentBytes) {
            this._views.reserve(bytesNeeded - currentBytes);
        }
        const viewBuffer = this._views.buffer;
        const viewOffset = index * type_js_1.BinaryView.ELEMENT_WIDTH;
        const view = new DataView(viewBuffer.buffer, viewBuffer.byteOffset + viewOffset, type_js_1.BinaryView.ELEMENT_WIDTH);
        // Write length (4 bytes, little-endian)
        view.setInt32(type_js_1.BinaryView.LENGTH_OFFSET, length, true);
        if (length <= type_js_1.BinaryView.INLINE_CAPACITY) {
            // Inline: store data directly in view struct (up to 12 bytes)
            viewBuffer.set(data, viewOffset + type_js_1.BinaryView.INLINE_OFFSET);
            // Zero out remaining bytes
            for (let i = length; i < type_js_1.BinaryView.INLINE_CAPACITY; i++) {
                viewBuffer[viewOffset + type_js_1.BinaryView.INLINE_OFFSET + i] = 0;
            }
        }
        else {
            // Out-of-line: store in variadic buffer
            // Write prefix (first 4 bytes of data)
            const prefix = new DataView(data.buffer, data.byteOffset, Math.min(4, length));
            view.setUint32(type_js_1.BinaryView.INLINE_OFFSET, prefix.getUint32(0, true), true);
            // Allocate space in variadic buffer
            if (!this._currentBuffer || this._currentBufferOffset + length > this._bufferSize) {
                // Start a new buffer
                if (this._currentBuffer) {
                    this._variadicBuffers.push(this._currentBuffer.buffer.slice(0, this._currentBufferOffset));
                }
                this._currentBuffer = new buffer_js_1.BufferBuilder(Uint8Array);
                this._currentBufferIndex = this._variadicBuffers.length;
                this._currentBufferOffset = 0;
            }
            // Write data to current buffer
            const bufferData = this._currentBuffer.reserve(length).buffer;
            bufferData.set(data, this._currentBufferOffset);
            // Write buffer index and offset to view struct
            view.setInt32(type_js_1.BinaryView.BUFFER_INDEX_OFFSET, this._currentBufferIndex, true);
            view.setInt32(type_js_1.BinaryView.BUFFER_OFFSET_OFFSET, this._currentBufferOffset, true);
            this._currentBufferOffset += length;
        }
        return this;
    }
    encodeValue(value) {
        return (0, buffer_js_2.toUint8Array)(value);
    }
    setValid(index, isValid) {
        // Ensure space is allocated in the views buffer for this index
        const bytesNeeded = (index + 1) * type_js_1.BinaryView.ELEMENT_WIDTH;
        const currentBytes = this._views.length;
        if (bytesNeeded > currentBytes) {
            this._views.reserve(bytesNeeded - currentBytes);
        }
        const result = super.setValid(index, isValid);
        if (!result) {
            // For null values, zero out the view struct
            const viewBuffer = this._views.buffer;
            const viewOffset = index * type_js_1.BinaryView.ELEMENT_WIDTH;
            for (let i = 0; i < type_js_1.BinaryView.ELEMENT_WIDTH; i++) {
                viewBuffer[viewOffset + i] = 0;
            }
        }
        return result;
    }
    clear() {
        this._variadicBuffers = [];
        this._currentBuffer = null;
        this._currentBufferIndex = 0;
        this._currentBufferOffset = 0;
        this._views.clear();
        return super.clear();
    }
    flush() {
        const { type, length, nullCount, _views, _nulls } = this;
        // Finalize current buffer if it exists
        if (this._currentBuffer && this._currentBufferOffset > 0) {
            this._variadicBuffers.push(this._currentBuffer.buffer.slice(0, this._currentBufferOffset));
            this._currentBuffer = null;
            this._currentBufferOffset = 0;
        }
        const views = _views.flush(length * type_js_1.BinaryView.ELEMENT_WIDTH);
        const nullBitmap = nullCount > 0 ? _nulls.flush(length) : undefined;
        const variadicBuffers = this._variadicBuffers.slice();
        // Reset variadic buffers for next batch
        this._variadicBuffers = [];
        this._currentBufferIndex = 0;
        this.clear();
        const props = {
            type,
            length,
            nullCount,
            nullBitmap,
            ['views']: views,
            ['variadicBuffers']: variadicBuffers
        };
        return (0, data_js_1.makeData)(props);
    }
    finish() {
        this.finished = true;
        return this;
    }
}
exports.BinaryViewBuilder = BinaryViewBuilder;

//# sourceMappingURL=binaryview.js.map
