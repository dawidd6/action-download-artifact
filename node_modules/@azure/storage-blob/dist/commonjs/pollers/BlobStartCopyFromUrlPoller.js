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
var BlobStartCopyFromUrlPoller_exports = {};
__export(BlobStartCopyFromUrlPoller_exports, {
  BlobBeginCopyFromUrlPoller: () => BlobBeginCopyFromUrlPoller
});
module.exports = __toCommonJS(BlobStartCopyFromUrlPoller_exports);
var import_core_util = require("@azure/core-util");
var import_core_lro = require("@azure/core-lro");
class BlobBeginCopyFromUrlPoller extends import_core_lro.Poller {
  intervalInMs;
  constructor(options) {
    const {
      blobClient,
      copySource,
      intervalInMs = 15e3,
      onProgress,
      resumeFrom,
      startCopyFromURLOptions
    } = options;
    let state;
    if (resumeFrom) {
      state = JSON.parse(resumeFrom).state;
    }
    const operation = makeBlobBeginCopyFromURLPollOperation({
      ...state,
      blobClient,
      copySource,
      startCopyFromURLOptions
    });
    super(operation);
    if (typeof onProgress === "function") {
      this.onProgress(onProgress);
    }
    this.intervalInMs = intervalInMs;
  }
  delay() {
    return (0, import_core_util.delay)(this.intervalInMs);
  }
}
const cancel = async function cancel2(options = {}) {
  const state = this.state;
  const { copyId } = state;
  if (state.isCompleted) {
    return makeBlobBeginCopyFromURLPollOperation(state);
  }
  if (!copyId) {
    state.isCancelled = true;
    return makeBlobBeginCopyFromURLPollOperation(state);
  }
  await state.blobClient.abortCopyFromURL(copyId, {
    abortSignal: options.abortSignal
  });
  state.isCancelled = true;
  return makeBlobBeginCopyFromURLPollOperation(state);
};
const update = async function update2(options = {}) {
  const state = this.state;
  const { blobClient, copySource, startCopyFromURLOptions } = state;
  if (!state.isStarted) {
    state.isStarted = true;
    const result = await blobClient.startCopyFromURL(copySource, startCopyFromURLOptions);
    state.copyId = result.copyId;
    if (result.copyStatus === "success") {
      state.result = result;
      state.isCompleted = true;
    }
  } else if (!state.isCompleted) {
    try {
      const result = await state.blobClient.getProperties({ abortSignal: options.abortSignal });
      const { copyStatus, copyProgress } = result;
      const prevCopyProgress = state.copyProgress;
      if (copyProgress) {
        state.copyProgress = copyProgress;
      }
      if (copyStatus === "pending" && copyProgress !== prevCopyProgress && typeof options.fireProgress === "function") {
        options.fireProgress(state);
      } else if (copyStatus === "success") {
        state.result = result;
        state.isCompleted = true;
      } else if (copyStatus === "failed") {
        state.error = new Error(
          `Blob copy failed with reason: "${result.copyStatusDescription || "unknown"}"`
        );
        state.isCompleted = true;
      }
    } catch (err) {
      state.error = err;
      state.isCompleted = true;
    }
  }
  return makeBlobBeginCopyFromURLPollOperation(state);
};
const toString = function toString2() {
  return JSON.stringify({ state: this.state }, (key, value) => {
    if (key === "blobClient") {
      return void 0;
    }
    return value;
  });
};
function makeBlobBeginCopyFromURLPollOperation(state) {
  return {
    state: { ...state },
    cancel,
    toString,
    update
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BlobBeginCopyFromUrlPoller
});
//# sourceMappingURL=BlobStartCopyFromUrlPoller.js.map
