import type { UserDelegationKey } from "./UserDelegationKey.js";
/**
 * ONLY AVAILABLE IN NODE.JS RUNTIME.
 *
 * UserDelegationKeyCredential is only used for generation of user delegation SAS.
 */
export declare class UserDelegationKeyCredential {
    readonly accountName: string;
    readonly userDelegationKey: UserDelegationKey;
    constructor(accountName: string, userDelegationKey: UserDelegationKey);
    computeHMACSHA256(_stringToSign: string): string;
}
//# sourceMappingURL=UserDelegationKeyCredential-browser.d.mts.map