import { ILlmSchemaV3_1 } from "./ILlmSchemaV3_1";

/**
 * Type schema info of the Llama.
 *
 * `ILlamaSchema` is a type schema info of the Llama function calling.
 *
 * `ILlamaSchema` seems fully supporting the JSON schema definition of the
 * OpenAPI v3.1 specification; {@link OpenApiV3_1.IJsonSchema}. By the way, as
 * the {@link OpenApiV3_1.IJsonSchema} has too much ambiguous and duplicated
 * expressions, `ILlamaSchema` is designed to be clear and simple for the Llama
 * function calling, by utilizing {@link ILlmSchemaV3_1} which has been
 * transformed from the {@link OpenApi.IJsonSchema} for the convenience and
 * clarity.
 *
 * Therefore, `ILlamaSchema` does not follow the entire specification of the
 * OpenAPI v3.1. It has own specific restrictions and definitions. Here is the
 * list of how `ILlmSchemaV3_1` is different with the OpenAPI v3.1 JSON schema.
 *
 * - Decompose mixed type: {@link OpenApiV3_1.IJsonSchema.IMixed}
 * - Resolve nullable property:
 *   {@link OpenApiV3_1.IJsonSchema.__ISignificant.nullable}
 * - Tuple type is banned: {@link OpenApiV3_1.IJsonSchema.ITuple.prefixItems}
 * - Constant type is banned: {@link OpenApiV3_1.IJsonSchema.IConstant}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IAnyOf} to {@link ILlamaSchema.IOneOf}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IAllOf} to {@link ILlamaSchema.IObject}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IRecursiveReference} to
 *   {@link ILlamaSchema.IReference}
 * - Do not support {@link OpenApiV3_1.IJsonSchema.ITuple} type
 *
 * If compare with the {@link OpenApi.IJsonSchema}, the emended JSON schema
 * specification,
 *
 * - {@link ILlamaSchema.IParameters.$defs} instead of the
 *   {@link OpenApi.IJsonSchema.schemas}
 * - Do not support {@link OpenApi.IJsonSchema.ITuple} type
 * - {@link ILlamaSchema.properties} and {@link ILlamaSchema.required} are always
 *   defined
 *
 * For reference, if you've composed the `ILlamaSchema` type with the
 * {@link ILlamaSchema.IConfig.reference} `false` option (default is `false`),
 * only the recursive named types would be archived into the
 * {@link ILlamaSchema.IParameters.$defs}, and the others would be escaped from
 * the {@link ILlamaSchema.IReference} type.
 *
 * @author Jeongho Nam - https://github.com/samchon
 * @reference https://www.llama.com/docs/model-cards-and-prompt-formats/llama3_2
 * @reference https://github.com/ggerganov/llama.cpp/blob/master/examples/json_schema_to_grammar.py
 * @warning Specified not only by the official documentation, but also by my
 *          experiments. Therefore, its definitions can be inaccurate or be
 *          changed in the future. If you find any wrong or outdated definitions,
 *          please let me know by issue.
 */
export type ILlamaSchema =
  | ILlamaSchema.IConstant
  | ILlamaSchema.IBoolean
  | ILlamaSchema.IInteger
  | ILlamaSchema.INumber
  | ILlamaSchema.IString
  | ILlamaSchema.IArray
  | ILlamaSchema.IObject
  | ILlamaSchema.IReference
  | ILlamaSchema.IOneOf
  | ILlamaSchema.INull
  | ILlamaSchema.IUnknown;
export namespace ILlamaSchema {
  /** Configuration for Llama schema composition. */
  export interface IConfig {
    /**
     * Whether to allow reference type in everywhere.
     *
     * If you configure this property to `false`, most of reference types
     * represented by {@link ILlamaSchema.IReference} would be escaped to a plain
     * type unless recursive type case.
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
     * @default true
     */
    reference: boolean;
  }

  /**
   * Type of the function parameters.
   *
   * `ILlamaSchema.IParameters` is a type defining a function's parameters as a
   * keyworded object type.
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
