/**
 * Type schema info of LLM function call.
 *
 * `ILlmSchema` is a type metadata of LLM (Large Language Model)
 * function calling.
 *
 * `ILlmSchema` basically follows the JSON schema definition of OpenAPI
 * v3.0 specification; {@link OpenApiV3.IJsonSchema}. However, `ILlmSchema`
 * does not have the reference type; {@link OpenApiV3.IJsonSchema.IReference}.
 * It's because the LLM cannot compose the reference typed arguments.
 *
 * For reference, the OpenAPI v3.0 based JSON schema definition can't
 * express the tuple array type. It has been supported since OpenAPI v3.1;
 * {@link OpenApi.IJsonSchema.ITuple}. Therefore, it would better to avoid
 * using the tuple array type in the LLM function calling.
 *
 * @reference https://platform.openai.com/docs/guides/function-calling
 * @author Jeongho Nam - https://github.com/samchon
 */
export type ILlmSchema =
  | ILlmSchema.IBoolean
  | ILlmSchema.IInteger
  | ILlmSchema.INumber
  | ILlmSchema.IString
  | ILlmSchema.IArray
  | ILlmSchema.IObject
  | ILlmSchema.IUnknown
  | ILlmSchema.INullOnly
  | ILlmSchema.IOneOf;
export namespace ILlmSchema {
  /**
   * Boolean type schema info.
   */
  export interface IBoolean extends __ISignificant<"boolean"> {
    /**
     * Default value.
     */
    default?: boolean | null;

    /**
     * Enumeration values.
     */
    enum?: Array<boolean | null>;
  }

  /**
   * Integer type schema info.
   */
  export interface IInteger extends __ISignificant<"integer"> {
    /**
     * Default value.
     *
     * @type int64
     */
    default?: number | null;

    /**
     * Enumeration values.
     *
     * @type int64
     */
    enum?: Array<number | null>;

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
     * For reference, even though your Swagger document has defined the
     * `exclusiveMinimum` value as `number`, it has been forcibly converted
     * to `boolean` type, and assigns the numeric value to the
     * {@link minimum} property in the {@link OpenApi} conversion.
     */
    exclusiveMinimum?: boolean;

    /**
     * Exclusive maximum value restriction.
     *
     * For reference, even though your Swagger document has defined the
     * `exclusiveMaximum` value as `number`, it has been forcibly converted
     * to `boolean` type, and assigns the numeric value to the
     * {@link maximum} property in the {@link OpenApi} conversion.
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
   * Number type schema info.
   */
  export interface INumber extends __ISignificant<"number"> {
    /**
     * Default value.
     */
    default?: number | null;

    /**
     * Enumeration values.
     */
    enum?: Array<number | null>;

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
   * String type schema info.
   */
  export interface IString extends __ISignificant<"string"> {
    /**
     * Default value.
     */
    default?: string | null;

    /**
     * Enumeration values.
     */
    enum?: Array<string | null>;

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

    /**
     * Content media type restriction.
     */
    contentMediaType?: string;
  }

  /**
   * Array type schema info.
   */
  export interface IArray<Schema extends ILlmSchema = ILlmSchema>
    extends __ISignificant<"array"> {
    /**
     * Items type schema info.
     *
     * The `items` means the type of the array elements. In other words, it is
     * the type schema info of the `T` in the TypeScript array type `Array<T>`.
     */
    items: Schema;

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
   * Object type schema info.
   */
  export interface IObject<Schema extends ILlmSchema = ILlmSchema>
    extends __ISignificant<"object"> {
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
    properties?: Record<string, Schema>;

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

    /**
     * Additional properties' info.
     *
     * The `additionalProperties` means the type schema info of the additional
     * properties that are not listed in the {@link properties}.
     *
     * If the value is `true`, it means that the additional properties are not
     * restricted. They can be any type. Otherwise, if the value is
     * {@link ILlmSchema} type, it means that the additional properties must
     * follow the type schema info.
     *
     * - `true`: `Record<string, any>`
     * - `ILlmSchema`: `Record<string, T>`
     */
    additionalProperties?: boolean | Schema;
  }

  /**
   * Unknown type schema info.
   *
   * It means the type of the value is `any`.
   */
  export interface IUnknown extends __IAttribute {
    /**
     * Type is never be defined.
     */
    type?: undefined;
  }

  /**
   * Null only type schema info.
   */
  export interface INullOnly extends __IAttribute {
    /**
     * Type is always `null`.
     */
    type: "null";

    /**
     * Default value.
     */
    default?: null;
  }

  /**
   * One of type schema info.
   *
   * `IOneOf` represents an union type of the TypeScript (`A | B | C`).
   *
   * For reference, even though your Swagger (or OpenAPI) document has
   * defined `anyOf` instead of the `oneOf`, it has been forcibly converted
   * to `oneOf` type by {@link OpenApi.convert OpenAPI conversion}.
   */
  export interface IOneOf<Schema extends ILlmSchema = ILlmSchema>
    extends __IAttribute {
    /**
     * List of the union types.
     */
    oneOf: Exclude<Schema, ILlmSchema.IOneOf<Schema>>[];
  }

  /**
   * Significant attributes that can be applied to the most types.
   */
  export interface __ISignificant<Type extends string> extends __IAttribute {
    /**
     * Discriminator value of the type.
     */
    type: Type;

    /**
     * Whether to allow `null` value or not.
     */
    nullable?: boolean;
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
