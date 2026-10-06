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
var Batch_exports = {};
__export(Batch_exports, {
  Batch: () => Batch
});
module.exports = __toCommonJS(Batch_exports);
var import_events = require("events");
var BatchStates = /* @__PURE__ */ ((BatchStates2) => {
  BatchStates2[BatchStates2["Good"] = 0] = "Good";
  BatchStates2[BatchStates2["Error"] = 1] = "Error";
  return BatchStates2;
})(BatchStates || {});
class Batch {
  /**
   * Concurrency. Must be lager than 0.
   */
  concurrency;
  /**
   * Number of active operations under execution.
   */
  actives = 0;
  /**
   * Number of completed operations under execution.
   */
  completed = 0;
  /**
   * Offset of next operation to be executed.
   */
  offset = 0;
  /**
   * Operation array to be executed.
   */
  operations = [];
  /**
   * States of Batch. When an error happens, state will turn into error.
   * Batch will stop execute left operations.
   */
  state = 0 /* Good */;
  /**
   * A private emitter used to pass events inside this class.
   */
  emitter;
  /**
   * Creates an instance of Batch.
   * @param concurrency -
   */
  constructor(concurrency = 5) {
    if (concurrency < 1) {
      throw new RangeError("concurrency must be larger than 0");
    }
    this.concurrency = concurrency;
    this.emitter = new import_events.EventEmitter();
  }
  /**
   * Add a operation into queue.
   *
   * @param operation -
   */
  addOperation(operation) {
    this.operations.push(async () => {
      try {
        this.actives++;
        await operation();
        this.actives--;
        this.completed++;
        this.parallelExecute();
      } catch (error) {
        this.emitter.emit("error", error);
      }
    });
  }
  /**
   * Start execute operations in the queue.
   *
   */
  async do() {
    if (this.operations.length === 0) {
      return Promise.resolve();
    }
    this.parallelExecute();
    return new Promise((resolve, reject) => {
      this.emitter.on("finish", resolve);
      this.emitter.on("error", (error) => {
        this.state = 1 /* Error */;
        reject(error);
      });
    });
  }
  /**
   * Get next operation to be executed. Return null when reaching ends.
   *
   */
  nextOperation() {
    if (this.offset < this.operations.length) {
      return this.operations[this.offset++];
    }
    return null;
  }
  /**
   * Start execute operations. One one the most important difference between
   * this method with do() is that do() wraps as an sync method.
   *
   */
  parallelExecute() {
    if (this.state === 1 /* Error */) {
      return;
    }
    if (this.completed >= this.operations.length) {
      this.emitter.emit("finish");
      return;
    }
    while (this.actives < this.concurrency) {
      const operation = this.nextOperation();
      if (operation) {
        operation();
      } else {
        return;
      }
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Batch
});
//# sourceMappingURL=Batch.js.map
