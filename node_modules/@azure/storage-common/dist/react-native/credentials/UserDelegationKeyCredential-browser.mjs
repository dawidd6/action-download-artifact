// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * ONLY AVAILABLE IN NODE.JS RUNTIME.
 *
 * UserDelegationKeyCredential is only used for generation of user delegation SAS.
 */
export class UserDelegationKeyCredential {
    accountName;
    userDelegationKey;
    constructor(accountName, userDelegationKey) {
        this.accountName = accountName;
        this.userDelegationKey = userDelegationKey;
        throw new Error("UserDelegationKeyCredential is not supported in the browser.");
    }
    computeHMACSHA256(_stringToSign) {
        throw new Error("UserDelegationKeyCredential is not supported in the browser.");
    }
}
//# sourceMappingURL=UserDelegationKeyCredential-browser.mjs.map