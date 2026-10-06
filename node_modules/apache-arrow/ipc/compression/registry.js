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
exports.compressionRegistry = void 0;
const compression_type_js_1 = require("../../fb/compression-type.js");
const validators_js_1 = require("./validators.js");
class _CompressionRegistry {
    constructor() {
        this.registry = {};
    }
    set(compression, codec) {
        if ((codec === null || codec === void 0 ? void 0 : codec.encode) && typeof codec.encode === 'function' && !validators_js_1.compressionValidators[compression].isValidCodecEncode(codec)) {
            throw new Error(`Encoder for ${compression_type_js_1.CompressionType[compression]} is not valid.`);
        }
        this.registry[compression] = codec;
    }
    get(compression) {
        var _a;
        return ((_a = this.registry) === null || _a === void 0 ? void 0 : _a[compression]) || null;
    }
}
exports.compressionRegistry = new _CompressionRegistry();

//# sourceMappingURL=registry.js.map
