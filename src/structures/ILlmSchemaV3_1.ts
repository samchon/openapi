import { IJsonSchemaAttribute } from "./IJsonSchemaAttribute";

/**
 * Type schema based on OpenAPI v3.1 for LLM function calling.
 *
 * `ILlmSchemaV3_1` is a type metadata for LLM (Large Language Model) function
 * calling, based on the OpenAPI v3.1 speicification. This type is not the final
 * type for the LLM function calling, but the intermediate structure for the
 * conversion to the final type of below:
 *
 * - {@link IChatGptSchema}
 * - {@link IClaudeSchema}
 * - {@link ILlamaSchema}
 *
 * However, the `ILlmSchemaV3_1` does not follow the entire specification of the
 * OpenAPI v3.1. It has own specific restrictions and definitions. Here is the
 * list of how `ILlmSchemaV3_1` is different with the OpenAPI v3.1 JSON schema.
 *
 * - Decompose mixed type: {@link OpenApiV3_1.IJsonSchema.IMixed}
 * - Resolve nullable property:
 *   {@link OpenApiV3_1.IJsonSchema.__ISignificant.nullable}
 * - Constant type is banned: {@link OpenApiV3_1.IJsonSchema.IConstant}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IAnyOf} to {@link ILlmSchemaV3_1.IOneOf}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IAllOf} to {@link ILlmSchemaV3_1.IObject}
 * - Merge {@link OpenApiV3_1.IJsonSchema.IRecursiveReference} to
 *   {@link ILlmSchemaV3_1.IReference}
 * - Do not support {@link OpenApiV3_1.IJsonSchema.ITuple} type
 *
 * If compare with the {@link OpenApi.IJsonSchema}, the emended JSON schema
 * specification,
 *
 * - {@link ILlmSchemaV3_1.IParameters.$defs} instead of the
 *   {@link OpenApi.IJsonSchema.schemas}
 * - Do not support {@link OpenApi.IJsonSchema.ITuple} type
 * - {@link ILlmSchemaV3_1.properties} and {@link ILlmSchemaV3_1.required} are
 *   always defined
 *
 * For reference, if you've composed the `ILlmSchemaV3_1` type with the
 * {@link ILlmSchemaV3_1.IConfig.reference} `false` option (default is `false`),
 * only the recursived named types would be archived into the
 * {@link ILlmSchemaV3_1.IParameters.$defs}, and the others would be ecaped from
 * the {@link ILlmSchemaV3_1.IReference} type.
 *
 * Also, if you've composed the `ILlmSchemaV3_1` type with the
 * {@link ILlmSchemaV3_1.IConfig.constraint} `false` option (default `false`),
 * the `ILlmSchemaV3_1` would not compose these properties. Instead, these
 * properties would be written on
 * {@link ILlmSchemaV3_1.__IAttribute.descripotion} field like `@format uuid`
 * case.
 *
 * - {@link ILlmSchemaV3_1.INumber.minimum}
 * - {@link ILlmSchemaV3_1.INumber.maximum}
 * - {@link ILlmSchemaV3_1.INumber.multipleOf}
 * - {@link ILlmSchemaV3_1.IString.minLength}
 * - {@link ILlmSchemaV3_1.IString.maxLength}
 * - {@link ILlmSchemaV3_1.IString.format}
 * - {@link ILlmSchemaV3_1.IString.pattern}
 * - {@link ILlmSchemaV3_1.IString.contentMediaType}
 * - {@link ILlmSchemaV3_1.IArray.minItems}
 * - {@link ILlmSchemaV3_1.IArray.maxItems}
 * - {@link ILlmSchemaV3_1.IArray.unique}
 *
 * @author Jeongho Nam - https://github.com/samchon
 * @reference https://platform.openai.com/docs/guides/function-calling
 * @reference https://platform.openai.com/docs/guides/structured-outputs
 */
export type ILlmSchemaV3_1 =
  | ILlmSchemaV3_1.IConstant
  | ILlmSchemaV3_1.IBoolean
  | ILlmSchemaV3_1.IInteger
  | ILlmSchemaV3_1.INumber
  | ILlmSchemaV3_1.IString
  | ILlmSchemaV3_1.IArray
  | ILlmSchemaV3_1.IObject
  | ILlmSchemaV3_1.IReference
  | ILlmSchemaV3_1.IOneOf
  | ILlmSchemaV3_1.INull
  | ILlmSchemaV3_1.IUnknown;
export namespace ILlmSchemaV3_1 {
  /** Configuration for OpenAPI v3.1 based LLM schema composition. */
  export interface IConfig {
    /**
     * Whether to allow constraint properties or not.
     *
     * If you configure this property to `false`, the schemas do not contain the
     * constraint properties of below. Instead, below properties would be
     * written to the {@link ILlmSchemaV3_1.__IAttribute.description} property as
     * a comment string like `"@format uuid"`.
     *
     * This is because some LLM schema model like {@link IChatGptSchema} has
     * banned such constraint, because their LLM cannot understand the
     * constraint properties and occur the hallucination.
     *
     * Therefore, considering your LLM model's performance, capability, and the
     * complexity of your parameter types, determine which is better, to allow
     * the constraint properties or not.
     *
     * - {@link ILlmSchemaV3_1.INumber.minimum}
     * - {@link ILlmSchemaV3_1.INumber.maximum}
     * - {@link ILlmSchemaV3_1.INumber.multipleOf}
     * - {@link ILlmSchemaV3_1.IString.minLength}
     * - {@link ILlmSchemaV3_1.IString.maxLength}
     * - {@link ILlmSchemaV3_1.IString.format}
     * - {@link ILlmSchemaV3_1.IString.pattern}
     * - {@link ILlmSchemaV3_1.IString.contentMediaType}
     * - {@link ILlmSchemaV3_1.IString.default}
     * - {@link ILlmSchemaV3_1.IArray.minItems}
     * - {@link ILlmSchemaV3_1.IArray.maxItems}
     * - {@link ILlmSchemaV3_1.IArray.unique}
     *
     * @default true
     */
    constraint: boolean;

    /**
     * Whether to allow reference type in everywhere.
     *
     * If you configure this property to `false`, most of reference types
     * represented by {@link ILlmSchemaV3_1.IReference} would be escaped to a
     * plain type unless recursive type case.
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
   * `ILlmSchemaV3_1.IParameters` is a type defining a function's parameters as
   * a keyworded object type.
   *
   * It also can be utilized for the structured output metadata.
   *
   * @reference https://platform.openai.com/docs/guides/structured-outputs
   */
  export interface IParameters extends Omit<IObject, "additionalProperties"> {
    /** Collection of the named types. */
    $defs: Record<string, ILlmSchemaV3_1>;

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

  /** Constant value type. */
  export interface IConstant extends IJsonSchemaAttribute {
    /** The constant value. */
    const: boolean | number | string;
  }

  /** Boolean type info. */
  export interface IBoolean extends IJsonSchemaAttribute.IBoolean {
    /** The default value. */
    default?: boolean;
  }

  /** Integer type info. */
  export interface IInteger extends IJsonSchemaAttribute.IInteger {
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
    items: ILlmSchemaV3_1;

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
     *
     * If you need additional properties that is represented by dynamic key, you
     * can use the {@link additionalProperties} instead.
     */
    properties: Record<string, ILlmSchemaV3_1>;

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
    additionalProperties?: boolean | ILlmSchemaV3_1;

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
     * {@link ILlmSchemaV3_1.IParameters.$defs} object.
     *
     * - `#/$defs/SomeObject`
     * - `#/$defs/AnotherObject`
     */
    $ref: string;
  }

  /**
   * Union type.
   *
   * `IOneOf` represents an union type of the TypeScript (`A | B | C`).
   *
   * For reference, even though your Swagger (or OpenAPI) document has defined
   * `anyOf` instead of the `oneOf`, {@link OpenApi} forcibly converts it to
   * `oneOf` type.
   */
  export interface IOneOf extends IJsonSchemaAttribute {
    /** List of the union types. */
    oneOf: Exclude<ILlmSchemaV3_1, ILlmSchemaV3_1.IOneOf>[];

    /** Discriminator info of the union type. */
    discriminator?: IOneOf.IDiscriminator;
  }
  export namespace IOneOf {
    /** Discriminator info of the union type. */
    export interface IDiscriminator {
      /** Property name for the discriminator. */
      propertyName: string;

      /**
       * Mapping of the discriminator value to the schema name.
       *
       * This property is valid only for {@link IReference} typed
       * {@link IOneOf.oneof} elements. Therefore, `key` of `mapping` is the
       * discriminator value, and `value` of `mapping` is the schema name like
       * `#/components/schemas/SomeObject`.
       */
      mapping?: Record<string, string>;
    }
  }

  /** Null type. */
  export interface INull extends IJsonSchemaAttribute.INull {
    /** Default value. */
    default?: null;
  }

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
}
