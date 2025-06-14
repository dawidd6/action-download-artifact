/**
 * Escapes reserved words in ECMAScript and TypeScript identifiers, by appending
 * a dollar sign.
 *
 * This function is intended for use with identifiers from Protobuf. The passed
 * string must be a valid identifier (e.g. not start with a digit).
 *
 * Also see safeObjectProperty() from @bufbuild/protoplugin/reflect.
 */
export declare function safeIdentifier(name: string): string;
