import { OpenApi } from "../OpenApi";
import { OpenApiTypeCheckerBase } from "./internal/OpenApiTypeCheckerBase";

export namespace OpenApiTypeChecker {
  /* -----------------------------------------------------------
    TYPE CHECKERS
  ----------------------------------------------------------- */
  export const isNull = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.INull =>
    OpenApiTypeCheckerBase.isNull(schema);

  export const isUnknown = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.IUnknown =>
    OpenApiTypeCheckerBase.isUnknown(schema);

  export const isConstant = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.IConstant =>
    OpenApiTypeCheckerBase.isConstant(schema);

  export const isBoolean = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.IBoolean =>
    OpenApiTypeCheckerBase.isBoolean(schema);

  export const isInteger = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.IInteger =>
    OpenApiTypeCheckerBase.isInteger(schema);

  export const isNumber = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.INumber =>
    OpenApiTypeCheckerBase.isNumber(schema);

  export const isString = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.IString =>
    OpenApiTypeCheckerBase.isString(schema);

  export const isArray = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.IArray =>
    OpenApiTypeCheckerBase.isArray(schema);

  export const isTuple = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.ITuple =>
    OpenApiTypeCheckerBase.isTuple(schema);

  export const isObject = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.IObject =>
    OpenApiTypeCheckerBase.isObject(schema);

  export const isReference = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.IReference =>
    OpenApiTypeCheckerBase.isReference(schema);

  export const isOneOf = (
    schema: OpenApi.IJsonSchema,
  ): schema is OpenApi.IJsonSchema.IOneOf =>
    OpenApiTypeCheckerBase.isOneOf(schema);

  export const isRecursiveReference = (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
  }): boolean =>
    OpenApiTypeCheckerBase.isRecursiveReference({
      prefix: "#/components/schemas/",
      components: props.components,
      schema: props.schema,
    });

  /* -----------------------------------------------------------
    OPERATORS
  ----------------------------------------------------------- */
  export const escape = (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    recursive: false | number;
    errors?: string[];
    accessor?: string;
    refAccessor?: string;
  }): OpenApi.IJsonSchema | null =>
    OpenApiTypeCheckerBase.escape({
      ...props,
      prefix: "#/components/schemas/",
    });

  export const unreference = (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    mismatches?: Set<string>;
  }): OpenApi.IJsonSchema | null =>
    OpenApiTypeCheckerBase.unreference({
      prefix: "#/components/schemas/",
      components: props.components,
      schema: props.schema,
      mismatches: props.mismatches,
    });

  export const visit = (props: {
    closure: (schema: OpenApi.IJsonSchema, accessor: string) => void;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    accessor?: string;
    refAccessor?: string;
  }): void =>
    OpenApiTypeCheckerBase.visit({
      ...props,
      prefix: "#/components/schemas/",
    });

  export const covers = (props: {
    components: OpenApi.IComponents;
    x: OpenApi.IJsonSchema;
    y: OpenApi.IJsonSchema;
  }): boolean =>
    OpenApiTypeCheckerBase.covers({
      prefix: "#/components/schemas/",
      components: props.components,
      x: props.x,
      y: props.y,
    });
}
