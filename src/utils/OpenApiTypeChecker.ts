import { OpenApi } from "../OpenApi";
import { MapUtil } from "./MapUtil";

export namespace OpenApiTypeChecker {
  export const visit =
    (closure: (schema: OpenApi.IJsonSchema) => void) =>
    (components: OpenApi.IComponents) => {
      const already: Set<string> = new Set();
      const next = (schema: OpenApi.IJsonSchema): void => {
        closure(schema);
        if (OpenApiTypeChecker.isReference(schema)) {
          const key: string = schema.$ref.split("#/components/schemas/").pop()!;
          if (already.has(key) === true) return;
          already.add(key);
          const found: OpenApi.IJsonSchema | undefined =
            components.schemas?.[key];
          if (found !== undefined) next(found);
        } else if (OpenApiTypeChecker.isOneOf(schema))
          schema.oneOf.forEach(next);
        else if (OpenApiTypeChecker.isObject(schema)) {
          for (const value of Object.values(schema.properties ?? {}))
            next(value);
          if (
            typeof schema.additionalProperties === "object" &&
            schema.additionalProperties !== null
          )
            next(schema.additionalProperties);
        } else if (OpenApiTypeChecker.isArray(schema)) next(schema.items);
        else if (OpenApiTypeChecker.isTuple(schema)) {
          (schema.prefixItems ?? []).forEach(next);
          if (
            typeof schema.additionalItems === "object" &&
            schema.additionalItems !== null
          )
            next(schema.additionalItems);
        }
      };
      return next;
    };

  /* -----------------------------------------------------------
    TYPE CHECKERS
  ----------------------------------------------------------- */
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

  /* -----------------------------------------------------------
    OPERATORS
  ----------------------------------------------------------- */
  export const covers = (
    components: OpenApi.IComponents,
  ): ((x: OpenApi.IJsonSchema, y: OpenApi.IJsonSchema) => boolean) =>
    coverStation(components)(new Map());

  const coverStation =
    (components: OpenApi.IComponents) =>
    (visited: Map<OpenApi.IJsonSchema, Map<OpenApi.IJsonSchema, boolean>>) =>
    (x: OpenApi.IJsonSchema, y: OpenApi.IJsonSchema): boolean => {
      const cache: boolean | undefined = visited.get(x)?.get(y);
      if (cache !== undefined) return cache;

      // FOR RECURSIVE CASE
      const nested: Map<OpenApi.IJsonSchema, boolean> = MapUtil.take(visited)(
        x,
      )(() => new Map());
      nested.set(y, true);

      // COMPUTE IT
      const result: boolean = coverSchema(components)(visited)(x, y);
      nested.set(y, result);
      return result;
    };

  const coverSchema =
    (components: OpenApi.IComponents) =>
    (visited: Map<OpenApi.IJsonSchema, Map<OpenApi.IJsonSchema, boolean>>) =>
    (x: OpenApi.IJsonSchema, y: OpenApi.IJsonSchema): boolean => {
      // CHECK EQUALITY
      if (x === y) return true;
      else if (isReference(x) && isReference(y) && x.$ref === y.$ref)
        return true;

      // COMPARE WITH FLATTENING
      const alpha: OpenApi.IJsonSchema[] = flatSchema(components)(x);
      const beta: OpenApi.IJsonSchema[] = flatSchema(components)(y);
      if (alpha.some((x) => isUnknown(x))) return true;
      else if (beta.some((x) => isUnknown(x))) return false;
      return beta.every((b) =>
        alpha.some((a) => coverEscapedSchema(components)(visited)(a, b)),
      );
    };

  const coverEscapedSchema =
    (components: OpenApi.IComponents) =>
    (visited: Map<OpenApi.IJsonSchema, Map<OpenApi.IJsonSchema, boolean>>) =>
    (x: OpenApi.IJsonSchema, y: OpenApi.IJsonSchema): boolean => {
      // CHECK EQUALITY
      if (x === y) return true;
      else if (isUnknown(x)) return true;
      else if (isUnknown(y)) return false;
      else if (isNull(x)) return isNull(y);
      // ATOMIC CASE
      else if (isConstant(x)) return isConstant(y) && x.const === y.const;
      else if (isBoolean(x))
        return isBoolean(y) || (isConstant(y) && typeof y.const === "boolean");
      else if (isInteger(x))
        return (isInteger(y) || isConstant(y)) && coverInteger(x, y);
      else if (isNumber(x))
        return (
          (isConstant(y) || isInteger(y) || isNumber(y)) && coverNumber(x, y)
        );
      else if (isString(x))
        return (isConstant(y) || isString(y)) && coverString(x, y);
      // INSTANCE CASE
      else if (isArray(x))
        return (
          (isArray(y) || isTuple(y)) && coverArray(components)(visited)(x, y)
        );
      else if (isObject(x))
        return isObject(y) && coverObject(components)(visited)(x, y);
      else if (isReference(x)) return isReference(y) && x.$ref === y.$ref;
      return false;
    };

  const coverArray =
    (components: OpenApi.IComponents) =>
    (visited: Map<OpenApi.IJsonSchema, Map<OpenApi.IJsonSchema, boolean>>) =>
    (
      x: OpenApi.IJsonSchema.IArray,
      y: OpenApi.IJsonSchema.IArray | OpenApi.IJsonSchema.ITuple,
    ): boolean => {
      if (isTuple(y))
        return (
          y.prefixItems.every((v) =>
            coverStation(components)(visited)(x.items, v),
          ) &&
          (y.additionalItems === undefined ||
            (typeof y.additionalItems === "object" &&
              coverStation(components)(visited)(x.items, y.additionalItems)))
        );
      else if (
        !(
          x.minItems === undefined ||
          (y.minItems !== undefined && x.minItems <= y.minItems)
        )
      )
        return false;
      else if (
        !(
          x.maxItems === undefined ||
          (y.maxItems !== undefined && x.maxItems >= y.maxItems)
        )
      )
        return false;
      return coverStation(components)(visited)(x.items, y.items);
    };

  const coverObject =
    (components: OpenApi.IComponents) =>
    (visited: Map<OpenApi.IJsonSchema, Map<OpenApi.IJsonSchema, boolean>>) =>
    (
      x: OpenApi.IJsonSchema.IObject,
      y: OpenApi.IJsonSchema.IObject,
    ): boolean => {
      if (!x.additionalProperties && !!y.additionalProperties) return false;
      else if (
        !!x.additionalProperties &&
        !!y.additionalProperties &&
        ((typeof x.additionalProperties === "object" &&
          y.additionalProperties === true) ||
          (typeof x.additionalProperties === "object" &&
            typeof y.additionalProperties === "object" &&
            !coverStation(components)(visited)(
              x.additionalProperties,
              y.additionalProperties,
            )))
      )
        return false;
      return Object.entries(y.properties ?? {}).every(([key, b]) => {
        const a: OpenApi.IJsonSchema | undefined = x.properties?.[key];
        if (a === undefined) return false;
        else if (
          (x.required?.includes(key) ?? false) === true &&
          (y.required?.includes(key) ?? false) === false
        )
          return false;
        return coverStation(components)(visited)(a, b);
      });
    };

  const coverInteger = (
    x: OpenApi.IJsonSchema.IInteger,
    y: OpenApi.IJsonSchema.IConstant | OpenApi.IJsonSchema.IInteger,
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
    x: OpenApi.IJsonSchema.INumber,
    y:
      | OpenApi.IJsonSchema.IConstant
      | OpenApi.IJsonSchema.IInteger
      | OpenApi.IJsonSchema.INumber,
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
    x: OpenApi.IJsonSchema.IString,
    y: OpenApi.IJsonSchema.IConstant | OpenApi.IJsonSchema.IString,
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
    x: Required<OpenApi.IJsonSchema.IString>["format"],
    y: Required<OpenApi.IJsonSchema.IString>["format"],
  ): boolean =>
    x === y ||
    (x === "idn-email" && y === "email") ||
    (x === "idn-hostname" && y === "hostname") ||
    (["uri", "iri"].includes(x) && y === "url") ||
    (x === "iri" && y === "uri") ||
    (x === "iri-reference" && y === "uri-reference");

  const flatSchema =
    (components: OpenApi.IComponents) =>
    (schema: OpenApi.IJsonSchema): OpenApi.IJsonSchema[] => {
      schema = escapeReference(components)(schema);
      if (isOneOf(schema))
        return schema.oneOf.map(flatSchema(components)).flat();
      return [schema];
    };

  const escapeReference =
    (components: OpenApi.IComponents) =>
    (
      schema: OpenApi.IJsonSchema,
    ): Exclude<OpenApi.IJsonSchema, OpenApi.IJsonSchema.IReference> =>
      isReference(schema)
        ? escapeReference(components)(
            components.schemas![
              schema.$ref.replace("#/components/schemas/", "")
            ],
          )
        : schema;
}
