import { IGeminiSchema } from "../structures/IGeminiSchema";

/**
 * Type checker for Gemini type schema.
 *
 * `GeminiTypeChecker` is a type checker of {@link IGeminiSchema}.
 *
 * @author Samchon
 */
export namespace GeminiTypeChecker {
  /* -----------------------------------------------------------
    OPERATORS
  ----------------------------------------------------------- */
  /**
   * Visit every nested schemas.
   *
   * Visit every nested schemas of the target, and apply the `props.closure` function.
   *
   * Here is the list of occuring nested visitings:
   *
   * - {@link IGeminiSchema.IObject.properties}
   * - {@link IGeminiSchema.IArray.items}
   *
   * @param props Properties for visiting
   */
  export const visit = (props: {
    closure: (schema: IGeminiSchema, accessor: string) => void;
    schema: IGeminiSchema;
    accessor?: string;
  }): void => {
    const accessor: string = props.accessor ?? "$input.schema";
    props.closure(props.schema, accessor);
    if (isObject(props.schema))
      Object.entries(props.schema.properties ?? {}).forEach(([key, value]) =>
        visit({
          closure: props.closure,
          schema: value,
          accessor: `${accessor}.properties[${JSON.stringify(key)}]`,
        }),
      );
    else if (isArray(props.schema))
      visit({
        closure: props.closure,
        schema: props.schema.items,
        accessor: `${accessor}.items`,
      });
  };

  /**
   * Test whether the `x` schema covers the `y` schema.
   *
   * @param props Properties for testing
   * @returns Whether the `x` schema covers the `y` schema
   */
  export const covers = (x: IGeminiSchema, y: IGeminiSchema): boolean => {
    // CHECK EQUALITY
    if (x === y) return true;
    else if (isUnknown(x)) return true;
    else if (isUnknown(y)) return false;
    else if (isNullOnly(x)) return isNullOnly(y);
    else if (isNullOnly(y)) return x.nullable === true;
    else if (x.nullable === true && !!y.nullable === false) return false;
    // ATOMIC CASE
    else if (isBoolean(x)) return isBoolean(y) && coverBoolean(x, y);
    else if (isInteger(x)) return isInteger(y) && coverInteger(x, y);
    else if (isNumber(x))
      return (isNumber(y) || isInteger(y)) && coverNumber(x, y);
    else if (isString(x)) return isString(y) && covertString(x, y);
    // INSTANCE CASE
    else if (isArray(x)) return isArray(y) && coverArray(x, y);
    else if (isObject(x)) return isObject(y) && coverObject(x, y);
    return false;
  };

  /**
   * @internal
   */
  const coverBoolean = (
    x: IGeminiSchema.IBoolean,
    y: IGeminiSchema.IBoolean,
  ): boolean =>
    x.enum === undefined ||
    (y.enum !== undefined && x.enum.every((v) => y.enum!.includes(v)));

  /**
   * @internal
   */
  const coverInteger = (
    x: IGeminiSchema.IInteger,
    y: IGeminiSchema.IInteger,
  ): boolean => {
    if (x.enum !== undefined)
      return y.enum !== undefined && x.enum.every((v) => y.enum!.includes(v));
    return x.type === y.type;
  };

  /**
   * @internal
   */
  const coverNumber = (
    x: IGeminiSchema.INumber,
    y: IGeminiSchema.INumber | IGeminiSchema.IInteger,
  ): boolean => {
    if (x.enum !== undefined)
      return y.enum !== undefined && x.enum.every((v) => y.enum!.includes(v));
    return x.type === y.type;
  };

  /**
   * @internal
   */
  const covertString = (
    x: IGeminiSchema.IString,
    y: IGeminiSchema.IString,
  ): boolean => {
    if (x.enum !== undefined)
      return y.enum !== undefined && x.enum.every((v) => y.enum!.includes(v));
    return x.type === y.type;
  };

  /**
   * @internal
   */
  const coverArray = (
    x: IGeminiSchema.IArray,
    y: IGeminiSchema.IArray,
  ): boolean => covers(x.items, y.items);

  /**
   * @internal
   */
  const coverObject = (
    x: IGeminiSchema.IObject,
    y: IGeminiSchema.IObject,
  ): boolean =>
    Object.entries(y.properties ?? {}).every(([key, b]) => {
      const a: IGeminiSchema | undefined = x.properties?.[key];
      if (a === undefined) return false;
      else if (
        (x.required?.includes(key) ?? false) === true &&
        (y.required?.includes(key) ?? false) === false
      )
        return false;
      return covers(a, b);
    });

  /* -----------------------------------------------------------
    TYPE CHECKERS
  ----------------------------------------------------------- */
  /**
   * Test whether the schema is a boolean type.
   *
   * @param schema Target schema
   * @returns Whether boolean type or not
   */
  export const isBoolean = (
    schema: IGeminiSchema,
  ): schema is IGeminiSchema.IBoolean =>
    (schema as IGeminiSchema.IBoolean).type === "boolean";

  /**
   * Test whether the schema is an integer type.
   *
   * @param schema Target schema
   * @returns Whether integer type or not
   */
  export const isInteger = (
    schema: IGeminiSchema,
  ): schema is IGeminiSchema.IInteger =>
    (schema as IGeminiSchema.IInteger).type === "integer";

  /**
   * Test whether the schema is a number type.
   *
   * @param schema Target schema
   * @returns Whether number type or not
   */
  export const isNumber = (
    schema: IGeminiSchema,
  ): schema is IGeminiSchema.INumber =>
    (schema as IGeminiSchema.INumber).type === "number";

  /**
   * Test whether the schema is a string type.
   *
   * @param schema Target schema
   * @returns Whether string type or not
   */
  export const isString = (
    schema: IGeminiSchema,
  ): schema is IGeminiSchema.IString =>
    (schema as IGeminiSchema.IString).type === "string";

  /**
   * Test whether the schema is an array type.
   *
   * @param schema Target schema
   * @returns Whether array type or not
   */
  export const isArray = (
    schema: IGeminiSchema,
  ): schema is IGeminiSchema.IArray =>
    (schema as IGeminiSchema.IArray).type === "array";

  /**
   * Test whether the schema is an object type.
   *
   * @param schema Target schema
   * @returns Whether object type or not
   */
  export const isObject = (
    schema: IGeminiSchema,
  ): schema is IGeminiSchema.IObject =>
    (schema as IGeminiSchema.IObject).type === "object";

  /**
   * Test whether the schema is a null type.
   *
   * @param schema Target schema
   * @returns Whether null type or not
   */
  export const isNullOnly = (
    schema: IGeminiSchema,
  ): schema is IGeminiSchema.INullOnly =>
    (schema as IGeminiSchema.INullOnly).type === "null";

  /**
   * Test whether the schema is a nullable type.
   *
   * @param schema Target schema
   * @returns Whether nullable type or not
   */
  export const isNullable = (schema: IGeminiSchema): boolean =>
    !isUnknown(schema) && (isNullOnly(schema) || schema.nullable === true);

  /**
   * Test whether the schema is an unknown type.
   *
   * @param schema Target schema
   * @returns Whether unknown type or not
   */
  export const isUnknown = (
    schema: IGeminiSchema,
  ): schema is IGeminiSchema.IUnknown =>
    (schema as IGeminiSchema.IUnknown).type === undefined;
}
