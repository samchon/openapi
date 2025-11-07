import { IGeminiSchema } from "../structures/IGeminiSchema";
import { MapUtil } from "./MapUtil";
import { OpenApiTypeCheckerBase } from "./internal/OpenApiTypeCheckerBase";

/**
 * Type checker for Gemini type schema.
 *
 * `GeminiTypeChecker` is a type checker of {@link IGeminiSchema}.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export namespace GeminiTypeChecker {
  /* -----------------------------------------------------------
    TYPE CHECKERS
  ----------------------------------------------------------- */
  /**
   * Test whether the schema is a null type.
   *
   * @param schema Target schema
   * @returns Whether null type or not
   */
  export const isNull = (
    schema: IGeminiSchema,
  ): schema is IGeminiSchema.INull =>
    (schema as IGeminiSchema.INull).type === "null";

  /**
   * Test whether the schema is an unknown type.
   *
   * @param schema Target schema
   * @returns Whether unknown type or not
   */
  export const isUnknown = (
    schema: IGeminiSchema,
  ): schema is IGeminiSchema.IUnknown =>
    (schema as IGeminiSchema.IUnknown).type === undefined &&
    !isAnyOf(schema) &&
    !isReference(schema);

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
    (schema as IGeminiSchema.IArray).type === "array" &&
    (schema as IGeminiSchema.IArray).items !== undefined;

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
   * Test whether the schema is a reference type.
   *
   * @param schema Target schema
   * @returns Whether reference type or not
   */
  export const isReference = (
    schema: IGeminiSchema,
  ): schema is IGeminiSchema.IReference => (schema as any).$ref !== undefined;

  /**
   * Test whether the schema is an union type.
   *
   * @param schema Target schema
   * @returns Whether union type or not
   */
  export const isAnyOf = (
    schema: IGeminiSchema,
  ): schema is IGeminiSchema.IAnyOf =>
    (schema as IGeminiSchema.IAnyOf).anyOf !== undefined;

  /* -----------------------------------------------------------
    OPERATORS
  ----------------------------------------------------------- */
  /**
   * Visit every nested schemas.
   *
   * Visit every nested schemas of the target, and apply the `props.closure`
   * function.
   *
   * Here is the list of occurring nested visitings:
   *
   * - {@link IGeminiSchema.IAnyOf.anyOf}
   * - {@link IGeminiSchema.IReference}
   * - {@link IGeminiSchema.IObject.properties}
   * - {@link IGeminiSchema.IArray.items}
   *
   * @param props Properties for visiting
   */
  export const visit = (props: {
    closure: (schema: IGeminiSchema, accessor: string) => void;
    $defs?: Record<string, IGeminiSchema> | undefined;
    schema: IGeminiSchema;
    accessor?: string;
    refAccessor?: string;
  }): void => {
    const already: Set<string> = new Set();
    const refAccessor: string = props.refAccessor ?? "$input.$defs";
    const next = (schema: IGeminiSchema, accessor: string): void => {
      props.closure(schema, accessor);
      if (GeminiTypeChecker.isReference(schema)) {
        const key: string = schema.$ref.split("#/$defs/").pop()!;
        if (already.has(key) === true) return;
        already.add(key);
        const found: IGeminiSchema | undefined = props.$defs?.[key];
        if (found !== undefined) next(found, `${refAccessor}[${key}]`);
      } else if (GeminiTypeChecker.isAnyOf(schema))
        schema.anyOf.forEach((s, i) => next(s, `${accessor}.anyOf[${i}]`));
      else if (GeminiTypeChecker.isObject(schema)) {
        for (const [key, value] of Object.entries(schema.properties))
          next(value, `${accessor}.properties[${JSON.stringify(key)}]`);
        if (
          typeof schema.additionalProperties === "object" &&
          schema.additionalProperties !== null
        )
          next(schema.additionalProperties, `${accessor}.additionalProperties`);
      } else if (GeminiTypeChecker.isArray(schema))
        next(schema.items, `${accessor}.items`);
    };
    next(props.schema, props.accessor ?? "$input.schemas");
  };

  /**
   * Test whether the `x` schema covers the `y` schema.
   *
   * @param props Properties for testing
   * @returns Whether the `x` schema covers the `y` schema
   */
  export const covers = (props: {
    $defs?: Record<string, IGeminiSchema> | undefined;
    x: IGeminiSchema;
    y: IGeminiSchema;
  }): boolean =>
    coverStation({
      $defs: props.$defs,
      x: props.x,
      y: props.y,
      visited: new Map(),
    });

  const coverStation = (p: {
    $defs?: Record<string, IGeminiSchema> | undefined;
    visited: Map<IGeminiSchema, Map<IGeminiSchema, boolean>>;
    x: IGeminiSchema;
    y: IGeminiSchema;
  }): boolean => {
    const cache: boolean | undefined = p.visited.get(p.x)?.get(p.y);
    if (cache !== undefined) return cache;

    // FOR RECURSIVE CASE
    const nested: Map<IGeminiSchema, boolean> = MapUtil.take(p.visited)(p.x)(
      () => new Map(),
    );
    nested.set(p.y, true);

    // COMPUTE IT
    const result: boolean = coverSchema(p);
    nested.set(p.y, result);
    return result;
  };

  const coverSchema = (p: {
    $defs?: Record<string, IGeminiSchema> | undefined;
    visited: Map<IGeminiSchema, Map<IGeminiSchema, boolean>>;
    x: IGeminiSchema;
    y: IGeminiSchema;
  }): boolean => {
    // CHECK EQUALITY
    if (p.x === p.y) return true;
    else if (isReference(p.x) && isReference(p.y) && p.x.$ref === p.y.$ref)
      return true;

    // COMPARE WITH FLATTENING
    const alpha: IGeminiSchema[] = flatSchema(p.$defs, p.x);
    const beta: IGeminiSchema[] = flatSchema(p.$defs, p.y);
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
    $defs?: Record<string, IGeminiSchema> | undefined;
    visited: Map<IGeminiSchema, Map<IGeminiSchema, boolean>>;
    x: IGeminiSchema;
    y: IGeminiSchema;
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
    $defs?: Record<string, IGeminiSchema> | undefined;
    visited: Map<IGeminiSchema, Map<IGeminiSchema, boolean>>;
    x: IGeminiSchema.IArray;
    y: IGeminiSchema.IArray;
  }): boolean => {
    if (
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
      $defs: p.$defs,
      visited: p.visited,
      x: p.x.items,
      y: p.y.items,
    });
  }

  const coverObject = (p: {
    $defs?: Record<string, IGeminiSchema> | undefined;
    visited: Map<IGeminiSchema, Map<IGeminiSchema, boolean>>;
    x: IGeminiSchema.IObject;
    y: IGeminiSchema.IObject;
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
            $defs: p.$defs,
            visited: p.visited,
            x: p.x.additionalProperties,
            y: p.y.additionalProperties,
          })))
    )
      return false;
    return Object.entries(p.y.properties ?? {}).every(([key, b]) => {
      const a: IGeminiSchema | undefined = p.x.properties?.[key];
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
  };

  const coverBoolean = (
    x: IGeminiSchema.IBoolean,
    y: IGeminiSchema.IBoolean,
  ): boolean => {
    if (!!x.enum?.length)
      return !!y.enum?.length && y.enum.every((v) => x.enum!.includes(v));
    return true;
  };

  const coverInteger = (
    x: IGeminiSchema.IInteger,
    y: IGeminiSchema.IInteger,
  ): boolean => {
    if (!!x.enum?.length)
      return !!y.enum?.length && y.enum.every((v) => x.enum!.includes(v));
    return OpenApiTypeCheckerBase.coverInteger(x, y);
  };

  const coverNumber = (
    x: IGeminiSchema.INumber,
    y: IGeminiSchema.IInteger | IGeminiSchema.INumber,
  ): boolean => {
    if (!!x.enum?.length)
      return !!y.enum?.length && y.enum.every((v) => x.enum!.includes(v));
    return OpenApiTypeCheckerBase.coverNumber(x, y);
  };

  const coverString = (
    x: IGeminiSchema.IString,
    y: IGeminiSchema.IString,
  ): boolean => {
    if (!!x.enum?.length)
      return !!y.enum?.length && y.enum.every((v) => x.enum!.includes(v));
    return OpenApiTypeCheckerBase.coverString(x, y);
  };

  const flatSchema = (
    $defs: Record<string, IGeminiSchema> | undefined,
    schema: IGeminiSchema,
  ): IGeminiSchema[] => {
    schema = escapeReference($defs, schema);
    if (isAnyOf(schema))
      return schema.anyOf.map((v) => flatSchema($defs, v)).flat();
    return [schema];
  };

  const escapeReference = (
    $defs: Record<string, IGeminiSchema> | undefined,
    schema: IGeminiSchema,
  ): Exclude<IGeminiSchema, IGeminiSchema.IReference> =>
    isReference(schema)
      ? escapeReference($defs, $defs![schema.$ref.replace("#/$defs/", "")]!)
      : schema;
}
