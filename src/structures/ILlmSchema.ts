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
     * type unless recursive type case.
     *
     * This is because the lower version of AI does not understand the reference
     * type well, and even the modern version of AI sometimes occur the
     * hallucination (Gemini).
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
    $defs: Record<string, ILlmSchema>;
    additionalProperties: false;
  }

  export interface IBoolean extends IJsonSchemaAttribute.IBoolean {}
  export interface IInteger extends IJsonSchemaAttribute.IInteger {}
  export interface INumber extends IJsonSchemaAttribute.INumber {}
  export interface IString extends IJsonSchemaAttribute.IString {}
  export interface IArray extends IJsonSchemaAttribute.IArray {}
  export interface IObject extends IJsonSchemaAttribute.IObject {}
  export interface IReference extends IJsonSchemaAttribute {}

  export interface IAnyOf extends IJsonSchemaAttribute {
    /** List of the union types. */
    anyOf: Exclude<ILlmSchema, ILlmSchema.IAnyOf>[];

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

  export interface INull extends IJsonSchemaAttribute.INull {}
  export interface IUnknown extends IJsonSchemaAttribute.IUnknown {}
}
