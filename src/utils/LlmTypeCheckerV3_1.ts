import { OpenApi } from "../OpenApi";
import { ILlmSchemaV3_1 } from "../structures/ILlmSchemaV3_1";
import { OpenApiTypeCheckerBase } from "./internal/OpenApiTypeCheckerBase";

export namespace LlmTypeCheckerV3_1 {
  /* -----------------------------------------------------------
    TYPE CHECKERS
  ----------------------------------------------------------- */
  export const isNull = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.INull => OpenApiTypeCheckerBase.isNull(schema);

  export const isUnknown = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IUnknown =>
    OpenApiTypeCheckerBase.isUnknown(schema);

  export const isConstant = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IConstant =>
    OpenApiTypeCheckerBase.isConstant(schema);

  export const isBoolean = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IBoolean =>
    OpenApiTypeCheckerBase.isBoolean(schema);

  export const isInteger = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IInteger =>
    OpenApiTypeCheckerBase.isInteger(schema);

  export const isNumber = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.INumber =>
    OpenApiTypeCheckerBase.isNumber(schema);

  export const isString = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IString =>
    OpenApiTypeCheckerBase.isString(schema);

  export const isArray = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IArray => OpenApiTypeCheckerBase.isArray(schema);

  export const isObject = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IObject =>
    OpenApiTypeCheckerBase.isObject(schema);

  export const isReference = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IReference =>
    OpenApiTypeCheckerBase.isReference(schema);

  export const isOneOf = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IOneOf => OpenApiTypeCheckerBase.isOneOf(schema);

  export const isRecursiveReference = (props: {
    $defs?: Record<string, ILlmSchemaV3_1>;
    schema: ILlmSchemaV3_1;
  }): boolean =>
    OpenApiTypeCheckerBase.isRecursiveReference({
      prefix: "#/$defs/",
      components: {
        schemas: props.$defs,
      },
      schema: props.schema,
    });

  /* -----------------------------------------------------------
    OPERATORS
  ----------------------------------------------------------- */
  export const escape = (props: {
    $defs?: Record<string, ILlmSchemaV3_1>;
    schema: ILlmSchemaV3_1;
    recursive: false | number;
  }): ILlmSchemaV3_1 | null =>
    OpenApiTypeCheckerBase.escape({
      prefix: "#/$defs/",
      components: {
        schemas: props.$defs,
      },
      schema: props.schema,
      recursive: props.recursive,
    }) as ILlmSchemaV3_1 | null;

  export const visit = (props: {
    closure: (schema: ILlmSchemaV3_1) => void;
    $defs?: Record<string, ILlmSchemaV3_1>;
    schema: ILlmSchemaV3_1;
  }): void =>
    OpenApiTypeCheckerBase.visit({
      prefix: "#/$defs/",
      closure: props.closure as (schema: OpenApi.IJsonSchema) => void,
      components: {
        schemas: props.$defs,
      },
      schema: props.schema,
    });

  export const covers = (props: {
    $defs?: Record<string, ILlmSchemaV3_1>;
    x: ILlmSchemaV3_1;
    y: ILlmSchemaV3_1;
  }): boolean =>
    OpenApiTypeCheckerBase.covers({
      prefix: "#/$defs/",
      components: {
        schemas: props.$defs,
      },
      x: props.x,
      y: props.y,
    });
}
