import { IJsonSchemaAttribute } from "./IJsonSchemaAttribute";

/**
 * Type schema based on OpenAPI v3.0 for LLM function calling.
 *
 * `ILlmSchemaV3` is a type metadata for LLM (Large Language Model) function
 * calling, based on the OpenAPI v3.0 specification. This type is not the final
 * type for the LLM function calling, but the intermediate structure for the
 * conversion to the final type like {@link IGeminiSchema}.
 *
 * `ILlmSchemaV3` basically follows the JSON schema definition of OpenAPI v3.0
 * specification; {@link OpenApiV3.IJsonSchema}. However, `ILlmSchemaV3` does not
 * have the reference type; {@link OpenApiV3.IJsonSchema.IReference}. It's
 * because the LLM cannot compose the reference typed arguments. If recursive
 * type comes, its type would be repeated in
 * {@link ILlmSchemaV3.IConfig.recursive} times. Otherwise you've configured it
 * to `false`, the recursive types are not allowed.
 *
 * For reference, the OpenAPI v3.0 based JSON schema definition can't express
 * the tuple array type. It has been supported since OpenAPI v3.1;
 * {@link OpenApi.IJsonSchema.ITuple}. Therefore, it would better to avoid using
 * the tuple array type in the LLM function calling.
 *
 * Also, if you configure {@link ILlmSchemaV3.IConfig.constraint} to `false`,
 * these properties would be banned and written to the
 * {@link ILlmSchemaV3.__IAttribute.description} property instead. It's because
 * there are some LLM models which does not support the constraint properties.
 *
 * - {@link ILlmSchemaV3.INumber.minimum}
 * - {@link ILlmSchemaV3.INumber.maximum}
 * - {@link ILlmSchemaV3.INumber.multipleOf}
 * - {@link ILlmSchemaV3.IString.minLength}
 * - {@link ILlmSchemaV3.IString.maxLength}
 * - {@link ILlmSchemaV3.IString.format}
 * - {@link ILlmSchemaV3.IString.pattern}
 * - {@link ILlmSchemaV3.IString.contentMediaType}
 * - {@link ILlmSchemaV3.IArray.minItems}
 * - {@link ILlmSchemaV3.IArray.maxItems}
 * - {@link ILlmSchemaV3.IArray.unique}
 *
 * @author Jeongho Nam - https://github.com/samchon
 * @reference https://platform.openai.com/docs/guides/function-calling
 */
export type ILlmSchemaV3 =
  | ILlmSchemaV3.IBoolean
  | ILlmSchemaV3.IInteger
  | ILlmSchemaV3.INumber
  | ILlmSchemaV3.IString
  | ILlmSchemaV3.IArray
  | ILlmSchemaV3.IObject
  | ILlmSchemaV3.IUnknown
  | ILlmSchemaV3.INullOnly
  | ILlmSchemaV3.IOneOf;
export namespace ILlmSchemaV3 {
  /** Configuration for OpenAPI v3.0 based LLM schema composition. */
  export interface IConfig {
    /**
     * Whether to allow constraint properties or not.
     *
     * If you configure this property to `false`, the schemas do not contain the
     * constraint properties of below. Instead, below properties would be
     * written to the {@link ILlmSchemaV3.__IAttribute.description} property as a
     * comment string like `"@format uuid"`.
     *
     * This is because some LLM schema model like {@link IGeminiSchema} has
     * banned such constraint, because their LLM cannot understand the
     * constraint properties and occur the hallucination.
     *
     * Therefore, considering your LLM model's performance, capability, and the
     * complexity of your parameter types, determine which is better, to allow
     * the constraint properties or not.
     *
     * - {@link ILlmSchemaV3.INumber.minimum}
     * - {@link ILlmSchemaV3.INumber.maximum}
     * - {@link ILlmSchemaV3.INumber.multipleOf}
     * - {@link ILlmSchemaV3.IString.minLength}
     * - {@link ILlmSchemaV3.IString.maxLength}
     * - {@link ILlmSchemaV3.IString.format}
     * - {@link ILlmSchemaV3.IString.pattern}
     * - {@link ILlmSchemaV3.IString.contentMediaType}
     * - {@link ILlmSchemaV3.IString.default}
     * - {@link ILlmSchemaV3.IArray.minItems}
     * - {@link ILlmSchemaV3.IArray.maxItems}
     * - {@link ILlmSchemaV3.IArray.unique}
     *
     * @default true
     */
    constraint: boolean;

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
   * `ILlmSchemaV3.IParameters` is a type defining a function's parameters as a
   * keyworded object type.
   *
   * It also can be utilized for the structured output metadata.
   *
   * @reference https://platform.openai.com/docs/guides/structured-outputs
   */
  export interface IParameters extends Omit<IObject, "additionalProperties"> {
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

  /** Boolean type schema info. */
  export interface IBoolean extends IJsonSchemaAttribute.IBoolean {
    /** Whether to allow `null` value or not. */
    nullable?: boolean;

    /** Default value. */
    default?: boolean | null;

    /** Enumeration values. */
    enum?: Array<boolean | null>;
  }

  /** Integer type schema info. */
  export interface IInteger extends IJsonSchemaAttribute.IInteger {
    /** Whether to allow `null` value or not. */
    nullable?: boolean;

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

  /** Number type schema info. */
  export interface INumber extends IJsonSchemaAttribute.INumber {
    /** Whether to allow `null` value or not. */
    nullable?: boolean;

    /** Default value. */
    default?: number | null;

    /** Enumeration values. */
    enum?: Array<number | null>;

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

  /** String type schema info. */
  export interface IString extends IJsonSchemaAttribute.IString {
    /** Whether to allow `null` value or not. */
    nullable?: boolean;

    /** Default value. */
    default?: string | null;

    /** Enumeration values. */
    enum?: Array<string | null>;

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

    /** Content media type restriction. */
    contentMediaType?: string;
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
    items: ILlmSchemaV3;

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
     * If you need additional properties that is represented by dynamic key, you
     * can use the {@link additionalProperties} instead.
     */
    properties: Record<string, ILlmSchemaV3>;

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

    /**
     * Additional properties' info.
     *
     * The `additionalProperties` means the type schema info of the additional
     * properties that are not listed in the {@link properties}.
     *
     * If the value is `true`, it means that the additional properties are not
     * restricted. They can be any type. Otherwise, if the value is
     * {@link ILlmSchemaV3} type, it means that the additional properties must
     * follow the type schema info.
     *
     * - `true`: `Record<string, any>`
     * - `IOpenAiSchema`: `Record<string, T>`
     */
    additionalProperties?: boolean | ILlmSchemaV3;
  }

  /**
   * One of type schema info.
   *
   * `IOneOf` represents an union type of the TypeScript (`A | B | C`).
   *
   * For reference, even though your Swagger (or OpenAPI) document has defined
   * `anyOf` instead of the `oneOf`, it has been forcibly converted to `oneOf`
   * type by {@link OpenApi.convert OpenAPI conversion}.
   */
  export interface IOneOf extends IJsonSchemaAttribute {
    /** List of the union types. */
    oneOf: Exclude<ILlmSchemaV3, ILlmSchemaV3.IOneOf>[];
  }

  /** Null only type schema info. */
  export interface INullOnly extends IJsonSchemaAttribute.INull {
    /** Default value. */
    default?: null;
  }

  /**
   * Unknown type schema info.
   *
   * It means the type of the value is `any`.
   */
  export interface IUnknown extends IJsonSchemaAttribute.IUnknown {}
}
