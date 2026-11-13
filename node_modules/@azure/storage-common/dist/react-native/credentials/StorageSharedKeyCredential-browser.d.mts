import type { RequestPolicy, RequestPolicyOptionsLike as RequestPolicyOptions } from "@azure/core-http-compat";
import { Credential } from "./Credential.js";
/**
 * ONLY AVAILABLE IN NODE.JS RUNTIME.
 *
 * StorageSharedKeyCredential for account key authorization of Azure Storage service.
 */
export declare class StorageSharedKeyCredential extends Credential {
    /**
     * Azure Storage account name; readonly.
     */
    readonly accountName: string;
    /**
     * Creates an instance of StorageSharedKeyCredential.
     * @param accountName -
     * @param accountKey -
     */
    constructor(_accountName: string, _accountKey: string);
    /**
     * Creates a StorageSharedKeyCredentialPolicy object.
     *
     * @param _nextPolicy -
     * @param _options -
     */
    create(_nextPolicy: RequestPolicy, _options: RequestPolicyOptions): RequestPolicy;
    /**
     * Generates a hash signature for an HTTP request or for a SAS.
     *
     * @param _stringToSign -
     */
    computeHMACSHA256(_stringToSign: string): string;
}
//# sourceMappingURL=StorageSharedKeyCredential-browser.d.mts.map