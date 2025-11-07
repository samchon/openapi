import { IJsonSchemaAttribute } from "./IJsonSchemaAttribute";

/**
 * Type schema info for OpenAI function calling.
 *
 * `IChatGptSchema` is a type schema info for OpenAI function calling. The type
 * name "ChatGpt" is intentionally used to avoid confusion with "OpenAPI"
 * specification, even though this is designed for OpenAI models.
 *
 * `IChatGptSchema` basically follows the JSON schema definition of the OpenAPI
 * v3.1 specification; {@link OpenApiV3_1.IJsonSchema}. However, it deviates from
 * the standard JSON schema specification and omits many features when used in
 * {@link IChatGptSchema.IConfig.strict} mode for OpenAI function calling.
 *
 * `IChatGptSchema` supports all JSON schema features through workaround
 * expressions using JSDoc tags in the `description` property, so using
 * `IChatGptSchema` does not degrade function calling performance even in strict
 * mode.
 *
 * Here is the list of how `IChatGptSchema` is different with the OpenAPI v3.1
 * JSON schema:
 *
 * - Decompose mixed type: {@link OpenApiV3_1.IJsonSchema.IMixed}
 * - Resolve nullable property:
 *   {@link OpenApiV3_1.IJsonSchema.__ISignificant.nullable}
 * - Tuple type is banned: {@link OpenApiV3_1.IJsonSchema.ITuple.prefixItems}
 * - Constant type is banned: {@link OpenApiV3_1.IJsonSchema.IConstant}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IOneOf} to {@link IChatGptSchema.IAnyOf}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IAllOf} to {@link IChatGptSchema.IObject}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IRecursiveReference} to
 *   {@link IChatGptSchema.IReference}
 * - When {@link IChatGptSchema.IConfig.strict} mode:
 *
 *   - Every object properties must be required
 *   - Do not allow {@link IChatGptSchema.IObject.additionalProperties}
 *
 * Compared to {@link OpenApi.IJsonSchema}, the emended JSON schema
 * specification:
 *
 * - {@link IChatGptSchema.IAnyOf} instead of {@link OpenApi.IJsonSchema.IOneOf}
 * - {@link IChatGptSchema.IParameters.$defs} instead of
 *   {@link OpenApi.IComponents.schemas}
 * - {@link IChatGptSchema.IString.enum} instead of
 *   {@link OpenApi.IJsonSchema.IConstant}
 * - {@link IChatGptSchema.additionalProperties} is fixed to `false` in strict mode
 * - {@link IChatGptSchema.properties} and {@link IChatGptSchema.required} are
 *   always defined
 * - No tuple type {@link OpenApi.IJsonSchema.ITuple} support
 * - When {@link IChatGptSchema.IConfig.strict} mode:
 *
 *   - Every object properties must be required
 *   - Do not allow {@link IChatGptSchema.IObject.additionalProperties}
 *
 * For reference, if you compose the `IChatGptSchema` type with the
 * {@link IChatGptSchema.IConfig.reference} `false` option (default is `false`),
 * only recursively named types are archived into the
 * {@link IChatGptSchema.IParameters.$defs}, and others are escaped from the
 * {@link IChatGptSchema.IReference} type.
 *
 * Also, OpenAI has banned the following constraint properties. Instead,
 * `IChatGptSchema` fills the {@link IChatGptSchema.description} property with
 * workaround expressions using JSDoc tags like `"@format uuid"` to convey these
 * constraints:
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
 * - {@link OpenApi.IJsonSchema.IArray.unique}
 *
 * Additionally, OpenAI cannot define the {@link IChatGptSchema.description}
 * property for the {@link IChatGptSchema.IReference} type, and does not
 * understand encapsulation of the {@link IChatGptSchema.IAnyOf} type. Therefore,
 * the {@link IChatGptSchema.description} is written to the parent object type,
 * not the reference type.
 *
 * ```json
 * {
 *   "type": "object",
 *   "description": "### Description of {@link something} property.\n\n> Hello?",
 *   "properties": {
 *     "something": {
 *       "$ref": "#/$defs/SomeObject"
 *     }
 *   }
 * }
 * ```
 *
 * @author Jeongho Nam - https://github.com/samchon
 * @reference https://platform.openai.com/docs/guides/function-calling
 * @reference https://platform.openai.com/docs/guides/structured-outputs
 * @warning Specified not only by official documentation, but also by
 *          experimental validation. Therefore, definitions may be inaccurate or
 *          change in the future. If you find wrong or outdated definitions,
 *          please report via issue.
 * @issue https://github.com/samchon/openapi/issues
 */
export type IChatGptSchema =
  | IChatGptSchema.IBoolean
  | IChatGptSchema.IInteger
  | IChatGptSchema.INumber
  | IChatGptSchema.IString
  | IChatGptSchema.IArray
  | IChatGptSchema.IObject
  | IChatGptSchema.IReference
  | IChatGptSchema.IAnyOf
  | IChatGptSchema.INull
  | IChatGptSchema.IUnknown;
export namespace IChatGptSchema {
  /** Configuration for ChatGPT schema composition. */
  export interface IConfig {
    /**
     * Whether to allow reference type in everywhere.
     *
     * If you configure this property to `false`, most of reference types
     * represented by {@link IChatGptSchema.IReference} would be escaped to a
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

    /**
     * Whether to apply the strict mode.
     *
     * If you configure this property to `true`, the ChatGPT function calling
     * does not allow optional properties and dynamic key typed properties in
     * the {@link IChatGptSchema.IObject} type. Instead, it increases the success
     * rate of the function calling.
     *
     * By the way, if you utilize the {@link typia.validate} function and give
     * its validation feedback to the ChatGPT, its performance is much better
     * than the strict mode. Therefore, I recommend you to just turn off the
     * strict mode and utilize the {@link typia.validate} function instead.
     *
     * @default false
     */
    strict?: boolean;
  }

  /**
   * Type for function parameters.
   *
   * `IChatGptSchema.IParameters` defines a function's parameters as a keyword
   * object type, where each property represents a named parameter.
   *
   * It can also be used for structured output metadata to define the expected
   * format of ChatGPT responses.
   *
   * @reference https://platform.openai.com/docs/guides/structured-outputs
   */
  export interface IParameters extends Omit<IObject, "additionalProperties"> {
    /** Collection of the named types. */
    $defs: Record<string, IChatGptSchema>;

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
  }

  /** Array type info. */
  export interface IArray extends IJsonSchemaAttribute.IArray {
    /**
     * Items type info.
     *
     * The `items` means the type of the array elements. In other words, it is
     * the type schema info of the `T` in the TypeScript array type `Array<T>`.
     */
    items: IChatGptSchema;
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
    properties: Record<string, IChatGptSchema>;

    /**
     * Additional properties information.
     *
     * The `additionalProperties` defines the type schema for additional
     * properties that are not listed in the {@link properties}.
     *
     * If the value is `true`, it means that the additional properties are not
     * restricted. They can be any type. Otherwise, if the value is
     * {@link IChatGptSchema} type, it means that the additional properties must
     * follow the type schema info.
     *
     * - `true`: `Record<string, any>`
     * - `IChatGptSchema`: `Record<string, T>`
     *
     * Note: If you've configured {@link IChatGptSchema.IConfig.strict} as
     * `true`, ChatGPT function calling does not support dynamic key typed
     * properties, so `additionalProperties` is always `false`.
     */
    additionalProperties?: boolean | IChatGptSchema;

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
     * {@link IChatGptSchema.IParameters.$defs} object.
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
   * instead of `oneOf`, {@link IChatGptSchema} forcibly converts it to `anyOf`
   * type.
   */
  export interface IAnyOf extends IJsonSchemaAttribute {
    /** List of the union types. */
    anyOf: Exclude<IChatGptSchema, IChatGptSchema.IAnyOf>[];

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
}
