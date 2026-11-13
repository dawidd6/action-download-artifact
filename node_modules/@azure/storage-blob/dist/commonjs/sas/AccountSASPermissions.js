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
var AccountSASPermissions_exports = {};
__export(AccountSASPermissions_exports, {
  AccountSASPermissions: () => AccountSASPermissions
});
module.exports = __toCommonJS(AccountSASPermissions_exports);
class AccountSASPermissions {
  /**
   * Parse initializes the AccountSASPermissions fields from a string.
   *
   * @param permissions -
   */
  static parse(permissions) {
    const accountSASPermissions = new AccountSASPermissions();
    for (const c of permissions) {
      switch (c) {
        case "r":
          accountSASPermissions.read = true;
          break;
        case "w":
          accountSASPermissions.write = true;
          break;
        case "d":
          accountSASPermissions.delete = true;
          break;
        case "x":
          accountSASPermissions.deleteVersion = true;
          break;
        case "l":
          accountSASPermissions.list = true;
          break;
        case "a":
          accountSASPermissions.add = true;
          break;
        case "c":
          accountSASPermissions.create = true;
          break;
        case "u":
          accountSASPermissions.update = true;
          break;
        case "p":
          accountSASPermissions.process = true;
          break;
        case "t":
          accountSASPermissions.tag = true;
          break;
        case "f":
          accountSASPermissions.filter = true;
          break;
        case "i":
          accountSASPermissions.setImmutabilityPolicy = true;
          break;
        case "y":
          accountSASPermissions.permanentDelete = true;
          break;
        default:
          throw new RangeError(`Invalid permission character: ${c}`);
      }
    }
    return accountSASPermissions;
  }
  /**
   * Creates a {@link AccountSASPermissions} from a raw object which contains same keys as it
   * and boolean values for them.
   *
   * @param permissionLike -
   */
  static from(permissionLike) {
    const accountSASPermissions = new AccountSASPermissions();
    if (permissionLike.read) {
      accountSASPermissions.read = true;
    }
    if (permissionLike.write) {
      accountSASPermissions.write = true;
    }
    if (permissionLike.delete) {
      accountSASPermissions.delete = true;
    }
    if (permissionLike.deleteVersion) {
      accountSASPermissions.deleteVersion = true;
    }
    if (permissionLike.filter) {
      accountSASPermissions.filter = true;
    }
    if (permissionLike.tag) {
      accountSASPermissions.tag = true;
    }
    if (permissionLike.list) {
      accountSASPermissions.list = true;
    }
    if (permissionLike.add) {
      accountSASPermissions.add = true;
    }
    if (permissionLike.create) {
      accountSASPermissions.create = true;
    }
    if (permissionLike.update) {
      accountSASPermissions.update = true;
    }
    if (permissionLike.process) {
      accountSASPermissions.process = true;
    }
    if (permissionLike.setImmutabilityPolicy) {
      accountSASPermissions.setImmutabilityPolicy = true;
    }
    if (permissionLike.permanentDelete) {
      accountSASPermissions.permanentDelete = true;
    }
    return accountSASPermissions;
  }
  /**
   * Permission to read resources and list queues and tables granted.
   */
  read = false;
  /**
   * Permission to write resources granted.
   */
  write = false;
  /**
   * Permission to delete blobs and files granted.
   */
  delete = false;
  /**
   * Permission to delete versions granted.
   */
  deleteVersion = false;
  /**
   * Permission to list blob containers, blobs, shares, directories, and files granted.
   */
  list = false;
  /**
   * Permission to add messages, table entities, and append to blobs granted.
   */
  add = false;
  /**
   * Permission to create blobs and files granted.
   */
  create = false;
  /**
   * Permissions to update messages and table entities granted.
   */
  update = false;
  /**
   * Permission to get and delete messages granted.
   */
  process = false;
  /**
   * Specfies Tag access granted.
   */
  tag = false;
  /**
   * Permission to filter blobs.
   */
  filter = false;
  /**
   * Permission to set immutability policy.
   */
  setImmutabilityPolicy = false;
  /**
   * Specifies that Permanent Delete is permitted.
   */
  permanentDelete = false;
  /**
   * Produces the SAS permissions string for an Azure Storage account.
   * Call this method to set AccountSASSignatureValues Permissions field.
   *
   * Using this method will guarantee the resource types are in
   * an order accepted by the service.
   *
   * @see https://learn.microsoft.com/rest/api/storageservices/constructing-an-account-sas
   *
   */
  toString() {
    const permissions = [];
    if (this.read) {
      permissions.push("r");
    }
    if (this.write) {
      permissions.push("w");
    }
    if (this.delete) {
      permissions.push("d");
    }
    if (this.deleteVersion) {
      permissions.push("x");
    }
    if (this.filter) {
      permissions.push("f");
    }
    if (this.tag) {
      permissions.push("t");
    }
    if (this.list) {
      permissions.push("l");
    }
    if (this.add) {
      permissions.push("a");
    }
    if (this.create) {
      permissions.push("c");
    }
    if (this.update) {
      permissions.push("u");
    }
    if (this.process) {
      permissions.push("p");
    }
    if (this.setImmutabilityPolicy) {
      permissions.push("i");
    }
    if (this.permanentDelete) {
      permissions.push("y");
    }
    return permissions.join("");
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AccountSASPermissions
});
//# sourceMappingURL=AccountSASPermissions.js.map
