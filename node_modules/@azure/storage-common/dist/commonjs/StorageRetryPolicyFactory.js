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
var StorageRetryPolicyFactory_exports = {};
__export(StorageRetryPolicyFactory_exports, {
  NewRetryPolicyFactory: () => import_StorageRetryPolicy.NewRetryPolicyFactory,
  StorageRetryPolicy: () => import_StorageRetryPolicy.StorageRetryPolicy,
  StorageRetryPolicyFactory: () => StorageRetryPolicyFactory,
  StorageRetryPolicyType: () => import_StorageRetryPolicyType.StorageRetryPolicyType
});
module.exports = __toCommonJS(StorageRetryPolicyFactory_exports);
var import_StorageRetryPolicy = require("./policies/StorageRetryPolicy.js");
var import_StorageRetryPolicyType = require("./policies/StorageRetryPolicyType.js");
class StorageRetryPolicyFactory {
  retryOptions;
  /**
   * Creates an instance of StorageRetryPolicyFactory.
   * @param retryOptions -
   */
  constructor(retryOptions) {
    this.retryOptions = retryOptions;
  }
  /**
   * Creates a StorageRetryPolicy object.
   *
   * @param nextPolicy -
   * @param options -
   */
  create(nextPolicy, options) {
    return new import_StorageRetryPolicy.StorageRetryPolicy(nextPolicy, options, this.retryOptions);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NewRetryPolicyFactory,
  StorageRetryPolicy,
  StorageRetryPolicyFactory,
  StorageRetryPolicyType
});
//# sourceMappingURL=StorageRetryPolicyFactory.js.map
