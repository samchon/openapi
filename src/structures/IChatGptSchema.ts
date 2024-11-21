/**
 * Type schema info of the ChatGPT.
 *
 * `IChatGptSchema` is a type schema info of the ChatGPT function calling.
 *
 * `IChatGptSchema` basically follows the JSON schema definition of the OpenAPI v3.1
 * speciifcation; {@link OpenApiV3_1.IJsonSchema}.
 *
 * However, the `IChatGptSchema` does not follow the entire specification of
 * the OpenAPI v3.1. It has own specific restrictions and definitions. Here is the
 * list of how `IChatGptSchema` is different with the OpenAPI v3.1 JSON schema.
 *
 * - Decompose mixed type: {@link OpenApiV3_1.IJsonSchema.IMixed}
 * - Resolve nullable property: {@link OpenApiV3_1.IJsonSchema.__ISignificant.nullable}
 * - Tuple type is banned: {@link OpenApiV3_1.IJsonSchema.ITuple.prefixItems}
 * - Constant type is banned: {@link OpenApiV3_1.IJsonSchema.IConstant}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IOneOf} to {@link IChatGptSchema.IAnOf}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IAllOf} to {@link IChatGptSchema.IObject}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IRecursiveReference} to {@link IChatGptSchema.IReference}
 * - Forcibly transform every object properties to be required
 *
 * If compare with the {@link OpenApi.IJsonSchema}, the emended JSON schema type of
 *
 * - {@link IChatGptSchema.IAnyOf} instead of the {@link OpenApi.IJsonSchema.IOneOf}
 * - {@link IChatGptSchema.IParameters.$defs} instead of the {@link OpenApi.IJsonSchema.IComponents.schemas}
 * - {@link IChatGptSchema.IString.enum} instead of the {@link OpenApi.IJsonSchema.IConstant}
 * - No tuple type {@link OpenApi.IJsonSchema.ITuple} support
 * - Forcibly transform every object properties to be required
 *
 * For reference, if you've composed the `IChatGptSchema` type with the
 * {@link ILlmApplication.IChatGptOptions.reference} `false` option (default is `false`),
 * only the recursived named types would be archived into the
 * {@link IChatGptSchema.IParameters.$defs}, and the others would be ecaped from the
 * {@link IChatGptSchema.IReference} type.
 *
 * Also, if you've composed the `IChatGptSchema` type with the
 * {@link ILlmApplication.IChatGptOptions.constraint} `false` option (default `false`),
 * the `IChatGptSchema` would not compose these properties. Instead, these
 * properties would be written on {@link IChatGptSchema.__IAttribute.descripotion}
 * field like `@format uuid` case.
 *
 * - {@link IChatGptSchema.INumber.minimum}
 * - {@link IChatGptSchema.INumber.maximum}
 * - {@link IChatGptSchema.INumber.multipleOf}
 * - {@link IChatGptSchema.IString.minLength}
 * - {@link IChatGptSchema.IString.maxLength}
 * - {@link IChatGptSchema.IString.format}
 * - {@link IChatGptSchema.IString.pattern}
 * - {@link IChatGptSchema.IString.contentMediaType}
 * - {@link IChatGptSchema.IArray.minItems}
 * - {@link IChatGptSchema.IArray.maxItems}
 * - {@link IChatGptSchema.IArray.unique}
 *
 * @reference https://platform.openai.com/docs/guides/function-calling
 * @reference https://platform.openai.com/docs/guides/structured-outputs
 * @warning Specified not by the official documentation, but by my experiments.
 *          Therefore, its definitions can be inaccurate or be changed in the
 *          future. If you find any wrong or outdated definitions, please let me
 *          know by issue
 * @issue https://github.com/samchon/openapi/issues
 * @author Jeongho Nam - https://github.com/samchon
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
   */
  export interface IParameters extends Omit<IObject, "additionalProperties"> {
    /**
     * Collection of the named types.
     */
    $defs?: Record<string, IChatGptSchema | undefined>;

    /**
     * Do not allow additional properties in the parameters.
     */
    additionalProperties: false;
  }

  /**
   * Boolean type info.
   */
  export interface IBoolean extends __ISignificant<"boolean"> {
    /**
     * Enumeration values.
     */
    enum?: Array<boolean>;

    /**
     * The default value.
     */
    default?: boolean;
  }

  /**
   * Integer type info.
   */
  export interface IInteger extends __ISignificant<"integer"> {
    /**
     * Enumeration values.
     */
    enum?: Array<number>;

    /**
     * Default value.
     *
     * @type int64
     */
    default?: number;

    /**
     * Minimum value restriction.
     *
     * @type int64
     */
    minimum?: number;

    /**
     * Maximum value restriction.
     *
     * @type int64
     */
    maximum?: number;

    /**
     * Exclusive minimum value restriction.
     *
     * For reference, even though your Swagger (or OpenAPI) document has
     * defined the `exclusiveMinimum` value as `number`, {@link IChatGptSchema}
     * forcibly converts it to `boolean` type, and assign the numeric value to
     * the {@link minimum} property.
     */
    exclusiveMinimum?: boolean;

    /**
     * Exclusive maximum value restriction.
     *
     * For reference, even though your Swagger (or OpenAPI) document has
     * defined the `exclusiveMaximum` value as `number`, {@link IChatGptSchema}
     * forcibly converts it to `boolean` type, and assign the numeric value to
     * the {@link maximum} property.
     */
    exclusiveMaximum?: boolean;

    /**
     * Multiple of value restriction.
     *
     * @type uint64
     * @exclusiveMinimum 0
     */
    multipleOf?: number;
  }

  /**
   * Number (double) type info.
   */
  export interface INumber extends __ISignificant<"number"> {
    /**
     * Enumeration values.
     */
    enum?: Array<number>;

    /**
     * Default value.
     */
    default?: number;

    /**
     * Minimum value restriction.
     */
    minimum?: number;

    /**
     * Maximum value restriction.
     */
    maximum?: number;

    /**
     * Exclusive minimum value restriction.
     *
     * For reference, even though your Swagger (or OpenAPI) document has
     * defined the `exclusiveMinimum` value as `number`, {@link OpenAiComposer}
     * forcibly converts it to `boolean` type, and assign the numeric value to
     * the {@link minimum} property.
     */
    exclusiveMinimum?: boolean;

    /**
     * Exclusive maximum value restriction.
     *
     * For reference, even though your Swagger (or OpenAPI) document has
     * defined the `exclusiveMaximum` value as `number`, {@link OpenAiComposer}
     * forcibly converts it to `boolean` type, and assign the numeric value to
     * the {@link maximum} property.
     */
    exclusiveMaximum?: boolean;

    /**
     * Multiple of value restriction.
     *
     * @exclusiveMinimum 0
     */
    multipleOf?: number;
  }

  /**
   * String type info.
   */
  export interface IString extends __ISignificant<"string"> {
    /**
     * Enumeration values.
     */
    enum?: Array<string>;

    /**
     * Default value.
     */
    default?: string;

    /**
     * Format restriction.
     */
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

    /**
     * Pattern restriction.
     */
    pattern?: string;

    /**
     * Content media type restriction.
     */
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

  /**
   * Array type info.
   */
  export interface IArray extends __ISignificant<"array"> {
    /**
     * Items type info.
     *
     * The `items` means the type of the array elements. In other words, it is
     * the type schema info of the `T` in the TypeScript array type `Array<T>`.
     */
    items: IChatGptSchema;

    /**
     * Unique items restriction.
     *
     * If this property value is `true`, target array must have unique items.
     */
    uniqueItems?: boolean;

    /**
     * Minimum items restriction.
     *
     * Restriction of minumum number of items in the array.
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

  /**
   * Object type info.
   */
  export interface IObject extends __ISignificant<"object"> {
    /**
     * Properties of the object.
     *
     * The `properties` means a list of key-value pairs of the object's
     * regular properties. The key is the name of the regular property,
     * and the value is the type schema info.
     *
     * If you need additional properties that is represented by dynamic key,
     * you can use the {@link additionalProperties} instead.
     */
    properties: Record<string, IChatGptSchema>;

    /**
     * Additional properties' info.
     *
     * The `additionalProperties` means the type schema info of the additional
     * properties that are not listed in the {@link properties}.
     *
     * If the value is `true`, it means that the additional properties are not
     * restricted. They can be any type. Otherwise, if the value is
     * {@link IOpenAiSchema} type, it means that the additional properties must
     * follow the type schema info.
     *
     * - `true`: `Record<string, any>`
     * - `IOpenAiSchema`: `Record<string, T>`
     */
    additionalProperties?: boolean | IChatGptSchema;

    /**
     * List of key values of the required properties.
     *
     * The `required` means a list of the key values of the required
     * {@link properties}. If some property key is not listed in the `required`
     * list, it means that property is optional. Otherwise some property key
     * exists in the `required` list, it means that the property must be filled.
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
    required?: string[];
  }

  /**
   * Reference type directing named schema.
   */
  export interface IReference<Key = string> extends __IAttribute {
    /**
     * Reference to the named schema.
     *
     * The `ref` is a reference to the named schema. Format of the `$ref` is
     * following the JSON Pointer specification. In the OpenAPI, the `$ref`
     * starts with `#/$defs/` which means the type is stored in
     * the {@link IChatGptSchema.ITop.$defs} object.
     *
     * - `#/$defs/SomeObject`
     * - `#/$defs/AnotherObject`
     */
    $ref: Key;
  }

  /**
   * Union type.
   *
   * IOneOf` represents an union type of the TypeScript (`A | B | C`).
   *
   * For reference, even though your Swagger (or OpenAPI) document has
   * defined `anyOf` instead of the `oneOf`, {@link IChatGptSchema} forcibly
   * converts it to `oneOf` type.
   */
  export interface IAnyOf extends __IAttribute {
    /**
     * List of the union types.
     */
    anyOf: Exclude<IChatGptSchema, IChatGptSchema.IAnyOf>[];
  }

  /**
   * Null type.
   */
  export interface INull extends __ISignificant<"null"> {
    /**
     * Default value.
     */
    default?: null;
  }

  /**
   * Unknown, the `any` type.
   */
  export interface IUnknown extends __IAttribute {
    /**
     * Type is never be defined.
     */
    type?: undefined;
  }

  /**
   * Significant attributes that can be applied to the most types.
   */
  export interface __ISignificant<Type extends string> extends __IAttribute {
    /**
     * Discriminator value of the type.
     */
    type: Type;
  }

  /**
   * Common attributes that can be applied to all types.
   */
  export interface __IAttribute {
    /**
     * Title of the schema.
     */
    title?: string;

    /**
     * Detailed description of the schema.
     */
    description?: string;

    /**
     * Whether the type is deprecated or not.
     */
    deprecated?: boolean;

    /**
     * Example value.
     */
    example?: any;

    /**
     * List of example values as key-value pairs.
     */
    examples?: Record<string, any>;
  }
}
