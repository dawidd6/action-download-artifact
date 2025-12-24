"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUploadChunkSize = getUploadChunkSize;
exports.getRuntimeToken = getRuntimeToken;
exports.getResultsServiceUrl = getResultsServiceUrl;
exports.isGhes = isGhes;
exports.getGitHubWorkspaceDir = getGitHubWorkspaceDir;
exports.getConcurrency = getConcurrency;
exports.getUploadChunkTimeout = getUploadChunkTimeout;
exports.getMaxArtifactListCount = getMaxArtifactListCount;
const os_1 = __importDefault(require("os"));
const core_1 = require("@actions/core");
// Used for controlling the highWaterMark value of the zip that is being streamed
// The same value is used as the chunk size that is use during upload to blob storage
function getUploadChunkSize() {
    return 8 * 1024 * 1024; // 8 MB Chunks
}
function getRuntimeToken() {
    const token = process.env['ACTIONS_RUNTIME_TOKEN'];
    if (!token) {
        throw new Error('Unable to get the ACTIONS_RUNTIME_TOKEN env variable');
    }
    return token;
}
function getResultsServiceUrl() {
    const resultsUrl = process.env['ACTIONS_RESULTS_URL'];
    if (!resultsUrl) {
        throw new Error('Unable to get the ACTIONS_RESULTS_URL env variable');
    }
    return new URL(resultsUrl).origin;
}
function isGhes() {
    const ghUrl = new URL(process.env['GITHUB_SERVER_URL'] || 'https://github.com');
    const hostname = ghUrl.hostname.trimEnd().toUpperCase();
    const isGitHubHost = hostname === 'GITHUB.COM';
    const isGheHost = hostname.endsWith('.GHE.COM');
    const isLocalHost = hostname.endsWith('.LOCALHOST');
    return !isGitHubHost && !isGheHost && !isLocalHost;
}
function getGitHubWorkspaceDir() {
    const ghWorkspaceDir = process.env['GITHUB_WORKSPACE'];
    if (!ghWorkspaceDir) {
        throw new Error('Unable to get the GITHUB_WORKSPACE env variable');
    }
    return ghWorkspaceDir;
}
// The maximum value of concurrency is 300.
// This value can be changed with ACTIONS_ARTIFACT_UPLOAD_CONCURRENCY variable.
function getConcurrency() {
    const numCPUs = os_1.default.cpus().length;
    let concurrencyCap = 32;
    if (numCPUs > 4) {
        const concurrency = 16 * numCPUs;
        concurrencyCap = concurrency > 300 ? 300 : concurrency;
    }
    const concurrencyOverride = process.env['ACTIONS_ARTIFACT_UPLOAD_CONCURRENCY'];
    if (concurrencyOverride) {
        const concurrency = parseInt(concurrencyOverride);
        if (isNaN(concurrency) || concurrency < 1) {
            throw new Error('Invalid value set for ACTIONS_ARTIFACT_UPLOAD_CONCURRENCY env variable');
        }
        if (concurrency < concurrencyCap) {
            (0, core_1.info)(`Set concurrency based on the value set in ACTIONS_ARTIFACT_UPLOAD_CONCURRENCY.`);
            return concurrency;
        }
        (0, core_1.info)(`ACTIONS_ARTIFACT_UPLOAD_CONCURRENCY is higher than the cap of ${concurrencyCap} based on the number of cpus. Set it to the maximum value allowed.`);
        return concurrencyCap;
    }
    // default concurrency to 5
    return 5;
}
function getUploadChunkTimeout() {
    const timeoutVar = process.env['ACTIONS_ARTIFACT_UPLOAD_TIMEOUT_MS'];
    if (!timeoutVar) {
        return 300000; // 5 minutes
    }
    const timeout = parseInt(timeoutVar);
    if (isNaN(timeout)) {
        throw new Error('Invalid value set for ACTIONS_ARTIFACT_UPLOAD_TIMEOUT_MS env variable');
    }
    return timeout;
}
// This value can be changed with ACTIONS_ARTIFACT_MAX_ARTIFACT_COUNT variable.
// Defaults to 1000 as a safeguard for rate limiting.
function getMaxArtifactListCount() {
    const maxCountVar = process.env['ACTIONS_ARTIFACT_MAX_ARTIFACT_COUNT'] || '1000';
    const maxCount = parseInt(maxCountVar);
    if (isNaN(maxCount) || maxCount < 1) {
        throw new Error('Invalid value set for ACTIONS_ARTIFACT_MAX_ARTIFACT_COUNT env variable');
    }
    return maxCount;
}
//# sourceMappingURL=config.js.map