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
    !isAnyOf(schema) &&
    !isReference(schema);

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

  export const isObject = (
    schema: IChatGptSchema,
  ): schema is IChatGptSchema.IObject =>
    (schema as IChatGptSchema.IObject).type === "object";

  export const isReference = (
    schema: IChatGptSchema,
  ): schema is IChatGptSchema.IReference => (schema as any).$ref !== undefined;

  export const isAnyOf = (
    schema: IChatGptSchema,
  ): schema is IChatGptSchema.IAnyOf =>
    (schema as IChatGptSchema.IAnyOf).anyOf !== undefined;

  /* -----------------------------------------------------------
    OPERATORS
  ----------------------------------------------------------- */
  export const visit = (props: {
    closure: (schema: IChatGptSchema, accessor: string) => void;
    $defs?: Record<string, IChatGptSchema> | undefined;
    schema: IChatGptSchema;
    accessor?: string;
    refAccessor?: string;
  }): void => {
    const already: Set<string> = new Set();
    const refAccessor: string = props.refAccessor ?? "$input.$defs";
    const next = (schema: IChatGptSchema, accessor: string): void => {
      props.closure(schema, accessor);
      if (ChatGptTypeChecker.isReference(schema)) {
        const key: string = schema.$ref.split("#/$defs/").pop()!;
        if (already.has(key) === true) return;
        already.add(key);
        const found: IChatGptSchema | undefined = props.$defs?.[key];
        if (found !== undefined) next(found, `${refAccessor}[${key}]`);
      } else if (ChatGptTypeChecker.isAnyOf(schema))
        schema.anyOf.forEach((s, i) => next(s, `${accessor}.anyOf[${i}]`));
      else if (ChatGptTypeChecker.isObject(schema))
        for (const [key, value] of Object.entries(schema.properties))
          next(value, `${accessor}.properties[${JSON.stringify(key)}]`);
      else if (ChatGptTypeChecker.isArray(schema))
        next(schema.items, `${accessor}.items`);
    };
    next(props.schema, props.accessor ?? "$input.schemas");
  };

  export const covers = (props: {
    $defs?: Record<string, IChatGptSchema> | undefined;
    x: IChatGptSchema;
    y: IChatGptSchema;
  }): boolean =>
    coverStation({
      $defs: props.$defs,
      x: props.x,
      y: props.y,
      visited: new Map(),
    });

  const coverStation = (p: {
    $defs?: Record<string, IChatGptSchema> | undefined;
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
    $defs?: Record<string, IChatGptSchema> | undefined;
    visited: Map<IChatGptSchema, Map<IChatGptSchema, boolean>>;
    x: IChatGptSchema;
    y: IChatGptSchema;
  }): boolean => {
    // CHECK EQUALITY
    if (p.x === p.y) return true;
    else if (isReference(p.x) && isReference(p.y) && p.x.$ref === p.y.$ref)
      return true;

    // COMPARE WITH FLATTENING
    const alpha: IChatGptSchema[] = flatSchema(p.$defs, p.x);
    const beta: IChatGptSchema[] = flatSchema(p.$defs, p.y);
    if (alpha.some((x) => isUnknown(x))) return true;
    else if (beta.some((x) => isUnknown(x))) return false;
    return beta.every((b) =>
      alpha.some((a) =>
        coverEscapedSchema({
          $defs: p.$defs,
          visited: p.visited,
          x: a,
          y: b,
        }),
      ),
    );
  };

  const coverEscapedSchema = (p: {
    $defs?: Record<string, IChatGptSchema> | undefined;
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
    else if (isBoolean(p.x)) return isBoolean(p.y) && coverBoolean(p.x, p.y);
    else if (isInteger(p.x)) return isInteger(p.y) && coverInteger(p.x, p.y);
    else if (isNumber(p.x)) return isNumber(p.y) && coverNumber(p.x, p.y);
    else if (isString(p.x)) return isString(p.y) && coverString(p.x, p.y);
    // INSTANCE CASE
    else if (isArray(p.x))
      return (
        isArray(p.y) &&
        coverArray({
          $defs: p.$defs,
          visited: p.visited,
          x: p.x,
          y: p.y,
        })
      );
    else if (isObject(p.x))
      return (
        isObject(p.y) &&
        coverObject({
          $defs: p.$defs,
          visited: p.visited,
          x: p.x,
          y: p.y,
        })
      );
    else if (isReference(p.x)) return isReference(p.y) && p.x.$ref === p.y.$ref;
    return false;
  };

  const coverArray = (p: {
    $defs?: Record<string, IChatGptSchema> | undefined;
    visited: Map<IChatGptSchema, Map<IChatGptSchema, boolean>>;
    x: IChatGptSchema.IArray;
    y: IChatGptSchema.IArray;
  }): boolean =>
    coverStation({
      $defs: p.$defs,
      visited: p.visited,
      x: p.x.items,
      y: p.y.items,
    });

  const coverObject = (p: {
    $defs?: Record<string, IChatGptSchema> | undefined;
    visited: Map<IChatGptSchema, Map<IChatGptSchema, boolean>>;
    x: IChatGptSchema.IObject;
    y: IChatGptSchema.IObject;
  }): boolean =>
    Object.entries(p.y.properties ?? {}).every(([key, b]) => {
      const a: IChatGptSchema | undefined = p.x.properties?.[key];
      if (a === undefined) return false;
      else if (
        (p.x.required?.includes(key) ?? false) === true &&
        (p.y.required?.includes(key) ?? false) === false
      )
        return false;
      return coverStation({
        $defs: p.$defs,
        visited: p.visited,
        x: a,
        y: b,
      });
    });

  const coverBoolean = (
    x: IChatGptSchema.IBoolean,
    y: IChatGptSchema.IBoolean,
  ): boolean => {
    if (!!x.enum?.length)
      return !!y.enum?.length && y.enum.every((v) => x.enum!.includes(v));
    return true;
  };

  const coverInteger = (
    x: IChatGptSchema.IInteger,
    y: IChatGptSchema.IInteger,
  ): boolean => {
    if (!!x.enum?.length)
      return !!y.enum?.length && y.enum.every((v) => x.enum!.includes(v));
    return x.type === y.type;
  };

  const coverNumber = (
    x: IChatGptSchema.INumber,
    y: IChatGptSchema.IInteger | IChatGptSchema.INumber,
  ): boolean => {
    if (!!x.enum?.length)
      return !!y.enum?.length && y.enum.every((v) => x.enum!.includes(v));
    return x.type === y.type || (x.type === "number" && y.type === "integer");
  };

  const coverString = (
    x: IChatGptSchema.IString,
    y: IChatGptSchema.IString,
  ): boolean => {
    if (!!x.enum?.length)
      return !!y.enum?.length && y.enum.every((v) => x.enum!.includes(v));
    return x.type === y.type;
  };

  const flatSchema = (
    $defs: Record<string, IChatGptSchema> | undefined,
    schema: IChatGptSchema,
  ): IChatGptSchema[] => {
    schema = escapeReference($defs, schema);
    if (isAnyOf(schema))
      return schema.anyOf.map((v) => flatSchema($defs, v)).flat();
    return [schema];
  };

  const escapeReference = (
    $defs: Record<string, IChatGptSchema> | undefined,
    schema: IChatGptSchema,
  ): Exclude<IChatGptSchema, IChatGptSchema.IReference> =>
    isReference(schema)
      ? escapeReference($defs, $defs![schema.$ref.replace("#/$defs/", "")]!)
      : schema;
}
