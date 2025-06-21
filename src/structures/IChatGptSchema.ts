import { IJsonSchemaAttribute } from "./IJsonSchemaAttribute";

/**
 * Type schema info of the ChatGPT.
 *
 * `IChatGptSchema` is a type schema info of the ChatGPT function calling.
 *
 * `IChatGptSchema` basically follows the JSON schema definition of the OpenAPI
 * v3.1 speciifcation; {@link OpenApiV3_1.IJsonSchema}.
 *
 * However, the `IChatGptSchema` does not follow the entire specification of the
 * OpenAPI v3.1. It has own specific restrictions and definitions. Here is the
 * list of how `IChatGptSchema` is different with the OpenAPI v3.1 JSON schema.
 *
 * - Decompose mixed type: {@link OpenApiV3_1.IJsonSchema.IMixed}
 * - Resolve nullable property:
 *   {@link OpenApiV3_1.IJsonSchema.__ISignificant.nullable}
 * - Tuple type is banned: {@link OpenApiV3_1.IJsonSchema.ITuple.prefixItems}
 * - Constant type is banned: {@link OpenApiV3_1.IJsonSchema.IConstant}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IOneOf} to {@link IChatGptSchema.IAnOf}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IAllOf} to {@link IChatGptSchema.IObject}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IRecursiveReference} to
 *   {@link IChatGptSchema.IReference}
 * - When {@link IChatGptSchema.IConfig.strict} mode
 *
 *   - Every object properties must be required
 *   - Do not allow {@link IChatGptSchema.IObject.additionalProperties}
 *
 * If compare with the {@link OpenApi.IJsonSchema}, the emended JSON schema
 * specification,
 *
 * - {@link IChatGptSchema.IAnyOf} instead of the {@link OpenApi.IJsonSchema.IOneOf}
 * - {@link IChatGptSchema.IParameters.$defs} instead of the
 *   {@link OpenApi.IJsonSchema.IComponents.schemas}
 * - {@link IChatGptSchema.IString.enum} instead of the
 *   {@link OpenApi.IJsonSchema.IConstant}
 * - {@link IChatGptSchema.additionalProperties} is fixed to `false`
 * - No tuple type {@link OpenApi.IJsonSchema.ITuple} support
 * - When {@link IChatGptSchema.IConfig.strict} mode
 *
 *   - Every object properties must be required
 *   - Do not allow {@link IChatGptSchema.IObject.additionalProperties}
 *
 * For reference, if you've composed the `IChatGptSchema` type with the
 * {@link IChatGptSchema.IConfig.reference} `false` option (default is `false`),
 * only the recursived named types would be archived into the
 * {@link IChatGptSchema.IParameters.$defs}, and the others would be ecaped from
 * the {@link IChatGptSchema.IReference} type.
 *
 * Also, OpenAI has banned below constraint properties. Instead,
 * `IChatGptSchema` fills the {@link IChatGptSchema.__IAttribute.description}
 * property with the comment text like `"@format uuid"`.
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
 * Additionally, OpenAI cannot define the `description` property to the
 * {@link IChatGptSchema.IReference} type, and even does not understand the
 * capsulization to the {@link IChatGptSchema.IAnyOf} type. Therefore, the
 * `description` is written to the parent object type, not the reference type.
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
 * @warning Specified not only by the official documentation, but also by my
 *          experiments. Therefore, its definitions can be inaccurate or be
 *          changed in the future. If you find any wrong or outdated definitions,
 *          please let me know by issue.
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
  /**
   * Type of the function parameters.
   *
   * `IChatGptSchema.IParameters` is a type defining a function's parameters as
   * a keyworded object type.
   *
   * It also can be utilized for the structured output metadata.
   *
   * @reference https://platform.openai.com/docs/guides/structured-outputs
   */
  export interface IParameters extends Omit<IObject, "additionalProperties"> {
    /** Collection of the named types. */
    $defs: Record<string, IChatGptSchema>;

    /**
     * Additional properties' info.
     *
     * The `additionalProperties` means the type schema info of the additional
     * properties that are not listed in the {@link properties}.
     *
     * By the way, it is not allowed in the parameters level.
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
     * Additional properties' info.
     *
     * The `additionalProperties` means the type schema info of the additional
     * properties that are not listed in the {@link properties}.
     *
     * By the way, if you've configured {@link IChatGptSchema.IConfig.strict} as
     * `true`, ChatGPT function calling does not support such dynamic key typed
     * properties, so the `additionalProperties` becomes always `false`.
     */
    additionalProperties?: boolean | IChatGptSchema;

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

  /** Reference type directing named schema. */
  export interface IReference extends IJsonSchemaAttribute {
    /**
     * Reference to the named schema.
     *
     * The `ref` is a reference to the named schema. Format of the `$ref` is
     * following the JSON Pointer specification. In the OpenAPI, the `$ref`
     * starts with `#/$defs/` which means the type is stored in the
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
   * `IAnyOf` represents an union type of the TypeScript (`A | B | C`).
   *
   * For reference, even though your Swagger (or OpenAPI) document has defined
   * `anyOf` instead of the `oneOf`, {@link IChatGptSchema} forcibly converts it
   * to `oneOf` type.
   */
  export interface IAnyOf extends IJsonSchemaAttribute {
    /** List of the union types. */
    anyOf: Exclude<IChatGptSchema, IChatGptSchema.IAnyOf>[];
  }

  /** Null type. */
  export interface INull extends IJsonSchemaAttribute.INull {}

  /** Unknown, the `any` type. */
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
  }

  /**
   * Common attributes that can be applied to all types.
   *
   * @ignore
   * @deprecated
   */
  export type __IAttribute = IJsonSchemaAttribute;

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
     * @default false
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
}
