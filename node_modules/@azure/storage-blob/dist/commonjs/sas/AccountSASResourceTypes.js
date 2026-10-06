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
var AccountSASResourceTypes_exports = {};
__export(AccountSASResourceTypes_exports, {
  AccountSASResourceTypes: () => AccountSASResourceTypes
});
module.exports = __toCommonJS(AccountSASResourceTypes_exports);
class AccountSASResourceTypes {
  /**
   * Creates an {@link AccountSASResourceTypes} from the specified resource types string. This method will throw an
   * Error if it encounters a character that does not correspond to a valid resource type.
   *
   * @param resourceTypes -
   */
  static parse(resourceTypes) {
    const accountSASResourceTypes = new AccountSASResourceTypes();
    for (const c of resourceTypes) {
      switch (c) {
        case "s":
          accountSASResourceTypes.service = true;
          break;
        case "c":
          accountSASResourceTypes.container = true;
          break;
        case "o":
          accountSASResourceTypes.object = true;
          break;
        default:
          throw new RangeError(`Invalid resource type: ${c}`);
      }
    }
    return accountSASResourceTypes;
  }
  /**
   * Permission to access service level APIs granted.
   */
  service = false;
  /**
   * Permission to access container level APIs (Blob Containers, Tables, Queues, File Shares) granted.
   */
  container = false;
  /**
   * Permission to access object level APIs (Blobs, Table Entities, Queue Messages, Files) granted.
   */
  object = false;
  /**
   * Converts the given resource types to a string.
   *
   * @see https://learn.microsoft.com/rest/api/storageservices/constructing-an-account-sas
   *
   */
  toString() {
    const resourceTypes = [];
    if (this.service) {
      resourceTypes.push("s");
    }
    if (this.container) {
      resourceTypes.push("c");
    }
    if (this.object) {
      resourceTypes.push("o");
    }
    return resourceTypes.join("");
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AccountSASResourceTypes
});
//# sourceMappingURL=AccountSASResourceTypes.js.map
