export type ILlmSchemaV3_1 =
  | ILlmSchemaV3_1.IBoolean
  | ILlmSchemaV3_1.IInteger
  | ILlmSchemaV3_1.INumber
  | ILlmSchemaV3_1.IString
  | ILlmSchemaV3_1.IArray
  | ILlmSchemaV3_1.ITuple
  | ILlmSchemaV3_1.IObject
  | ILlmSchemaV3_1.IOneOf
  | ILlmSchemaV3_1.INull
  | ILlmSchemaV3_1.IUnknown;
export namespace ILlmSchemaV3_1 {
  /**
   * Constant value type.
   */
  export interface IConstant extends __IAttribute {
    /**
     * The constant value.
     */
    const: boolean | number | string;
  }

  /**
   * Boolean type info.
   */
  export interface IBoolean extends __ISignificant<"boolean"> {
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
     * defined the `exclusiveMinimum` value as `number`, {@link OpenApi}
     * forcibly converts it to `boolean` type, and assign the numeric value to
     * the {@link minimum} property.
     */
    exclusiveMinimum?: boolean;

    /**
     * Exclusive maximum value restriction.
     *
     * For reference, even though your Swagger (or OpenAPI) document has
     * defined the `exclusiveMaximum` value as `number`, {@link OpenApi}
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
   * Tuple type info.
   */
  export interface ITuple extends __ISignificant<"array"> {
    /**
     * Prefix items.
     *
     * The `prefixItems` means the type schema info of the prefix items in the
     * tuple type. In the TypeScript, it is expressed as `[T1, T2]`.
     *
     * If you want to express `[T1, T2, ...TO[]]` type, you can configure the
     * `...TO[]` through the {@link additionalItems} property.
     */
    prefixItems: ILlmSchemaV3_1[];

    /**
     * Additional items.
     *
     * The `additionalItems` means the type schema info of the additional items
     * after the {@link prefixItems}. In the TypeScript, if there's a type
     * `[T1, T2, ...TO[]]`, the `...TO[]` is represented by the `additionalItems`.
     *
     * By the way, if you configure the `additionalItems` as `true`, it means
     * the additional items are not restricted. They can be any type, so that
     * it is equivalent to the TypeScript type `[T1, T2, ...any[]]`.
     *
     * Otherwise configure the `additionalItems` as the {@link IJsonSchema},
     * it means the additional items must follow the type schema info.
     * Therefore, it is equivalent to the TypeScript type `[T1, T2, ...TO[]]`.
     */
    additionalItems?: boolean | ILlmSchemaV3_1;

    /**
     * Unique items restriction.
     *
     * If this property value is `true`, target tuple must have unique items.
     */
    uniqueItems?: boolean;

    /**
     * Minimum items restriction.
     *
     * Restriction of minumum number of items in the tuple.
     *
     * @type uint64
     */
    minItems?: number;

    /**
     * Maximum items restriction.
     *
     * Restriction of maximum number of items in the tuple.
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
   * Union type.
   *
   * IOneOf` represents an union type of the TypeScript (`A | B | C`).
   *
   * For reference, even though your Swagger (or OpenAPI) document has
   * defined `anyOf` instead of the `oneOf`, {@link OpenApi} forcibly
   * converts it to `oneOf` type.
   */
  export interface IOneOf extends __IAttribute {
    /**
     * List of the union types.
     */
    oneOf: Exclude<ILlmSchemaV3_1, ILlmSchemaV3_1.IOneOf>[];

    /**
     * Discriminator info of the union type.
     */
    discriminator?: IOneOf.IDiscriminator;
  }
  export namespace IOneOf {
    /**
     * Discriminator info of the union type.
     */
    export interface IDiscriminator {
      /**
       * Property name for the discriminator.
       */
      propertyName: string;

      /**
       * Mapping of the discriminator value to the schema name.
       *
       * This property is valid only for {@link IReference} typed
       * {@link IOneOf.oneof} elements. Therefore, `key` of `mapping` is
       * the discriminator value, and `value` of `mapping` is the
       * schema name like `#/components/schemas/SomeObject`.
       */
      mapping?: Record<string, string>;
    }
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
