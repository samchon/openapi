import { IChatGptSchema } from "../structures/IChatGptSchema";
import { MapUtil } from "./MapUtil";

export namespace ChatGptTypeChecker {
  /* -----------------------------------------------------------
    TYPE CHECKERS
  ----------------------------------------------------------- */
  export const isNull = (
    schema: IChatGptSchema,
  ): schema is IChatGptSchema.INull =>
    (schema as IChatGptSchema.INull).type === "null";
  export const isUnknown = (
    schema: IChatGptSchema,
  ): schema is IChatGptSchema.IUnknown =>
    (schema as IChatGptSchema.IUnknown).type === undefined &&
    !isConstant(schema) &&
    !isOneOf(schema) &&
    !isReference(schema);

  export const isConstant = (
    schema: IChatGptSchema,
  ): schema is IChatGptSchema.IConstant =>
    (schema as IChatGptSchema.IConstant).const !== undefined;
  export const isBoolean = (
    schema: IChatGptSchema,
  ): schema is IChatGptSchema.IBoolean =>
    (schema as IChatGptSchema.IBoolean).type === "boolean";
  export const isInteger = (
    schema: IChatGptSchema,
  ): schema is IChatGptSchema.IInteger =>
    (schema as IChatGptSchema.IInteger).type === "integer";
  export const isNumber = (
    schema: IChatGptSchema,
  ): schema is IChatGptSchema.INumber =>
    (schema as IChatGptSchema.INumber).type === "number";
  export const isString = (
    schema: IChatGptSchema,
  ): schema is IChatGptSchema.IString =>
    (schema as IChatGptSchema.IString).type === "string";

  export const isArray = (
    schema: IChatGptSchema,
  ): schema is IChatGptSchema.IArray =>
    (schema as IChatGptSchema.IArray).type === "array" &&
    (schema as IChatGptSchema.IArray).items !== undefined;
  export const isTuple = (
    schema: IChatGptSchema,
  ): schema is IChatGptSchema.ITuple =>
    (schema as IChatGptSchema.ITuple).type === "array" &&
    (schema as IChatGptSchema.ITuple).prefixItems !== undefined;
  export const isObject = (
    schema: IChatGptSchema,
  ): schema is IChatGptSchema.IObject =>
    (schema as IChatGptSchema.IObject).type === "object";
  export const isReference = (
    schema: IChatGptSchema,
  ): schema is IChatGptSchema.IReference => (schema as any).$ref !== undefined;
  export const isOneOf = (
    schema: IChatGptSchema,
  ): schema is IChatGptSchema.IOneOf =>
    (schema as IChatGptSchema.IOneOf).oneOf !== undefined;

  /* -----------------------------------------------------------
    OPERATORS
  ----------------------------------------------------------- */
  export const visit = (props: {
    closure: (schema: IChatGptSchema) => void;
    top: IChatGptSchema.ITop;
    schema: IChatGptSchema;
  }): void => {
    const already: Set<string> = new Set();
    const next = (schema: IChatGptSchema): void => {
      props.closure(schema);
      if (ChatGptTypeChecker.isReference(schema)) {
        const key: string = schema.$ref.split("#/$defs/").pop()!;
        if (already.has(key) === true) return;
        already.add(key);
        const found: IChatGptSchema | undefined = props.top.$defs?.[key];
        if (found !== undefined) next(found);
      } else if (ChatGptTypeChecker.isOneOf(schema)) schema.oneOf.forEach(next);
      else if (ChatGptTypeChecker.isObject(schema)) {
        for (const value of Object.values(schema.properties ?? {})) next(value);
        if (
          typeof schema.additionalProperties === "object" &&
          schema.additionalProperties !== null
        )
          next(schema.additionalProperties);
      } else if (ChatGptTypeChecker.isArray(schema)) next(schema.items);
      else if (ChatGptTypeChecker.isTuple(schema)) {
        (schema.prefixItems ?? []).forEach(next);
        if (
          typeof schema.additionalItems === "object" &&
          schema.additionalItems !== null
        )
          next(schema.additionalItems);
      }
    };
    next(props.schema);
  };

  export const covers = (props: {
    top: IChatGptSchema.ITop;
    x: IChatGptSchema;
    y: IChatGptSchema;
  }): boolean =>
    coverStation({
      top: props.top,
      x: props.x,
      y: props.y,
      visited: new Map(),
    });

  const coverStation = (p: {
    top: IChatGptSchema.ITop;
    visited: Map<IChatGptSchema, Map<IChatGptSchema, boolean>>;
    x: IChatGptSchema;
    y: IChatGptSchema;
  }): boolean => {
    const cache: boolean | undefined = p.visited.get(p.x)?.get(p.y);
    if (cache !== undefined) return cache;

    // FOR RECURSIVE CASE
    const nested: Map<IChatGptSchema, boolean> = MapUtil.take(p.visited)(p.x)(
      () => new Map(),
    );
    nested.set(p.y, true);

    // COMPUTE IT
    const result: boolean = coverSchema(p);
    nested.set(p.y, result);
    return result;
  };

  const coverSchema = (p: {
    top: IChatGptSchema.ITop;
    visited: Map<IChatGptSchema, Map<IChatGptSchema, boolean>>;
    x: IChatGptSchema;
    y: IChatGptSchema;
  }): boolean => {
    // CHECK EQUALITY
    if (p.x === p.y) return true;
    else if (isReference(p.x) && isReference(p.y) && p.x.$ref === p.y.$ref)
      return true;

    // COMPARE WITH FLATTENING
    const alpha: IChatGptSchema[] = flatSchema(p.top, p.x);
    const beta: IChatGptSchema[] = flatSchema(p.top, p.y);
    if (alpha.some((x) => isUnknown(x))) return true;
    else if (beta.some((x) => isUnknown(x))) return false;
    return beta.every((b) =>
      alpha.some((a) =>
        coverEscapedSchema({
          top: p.top,
          visited: p.visited,
          x: a,
          y: b,
        }),
      ),
    );
  };

  const coverEscapedSchema = (p: {
    top: IChatGptSchema.ITop;
    visited: Map<IChatGptSchema, Map<IChatGptSchema, boolean>>;
    x: IChatGptSchema;
    y: IChatGptSchema;
  }): boolean => {
    // CHECK EQUALITY
    if (p.x === p.y) return true;
    else if (isUnknown(p.x)) return true;
    else if (isUnknown(p.y)) return false;
    else if (isNull(p.x)) return isNull(p.y);
    // ATOMIC CASE
    else if (isConstant(p.x)) return isConstant(p.y) && p.x.const === p.y.const;
    else if (isBoolean(p.x))
      return (
        isBoolean(p.y) || (isConstant(p.y) && typeof p.y.const === "boolean")
      );
    else if (isInteger(p.x))
      return (isInteger(p.y) || isConstant(p.y)) && coverInteger(p.x, p.y);
    else if (isNumber(p.x))
      return (
        (isConstant(p.y) || isInteger(p.y) || isNumber(p.y)) &&
        coverNumber(p.x, p.y)
      );
    else if (isString(p.x))
      return (isConstant(p.y) || isString(p.y)) && coverString(p.x, p.y);
    // INSTANCE CASE
    else if (isArray(p.x))
      return (
        (isArray(p.y) || isTuple(p.y)) &&
        coverArray({
          top: p.top,
          visited: p.visited,
          x: p.x,
          y: p.y,
        })
      );
    else if (isObject(p.x))
      return (
        isObject(p.y) &&
        coverObject({
          top: p.top,
          visited: p.visited,
          x: p.x,
          y: p.y,
        })
      );
    else if (isReference(p.x)) return isReference(p.y) && p.x.$ref === p.y.$ref;
    return false;
  };

  const coverArray = (p: {
    top: IChatGptSchema.ITop;
    visited: Map<IChatGptSchema, Map<IChatGptSchema, boolean>>;
    x: IChatGptSchema.IArray;
    y: IChatGptSchema.IArray | IChatGptSchema.ITuple;
  }): boolean => {
    if (isTuple(p.y))
      return (
        p.y.prefixItems.every((v) =>
          coverStation({
            top: p.top,
            visited: p.visited,
            x: p.x.items,
            y: v,
          }),
        ) &&
        (p.y.additionalItems === undefined ||
          (typeof p.y.additionalItems === "object" &&
            coverStation({
              top: p.top,
              visited: p.visited,
              x: p.x.items,
              y: p.y.additionalItems,
            })))
      );
    else if (
      !(
        p.x.minItems === undefined ||
        (p.y.minItems !== undefined && p.x.minItems <= p.y.minItems)
      )
    )
      return false;
    else if (
      !(
        p.x.maxItems === undefined ||
        (p.y.maxItems !== undefined && p.x.maxItems >= p.y.maxItems)
      )
    )
      return false;
    return coverStation({
      top: p.top,
      visited: p.visited,
      x: p.x.items,
      y: p.y.items,
    });
  };

  const coverObject = (p: {
    top: IChatGptSchema.ITop;
    visited: Map<IChatGptSchema, Map<IChatGptSchema, boolean>>;
    x: IChatGptSchema.IObject;
    y: IChatGptSchema.IObject;
  }): boolean => {
    if (!p.x.additionalProperties && !!p.y.additionalProperties) return false;
    else if (
      !!p.x.additionalProperties &&
      !!p.y.additionalProperties &&
      ((typeof p.x.additionalProperties === "object" &&
        p.y.additionalProperties === true) ||
        (typeof p.x.additionalProperties === "object" &&
          typeof p.y.additionalProperties === "object" &&
          !coverStation({
            top: p.top,
            visited: p.visited,
            x: p.x.additionalProperties,
            y: p.y.additionalProperties,
          })))
    )
      return false;
    return Object.entries(p.y.properties ?? {}).every(([key, b]) => {
      const a: IChatGptSchema | undefined = p.x.properties?.[key];
      if (a === undefined) return false;
      else if (
        (p.x.required?.includes(key) ?? false) === true &&
        (p.y.required?.includes(key) ?? false) === false
      )
        return false;
      return coverStation({
        top: p.top,
        visited: p.visited,
        x: a,
        y: b,
      });
    });
  };

  const coverInteger = (
    x: IChatGptSchema.IInteger,
    y: IChatGptSchema.IConstant | IChatGptSchema.IInteger,
  ): boolean => {
    if (isConstant(y))
      return typeof y.const === "number" && Number.isInteger(y.const);
    return [
      x.type === y.type,
      x.minimum === undefined ||
        (y.minimum !== undefined && x.minimum <= y.minimum),
      x.maximum === undefined ||
        (y.maximum !== undefined && x.maximum >= y.maximum),
      x.exclusiveMinimum !== true ||
        x.minimum === undefined ||
        (y.minimum !== undefined &&
          (y.exclusiveMinimum === true || x.minimum < y.minimum)),
      x.exclusiveMaximum !== true ||
        x.maximum === undefined ||
        (y.maximum !== undefined &&
          (y.exclusiveMaximum === true || x.maximum > y.maximum)),
      x.multipleOf === undefined ||
        (y.multipleOf !== undefined &&
          y.multipleOf / x.multipleOf ===
            Math.floor(y.multipleOf / x.multipleOf)),
    ].every((v) => v);
  };

  const coverNumber = (
    x: IChatGptSchema.INumber,
    y:
      | IChatGptSchema.IConstant
      | IChatGptSchema.IInteger
      | IChatGptSchema.INumber,
  ): boolean => {
    if (isConstant(y)) return typeof y.const === "number";
    return [
      x.type === y.type || (x.type === "number" && y.type === "integer"),
      x.minimum === undefined ||
        (y.minimum !== undefined && x.minimum <= y.minimum),
      x.maximum === undefined ||
        (y.maximum !== undefined && x.maximum >= y.maximum),
      x.exclusiveMinimum !== true ||
        x.minimum === undefined ||
        (y.minimum !== undefined &&
          (y.exclusiveMinimum === true || x.minimum < y.minimum)),
      x.exclusiveMaximum !== true ||
        x.maximum === undefined ||
        (y.maximum !== undefined &&
          (y.exclusiveMaximum === true || x.maximum > y.maximum)),
      x.multipleOf === undefined ||
        (y.multipleOf !== undefined &&
          y.multipleOf / x.multipleOf ===
            Math.floor(y.multipleOf / x.multipleOf)),
    ].every((v) => v);
  };

  const coverString = (
    x: IChatGptSchema.IString,
    y: IChatGptSchema.IConstant | IChatGptSchema.IString,
  ): boolean => {
    if (isConstant(y)) return typeof y.const === "string";
    return [
      x.format === undefined ||
        (y.format !== undefined && coverFormat(x.format, y.format)),
      x.pattern === undefined || x.pattern === y.pattern,
      x.minLength === undefined ||
        (y.minLength !== undefined && x.minLength <= y.minLength),
      x.maxLength === undefined ||
        (y.maxLength !== undefined && x.maxLength >= y.maxLength),
    ].every((v) => v);
  };

  const coverFormat = (
    x: Required<IChatGptSchema.IString>["format"],
    y: Required<IChatGptSchema.IString>["format"],
  ): boolean =>
    x === y ||
    (x === "idn-email" && y === "email") ||
    (x === "idn-hostname" && y === "hostname") ||
    (["uri", "iri"].includes(x) && y === "url") ||
    (x === "iri" && y === "uri") ||
    (x === "iri-reference" && y === "uri-reference");

  const flatSchema = (
    top: IChatGptSchema.ITop,
    schema: IChatGptSchema,
  ): IChatGptSchema[] => {
    schema = escapeReference(top, schema);
    if (isOneOf(schema))
      return schema.oneOf.map((v) => flatSchema(top, v)).flat();
    return [schema];
  };

  const escapeReference = (
    top: IChatGptSchema.ITop,
    schema: IChatGptSchema,
  ): Exclude<IChatGptSchema, IChatGptSchema.IReference> =>
    isReference(schema)
      ? escapeReference(top, top.$defs![schema.$ref.replace("#/$defs/", "")]!)
      : schema;
}
