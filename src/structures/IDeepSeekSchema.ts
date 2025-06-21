import { ILlmSchemaV3_1 } from "./ILlmSchemaV3_1";

/**
 * Type schema info of the DeepSeek.
 *
 * `IDeepSeekSchema` is a type schema info of the DeepSeek function calling.
 *
 * `IDeepSeekSchema` seems fully supporting the JSON schema definition of the
 * OpenAPI v3.1 specification; {@link OpenApiV3_1.IJsonSchema}. By the way, as
 * the {@link OpenApiV3_1.IJsonSchema} has too much ambiguous and duplicated
 * expressions, `IDeepSeekSchema` is designed to be clear and simple for the
 * DeepSeek function calling, by utilizing {@link ILlmSchemaV3_1} which has been
 * transformed from the {@link OpenApi.IJsonSchema} for the convenience and
 * clarity.
 *
 * Therefore, `IDeepSeekSchema` does not follow the entire specification of the
 * OpenAPI v3.1. It has own specific restrictions and definitions. Here is the
 * list of how `ILlmSchemaV3_1` is different with the OpenAPI v3.1 JSON schema.
 *
 * - Decompose mixed type: {@link OpenApiV3_1.IJsonSchema.IMixed}
 * - Resolve nullable property:
 *   {@link OpenApiV3_1.IJsonSchema.__ISignificant.nullable}
 * - Tuple type is banned: {@link OpenApiV3_1.IJsonSchema.ITuple.prefixItems}
 * - Constant type is banned: {@link OpenApiV3_1.IJsonSchema.IConstant}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IAnyOf} to {@link IDeepSeekSchema.IOneOf}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IAllOf} to {@link IDeepSeekSchema.IObject}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IRecursiveReference} to
 *   {@link IDeepSeekSchema.IReference}
 * - Do not support {@link OpenApiV3_1.IJsonSchema.ITuple} type
 *
 * If compare with the {@link OpenApi.IJsonSchema}, the emended JSON schema
 * specification,
 *
 * - {@link IDeepSeekSchema.IParameters.$defs} instead of the
 *   {@link OpenApi.IJsonSchema.schemas}
 * - Do not support {@link OpenApi.IJsonSchema.ITuple} type
 * - {@link IDeepSeekSchema.properties} and {@link IDeepSeekSchema.required} are
 *   always defined
 *
 * For reference, if you've composed the `IDeepSeekSchema` type with the
 * {@link IDeepSeekSchema.IConfig.reference} `false` option (default is `false`),
 * only the recursive named types would be archived into the
 * {@link IDeepSeekSchema.IParameters.$defs}, and the others would be escaped
 * from the {@link IDeepSeekSchema.IReference} type.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export type IDeepSeekSchema =
  | IDeepSeekSchema.IConstant
  | IDeepSeekSchema.IBoolean
  | IDeepSeekSchema.IInteger
  | IDeepSeekSchema.INumber
  | IDeepSeekSchema.IString
  | IDeepSeekSchema.IArray
  | IDeepSeekSchema.IObject
  | IDeepSeekSchema.IReference
  | IDeepSeekSchema.IOneOf
  | IDeepSeekSchema.INull
  | IDeepSeekSchema.IUnknown;
export namespace IDeepSeekSchema {
  /** Configuration for DeepSeek schema composition. */
  export interface IConfig {
    /**
     * Whether to allow reference type in everywhere.
     *
     * If you configure this property to `false`, most of reference types
     * represented by {@link IDeepSeekSchema.IReference} would be escaped to a
     * plain type unless recursive type case.
     *
     * This is because some low sized LLM models does not understand the
     * reference type well, and even the large size LLM models sometimes occur
     * the hallucination.
     *
     * However, the reference type makes the schema size smaller, so that
     * reduces the LLM token cost. Therefore, if you're using the large size of
     * LLM model, and want to reduce the LLM token cost, you can configure this
     * property to `true`.
     *
     * @default false
     */
    reference: boolean;
  }

  /**
   * Type of the function parameters.
   *
   * `IDeepSeekSchema.IParameters` is a type defining a function's parameters as
   * a keyworded object type.
   *
   * It also can be utilized for the structured output metadata.
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

  /** Reference type directing named schema. */
  export type IReference = ILlmSchemaV3_1.IReference;

  /**
   * Union type.
   *
   * `IOneOf` represents an union type of the TypeScript (`A | B | C`).
   *
   * For reference, even though your Swagger (or OpenAPI) document has defined
   * `anyOf` instead of the `oneOf`, {@link OpenApi} forcibly converts it to
   * `oneOf` type.
   */
  export type IOneOf = ILlmSchemaV3_1.IOneOf;
  export namespace IOneOf {
    /** Discriminator info of the union type. */
    export type IDiscriminator = ILlmSchemaV3_1.IOneOf.IDiscriminator;
  }

  /** Null type. */
  export type INull = ILlmSchemaV3_1.INull;

  /** Unknown, the `any` type. */
  export type IUnknown = ILlmSchemaV3_1.IUnknown;
}
