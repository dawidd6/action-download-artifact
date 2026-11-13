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
import { BinaryView } from '../type.mjs';
import { Builder } from '../builder.mjs';
import { BufferBuilder } from './buffer.mjs';
import { toUint8Array } from '../util/buffer.mjs';
import { makeData } from '../data.mjs';
/** @ignore */
export class BinaryViewBuilder extends Builder {
    constructor(opts) {
        super(opts);
        this._variadicBuffers = [];
        this._currentBuffer = null;
        this._currentBufferIndex = 0;
        this._currentBufferOffset = 0;
        this._bufferSize = 32 * 1024 * 1024; // 32MB per buffer as per spec recommendation
        this._views = new BufferBuilder(Uint8Array);
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
        const bytesNeeded = (index + 1) * BinaryView.ELEMENT_WIDTH;
        const currentBytes = this._views.length;
        if (bytesNeeded > currentBytes) {
            this._views.reserve(bytesNeeded - currentBytes);
        }
        const viewBuffer = this._views.buffer;
        const viewOffset = index * BinaryView.ELEMENT_WIDTH;
        const view = new DataView(viewBuffer.buffer, viewBuffer.byteOffset + viewOffset, BinaryView.ELEMENT_WIDTH);
        // Write length (4 bytes, little-endian)
        view.setInt32(BinaryView.LENGTH_OFFSET, length, true);
        if (length <= BinaryView.INLINE_CAPACITY) {
            // Inline: store data directly in view struct (up to 12 bytes)
            viewBuffer.set(data, viewOffset + BinaryView.INLINE_OFFSET);
            // Zero out remaining bytes
            for (let i = length; i < BinaryView.INLINE_CAPACITY; i++) {
                viewBuffer[viewOffset + BinaryView.INLINE_OFFSET + i] = 0;
            }
        }
        else {
            // Out-of-line: store in variadic buffer
            // Write prefix (first 4 bytes of data)
            const prefix = new DataView(data.buffer, data.byteOffset, Math.min(4, length));
            view.setUint32(BinaryView.INLINE_OFFSET, prefix.getUint32(0, true), true);
            // Allocate space in variadic buffer
            if (!this._currentBuffer || this._currentBufferOffset + length > this._bufferSize) {
                // Start a new buffer
                if (this._currentBuffer) {
                    this._variadicBuffers.push(this._currentBuffer.buffer.slice(0, this._currentBufferOffset));
                }
                this._currentBuffer = new BufferBuilder(Uint8Array);
                this._currentBufferIndex = this._variadicBuffers.length;
                this._currentBufferOffset = 0;
            }
            // Write data to current buffer
            const bufferData = this._currentBuffer.reserve(length).buffer;
            bufferData.set(data, this._currentBufferOffset);
            // Write buffer index and offset to view struct
            view.setInt32(BinaryView.BUFFER_INDEX_OFFSET, this._currentBufferIndex, true);
            view.setInt32(BinaryView.BUFFER_OFFSET_OFFSET, this._currentBufferOffset, true);
            this._currentBufferOffset += length;
        }
        return this;
    }
    encodeValue(value) {
        return toUint8Array(value);
    }
    setValid(index, isValid) {
        // Ensure space is allocated in the views buffer for this index
        const bytesNeeded = (index + 1) * BinaryView.ELEMENT_WIDTH;
        const currentBytes = this._views.length;
        if (bytesNeeded > currentBytes) {
            this._views.reserve(bytesNeeded - currentBytes);
        }
        const result = super.setValid(index, isValid);
        if (!result) {
            // For null values, zero out the view struct
            const viewBuffer = this._views.buffer;
            const viewOffset = index * BinaryView.ELEMENT_WIDTH;
            for (let i = 0; i < BinaryView.ELEMENT_WIDTH; i++) {
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
        const views = _views.flush(length * BinaryView.ELEMENT_WIDTH);
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
        return makeData(props);
    }
    finish() {
        this.finished = true;
        return this;
    }
}

//# sourceMappingURL=binaryview.mjs.map
