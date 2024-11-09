import { ILlmSchemaV3_1 } from "../structures/ILlmSchemaV3_1";

export namespace LlmTypeCheckerV3_1 {
  /* -----------------------------------------------------------
    TYPE CHECKERS
  ----------------------------------------------------------- */
  export const isNull = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.INull =>
    (schema as ILlmSchemaV3_1.INull).type === "null";

  export const isUnknown = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IUnknown =>
    (schema as ILlmSchemaV3_1.IUnknown).type === undefined &&
    !isConstant(schema) &&
    !isOneOf(schema);

  export const isConstant = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IConstant =>
    (schema as ILlmSchemaV3_1.IConstant).const !== undefined;

  export const isBoolean = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IBoolean =>
    (schema as ILlmSchemaV3_1.IBoolean).type === "boolean";

  export const isInteger = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IInteger =>
    (schema as ILlmSchemaV3_1.IInteger).type === "integer";

  export const isNumber = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.INumber =>
    (schema as ILlmSchemaV3_1.INumber).type === "number";

  export const isString = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IString =>
    (schema as ILlmSchemaV3_1.IString).type === "string";

  export const isArray = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IArray =>
    (schema as ILlmSchemaV3_1.IArray).type === "array" &&
    (schema as ILlmSchemaV3_1.IArray).items !== undefined;

  export const isTuple = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.ITuple =>
    (schema as ILlmSchemaV3_1.ITuple).type === "array" &&
    (schema as ILlmSchemaV3_1.ITuple).prefixItems !== undefined;

  export const isObject = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IObject =>
    (schema as ILlmSchemaV3_1.IObject).type === "object";

  export const isOneOf = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IOneOf =>
    (schema as ILlmSchemaV3_1.IOneOf).oneOf !== undefined;
}
