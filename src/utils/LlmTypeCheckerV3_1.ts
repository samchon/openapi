import { ILlmSchemaV3_1 } from "../structures/ILlmSchemaV3_1";
import { OpenApiTypeCheckerBase } from "./internal/OpenApiTypeCheckerBase";

export namespace LlmTypeCheckerV3_1 {
  /* -----------------------------------------------------------
    TYPE CHECKERS
  ----------------------------------------------------------- */
  /**
   * Test whether the schema is a nul type.
   *
   * @param schema Target schema
   * @returns Whether null type or not
   */
  export const isNull = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.INull => OpenApiTypeCheckerBase.isNull(schema);

  /**
   * Test whether the schema is an unknown type.
   *
   * @param schema Target schema
   * @returns Whether unknown type or not
   */
  export const isUnknown = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IUnknown =>
    OpenApiTypeCheckerBase.isUnknown(schema);

  /**
   * Test whether the schema is a constant type.
   *
   * @param schema Target schema
   * @returns Whether constant type or not
   */
  export const isConstant = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IConstant =>
    OpenApiTypeCheckerBase.isConstant(schema);

  /**
   * Test whether the schema is a boolean type.
   *
   * @param schema Target schema
   * @returns Whether boolean type or not
   */
  export const isBoolean = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IBoolean =>
    OpenApiTypeCheckerBase.isBoolean(schema);

  /**
   * Test whether the schema is an integer type.
   *
   * @param schema Target schema
   * @returns Whether integer type or not
   */
  export const isInteger = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IInteger =>
    OpenApiTypeCheckerBase.isInteger(schema);

  /**
   * Test whether the schema is a number type.
   *
   * @param schema Target schema
   * @returns Whether number type or not
   */
  export const isNumber = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.INumber =>
    OpenApiTypeCheckerBase.isNumber(schema);

  /**
   * Test whether the schema is a string type.
   *
   * @param schema Target schema
   * @returns Whether string type or not
   */
  export const isString = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IString =>
    OpenApiTypeCheckerBase.isString(schema);

  /**
   * Test whether the schema is an array type.
   *
   * @param schema Target schema
   * @returns Whether array type or not
   */
  export const isArray = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IArray => OpenApiTypeCheckerBase.isArray(schema);

  /**
   * Test whether the schema is an object type.
   *
   * @param schema Target schema
   * @returns Whether object type or not
   */
  export const isObject = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IObject =>
    OpenApiTypeCheckerBase.isObject(schema);

  /**
   * Test whether the schema is a reference type.
   *
   * @param schema Target schema
   * @returns Whether reference type or not
   */
  export const isReference = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IReference =>
    OpenApiTypeCheckerBase.isReference(schema);

  /**
   * Test whether the schema is an union type.
   *
   * @param schema Target schema
   * @returns Whether union type or not
   */
  export const isOneOf = (
    schema: ILlmSchemaV3_1,
  ): schema is ILlmSchemaV3_1.IOneOf => OpenApiTypeCheckerBase.isOneOf(schema);

  /**
   * Test whether the schema is recursive reference type.
   *
   * Test whether the target schema is a reference type, and test one thing more
   * that the reference is self-recursive or not.
   *
   * @param props Properties for recursive reference test
   * @returns Whether the schema is recursive reference type or not
   */
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
  /**
   * Test whether the `x` schema covers the `y` schema.
   *
   * @param props Properties for testing
   * @returns Whether the `x` schema covers the `y` schema
   */
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

  /**
   * Visit every nested schemas.
   *
   * Visit every nested schemas of the target, and apply the `props.closure`
   * function.
   *
   * Here is the list of occurring nested visitings:
   *
   * - {@link ILlmSchemaV3_1.IOneOf.oneOf}
   * - {@link ILlmSchemaV3_1.IReference}
   * - {@link ILlmSchemaV3_1.IObject.properties}
   * - {@link ILlmSchemaV3_1.IObject.additionalProperties}
   * - {@link ILlmSchemaV3_1.IArray.items}
   *
   * @param props Properties for visiting
   */
  export const visit = (props: {
    closure: (schema: ILlmSchemaV3_1, accessor: string) => void;
    $defs?: Record<string, ILlmSchemaV3_1>;
    schema: ILlmSchemaV3_1;
  }): void =>
    OpenApiTypeCheckerBase.visit({
      prefix: "#/$defs/",
      components: {
        schemas: props.$defs,
      },
      closure: props.closure as any,
      schema: props.schema,
    });
}
