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
  | IGeminiSchema.IReference
  | IGeminiSchema.IAnyOf
  | IGeminiSchema.INull
  | IGeminiSchema.IUnknown;
export namespace IGeminiSchema {
  /**
   * Type for function parameters.
   *
   * `IGeminiSchema.IParameters` defines a function's parameters as a keyword
   * object type, where each property represents a named parameter.
   *
   * It can also be used for structured output metadata to define the expected
   * format of ChatGPT responses.
   *
   * @reference https://platform.openai.com/docs/guides/structured-outputs
   */
  export interface IParameters extends Omit<IObject, "additionalProperties"> {
    /** Collection of the named types. */
    $defs: Record<string, IGeminiSchema>;

    /**
     * Additional properties information.
     *
     * The `additionalProperties` defines the type schema for additional
     * properties that are not listed in the {@link properties}.
     *
     * By the way, it is not allowed at the parameters level.
     */
    additionalProperties: false;
  }

  /** Boolean type info. */
  export interface IBoolean extends IJsonSchemaAttribute.IBoolean {
    /** Enumeration values. */
    enum?: Array<boolean>;
  }

  /** Integer type info. */
  export interface IInteger extends IJsonSchemaAttribute.IInteger {
    /** Enumeration values. */
    enum?: Array<number>;
  }

  /** Number (double) type info. */
  export interface INumber extends IJsonSchemaAttribute.INumber {
    /** Enumeration values. */
    enum?: Array<number>;
  }

  /** String type info. */
  export interface IString extends IJsonSchemaAttribute.IString {
    /** Enumeration values. */
    enum?: Array<string>;

    /** Default value. */
    default?: string;

    /** Format restriction. */
    format?:
      | "binary"
      | "byte"
      | "password"
      | "regex"
      | "uuid"
      | "email"
      | "hostname"
      | "idn-email"
      | "idn-hostname"
      | "iri"
      | "iri-reference"
      | "ipv4"
      | "ipv6"
      | "uri"
      | "uri-reference"
      | "uri-template"
      | "url"
      | "date-time"
      | "date"
      | "time"
      | "duration"
      | "json-pointer"
      | "relative-json-pointer"
      | (string & {});

    /** Pattern restriction. */
    pattern?: string;

    /** Content media type restriction. */
    contentMediaType?: string;

    /**
     * Minimum length restriction.
     *
     * @type uint64
     */
    minLength?: number;

    /**
     * Maximum length restriction.
     *
     * @type uint64
     */
    maxLength?: number;
  }

  /** Array type info. */
  export interface IArray extends IJsonSchemaAttribute.IArray {
    /**
     * Items type info.
     *
     * The `items` means the type of the array elements. In other words, it is
     * the type schema info of the `T` in the TypeScript array type `Array<T>`.
     */
    items: IGeminiSchema;

    /**
     * Unique items restriction.
     *
     * If this property value is `true`, target array must have unique items.
     */
    uniqueItems?: boolean;

    /**
     * Minimum items restriction.
     *
     * Restriction of minimum number of items in the array.
     *
     * @type uint64
     */
    minItems?: number;

    /**
     * Maximum items restriction.
     *
     * Restriction of maximum number of items in the array.
     *
     * @type uint64
     */
    maxItems?: number;
  }

  /** Object type info. */
  export interface IObject extends IJsonSchemaAttribute.IObject {
    /**
     * Properties of the object.
     *
     * The `properties` means a list of key-value pairs of the object's regular
     * properties. The key is the name of the regular property, and the value is
     * the type schema info.
     */
    properties: Record<string, IGeminiSchema>;

    /**
     * Additional properties' info.
     *
     * The `additionalProperties` means the type schema info of the additional
     * properties that are not listed in the {@link properties}.
     *
     * If the value is `true`, it means that the additional properties are not
     * restricted. They can be any type. Otherwise, if the value is
     * {@link IGeminiSchema} type, it means that the additional properties must
     * follow the type schema info.
     *
     * - `true`: `Record<string, any>`
     * - `IGeminiSchema`: `Record<string, T>`
     */
    additionalProperties?: boolean | IGeminiSchema;

    /**
     * List of required property keys.
     *
     * The `required` contains a list of property keys from {@link properties}
     * that must be provided. Properties not listed in `required` are optional,
     * while those listed must be filled.
     *
     * Below is an example of {@link properties} and `required`:
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
     * so they are listed in the `required` array.
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

  /** Reference type directing to named schema. */
  export interface IReference extends IJsonSchemaAttribute {
    /**
     * Reference to the named schema.
     *
     * The `$ref` is a reference to a named schema. The format follows the JSON
     * Pointer specification. In OpenAPI, the `$ref` starts with `#/$defs/`
     * which indicates the type is stored in the
     * {@link IGeminiSchema.IParameters.$defs} object.
     *
     * - `#/$defs/SomeObject`
     * - `#/$defs/AnotherObject`
     */
    $ref: string;
  }

  /**
   * Union type.
   *
   * `IAnyOf` represents a union type in TypeScript (`A | B | C`).
   *
   * For reference, even if your Swagger (or OpenAPI) document defines `anyOf`
   * instead of `oneOf`, {@link IGeminiSchema} forcibly converts it to `anyOf`
   * type.
   */
  export interface IAnyOf extends IJsonSchemaAttribute {
    /** List of the union types. */
    anyOf: Exclude<IGeminiSchema, IGeminiSchema.IAnyOf>[];

    /** Discriminator info of the union type. */
    "x-discriminator"?: IAnyOf.IDiscriminator;
  }
  export namespace IAnyOf {
    /** Discriminator info of the union type. */
    export interface IDiscriminator {
      /** Property name for the discriminator. */
      propertyName: string;

      /**
       * Mapping of discriminator values to schema names.
       *
       * This property is valid only for {@link IReference} typed
       * {@link IAnyOf.anyOf} elements. Therefore, the `key` of `mapping` is the
       * discriminator value, and the `value` of `mapping` is the schema name
       * like `#/components/schemas/SomeObject`.
       */
      mapping?: Record<string, string>;
    }
  }

  /** Null type. */
  export interface INull extends IJsonSchemaAttribute.INull {}

  /** Unknown, the `any` type. */
  export interface IUnknown extends IJsonSchemaAttribute.IUnknown {}

  /** Configuration for the Gemini schema composition. */
  export interface IConfig {
    /**
     * Whether to allow reference type in everywhere.
     *
     * If you configure this property to `false`, most of reference types
     * represented by {@link IGeminiSchema.IReference} would be escaped to a
     * plain type unless recursive type case.
     *
     * This is because the lower version of ChatGPT does not understand the
     * reference type well, and even the modern version of ChatGPT sometimes
     * occur the hallucination.
     *
     * However, the reference type makes the schema size smaller, so that
     * reduces the LLM token cost. Therefore, if you're using the modern version
     * of ChatGPT, and want to reduce the LLM token cost, you can configure this
     * property to `true`.
     *
     * @default true
     */
    reference: boolean;
  }
}
