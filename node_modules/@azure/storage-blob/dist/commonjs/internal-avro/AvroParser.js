var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var AvroParser_exports = {};
__export(AvroParser_exports, {
  AvroParser: () => AvroParser,
  AvroType: () => AvroType
});
module.exports = __toCommonJS(AvroParser_exports);
class AvroParser {
  /**
   * Reads a fixed number of bytes from the stream.
   *
   * @param stream -
   * @param length -
   * @param options -
   */
  static async readFixedBytes(stream, length, options = {}) {
    const bytes = await stream.read(length, { abortSignal: options.abortSignal });
    if (bytes.length !== length) {
      throw new Error("Hit stream end.");
    }
    return bytes;
  }
  /**
   * Reads a single byte from the stream.
   *
   * @param stream -
   * @param options -
   */
  static async readByte(stream, options = {}) {
    const buf = await AvroParser.readFixedBytes(stream, 1, options);
    return buf[0];
  }
  // int and long are stored in variable-length zig-zag coding.
  // variable-length: https://lucene.apache.org/core/3_5_0/fileformats.html#VInt
  // zig-zag: https://developers.google.com/protocol-buffers/docs/encoding?csw=1#types
  static async readZigZagLong(stream, options = {}) {
    let zigZagEncoded = 0;
    let significanceInBit = 0;
    let byte, haveMoreByte, significanceInFloat;
    do {
      byte = await AvroParser.readByte(stream, options);
      haveMoreByte = byte & 128;
      zigZagEncoded |= (byte & 127) << significanceInBit;
      significanceInBit += 7;
    } while (haveMoreByte && significanceInBit < 28);
    if (haveMoreByte) {
      zigZagEncoded = zigZagEncoded;
      significanceInFloat = 268435456;
      do {
        byte = await AvroParser.readByte(stream, options);
        zigZagEncoded += (byte & 127) * significanceInFloat;
        significanceInFloat *= 128;
      } while (byte & 128);
      const res = (zigZagEncoded % 2 ? -(zigZagEncoded + 1) : zigZagEncoded) / 2;
      if (res < Number.MIN_SAFE_INTEGER || res > Number.MAX_SAFE_INTEGER) {
        throw new Error("Integer overflow.");
      }
      return res;
    }
    return zigZagEncoded >> 1 ^ -(zigZagEncoded & 1);
  }
  static async readLong(stream, options = {}) {
    return AvroParser.readZigZagLong(stream, options);
  }
  static async readInt(stream, options = {}) {
    return AvroParser.readZigZagLong(stream, options);
  }
  static async readNull() {
    return null;
  }
  static async readBoolean(stream, options = {}) {
    const b = await AvroParser.readByte(stream, options);
    if (b === 1) {
      return true;
    } else if (b === 0) {
      return false;
    } else {
      throw new Error("Byte was not a boolean.");
    }
  }
  static async readFloat(stream, options = {}) {
    const u8arr = await AvroParser.readFixedBytes(stream, 4, options);
    const view = new DataView(u8arr.buffer, u8arr.byteOffset, u8arr.byteLength);
    return view.getFloat32(0, true);
  }
  static async readDouble(stream, options = {}) {
    const u8arr = await AvroParser.readFixedBytes(stream, 8, options);
    const view = new DataView(u8arr.buffer, u8arr.byteOffset, u8arr.byteLength);
    return view.getFloat64(0, true);
  }
  static async readBytes(stream, options = {}) {
    const size = await AvroParser.readLong(stream, options);
    if (size < 0) {
      throw new Error("Bytes size was negative.");
    }
    return stream.read(size, { abortSignal: options.abortSignal });
  }
  static async readString(stream, options = {}) {
    const u8arr = await AvroParser.readBytes(stream, options);
    const utf8decoder = new TextDecoder();
    return utf8decoder.decode(u8arr);
  }
  static async readMapPair(stream, readItemMethod, options = {}) {
    const key = await AvroParser.readString(stream, options);
    const value = await readItemMethod(stream, options);
    return { key, value };
  }
  static async readMap(stream, readItemMethod, options = {}) {
    const readPairMethod = (s, opts = {}) => {
      return AvroParser.readMapPair(s, readItemMethod, opts);
    };
    const pairs = await AvroParser.readArray(stream, readPairMethod, options);
    const dict = {};
    for (const pair of pairs) {
      dict[pair.key] = pair.value;
    }
    return dict;
  }
  static async readArray(stream, readItemMethod, options = {}) {
    const items = [];
    for (let count = await AvroParser.readLong(stream, options); count !== 0; count = await AvroParser.readLong(stream, options)) {
      if (count < 0) {
        await AvroParser.readLong(stream, options);
        count = -count;
      }
      while (count--) {
        const item = await readItemMethod(stream, options);
        items.push(item);
      }
    }
    return items;
  }
}
var AvroComplex = /* @__PURE__ */ ((AvroComplex2) => {
  AvroComplex2["RECORD"] = "record";
  AvroComplex2["ENUM"] = "enum";
  AvroComplex2["ARRAY"] = "array";
  AvroComplex2["MAP"] = "map";
  AvroComplex2["UNION"] = "union";
  AvroComplex2["FIXED"] = "fixed";
  return AvroComplex2;
})(AvroComplex || {});
var AvroPrimitive = /* @__PURE__ */ ((AvroPrimitive2) => {
  AvroPrimitive2["NULL"] = "null";
  AvroPrimitive2["BOOLEAN"] = "boolean";
  AvroPrimitive2["INT"] = "int";
  AvroPrimitive2["LONG"] = "long";
  AvroPrimitive2["FLOAT"] = "float";
  AvroPrimitive2["DOUBLE"] = "double";
  AvroPrimitive2["BYTES"] = "bytes";
  AvroPrimitive2["STRING"] = "string";
  return AvroPrimitive2;
})(AvroPrimitive || {});
class AvroType {
  // eslint-disable-line @typescript-eslint/no-wrapper-object-types
  /**
   * Determines the AvroType from the Avro Schema.
   */
  // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
  static fromSchema(schema) {
    if (typeof schema === "string") {
      return AvroType.fromStringSchema(schema);
    } else if (Array.isArray(schema)) {
      return AvroType.fromArraySchema(schema);
    } else {
      return AvroType.fromObjectSchema(schema);
    }
  }
  static fromStringSchema(schema) {
    switch (schema) {
      case "null" /* NULL */:
      case "boolean" /* BOOLEAN */:
      case "int" /* INT */:
      case "long" /* LONG */:
      case "float" /* FLOAT */:
      case "double" /* DOUBLE */:
      case "bytes" /* BYTES */:
      case "string" /* STRING */:
        return new AvroPrimitiveType(schema);
      default:
        throw new Error(`Unexpected Avro type ${schema}`);
    }
  }
  static fromArraySchema(schema) {
    return new AvroUnionType(schema.map(AvroType.fromSchema));
  }
  static fromObjectSchema(schema) {
    const type = schema.type;
    try {
      return AvroType.fromStringSchema(type);
    } catch {
    }
    switch (type) {
      case "record" /* RECORD */:
        if (schema.aliases) {
          throw new Error(`aliases currently is not supported, schema: ${schema}`);
        }
        if (!schema.name) {
          throw new Error(`Required attribute 'name' doesn't exist on schema: ${schema}`);
        }
        const fields = {};
        if (!schema.fields) {
          throw new Error(`Required attribute 'fields' doesn't exist on schema: ${schema}`);
        }
        for (const field of schema.fields) {
          fields[field.name] = AvroType.fromSchema(field.type);
        }
        return new AvroRecordType(fields, schema.name);
      case "enum" /* ENUM */:
        if (schema.aliases) {
          throw new Error(`aliases currently is not supported, schema: ${schema}`);
        }
        if (!schema.symbols) {
          throw new Error(`Required attribute 'symbols' doesn't exist on schema: ${schema}`);
        }
        return new AvroEnumType(schema.symbols);
      case "map" /* MAP */:
        if (!schema.values) {
          throw new Error(`Required attribute 'values' doesn't exist on schema: ${schema}`);
        }
        return new AvroMapType(AvroType.fromSchema(schema.values));
      case "array" /* ARRAY */:
      // Unused today
      case "fixed" /* FIXED */:
      // Unused today
      default:
        throw new Error(`Unexpected Avro type ${type} in ${schema}`);
    }
  }
}
class AvroPrimitiveType extends AvroType {
  _primitive;
  constructor(primitive) {
    super();
    this._primitive = primitive;
  }
  // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
  read(stream, options = {}) {
    switch (this._primitive) {
      case "null" /* NULL */:
        return AvroParser.readNull();
      case "boolean" /* BOOLEAN */:
        return AvroParser.readBoolean(stream, options);
      case "int" /* INT */:
        return AvroParser.readInt(stream, options);
      case "long" /* LONG */:
        return AvroParser.readLong(stream, options);
      case "float" /* FLOAT */:
        return AvroParser.readFloat(stream, options);
      case "double" /* DOUBLE */:
        return AvroParser.readDouble(stream, options);
      case "bytes" /* BYTES */:
        return AvroParser.readBytes(stream, options);
      case "string" /* STRING */:
        return AvroParser.readString(stream, options);
      default:
        throw new Error("Unknown Avro Primitive");
    }
  }
}
class AvroEnumType extends AvroType {
  _symbols;
  constructor(symbols) {
    super();
    this._symbols = symbols;
  }
  // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
  async read(stream, options = {}) {
    const value = await AvroParser.readInt(stream, options);
    return this._symbols[value];
  }
}
class AvroUnionType extends AvroType {
  _types;
  constructor(types) {
    super();
    this._types = types;
  }
  async read(stream, options = {}) {
    const typeIndex = await AvroParser.readInt(stream, options);
    return this._types[typeIndex].read(stream, options);
  }
}
class AvroMapType extends AvroType {
  _itemType;
  constructor(itemType) {
    super();
    this._itemType = itemType;
  }
  // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
  read(stream, options = {}) {
    const readItemMethod = (s, opts) => {
      return this._itemType.read(s, opts);
    };
    return AvroParser.readMap(stream, readItemMethod, options);
  }
}
class AvroRecordType extends AvroType {
  _name;
  _fields;
  constructor(fields, name) {
    super();
    this._fields = fields;
    this._name = name;
  }
  // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
  async read(stream, options = {}) {
    const record = {};
    record["$schema"] = this._name;
    for (const key in this._fields) {
      if (Object.prototype.hasOwnProperty.call(this._fields, key)) {
        record[key] = await this._fields[key].read(stream, options);
      }
    }
    return record;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AvroParser,
  AvroType
});
//# sourceMappingURL=AvroParser.js.map
