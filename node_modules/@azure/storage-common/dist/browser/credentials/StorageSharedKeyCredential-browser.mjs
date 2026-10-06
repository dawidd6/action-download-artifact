// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Credential } from "./Credential.js";
/**
 * ONLY AVAILABLE IN NODE.JS RUNTIME.
 *
 * StorageSharedKeyCredential for account key authorization of Azure Storage service.
 */
export class StorageSharedKeyCredential extends Credential {
    /**
     * Azure Storage account name; readonly.
     */
    accountName;
    /**
     * Creates an instance of StorageSharedKeyCredential.
     * @param accountName -
     * @param accountKey -
     */
    constructor(_accountName, _accountKey) {
        super();
        throw new Error("StorageSharedKeyCredential is not supported in the browser.");
    }
    /**
     * Creates a StorageSharedKeyCredentialPolicy object.
     *
     * @param _nextPolicy -
     * @param _options -
     */
    create(_nextPolicy, _options) {
        throw new Error("StorageSharedKeyCredential is not supported in the browser.");
    }
    /**
     * Generates a hash signature for an HTTP request or for a SAS.
     *
     * @param _stringToSign -
     */
    computeHMACSHA256(_stringToSign) {
        throw new Error("StorageSharedKeyCredential is not supported in the browser.");
    }
}
//# sourceMappingURL=StorageSharedKeyCredential-browser.mjs.map