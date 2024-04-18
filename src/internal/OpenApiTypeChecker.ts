import { OpenApi } from "../OpenApi";

export namespace OpenApiTypeChecker {
  export const isNull = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.INull =>
    (schema as OpenApi.IJsonSchema.INull).type === "null";
  export const isUnknown = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.IUnknown =>
    (schema as OpenApi.IJsonSchema.IUnknown).type === undefined &&
    !isConstant(schema) &&
    !isOneOf(schema) &&
    !isReference(schema);

  export const isConstant = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.IConstant =>
    (schema as OpenApi.IJsonSchema.IConstant).const !== undefined;
  export const isBoolean = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.IBoolean =>
    (schema as OpenApi.IJsonSchema.IBoolean).type === "boolean";
  export const isInteger = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.IInteger =>
    (schema as OpenApi.IJsonSchema.IInteger).type === "integer";
  export const isNumber = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.INumber =>
    (schema as OpenApi.IJsonSchema.INumber).type === "number";
  export const isString = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.IString =>
    (schema as OpenApi.IJsonSchema.IString).type === "string";

  export const isArray = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.IArray =>
    (schema as OpenApi.IJsonSchema.IArray).type === "array" &&
    (schema as OpenApi.IJsonSchema.IArray).items !== undefined;
  export const isTuple = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.ITuple =>
    (schema as OpenApi.IJsonSchema.ITuple).type === "array" &&
    (schema as OpenApi.IJsonSchema.ITuple).prefixItems !== undefined;
  export const isObject = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.IObject =>
    (schema as OpenApi.IJsonSchema.IObject).type === "object";
  export const isReference = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.IReference =>
    (schema as any).$ref !== undefined;
  export const isOneOf = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.IOneOf =>
    (schema as OpenApi.IJsonSchema.IOneOf).oneOf !== undefined;
}
