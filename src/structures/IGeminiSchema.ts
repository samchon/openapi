import { IJsonSchemaAttribute } from "./IJsonSchemaAttribute";

/**
 * Type schema info for the Gemini function calling.
 *
 * `IGeminiSchema` is a type metadata for the LLM (Large Language Model)
 * function calling in the Gemini.
 *
 * `IGeminiSchema` basically follows the JSON schema definition of the OpenAPI
 * v3.0 specification; {@link OpenApiV3.IJsonSchema}. However, `IGeminiSchema`
 * cannot understand union and reference types, represented by the `oneOf` and
 * `$ref` properties. Also, as OpenAPI v3.0 specification does not support the
 * tuple type, `IGeminiSchema` does not support the tuple type either.
 *
 * - Does not support
 *
 *   - {@link OpenApiV3.IJsonSchema.IReference}
 *   - {@link OpenApiV3.IJsonSchema.IAllOf}
 *   - {@link OpenApiV3.IJsonSchema.IAnyOf}
 *   - {@link OpenApiV3.IJsonSchema.IOneOf}
 *   - {@link OpenApiV3.IJsonSchema.IObject.additionalProperties}
 *   - {@link OpenApiV3.IJsonSchema.__IAttribute.title}
 *
 * If compare with {@link OpenApi.IJsonSchema}, the emended JSON schema type,
 * these are not supported in the Gemini schema. One thing interesting is, the
 * Gemini does not support the `title` property, so it would be revealed in the
 * {@link IGeminiSchema.__IAttribute.description} property instead.
 *
 * - {@link OpenApi.IJsonSchema.IReference}
 * - {@link OpenApi.IJsonSchema.IOneOf}
 * - {@link OpenApi.IJsonSchema.ITuple}
 * - {@link OpenApi.IJsonSchema.IObject.additionalProperties}
 * - {@link OpenApi.IJsonSchema.__IAttribute.title}
 *
 * Also, Gemini has banned below constraint properties. Instead, I'll will fill
 * the {@link IGeminiSchema.__IAttribute.description} property with the comment
 * text like `"@format uuid"`.
 *
 * - {@link OpenApi.IJsonSchema.INumber.minimum}
 * - {@link OpenApi.IJsonSchema.INumber.maximum}
 * - {@link OpenApi.IJsonSchema.INumber.multipleOf}
 * - {@link OpenApi.IJsonSchema.IString.minLength}
 * - {@link OpenApi.IJsonSchema.IString.maxLength}
 * - {@link OpenApi.IJsonSchema.IString.format}
 * - {@link OpenApi.IJsonSchema.IString.pattern}
 * - {@link OpenApi.IJsonSchema.IString.contentMediaType}
 * - {@link OpenApi.IJsonSchema.IString.default}
 * - {@link OpenApi.IJsonSchema.IArray.minItems}
 * - {@link OpenApi.IJsonSchema.IArray.maxItems}
 * - {@link OpenApi.IJsonSchema.IArray.uniqueItems}
 *
 * @author Jeongho Nam - https://github.com/samchon
 * @reference https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/function-calling
 * @reference https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/function-calling
 * @reference https://ai.google.dev/gemini-api/docs/structured-output
 * @warning Specified not only by the official documentation, but also by my
 *          experiments. Therefore, its definitions can be inaccurate or be
 *          changed in the future. If you find any wrong or outdated definitions,
 *          please let me know by issue.
 * @issue https://github.com/samchon/openapi/issues
 */
export type IGeminiSchema =
  | IGeminiSchema.IBoolean
  | IGeminiSchema.IInteger
  | IGeminiSchema.INumber
  | IGeminiSchema.IString
  | IGeminiSchema.IArray
  | IGeminiSchema.IObject
  | IGeminiSchema.IUnknown
  | IGeminiSchema.INullOnly;
export namespace IGeminiSchema {
  /** Configuration for the Gemini schema composition. */
  export interface IConfig {
    /**
     * Whether to allow recursive types or not.
     *
     * If allow, then how many times to repeat the recursive types.
     *
     * By the way, if the model is "chatgpt", the recursive types are always
     * allowed without any limitation, due to it supports the reference type.
     *
     * @default 3
     */
    recursive: false | number;
  }

  /**
   * Type of the function parameters.
   *
   * `IGeminiSchema.IParameters` is a type defining a function's parameters as a
   * keyworded object type.
   *
   * It also can be utilized for the structured output metadata.
   *
   * @reference https://ai.google.dev/gemini-api/docs/structured-output
   */
  export type IParameters = IObject;

  /** Boolean type schema info. */
  export interface IBoolean extends IJsonSchemaAttribute.IBoolean {
    /** Whether to allow `null` value or not. */
    nullable?: boolean;

    /** Enumeration values. */
    enum?: Array<boolean | null>;
  }

  /** Integer type schema info. */
  export interface IInteger extends IJsonSchemaAttribute.IInteger {
    /** Whether to allow `null` value or not. */
    nullable?: boolean;

    /**
     * Enumeration values.
     *
     * @type int64
     */
    enum?: Array<number | null>;
  }

  /** Number type schema info. */
  export interface INumber extends IJsonSchemaAttribute.INumber {
    /** Whether to allow `null` value or not. */
    nullable?: boolean;

    /** Enumeration values. */
    enum?: Array<number | null>;
  }

  /** String type schema info. */
  export interface IString extends IJsonSchemaAttribute.IString {
    /** Whether to allow `null` value or not. */
    nullable?: boolean;

    /** Enumeration values. */
    enum?: Array<string | null>;
  }

  /** Array type schema info. */
  export interface IArray extends IJsonSchemaAttribute.IArray {
    /** Whether to allow `null` value or not. */
    nullable?: boolean;

    /**
     * Items type schema info.
     *
     * The `items` means the type of the array elements. In other words, it is
     * the type schema info of the `T` in the TypeScript array type `Array<T>`.
     */
    items: IGeminiSchema;
  }

  /** Object type schema info. */
  export interface IObject extends IJsonSchemaAttribute.IObject {
    /** Whether to allow `null` value or not. */
    nullable?: boolean;

    /**
     * Properties of the object.
     *
     * The `properties` means a list of key-value pairs of the object's regular
     * properties. The key is the name of the regular property, and the value is
     * the type schema info.
     *
     * If you need additional properties that is represented by dynamic key, it
     * is not possible to compose because the Gemini does not support it.
     */
    properties: Record<string, IGeminiSchema>;

    /**
     * List of key values of the required properties.
     *
     * The `required` means a list of the key values of the required
     * {@link properties}. If some property key is not listed in the `required`
     * list, it means that property is optional. Otherwise some property key
     * exists in the `required` list, it means that the property must be
     * filled.
     *
     * Below is an example of the {@link properties} and `required`.
     *
     * ```typescript
     * interface SomeObject {
     *   id: string;
     *   email: string;
     *   name?: string;
     * }
     * ```
     *
     * As you can see, `id` and `email` {@link properties} are {@link required},
     * so that they are listed in the `required` list.
     *
     * ```json
     * {
     *   "type": "object",
     *   "properties": {
     *     "id": { "type": "string" },
     *     "email": { "type": "string" },
     *     "name": { "type": "string" }
     *   },
     *   "required": ["id", "email"]
     * }
     * ```
     */
    required: string[];
  }

  /** Null only type schema info. */
  export interface INullOnly extends IJsonSchemaAttribute.INull {}

  /**
   * Unknown type schema info.
   *
   * It means the type of the value is `any`.
   */
  export interface IUnknown extends IJsonSchemaAttribute.IUnknown {}

  /**
   * Significant attributes that can be applied to the most types.
   *
   * @ignore
   * @deprecated
   */
  export interface __ISignificant<Type extends string> extends __IAttribute {
    /** Discriminator value of the type. */
    type: Type;

    /** Whether to allow `null` value or not. */
    nullable?: boolean;
  }

  /**
   * Common attributes that can be applied to all types.
   *
   * @ignore
   * @deprecated
   */
  export type __IAttribute = IJsonSchemaAttribute;
}
