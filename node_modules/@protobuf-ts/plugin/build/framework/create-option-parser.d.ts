/**
 * Plugin options derived from an options spec.
 */
export declare type Options<S extends OptionSpecs> = {
    [K in keyof S]: boolean;
};
declare type OptionSpecs = Record<string, OptionSpec>;
declare type OptionSpec = {
    kind: "flag";
    /**
     * A description for this option.
     */
    description: string;
    /**
     * If this option is set, setting any of the following other options is an error.
     */
    excludes?: readonly string[];
    /**
     * If this option is set, the following other options must be set as well.
     */
    requires?: readonly string[];
};
/**
 * Function to parse raw options into typed options.
 * May throw an error.
 */
export declare type OptionsParseFn<S extends OptionSpecs> = (input: string | {
    key: string;
    value: string;
}[]) => Options<S>;
/**
 * Create a function for parsing options from an options spec.
 */
export declare function createOptionParser<S extends OptionSpecs>(optionSpecs: S): OptionsParseFn<S>;
export {};
