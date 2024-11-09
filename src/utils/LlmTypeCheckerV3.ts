import { ILlmSchemaV3 } from "../structures/ILlmSchemaV3";

/**
 * Type checker for LLM type schema.
 *
 * `LlmSchemaTypeChecker` is a type checker of {@link ILlmSchemaV3}.
 *
 * @author Samchon
 */
export namespace LlmTypeCheckerV3 {
  /* -----------------------------------------------------------
    OPERATORS
  ----------------------------------------------------------- */
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
    schema: ILlmSchemaV3,
    callback: (schema: ILlmSchemaV3) => void,
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

  /* -----------------------------------------------------------
    TYPE CHECKERS
  ----------------------------------------------------------- */
  /**
   * Test whether the schema is an union type.
   *
   * @param schema Target schema
   * @returns Whether union type or not
   */
  export const isOneOf = (
    schema: ILlmSchemaV3,
  ): schema is ILlmSchemaV3.IOneOf =>
    (schema as ILlmSchemaV3.IOneOf).oneOf !== undefined;

  /**
   * Test whether the schema is an object type.
   *
   * @param schema Target schema
   * @returns Whether object type or not
   */
  export const isObject = (
    schema: ILlmSchemaV3,
  ): schema is ILlmSchemaV3.IObject =>
    (schema as ILlmSchemaV3.IObject).type === "object";

  /**
   * Test whether the schema is an array type.
   *
   * @param schema Target schema
   * @returns Whether array type or not
   */
  export const isArray = (
    schema: ILlmSchemaV3,
  ): schema is ILlmSchemaV3.IArray =>
    (schema as ILlmSchemaV3.IArray).type === "array";

  /**
   * Test whether the schema is a boolean type.
   *
   * @param schema Target schema
   * @returns Whether boolean type or not
   */
  export const isBoolean = (
    schema: ILlmSchemaV3,
  ): schema is ILlmSchemaV3.IBoolean =>
    (schema as ILlmSchemaV3.IBoolean).type === "boolean";

  /**
   * Test whether the schema is an integer type.
   *
   * @param schema Target schema
   * @returns Whether integer type or not
   */
  export const isInteger = (
    schema: ILlmSchemaV3,
  ): schema is ILlmSchemaV3.IInteger =>
    (schema as ILlmSchemaV3.IInteger).type === "integer";

  /**
   * Test whether the schema is a number type.
   *
   * @param schema Target schema
   * @returns Whether number type or not
   */
  export const isNumber = (
    schema: ILlmSchemaV3,
  ): schema is ILlmSchemaV3.INumber =>
    (schema as ILlmSchemaV3.INumber).type === "number";

  /**
   * Test whether the schema is a string type.
   *
   * @param schema Target schema
   * @returns Whether string type or not
   */
  export const isString = (
    schema: ILlmSchemaV3,
  ): schema is ILlmSchemaV3.IString =>
    (schema as ILlmSchemaV3.IString).type === "string";

  /**
   * Test whether the schema is a null type.
   *
   * @param schema Target schema
   * @returns Whether null type or not
   */
  export const isNullOnly = (
    schema: ILlmSchemaV3,
  ): schema is ILlmSchemaV3.INullOnly =>
    (schema as ILlmSchemaV3.INullOnly).type === "null";

  /**
   * Test whether the schema is a nullable type.
   *
   * @param schema Target schema
   * @returns Whether nullable type or not
   */
  export const isNullable = (schema: ILlmSchemaV3): boolean =>
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
    schema: ILlmSchemaV3,
  ): schema is ILlmSchemaV3.IUnknown =>
    !isOneOf(schema) && (schema as ILlmSchemaV3.IUnknown).type === undefined;
}
