import { IJsonSchemaAttribute } from "./IJsonSchemaAttribute";

export type ILlmSchema =
  | ILlmSchema.IBoolean
  | ILlmSchema.IInteger
  | ILlmSchema.INumber
  | ILlmSchema.IString
  | ILlmSchema.IArray
  | ILlmSchema.IObject
  | ILlmSchema.IReference
  | ILlmSchema.IAnyOf
  | ILlmSchema.INull
  | ILlmSchema.IUnknown;
export namespace ILlmSchema {
  export interface IConfig {
    /**
     * Whether to allow reference type in everywhere.
     *
     * If you configure this property to `false`, most of reference types
     * represented by {@link ILlmSchema.IReference} would be escaped to a plain
     * type unless recursive type comes.
     *
     * This is because the lower version of AI does not understand the reference
     * type well, and even the modern version of AI sometimes occur the
     * hallucination (ex: Google Gemini).
     *
     * However, the reference type makes the schema size smaller, so that
     * reduces the LLM token cost. Therefore, if you're using the modern version
     * of AI, and want to reduce the LLM token cost, you can configure this
     * property to `true`.
     *
     * @default true
     */
    reference?: boolean;

    /**
     * Whether to apply the strict mode.
     *
     * If you configure this property to `true`, the OpenAI function calling
     * does not allow optional properties and dynamic key typed properties in
     * the {@link IChatGptSchema.IObject} type. Instead, it increases the success
     * rate of the function calling.
     *
     * By the way, if you utilize the {@link typia.validate} function and give
     * its validation feedback to the OpenAI, its performance is much better
     * than the strict mode.
     *
     * Therefore, I recommend you to just turn off the strict mode and utilize
     * the {@link typia.validate} function instead.
     *
     * @default false
     */
    strict?: boolean;
  }

  export interface IParameters extends Omit<IObject, "additionalProperties"> {
    /**
     * Collection of the named types.
     *
     * This record would be filled when {@link IConfig.reference} is `true`, or
     * recurisve type comes.
     */
    $defs: Record<string, ILlmSchema>;

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

    /** Default value. */
    default?: boolean;
  }

  /** Integer type info. */
  export interface IInteger extends IJsonSchemaAttribute.IInteger {
    /** Enumeration values. */
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

    /** Exclusive minimum value restriction. */
    exclusiveMinimum?: number;

    /** Exclusive maximum value restriction. */
    exclusiveMaximum?: number;

    /**
     * Multiple of value restriction.
     *
     * @type uint64
     * @exclusiveMinimum 0
     */
    multipleOf?: number;
  }

  /** Number (double) type info. */
  export interface INumber extends IJsonSchemaAttribute.INumber {
    /** Enumeration values. */
    enum?: Array<number>;

    /** Default value. */
    default?: number;

    /** Minimum value restriction. */
    minimum?: number;

    /** Maximum value restriction. */
    maximum?: number;

    /** Exclusive minimum value restriction. */
    exclusiveMinimum?: number;

    /** Exclusive maximum value restriction. */
    exclusiveMaximum?: number;

    /**
     * Multiple of value restriction.
     *
     * @exclusiveMinimum 0
     */
    multipleOf?: number;
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
    items: ILlmSchema;

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
    properties: Record<string, ILlmSchema>;

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
    additionalProperties?: ILlmSchema | boolean;

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

  /**
   * Reference type directing to named schema.
   *
   * If {@link IConfig.strict} mode, its other properties like {@link description}
   * would be disabled. Instead, the description would be placed in the parent
   * type. For example, if this reference type is used as a property of an
   * object, the description would be placed in the object place.
   */
  export interface IReference extends IJsonSchemaAttribute {
    /**
     * Reference to the named schema.
     *
     * The `$ref` is a reference to a named schema. The format follows the JSON
     * Pointer specification. In OpenAPI, the `$ref` starts with `#/$defs/`
     * which indicates the type is stored in the
     * {@link ILlmSchema.IParameters.$defs} object.
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
   * instead of `oneOf`, {@link ILlmSchema} forcibly converts it to `anyOf`
   * type.
   */
  export interface IAnyOf extends IJsonSchemaAttribute {
    /** List of the union types. */
    anyOf: Exclude<ILlmSchema, ILlmSchema.IAnyOf>[];

    /**
     * Discriminator info of the union type.
     *
     * This discriminator is used to determine which type in the union should be
     * used based on the value of a specific property.
     */
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
