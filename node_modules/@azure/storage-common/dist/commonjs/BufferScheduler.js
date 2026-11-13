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
var BufferScheduler_exports = {};
__export(BufferScheduler_exports, {
  BufferScheduler: () => BufferScheduler
});
module.exports = __toCommonJS(BufferScheduler_exports);
var import_events = require("events");
var import_PooledBuffer = require("./PooledBuffer.js");
class BufferScheduler {
  /**
   * Size of buffers in incoming and outgoing queues. This class will try to align
   * data read from Readable stream into buffer chunks with bufferSize defined.
   */
  bufferSize;
  /**
   * How many buffers can be created or maintained.
   */
  maxBuffers;
  /**
   * A Node.js Readable stream.
   */
  readable;
  /**
   * OutgoingHandler is an async function triggered by BufferScheduler when there
   * are available buffers in outgoing array.
   */
  outgoingHandler;
  /**
   * An internal event emitter.
   */
  emitter = new import_events.EventEmitter();
  /**
   * Concurrency of executing outgoingHandlers. (0 lesser than concurrency lesser than or equal to maxBuffers)
   */
  concurrency;
  /**
   * An internal offset marker to track data offset in bytes of next outgoingHandler.
   */
  offset = 0;
  /**
   * An internal marker to track whether stream is end.
   */
  isStreamEnd = false;
  /**
   * An internal marker to track whether stream or outgoingHandler returns error.
   */
  isError = false;
  /**
   * How many handlers are executing.
   */
  executingOutgoingHandlers = 0;
  /**
   * Encoding of the input Readable stream which has string data type instead of Buffer.
   */
  encoding;
  /**
   * How many buffers have been allocated.
   */
  numBuffers = 0;
  /**
   * Because this class doesn't know how much data every time stream pops, which
   * is defined by highWaterMarker of the stream. So BufferScheduler will cache
   * data received from the stream, when data in unresolvedDataArray exceeds the
   * blockSize defined, it will try to concat a blockSize of buffer, fill into available
   * buffers from incoming and push to outgoing array.
   */
  unresolvedDataArray = [];
  /**
   * How much data consisted in unresolvedDataArray.
   */
  unresolvedLength = 0;
  /**
   * The array includes all the available buffers can be used to fill data from stream.
   */
  incoming = [];
  /**
   * The array (queue) includes all the buffers filled from stream data.
   */
  outgoing = [];
  /**
   * Creates an instance of BufferScheduler.
   *
   * @param readable - A Node.js Readable stream
   * @param bufferSize - Buffer size of every maintained buffer
   * @param maxBuffers - How many buffers can be allocated
   * @param outgoingHandler - An async function scheduled to be
   *                                          triggered when a buffer fully filled
   *                                          with stream data
   * @param concurrency - Concurrency of executing outgoingHandlers (&gt;0)
   * @param encoding - [Optional] Encoding of Readable stream when it's a string stream
   */
  constructor(readable, bufferSize, maxBuffers, outgoingHandler, concurrency, encoding) {
    if (bufferSize <= 0) {
      throw new RangeError(`bufferSize must be larger than 0, current is ${bufferSize}`);
    }
    if (maxBuffers <= 0) {
      throw new RangeError(`maxBuffers must be larger than 0, current is ${maxBuffers}`);
    }
    if (concurrency <= 0) {
      throw new RangeError(`concurrency must be larger than 0, current is ${concurrency}`);
    }
    this.bufferSize = bufferSize;
    this.maxBuffers = maxBuffers;
    this.readable = readable;
    this.outgoingHandler = outgoingHandler;
    this.concurrency = concurrency;
    this.encoding = encoding;
  }
  /**
   * Start the scheduler, will return error when stream of any of the outgoingHandlers
   * returns error.
   *
   */
  async do() {
    return new Promise((resolve, reject) => {
      this.readable.on("data", (data) => {
        data = typeof data === "string" ? Buffer.from(data, this.encoding) : data;
        this.appendUnresolvedData(data);
        if (!this.resolveData()) {
          this.readable.pause();
        }
      });
      this.readable.on("error", (err) => {
        this.emitter.emit("error", err);
      });
      this.readable.on("end", () => {
        this.isStreamEnd = true;
        this.emitter.emit("checkEnd");
      });
      this.emitter.on("error", (err) => {
        this.isError = true;
        this.readable.pause();
        reject(err);
      });
      this.emitter.on("checkEnd", () => {
        if (this.outgoing.length > 0) {
          this.triggerOutgoingHandlers();
          return;
        }
        if (this.isStreamEnd && this.executingOutgoingHandlers === 0) {
          if (this.unresolvedLength > 0 && this.unresolvedLength < this.bufferSize) {
            const buffer = this.shiftBufferFromUnresolvedDataArray();
            this.outgoingHandler(() => buffer.getReadableStream(), buffer.size, this.offset).then(resolve).catch(reject);
          } else if (this.unresolvedLength >= this.bufferSize) {
            return;
          } else {
            resolve();
          }
        }
      });
    });
  }
  /**
   * Insert a new data into unresolved array.
   *
   * @param data -
   */
  appendUnresolvedData(data) {
    this.unresolvedDataArray.push(data);
    this.unresolvedLength += data.length;
  }
  /**
   * Try to shift a buffer with size in blockSize. The buffer returned may be less
   * than blockSize when data in unresolvedDataArray is less than bufferSize.
   *
   */
  shiftBufferFromUnresolvedDataArray(buffer) {
    if (!buffer) {
      buffer = new import_PooledBuffer.PooledBuffer(this.bufferSize, this.unresolvedDataArray, this.unresolvedLength);
    } else {
      buffer.fill(this.unresolvedDataArray, this.unresolvedLength);
    }
    this.unresolvedLength -= buffer.size;
    return buffer;
  }
  /**
   * Resolve data in unresolvedDataArray. For every buffer with size in blockSize
   * shifted, it will try to get (or allocate a buffer) from incoming, and fill it,
   * then push it into outgoing to be handled by outgoing handler.
   *
   * Return false when available buffers in incoming are not enough, else true.
   *
   * @returns Return false when buffers in incoming are not enough, else true.
   */
  resolveData() {
    while (this.unresolvedLength >= this.bufferSize) {
      let buffer;
      if (this.incoming.length > 0) {
        buffer = this.incoming.shift();
        this.shiftBufferFromUnresolvedDataArray(buffer);
      } else {
        if (this.numBuffers < this.maxBuffers) {
          buffer = this.shiftBufferFromUnresolvedDataArray();
          this.numBuffers++;
        } else {
          return false;
        }
      }
      this.outgoing.push(buffer);
      this.triggerOutgoingHandlers();
    }
    return true;
  }
  /**
   * Try to trigger a outgoing handler for every buffer in outgoing. Stop when
   * concurrency reaches.
   */
  async triggerOutgoingHandlers() {
    let buffer;
    do {
      if (this.executingOutgoingHandlers >= this.concurrency) {
        return;
      }
      buffer = this.outgoing.shift();
      if (buffer) {
        this.triggerOutgoingHandler(buffer);
      }
    } while (buffer);
  }
  /**
   * Trigger a outgoing handler for a buffer shifted from outgoing.
   *
   * @param buffer -
   */
  async triggerOutgoingHandler(buffer) {
    const bufferLength = buffer.size;
    this.executingOutgoingHandlers++;
    this.offset += bufferLength;
    try {
      await this.outgoingHandler(
        () => buffer.getReadableStream(),
        bufferLength,
        this.offset - bufferLength
      );
    } catch (err) {
      this.emitter.emit("error", err);
      return;
    }
    this.executingOutgoingHandlers--;
    this.reuseBuffer(buffer);
    this.emitter.emit("checkEnd");
  }
  /**
   * Return buffer used by outgoing handler into incoming.
   *
   * @param buffer -
   */
  reuseBuffer(buffer) {
    this.incoming.push(buffer);
    if (!this.isError && this.resolveData() && !this.isStreamEnd) {
      this.readable.resume();
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BufferScheduler
});
//# sourceMappingURL=BufferScheduler.js.map
