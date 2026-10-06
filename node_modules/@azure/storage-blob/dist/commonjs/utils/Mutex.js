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
var Mutex_exports = {};
__export(Mutex_exports, {
  Mutex: () => Mutex
});
module.exports = __toCommonJS(Mutex_exports);
var MutexLockStatus = /* @__PURE__ */ ((MutexLockStatus2) => {
  MutexLockStatus2[MutexLockStatus2["LOCKED"] = 0] = "LOCKED";
  MutexLockStatus2[MutexLockStatus2["UNLOCKED"] = 1] = "UNLOCKED";
  return MutexLockStatus2;
})(MutexLockStatus || {});
class Mutex {
  /**
   * Lock for a specific key. If the lock has been acquired by another customer, then
   * will wait until getting the lock.
   *
   * @param key - lock key
   */
  static async lock(key) {
    return new Promise((resolve) => {
      if (this.keys[key] === void 0 || this.keys[key] === 1 /* UNLOCKED */) {
        this.keys[key] = 0 /* LOCKED */;
        resolve();
      } else {
        this.onUnlockEvent(key, () => {
          this.keys[key] = 0 /* LOCKED */;
          resolve();
        });
      }
    });
  }
  /**
   * Unlock a key.
   *
   * @param key -
   */
  static async unlock(key) {
    return new Promise((resolve) => {
      if (this.keys[key] === 0 /* LOCKED */) {
        this.emitUnlockEvent(key);
      }
      delete this.keys[key];
      resolve();
    });
  }
  static keys = {};
  static listeners = {};
  static onUnlockEvent(key, handler) {
    if (this.listeners[key] === void 0) {
      this.listeners[key] = [handler];
    } else {
      this.listeners[key].push(handler);
    }
  }
  static emitUnlockEvent(key) {
    if (this.listeners[key] !== void 0 && this.listeners[key].length > 0) {
      const handler = this.listeners[key].shift();
      setImmediate(() => {
        handler.call(this);
      });
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Mutex
});
//# sourceMappingURL=Mutex.js.map
