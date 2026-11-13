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
var AccountSASServices_exports = {};
__export(AccountSASServices_exports, {
  AccountSASServices: () => AccountSASServices
});
module.exports = __toCommonJS(AccountSASServices_exports);
class AccountSASServices {
  /**
   * Creates an {@link AccountSASServices} from the specified services string. This method will throw an
   * Error if it encounters a character that does not correspond to a valid service.
   *
   * @param services -
   */
  static parse(services) {
    const accountSASServices = new AccountSASServices();
    for (const c of services) {
      switch (c) {
        case "b":
          accountSASServices.blob = true;
          break;
        case "f":
          accountSASServices.file = true;
          break;
        case "q":
          accountSASServices.queue = true;
          break;
        case "t":
          accountSASServices.table = true;
          break;
        default:
          throw new RangeError(`Invalid service character: ${c}`);
      }
    }
    return accountSASServices;
  }
  /**
   * Permission to access blob resources granted.
   */
  blob = false;
  /**
   * Permission to access file resources granted.
   */
  file = false;
  /**
   * Permission to access queue resources granted.
   */
  queue = false;
  /**
   * Permission to access table resources granted.
   */
  table = false;
  /**
   * Converts the given services to a string.
   *
   */
  toString() {
    const services = [];
    if (this.blob) {
      services.push("b");
    }
    if (this.table) {
      services.push("t");
    }
    if (this.queue) {
      services.push("q");
    }
    if (this.file) {
      services.push("f");
    }
    return services.join("");
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AccountSASServices
});
//# sourceMappingURL=AccountSASServices.js.map
