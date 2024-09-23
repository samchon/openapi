import { ILlmSchema } from "../structures/ILlmSchema";

/**
 * Type checker for LLM type schema.
 *
 * `LlmSchemaTypeChecker` is a type checker of {@link ILlmSchema}.
 *
 * @author Samchon
 */
export namespace LlmTypeChecker {
  /**
   * Visit every nested schemas.
   *
   * Visit every nested schemas of the target, and apply the callback function
   * to them.
   *
   * If the visitor meets an union type, it will visit every individual schemas
   * in the union type. Otherwise meets an object type, it will visit every
   * properties and additional properties. If the visitor meets an array type,
   * it will visit the item type.
   *
   * @param schema Target schema to visit
   * @param callback Callback function to apply
   */
  export const visit = (
    schema: ILlmSchema,
    callback: (schema: ILlmSchema) => void,
  ): void => {
    callback(schema);
    if (isOneOf(schema)) schema.oneOf.forEach((s) => visit(s, callback));
    else if (isObject(schema)) {
      for (const [_, s] of Object.entries(schema.properties ?? {}))
        visit(s, callback);
      if (
        typeof schema.additionalProperties === "object" &&
        schema.additionalProperties !== null
      )
        visit(schema.additionalProperties, callback);
    } else if (isArray(schema)) visit(schema.items, callback);
  };

  /**
   * Test whether the schema is an union type.
   *
   * @param schema Target schema
   * @returns Whether union type or not
   */
  export const isOneOf = (schema: ILlmSchema): schema is ILlmSchema.IOneOf =>
    (schema as ILlmSchema.IOneOf).oneOf !== undefined;

  /**
   * Test whether the schema is an object type.
   *
   * @param schema Target schema
   * @returns Whether object type or not
   */
  export const isObject = (schema: ILlmSchema): schema is ILlmSchema.IObject =>
    (schema as ILlmSchema.IObject).type === "object";

  /**
   * Test whether the schema is an array type.
   *
   * @param schema Target schema
   * @returns Whether array type or not
   */
  export const isArray = (schema: ILlmSchema): schema is ILlmSchema.IArray =>
    (schema as ILlmSchema.IArray).type === "array";

  /**
   * Test whether the schema is a boolean type.
   *
   * @param schema Target schema
   * @returns Whether boolean type or not
   */
  export const isBoolean = (
    schema: ILlmSchema,
  ): schema is ILlmSchema.IBoolean =>
    (schema as ILlmSchema.IBoolean).type === "boolean";

  /**
   * Test whether the schema is an integer type.
   *
   * @param schema Target schema
   * @returns Whether integer type or not
   */
  export const isInteger = (
    schema: ILlmSchema,
  ): schema is ILlmSchema.IInteger =>
    (schema as ILlmSchema.IInteger).type === "integer";

  /**
   * Test whether the schema is a number type.
   *
   * @param schema Target schema
   * @returns Whether number type or not
   */
  export const isNumber = (schema: ILlmSchema): schema is ILlmSchema.INumber =>
    (schema as ILlmSchema.INumber).type === "number";

  /**
   * Test whether the schema is a string type.
   *
   * @param schema Target schema
   * @returns Whether string type or not
   */
  export const isString = (schema: ILlmSchema): schema is ILlmSchema.IString =>
    (schema as ILlmSchema.IString).type === "string";

  /**
   * Test whether the schema is a null type.
   *
   * @param schema Target schema
   * @returns Whether null type or not
   */
  export const isNullOnly = (
    schema: ILlmSchema,
  ): schema is ILlmSchema.INullOnly =>
    (schema as ILlmSchema.INullOnly).type === "null";

  /**
   * Test whether the schema is a nullable type.
   *
   * @param schema Target schema
   * @returns Whether nullable type or not
   */
  export const isNullable = (schema: ILlmSchema): boolean =>
    !isUnknown(schema) &&
    (isNullOnly(schema) ||
      (isOneOf(schema)
        ? schema.oneOf.some(isNullable)
        : schema.nullable === true));

  /**
   * Test whether the schema is an unknown type.
   *
   * @param schema Target schema
   * @returns Whether unknown type or not
   */
  export const isUnknown = (
    schema: ILlmSchema,
  ): schema is ILlmSchema.IUnknown =>
    !isOneOf(schema) && (schema as ILlmSchema.IUnknown).type === undefined;
}
