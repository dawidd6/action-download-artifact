export declare class PluginOptionError extends Error {
    name: string;
    constructor(option: string, reason?: unknown);
}
export declare function reasonToString(reason: unknown): string;
export declare function isPluginOptionError(arg: unknown): arg is PluginOptionError;
