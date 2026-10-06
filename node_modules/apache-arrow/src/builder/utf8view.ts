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

import { Utf8View } from '../type.js';
import { BuilderOptions } from '../builder.js';
import { BinaryViewBuilder } from './binaryview.js';
import { encodeUtf8 } from '../util/utf8.js';

/** @ignore */
export class Utf8ViewBuilder<TNull = any> extends BinaryViewBuilder<Utf8View, TNull> {
    constructor(opts: BuilderOptions<Utf8View, TNull>) {
        super(opts);
    }

    public override setValue(index: number, value: Utf8View['TValue']) {
        return this.writeBinaryValue(index, encodeUtf8(value));
    }
}
