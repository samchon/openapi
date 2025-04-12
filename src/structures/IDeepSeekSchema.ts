import { ILlmSchemaV3_1 } from "./ILlmSchemaV3_1";

/**
 * Type schema info of the DeepSeek.
 *
 * `IDeepSeekSchema` is a type schema info of the DeepSeek function calling.
 *
 * `IDeepSeekSchema` seems fully supporting the JSON schema definition of the OpenAPI v3.1
 * specification; {@link OpenApiV3_1.IJsonSchema}. By the way, as the
 * {@link OpenApiV3_1.IJsonSchema} has too much ambiguous and duplicated expressions,
 * `IDeepSeekSchema` is designed to be clear and simple for the DeepSeek function calling,
 * by utilizng {@link ILlmSchemaV3_1} which has been transformed from the
 * {@link OpenApi.IJsonSchema} for the convenience and clarity.
 *
 * Therefore, `IDeepSeekSchema` does not follow the entire specification of
 * the OpenAPI v3.1. It has own specific restrictions and definitions. Here is the
 * list of how `ILlmSchemaV3_1` is different with the OpenAPI v3.1 JSON schema.
 *
 * - Decompose mixed type: {@link OpenApiV3_1.IJsonSchema.IMixed}
 * - Resolve nullable property: {@link OpenApiV3_1.IJsonSchema.__ISignificant.nullable}
 * - Tuple type is banned: {@link OpenApiV3_1.IJsonSchema.ITuple.prefixItems}
 * - Constant type is banned: {@link OpenApiV3_1.IJsonSchema.IConstant}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IAnyOf} to {@link IDeepSeekSchema.IOneOf}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IAllOf} to {@link IDeepSeekSchema.IObject}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IRecursiveReference} to {@link IDeepSeekSchema.IReference}
 * - Do not support {@link OpenApiV3_1.IJsonSchema.ITuple} type
 *
 * If compare with the {@link OpenApi.IJsonSchema}, the emended JSON schema specification,
 *
 * - {@link IDeepSeekSchema.IParameters.$defs} instead of the {@link OpenApi.IJsonSchema.schemas}
 * - Do not support {@link OpenApi.IJsonSchema.ITuple} type
 * - {@link IDeepSeekSchema.properties} and {@link IDeepSeekSchema.required} are always defined
 *
 * For reference, if you've composed the `IDeepSeekSchema` type with the
 * {@link IDeepSeekSchema.IConfig.reference} `false` option (default is `false`), only the
 * recursive named types would be archived into the {@link IDeepSeekSchema.IParameters.$defs},
 * and the others would be escaped from the {@link IDeepSeekSchema.IReference} type.
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
  /**
   * Configuration for DeepSeek schema composition.
   */
  export interface IConfig {
    /**
     * Whether to allow reference type in everywhere.
     *
     * If you configure this property to `false`, most of reference types
     * represented by {@link IDeepSeekSchema.IReference} would be escaped to
     * a plain type unless recursive type case.
     *
     * This is because some low sized LLM models does not understand the
     * reference type well, and even the large size LLM models sometimes occur
     * the hallucination.
     *
     * However, the reference type makes the schema size smaller, so that reduces
     * the LLM token cost. Therefore, if you're using the large size of LLM model,
     * and want to reduce the LLM token cost, you can configure this property to
     * `true`.
     *
     * @default false
     */
    reference: boolean;
  }

  export import IParameters = ILlmSchemaV3_1.IParameters;

  export import IConstant = ILlmSchemaV3_1.IConstant;
  export import IBoolean = ILlmSchemaV3_1.IBoolean;
  export import IInteger = ILlmSchemaV3_1.IInteger;
  export import INumber = ILlmSchemaV3_1.INumber;
  export import IString = ILlmSchemaV3_1.IString;

  export import IObject = ILlmSchemaV3_1.IObject;
  export import IArray = ILlmSchemaV3_1.IArray;
  export import IReference = ILlmSchemaV3_1.IReference;
  export import IOneOf = ILlmSchemaV3_1.IOneOf;
  export import INull = ILlmSchemaV3_1.INull;
  export import IUnknown = ILlmSchemaV3_1.IUnknown;
}
