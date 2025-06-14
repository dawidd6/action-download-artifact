import { type AnyDesc, type DescComments, type DescEnumValue, type DescExtension, type DescField, type DescFile } from "@bufbuild/protobuf";
/**
 * Get comments on the package element in the protobuf source.
 */
export declare function getPackageComments(desc: DescFile): DescComments;
/**
 * Get comments on the syntax element in the protobuf source.
 */
export declare function getSyntaxComments(desc: DescFile): DescComments;
/**
 * Get comments on the element in the protobuf source.
 */
export declare function getComments(desc: Exclude<AnyDesc, DescFile>): DescComments;
/**
 * Get feature options set on the element in the protobuf source. This returns
 * compact (e.g. fields) or regular options (e.g. files) as an array of strings.
 */
export declare function getFeatureOptionStrings(desc: AnyDesc): string[];
/**
 * Return a string that matches the definition of a field in the protobuf
 * source. Does not take custom options into account.
 */
export declare function getDeclarationString(desc: DescField | DescExtension | DescEnumValue): string;
