import { ILlmSchemaV3_1 } from "./ILlmSchemaV3_1";

/**
 * Type schema for Claude function calling.
 *
 * `IClaudeSchema` defines the type schema format for Claude function calling.
 *
 * `IClaudeSchema` appears to fully support the JSON schema definition of the
 * OpenAPI v3.1 specification; {@link OpenApiV3_1.IJsonSchema}. However, since
 * {@link OpenApiV3_1.IJsonSchema} has many ambiguous and duplicated expressions,
 * `IClaudeSchema` is designed to be clear and simple for Claude function
 * calling by utilizing {@link ILlmSchemaV3_1}, which has been transformed from
 * {@link OpenApi.IJsonSchema} for convenience and clarity.
 *
 * Therefore, `IClaudeSchema` does not follow the entire OpenAPI v3.1
 * specification. It has specific restrictions and definitions. Here are the
 * differences between `ILlmSchemaV3_1` and the OpenAPI v3.1 JSON schema:
 *
 * - Decompose mixed type: {@link OpenApiV3_1.IJsonSchema.IMixed}
 * - Resolve nullable property:
 *   {@link OpenApiV3_1.IJsonSchema.__ISignificant.nullable}
 * - Tuple type is banned: {@link OpenApiV3_1.IJsonSchema.ITuple.prefixItems}
 * - Constant type is banned: {@link OpenApiV3_1.IJsonSchema.IConstant}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IAnyOf} to {@link IClaudeSchema.IOneOf}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IAllOf} to {@link IClaudeSchema.IObject}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IRecursiveReference} to
 *   {@link IClaudeSchema.IReference}
 * - Do not support {@link OpenApiV3_1.IJsonSchema.ITuple} type
 *
 * Compared to {@link OpenApi.IJsonSchema}, the emended JSON schema
 * specification:
 *
 * - {@link IClaudeSchema.IParameters.$defs} instead of
 *   {@link OpenApi.IComponents.schemas}
 * - Do not support {@link OpenApi.IJsonSchema.ITuple} type
 * - {@link IClaudeSchema.properties} and {@link IClaudeSchema.required} are always
 *   defined
 *
 * For reference, if you compose the `IClaudeSchema` type with the
 * {@link IClaudeSchema.IConfig.reference} `false` option (default is `false`),
 * only recursively named types will be archived into the
 * {@link IClaudeSchema.IParameters.$defs}, and others will be escaped from the
 * {@link IClaudeSchema.IReference} type.
 *
 * @author Jeongho Nam - https://github.com/samchon
 * @reference https://docs.anthropic.com/en/docs/build-with-claude/tool-use
 * @reference https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/increase-consistency
 */
export type IClaudeSchema =
  | IClaudeSchema.IConstant
  | IClaudeSchema.IBoolean
  | IClaudeSchema.IInteger
  | IClaudeSchema.INumber
  | IClaudeSchema.IString
  | IClaudeSchema.IArray
  | IClaudeSchema.IObject
  | IClaudeSchema.IReference
  | IClaudeSchema.IOneOf
  | IClaudeSchema.INull
  | IClaudeSchema.IUnknown;
export namespace IClaudeSchema {
  /** Configuration for Claude schema composition. */
  export interface IConfig {
    /**
     * Whether to allow reference types everywhere.
     *
     * If you configure this property to `false`, most reference types
     * represented by {@link IClaudeSchema.IReference} will be escaped to plain
     * types unless in recursive type cases.
     *
     * This is because some smaller LLM models do not understand reference types
     * well, and even large LLM models sometimes experience hallucinations.
     *
     * However, reference types make the schema size smaller, reducing LLM token
     * costs. Therefore, if you're using a large LLM model and want to reduce
     * token costs, you can configure this property to `true`.
     *
     * @default true
     */
    reference: boolean;
  }

  /**
   * Type for function parameters.
   *
   * `IClaudeSchema.IParameters` defines a function's parameters as a keyword
   * object type.
   *
   * It can also be used for structured output metadata.
   *
   * @reference https://platform.openai.com/docs/guides/structured-outputs
   */
  export type IParameters = ILlmSchemaV3_1.IParameters;

  /** Constant value type. */
  export type IConstant = ILlmSchemaV3_1.IConstant;

  /** Boolean type info. */
  export type IBoolean = ILlmSchemaV3_1.IBoolean;

  /** Integer type info. */
  export type IInteger = ILlmSchemaV3_1.IInteger;

  /** Number (double) type info. */
  export type INumber = ILlmSchemaV3_1.INumber;

  /** String type info. */
  export type IString = ILlmSchemaV3_1.IString;

  /** Array type info. */
  export type IArray = ILlmSchemaV3_1.IArray;

  /** Object type info. */
  export type IObject = ILlmSchemaV3_1.IObject;

  /** Reference type directing to named schema. */
  export type IReference = ILlmSchemaV3_1.IReference;

  /**
   * Union type.
   *
   * `IOneOf` represents a union type in TypeScript (`A | B | C`).
   *
   * For reference, even if your Swagger (or OpenAPI) document defines `anyOf`
   * instead of `oneOf`, {@link OpenApi} forcibly converts it to `oneOf` type.
   */
  export type IOneOf = ILlmSchemaV3_1.IOneOf;
  export namespace IOneOf {
    /** Discriminator information of the union type. */
    export type IDiscriminator = ILlmSchemaV3_1.IOneOf.IDiscriminator;
  }

  /** Null type. */
  export type INull = ILlmSchemaV3_1.INull;

  /** Unknown, the `any` type. */
  export type IUnknown = ILlmSchemaV3_1.IUnknown;
}
