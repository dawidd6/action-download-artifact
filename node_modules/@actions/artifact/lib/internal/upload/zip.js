"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipUploadStream = exports.DEFAULT_COMPRESSION_LEVEL = void 0;
exports.createZipUploadStream = createZipUploadStream;
const stream = __importStar(require("stream"));
const promises_1 = require("fs/promises");
const archiver = __importStar(require("archiver"));
const core = __importStar(require("@actions/core"));
const config_1 = require("../shared/config");
exports.DEFAULT_COMPRESSION_LEVEL = 6;
// Custom stream transformer so we can set the highWaterMark property
// See https://github.com/nodejs/node/issues/8855
class ZipUploadStream extends stream.Transform {
    constructor(bufferSize) {
        super({
            highWaterMark: bufferSize
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _transform(chunk, enc, cb) {
        cb(null, chunk);
    }
}
exports.ZipUploadStream = ZipUploadStream;
function createZipUploadStream(uploadSpecification_1) {
    return __awaiter(this, arguments, void 0, function* (uploadSpecification, compressionLevel = exports.DEFAULT_COMPRESSION_LEVEL) {
        core.debug(`Creating Artifact archive with compressionLevel: ${compressionLevel}`);
        const zip = archiver.create('zip', {
            highWaterMark: (0, config_1.getUploadChunkSize)(),
            zlib: { level: compressionLevel }
        });
        // register callbacks for various events during the zip lifecycle
        zip.on('error', zipErrorCallback);
        zip.on('warning', zipWarningCallback);
        zip.on('finish', zipFinishCallback);
        zip.on('end', zipEndCallback);
        for (const file of uploadSpecification) {
            if (file.sourcePath !== null) {
                // Check if symlink and resolve the source path
                let sourcePath = file.sourcePath;
                if (file.stats.isSymbolicLink()) {
                    sourcePath = yield (0, promises_1.realpath)(file.sourcePath);
                }
                // Add the file to the zip
                zip.file(sourcePath, {
                    name: file.destinationPath
                });
            }
            else {
                // Add a directory to the zip
                zip.append('', { name: file.destinationPath });
            }
        }
        const bufferSize = (0, config_1.getUploadChunkSize)();
        const zipUploadStream = new ZipUploadStream(bufferSize);
        core.debug(`Zip write high watermark value ${zipUploadStream.writableHighWaterMark}`);
        core.debug(`Zip read high watermark value ${zipUploadStream.readableHighWaterMark}`);
        zip.pipe(zipUploadStream);
        zip.finalize();
        return zipUploadStream;
    });
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const zipErrorCallback = (error) => {
    core.error('An error has occurred while creating the zip file for upload');
    core.info(error);
    throw new Error('An error has occurred during zip creation for the artifact');
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const zipWarningCallback = (error) => {
    if (error.code === 'ENOENT') {
        core.warning('ENOENT warning during artifact zip creation. No such file or directory');
        core.info(error);
    }
    else {
        core.warning(`A non-blocking warning has occurred during artifact zip creation: ${error.code}`);
        core.info(error);
    }
};
const zipFinishCallback = () => {
    core.debug('Zip stream for upload has finished.');
};
const zipEndCallback = () => {
    core.debug('Zip stream for upload has ended.');
};
//# sourceMappingURL=zip.js.map