/**
 * A user delegation key.
 */
export interface UserDelegationKey {
    /**
     * The Azure Active Directory object ID in GUID format.
     */
    signedObjectId: string;
    /**
     * The Azure Active Directory tenant ID in GUID format.
     */
    signedTenantId: string;
    /**
     * The date-time the key is active.
     */
    signedStartsOn: Date;
    /**
     * The date-time the key expires.
     */
    signedExpiresOn: Date;
    /**
     * Abbreviation of the Azure Storage service that accepts the key.
     */
    signedService: string;
    /**
     * The service version that created the key.
     */
    signedVersion: string;
    /**
     * The key as a base64 string.
     */
    value: string;
}
/**
 * ONLY AVAILABLE IN NODE.JS RUNTIME.
 *
 * UserDelegationKeyCredential is only used for generation of user delegation SAS.
 * @see https://learn.microsoft.com/rest/api/storageservices/create-user-delegation-sas
 */
export declare class UserDelegationKeyCredential {
    /**
     * Azure Storage account name; readonly.
     */
    readonly accountName: string;
    /**
     * Azure Storage user delegation key; readonly.
     */
    readonly userDelegationKey: UserDelegationKey;
    /**
     * Key value in Buffer type.
     */
    private readonly key;
    /**
     * Creates an instance of UserDelegationKeyCredential.
     * @param accountName -
     * @param userDelegationKey -
     */
    constructor(accountName: string, userDelegationKey: UserDelegationKey);
    /**
     * Generates a hash signature for an HTTP request or for a SAS.
     *
     * @param stringToSign -
     */
    computeHMACSHA256(stringToSign: string): string;
}
//# sourceMappingURL=UserDelegationKeyCredential.d.ts.map