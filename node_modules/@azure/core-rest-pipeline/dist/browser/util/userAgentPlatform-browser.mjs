// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * @internal
 */
export function getHeaderName() {
    return "x-ms-useragent";
}
function getBrowserInfo(userAgent) {
    const browserRegexes = [
        { name: "Firefox", regex: /Firefox\/([\d.]+)/ },
        { name: "Safari", regex: /Version\/([\d.]+).*Safari/ },
    ];
    for (const browser of browserRegexes) {
        const match = userAgent.match(browser.regex);
        if (match) {
            return { brand: browser.name, version: match[1] };
        }
    }
    return undefined;
}
function getBrandVersionString(brands) {
    const brandOrder = ["Google Chrome", "Microsoft Edge", "Opera", "Brave", "Chromium"];
    for (const brand of brandOrder) {
        const foundBrand = brands.find((b) => b.brand === brand);
        if (foundBrand) {
            return foundBrand;
        }
    }
    return undefined;
}
/**
 * @internal
 */
export async function setPlatformSpecificData(map) {
    const nav = globalThis.navigator;
    let osInfo = "unknown";
    if (nav?.userAgentData) {
        const entropyValues = await nav.userAgentData.getHighEntropyValues([
            "architecture",
            "platformVersion",
        ]);
        osInfo = `${entropyValues.platform} ${entropyValues.platformVersion}; ${entropyValues.architecture}`;
        const brand = getBrandVersionString(nav.userAgentData.brands);
        if (brand) {
            map.set(brand.brand, `${brand.version} (${osInfo})`);
        }
    }
    else if (nav?.platform) {
        osInfo = nav.platform;
        const brand = getBrowserInfo(nav.userAgent);
        if (brand) {
            map.set(brand.brand, `${brand.version} (${osInfo})`);
        }
    }
    else if (typeof EdgeRuntime === "string") {
        map.set("EdgeRuntime", `${EdgeRuntime} (${osInfo})`);
    }
}
//# sourceMappingURL=userAgentPlatform-browser.mjs.map