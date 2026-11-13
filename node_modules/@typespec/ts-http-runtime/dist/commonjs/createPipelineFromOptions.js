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
var createPipelineFromOptions_exports = {};
__export(createPipelineFromOptions_exports, {
  createPipelineFromOptions: () => createPipelineFromOptions
});
module.exports = __toCommonJS(createPipelineFromOptions_exports);
var import_logPolicy = require("./policies/logPolicy.js");
var import_pipeline = require("./pipeline.js");
var import_userAgentPolicy = require("./policies/userAgentPolicy.js");
var import_defaultRetryPolicy = require("./policies/defaultRetryPolicy.js");
var import_formDataPolicy = require("./policies/formDataPolicy.js");
var import_policies = require("./policies/platformPolicies.js");
var import_multipartPolicy = require("./policies/multipartPolicy.js");
function createPipelineFromOptions(options) {
  const pipeline = (0, import_pipeline.createEmptyPipeline)();
  (0, import_policies.addPlatformPolicies)(pipeline, options);
  pipeline.addPolicy((0, import_formDataPolicy.formDataPolicy)(), { beforePolicies: [import_multipartPolicy.multipartPolicyName] });
  pipeline.addPolicy((0, import_userAgentPolicy.userAgentPolicy)(options.userAgentOptions));
  pipeline.addPolicy((0, import_multipartPolicy.multipartPolicy)(), { afterPhase: "Deserialize" });
  pipeline.addPolicy((0, import_defaultRetryPolicy.defaultRetryPolicy)(options.retryOptions), { phase: "Retry" });
  pipeline.addPolicy((0, import_logPolicy.logPolicy)(options.loggingOptions), { afterPhase: "Sign" });
  return pipeline;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createPipelineFromOptions
});
//# sourceMappingURL=createPipelineFromOptions.js.map
