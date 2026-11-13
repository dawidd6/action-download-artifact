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
var BlobSASPermissions_exports = {};
__export(BlobSASPermissions_exports, {
  BlobSASPermissions: () => BlobSASPermissions
});
module.exports = __toCommonJS(BlobSASPermissions_exports);
class BlobSASPermissions {
  /**
   * Creates a {@link BlobSASPermissions} from the specified permissions string. This method will throw an
   * Error if it encounters a character that does not correspond to a valid permission.
   *
   * @param permissions -
   */
  static parse(permissions) {
    const blobSASPermissions = new BlobSASPermissions();
    for (const char of permissions) {
      switch (char) {
        case "r":
          blobSASPermissions.read = true;
          break;
        case "a":
          blobSASPermissions.add = true;
          break;
        case "c":
          blobSASPermissions.create = true;
          break;
        case "w":
          blobSASPermissions.write = true;
          break;
        case "d":
          blobSASPermissions.delete = true;
          break;
        case "x":
          blobSASPermissions.deleteVersion = true;
          break;
        case "t":
          blobSASPermissions.tag = true;
          break;
        case "m":
          blobSASPermissions.move = true;
          break;
        case "e":
          blobSASPermissions.execute = true;
          break;
        case "i":
          blobSASPermissions.setImmutabilityPolicy = true;
          break;
        case "y":
          blobSASPermissions.permanentDelete = true;
          break;
        default:
          throw new RangeError(`Invalid permission: ${char}`);
      }
    }
    return blobSASPermissions;
  }
  /**
   * Creates a {@link BlobSASPermissions} from a raw object which contains same keys as it
   * and boolean values for them.
   *
   * @param permissionLike -
   */
  static from(permissionLike) {
    const blobSASPermissions = new BlobSASPermissions();
    if (permissionLike.read) {
      blobSASPermissions.read = true;
    }
    if (permissionLike.add) {
      blobSASPermissions.add = true;
    }
    if (permissionLike.create) {
      blobSASPermissions.create = true;
    }
    if (permissionLike.write) {
      blobSASPermissions.write = true;
    }
    if (permissionLike.delete) {
      blobSASPermissions.delete = true;
    }
    if (permissionLike.deleteVersion) {
      blobSASPermissions.deleteVersion = true;
    }
    if (permissionLike.tag) {
      blobSASPermissions.tag = true;
    }
    if (permissionLike.move) {
      blobSASPermissions.move = true;
    }
    if (permissionLike.execute) {
      blobSASPermissions.execute = true;
    }
    if (permissionLike.setImmutabilityPolicy) {
      blobSASPermissions.setImmutabilityPolicy = true;
    }
    if (permissionLike.permanentDelete) {
      blobSASPermissions.permanentDelete = true;
    }
    return blobSASPermissions;
  }
  /**
   * Specifies Read access granted.
   */
  read = false;
  /**
   * Specifies Add access granted.
   */
  add = false;
  /**
   * Specifies Create access granted.
   */
  create = false;
  /**
   * Specifies Write access granted.
   */
  write = false;
  /**
   * Specifies Delete access granted.
   */
  delete = false;
  /**
   * Specifies Delete version access granted.
   */
  deleteVersion = false;
  /**
   * Specfies Tag access granted.
   */
  tag = false;
  /**
   * Specifies Move access granted.
   */
  move = false;
  /**
   * Specifies Execute access granted.
   */
  execute = false;
  /**
   * Specifies SetImmutabilityPolicy access granted.
   */
  setImmutabilityPolicy = false;
  /**
   * Specifies that Permanent Delete is permitted.
   */
  permanentDelete = false;
  /**
   * Converts the given permissions to a string. Using this method will guarantee the permissions are in an
   * order accepted by the service.
   *
   * @returns A string which represents the BlobSASPermissions
   */
  toString() {
    const permissions = [];
    if (this.read) {
      permissions.push("r");
    }
    if (this.add) {
      permissions.push("a");
    }
    if (this.create) {
      permissions.push("c");
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
    if (this.tag) {
      permissions.push("t");
    }
    if (this.move) {
      permissions.push("m");
    }
    if (this.execute) {
      permissions.push("e");
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
  BlobSASPermissions
});
//# sourceMappingURL=BlobSASPermissions.js.map
