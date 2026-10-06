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
exports.Utf8ViewBuilder = void 0;
const binaryview_js_1 = require("./binaryview.js");
const utf8_js_1 = require("../util/utf8.js");
/** @ignore */
class Utf8ViewBuilder extends binaryview_js_1.BinaryViewBuilder {
    constructor(opts) {
        super(opts);
    }
    setValue(index, value) {
        return this.writeBinaryValue(index, (0, utf8_js_1.encodeUtf8)(value));
    }
}
exports.Utf8ViewBuilder = Utf8ViewBuilder;

//# sourceMappingURL=utf8view.js.map
