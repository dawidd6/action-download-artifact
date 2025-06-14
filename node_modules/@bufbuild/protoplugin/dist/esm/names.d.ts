import type { DescEnum, DescExtension, DescFile, DescMessage, DescService } from "@bufbuild/protobuf";
/**
 * Return a file path for the give file descriptor.
 */
export declare function generateFilePath(file: DescFile, bootstrapWkt: boolean, filesToGenerate: DescFile[]): string;
/**
 * Return a safe identifier for a generated descriptor.
 */
export declare function generatedDescName(desc: DescFile | DescEnum | DescMessage | DescExtension | DescService): string;
/**
 * Return a safe identifier for a generated shape.
 */
export declare function generatedShapeName(desc: DescEnum | DescMessage): string;
/**
 * Return a safe identifier for a generated JSON type.
 */
export declare function generatedJsonTypeName(desc: DescEnum | DescMessage): string;
/**
 * Return a safe identifier for a generated Valid type.
 */
export declare function generatedValidTypeName(desc: DescEnum | DescMessage): string;
