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
  export const visit = (
    schema: IGeminiSchema,
    closure: (schema: IGeminiSchema) => void,
  ): void => {
    closure(schema);
    if (isObject(schema)) {
      Object.values(schema.properties ?? {}).forEach((child) =>
        visit(child, closure),
      );
    } else if (isArray(schema)) visit(schema.items, closure);
  };

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
    return [
      x.type === y.type,
      // x.minimum === undefined ||
      //   (y.minimum !== undefined && x.minimum <= y.minimum),
      // x.maximum === undefined ||
      //   (y.maximum !== undefined && x.maximum >= y.maximum),
      // x.exclusiveMinimum !== true ||
      //   x.minimum === undefined ||
      //   (y.minimum !== undefined &&
      //     (y.exclusiveMinimum === true || x.minimum < y.minimum)),
      // x.exclusiveMaximum !== true ||
      //   x.maximum === undefined ||
      //   (y.maximum !== undefined &&
      //     (y.exclusiveMaximum === true || x.maximum > y.maximum)),
      // x.multipleOf === undefined ||
      //   (y.multipleOf !== undefined &&
      //     y.multipleOf / x.multipleOf ===
      //       Math.floor(y.multipleOf / x.multipleOf)),
    ].every((v) => v);
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
    return [
      x.type === y.type,
      // x.minimum === undefined ||
      //   (y.minimum !== undefined && x.minimum <= y.minimum),
      // x.maximum === undefined ||
      //   (y.maximum !== undefined && x.maximum >= y.maximum),
      // x.exclusiveMinimum !== true ||
      //   x.minimum === undefined ||
      //   (y.minimum !== undefined &&
      //     (y.exclusiveMinimum === true || x.minimum < y.minimum)),
      // x.exclusiveMaximum !== true ||
      //   x.maximum === undefined ||
      //   (y.maximum !== undefined &&
      //     (y.exclusiveMaximum === true || x.maximum > y.maximum)),
      // x.multipleOf === undefined ||
      //   (y.multipleOf !== undefined &&
      //     y.multipleOf / x.multipleOf ===
      //       Math.floor(y.multipleOf / x.multipleOf)),
    ].every((v) => v);
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
    return [
      x.type === y.type,
      // x.format === undefined ||
      //   (y.format !== undefined && coverFormat(x.format, y.format)),
      // x.pattern === undefined || x.pattern === y.pattern,
      // x.minLength === undefined ||
      //   (y.minLength !== undefined && x.minLength <= y.minLength),
      // x.maxLength === undefined ||
      //   (y.maxLength !== undefined && x.maxLength >= y.maxLength),
    ].every((v) => v);
  };

  // /**
  //  * @internal
  //  */
  // const coverFormat = (
  //   x: Required<IGeminiSchema.IString>["format"],
  //   y: Required<IGeminiSchema.IString>["format"],
  // ): boolean =>
  //   x === y ||
  //   (x === "idn-email" && y === "email") ||
  //   (x === "idn-hostname" && y === "hostname") ||
  //   (["uri", "iri"].includes(x) && y === "url") ||
  //   (x === "iri" && y === "uri") ||
  //   (x === "iri-reference" && y === "uri-reference");

  /**
   * @internal
   */
  const coverArray = (
    x: IGeminiSchema.IArray,
    y: IGeminiSchema.IArray,
  ): boolean => {
    // if (
    //   !(
    //     x.minItems === undefined ||
    //     (y.minItems !== undefined && x.minItems <= y.minItems)
    //   )
    // )
    //   return false;
    // else if (
    //   !(
    //     x.maxItems === undefined ||
    //     (y.maxItems !== undefined && x.maxItems >= y.maxItems)
    //   )
    // )
    //   return false;
    return covers(x.items, y.items);
  };

  /**
   * @internal
   */
  const coverObject = (
    x: IGeminiSchema.IObject,
    y: IGeminiSchema.IObject,
  ): boolean => {
    return Object.entries(y.properties ?? {}).every(([key, b]) => {
      const a: IGeminiSchema | undefined = x.properties?.[key];
      if (a === undefined) return false;
      else if (
        (x.required?.includes(key) ?? false) === true &&
        (y.required?.includes(key) ?? false) === false
      )
        return false;
      return covers(a, b);
    });
  };

  /* -----------------------------------------------------------
    TYPE CHECKERS
  ----------------------------------------------------------- */
  export const isBoolean = (
    schema: IGeminiSchema,
  ): schema is IGeminiSchema.IBoolean =>
    (schema as IGeminiSchema.IBoolean).type === "boolean";

  export const isInteger = (
    schema: IGeminiSchema,
  ): schema is IGeminiSchema.IInteger =>
    (schema as IGeminiSchema.IInteger).type === "integer";

  export const isNumber = (
    schema: IGeminiSchema,
  ): schema is IGeminiSchema.INumber =>
    (schema as IGeminiSchema.INumber).type === "number";

  export const isString = (
    schema: IGeminiSchema,
  ): schema is IGeminiSchema.IString =>
    (schema as IGeminiSchema.IString).type === "string";

  export const isArray = (
    schema: IGeminiSchema,
  ): schema is IGeminiSchema.IArray =>
    (schema as IGeminiSchema.IArray).type === "array";

  export const isObject = (
    schema: IGeminiSchema,
  ): schema is IGeminiSchema.IObject =>
    (schema as IGeminiSchema.IObject).type === "object";

  export const isNullOnly = (
    schema: IGeminiSchema,
  ): schema is IGeminiSchema.INullOnly =>
    (schema as IGeminiSchema.INullOnly).type === "null";

  export const isUnknown = (
    schema: IGeminiSchema,
  ): schema is IGeminiSchema.IUnknown =>
    (schema as IGeminiSchema.IUnknown).type === undefined;
}
