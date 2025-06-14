import type { GenEnum, GenExtension, GenFile, GenMessage } from "../../../../codegenv2/types.js";
import type { FeatureSet } from "./descriptor_pb.js";
import type { Message } from "../../../../types.js";
/**
 * Describes the file google/protobuf/java_features.proto.
 */
export declare const file_google_protobuf_java_features: GenFile;
/**
 * @generated from message pb.JavaFeatures
 */
export type JavaFeatures = Message<"pb.JavaFeatures"> & {
    /**
     * Whether or not to treat an enum field as closed.  This option is only
     * applicable to enum fields, and will be removed in the future.  It is
     * consistent with the legacy behavior of using proto3 enum types for proto2
     * fields.
     *
     * @generated from field: optional bool legacy_closed_enum = 1;
     */
    legacyClosedEnum: boolean;
    /**
     * @generated from field: optional pb.JavaFeatures.Utf8Validation utf8_validation = 2;
     */
    utf8Validation: JavaFeatures_Utf8Validation;
    /**
     * Whether to use the old default outer class name scheme, or the new feature
     * which adds a "Proto" suffix to the outer class name.
     *
     * Users will not be able to set this option, because we removed it in the
     * same edition that it was introduced. But we use it to determine which
     * naming scheme to use for outer class name defaults.
     *
     * @generated from field: optional bool use_old_outer_classname_default = 4;
     */
    useOldOuterClassnameDefault: boolean;
};
/**
 * @generated from message pb.JavaFeatures
 */
export type JavaFeaturesJson = {
    /**
     * Whether or not to treat an enum field as closed.  This option is only
     * applicable to enum fields, and will be removed in the future.  It is
     * consistent with the legacy behavior of using proto3 enum types for proto2
     * fields.
     *
     * @generated from field: optional bool legacy_closed_enum = 1;
     */
    legacyClosedEnum?: boolean;
    /**
     * @generated from field: optional pb.JavaFeatures.Utf8Validation utf8_validation = 2;
     */
    utf8Validation?: JavaFeatures_Utf8ValidationJson;
    /**
     * Whether to use the old default outer class name scheme, or the new feature
     * which adds a "Proto" suffix to the outer class name.
     *
     * Users will not be able to set this option, because we removed it in the
     * same edition that it was introduced. But we use it to determine which
     * naming scheme to use for outer class name defaults.
     *
     * @generated from field: optional bool use_old_outer_classname_default = 4;
     */
    useOldOuterClassnameDefault?: boolean;
};
/**
 * Describes the message pb.JavaFeatures.
 * Use `create(JavaFeaturesSchema)` to create a new message.
 */
export declare const JavaFeaturesSchema: GenMessage<JavaFeatures, {
    jsonType: JavaFeaturesJson;
}>;
/**
 * The UTF8 validation strategy to use.  See go/editions-utf8-validation for
 * more information on this feature.
 *
 * @generated from enum pb.JavaFeatures.Utf8Validation
 */
export declare enum JavaFeatures_Utf8Validation {
    /**
     * Invalid default, which should never be used.
     *
     * @generated from enum value: UTF8_VALIDATION_UNKNOWN = 0;
     */
    UTF8_VALIDATION_UNKNOWN = 0,
    /**
     * Respect the UTF8 validation behavior specified by the global
     * utf8_validation feature.
     *
     * @generated from enum value: DEFAULT = 1;
     */
    DEFAULT = 1,
    /**
     * Verifies UTF8 validity overriding the global utf8_validation
     * feature. This represents the legacy java_string_check_utf8 option.
     *
     * @generated from enum value: VERIFY = 2;
     */
    VERIFY = 2
}
/**
 * The UTF8 validation strategy to use.  See go/editions-utf8-validation for
 * more information on this feature.
 *
 * @generated from enum pb.JavaFeatures.Utf8Validation
 */
export type JavaFeatures_Utf8ValidationJson = "UTF8_VALIDATION_UNKNOWN" | "DEFAULT" | "VERIFY";
/**
 * Describes the enum pb.JavaFeatures.Utf8Validation.
 */
export declare const JavaFeatures_Utf8ValidationSchema: GenEnum<JavaFeatures_Utf8Validation, JavaFeatures_Utf8ValidationJson>;
/**
 * @generated from extension: optional pb.JavaFeatures java = 1001;
 */
export declare const java: GenExtension<FeatureSet, JavaFeatures>;
