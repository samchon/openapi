import { OpenApi } from "../../OpenApi";
import { MapUtil } from "../MapUtil";
import { JsonDescriptionUtil } from "./JsonDescriptionUtil";

/**
 * @internal
 */
export namespace OpenApiTypeCheckerBase {
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

  export const isRecursiveReference = (props: {
    prefix: string;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
  }): boolean => {
    if (isReference(props.schema) === false) return false;
    const current: string = props.schema.$ref.split(props.prefix)[1];
    let counter: number = 0;
    visit({
      prefix: props.prefix,
      components: props.components,
      schema: props.schema,
      closure: (schema) => {
        if (isReference(schema)) {
          const next: string = schema.$ref.split(props.prefix)[1];
          if (current === next) ++counter;
        }
      },
    });
    return counter > 1;
  };

  /* -----------------------------------------------------------
    OPERATORS
  ----------------------------------------------------------- */
  export const unreference = (props: {
    prefix: string;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
  }): OpenApi.IJsonSchema | null => {
    if (isReference(props.schema) === false) return props.schema;
    const key: string = props.schema.$ref.split(props.prefix).pop()!;
    const found: OpenApi.IJsonSchema | undefined =
      props.components.schemas?.[key];
    return found ? unreference({ ...props, schema: found }) : null;
  };

  export const escape = (props: {
    prefix: string;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    recursive: false | number;
  }): OpenApi.IJsonSchema | null =>
    escapeSchema({
      prefix: props.prefix,
      components: props.components,
      schema: props.schema,
      recursive: props.recursive,
      visited: new Map(),
    }) || null;

  export const visit = (props: {
    prefix: string;
    closure: (schema: OpenApi.IJsonSchema) => void;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
  }): void => {
    const already: Set<string> = new Set();
    const next = (schema: OpenApi.IJsonSchema): void => {
      props.closure(schema);
      if (isReference(schema)) {
        const key: string = schema.$ref.split(props.prefix).pop()!;
        if (already.has(key) === true) return;
        already.add(key);
        const found: OpenApi.IJsonSchema | undefined =
          props.components.schemas?.[key];
        if (found !== undefined) next(found);
      } else if (isOneOf(schema)) schema.oneOf.forEach(next);
      else if (isObject(schema)) {
        for (const value of Object.values(schema.properties ?? {})) next(value);
        if (
          typeof schema.additionalProperties === "object" &&
          schema.additionalProperties !== null
        )
          next(schema.additionalProperties);
      } else if (isArray(schema)) next(schema.items);
      else if (isTuple(schema)) {
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
    prefix: string;
    components: OpenApi.IComponents;
    x: OpenApi.IJsonSchema;
    y: OpenApi.IJsonSchema;
  }): boolean =>
    coverStation({
      prefix: props.prefix,
      components: props.components,
      x: props.x,
      y: props.y,
      visited: new Map(),
    });

  const escapeSchema = (props: {
    components: OpenApi.IComponents;
    prefix: string;
    schema: OpenApi.IJsonSchema;
    recursive: false | number;
    visited: Map<string, number>;
  }): OpenApi.IJsonSchema | null | undefined => {
    if (isReference(props.schema)) {
      // REFERENCE
      const name: string = props.schema.$ref.split(props.prefix)[1];
      const target: OpenApi.IJsonSchema | undefined =
        props.components.schemas?.[name];
      if (target === undefined) return null;
      else if (props.visited.has(name) === true) {
        if (props.recursive === false) return null;
        const depth: number = props.visited.get(name)!;
        if (depth > props.recursive) return undefined;
        props.visited.set(name, depth + 1);
        const res: OpenApi.IJsonSchema | null | undefined = escapeSchema({
          prefix: props.prefix,
          recursive: props.recursive,
          components: props.components,
          schema: target,
          visited: props.visited,
        });
        return res
          ? {
              ...res,
              description: JsonDescriptionUtil.cascade({
                prefix: props.prefix,
                components: props.components,
                $ref: props.schema.$ref,
                description: res.description,
                escape: true,
              }),
            }
          : res;
      }
      const res: OpenApi.IJsonSchema | null | undefined = escapeSchema({
        prefix: props.prefix,
        recursive: props.recursive,
        components: props.components,
        schema: target,
        visited: new Map([...props.visited, [name, 1]]),
      });
      return res
        ? {
            ...res,
            description: JsonDescriptionUtil.cascade({
              prefix: props.prefix,
              components: props.components,
              $ref: props.schema.$ref,
              description: res.description,
              escape: true,
            }),
          }
        : res;
    } else if (isOneOf(props.schema)) {
      // UNION
      const elements: Array<OpenApi.IJsonSchema | null | undefined> =
        props.schema.oneOf.map((schema) =>
          escapeSchema({
            prefix: props.prefix,
            recursive: props.recursive,
            components: props.components,
            schema: schema,
            visited: props.visited,
          }),
        );
      if (elements.some((v) => v === null)) return null;
      const filtered: OpenApi.IJsonSchema[] = elements.filter(
        (v) => v !== undefined,
      ) as OpenApi.IJsonSchema[];
      if (filtered.length === 0) return undefined;
      return {
        ...props,
        oneOf: filtered
          .map((v) =>
            flatSchema({
              prefix: props.prefix,
              components: props.components,
              schema: v,
            }),
          )
          .flat(),
      };
    } else if (isObject(props.schema)) {
      // OBJECT
      const object: OpenApi.IJsonSchema.IObject = props.schema;
      const properties: Array<
        [string, OpenApi.IJsonSchema | null | undefined]
      > = Object.entries(object.properties ?? {}).map(([key, value]) => [
        key,
        escapeSchema({
          prefix: props.prefix,
          recursive: props.recursive,
          components: props.components,
          schema: value,
          visited: props.visited,
        }),
      ]);
      const additionalProperties:
        | OpenApi.IJsonSchema
        | null
        | boolean
        | undefined = object.additionalProperties
        ? typeof object.additionalProperties === "object" &&
          object.additionalProperties !== null
          ? escapeSchema({
              prefix: props.prefix,
              recursive: props.recursive,
              components: props.components,
              schema: object.additionalProperties,
              visited: props.visited,
            })
          : object.additionalProperties
        : false;
      if (
        properties.some(([_k, v]) => v === null) ||
        additionalProperties === null
      )
        return null;
      else if (
        properties.some(
          ([k, v]) => v === undefined && object.required?.includes(k) === true,
        ) === true
      )
        return undefined;
      return {
        ...object,
        properties: Object.fromEntries(
          properties.filter(([_k, v]) => v !== undefined) as Array<
            [string, OpenApi.IJsonSchema]
          >,
        ),
        additionalProperties: additionalProperties ?? false,
        required:
          object.required?.filter((k) =>
            properties.some(([key, value]) => key === k && value !== undefined),
          ) ?? [],
      };
    } else if (isTuple(props.schema)) {
      // TUPLE
      const elements: Array<OpenApi.IJsonSchema | null | undefined> =
        props.schema.prefixItems.map((schema) =>
          escapeSchema({
            prefix: props.prefix,
            recursive: props.recursive,
            components: props.components,
            schema: schema,
            visited: props.visited,
          }),
        );
      const additionalItems: OpenApi.IJsonSchema | null | boolean | undefined =
        props.schema.additionalItems
          ? typeof props.schema.additionalItems === "object" &&
            props.schema.additionalItems !== null
            ? escapeSchema({
                prefix: props.prefix,
                recursive: props.recursive,
                components: props.components,
                schema: props.schema.additionalItems,
                visited: props.visited,
              })
            : props.schema.additionalItems
          : false;
      if (elements.some((v) => v === null) || additionalItems === null)
        return null;
      else if (elements.some((v) => v === undefined)) return undefined;
      return {
        ...props.schema,
        prefixItems: elements as OpenApi.IJsonSchema[],
        additionalItems: additionalItems ?? false,
      };
    } else if (isArray(props.schema)) {
      // ARRAY
      const items: OpenApi.IJsonSchema | null | undefined = escapeSchema({
        prefix: props.prefix,
        recursive: props.recursive,
        components: props.components,
        schema: props.schema.items,
        visited: props.visited,
      });
      if (items === null) return null;
      else if (items === undefined)
        return {
          ...props.schema,
          minItems: undefined,
          maxItems: 0,
          items: {},
        };
      return {
        ...props.schema,
        items: items,
      };
    }
    return props.schema;
  };

  const coverStation = (p: {
    prefix: string;
    components: OpenApi.IComponents;
    visited: Map<OpenApi.IJsonSchema, Map<OpenApi.IJsonSchema, boolean>>;
    x: OpenApi.IJsonSchema;
    y: OpenApi.IJsonSchema;
  }): boolean => {
    const cache: boolean | undefined = p.visited.get(p.x)?.get(p.y);
    if (cache !== undefined) return cache;

    // FOR RECURSIVE CASE
    const nested: Map<OpenApi.IJsonSchema, boolean> = MapUtil.take(p.visited)(
      p.x,
    )(() => new Map());
    nested.set(p.y, true);

    // COMPUTE IT
    const result: boolean = coverSchema(p);
    nested.set(p.y, result);
    return result;
  };

  const coverSchema = (p: {
    prefix: string;
    components: OpenApi.IComponents;
    visited: Map<OpenApi.IJsonSchema, Map<OpenApi.IJsonSchema, boolean>>;
    x: OpenApi.IJsonSchema;
    y: OpenApi.IJsonSchema;
  }): boolean => {
    // CHECK EQUALITY
    if (p.x === p.y) return true;
    else if (isReference(p.x) && isReference(p.y) && p.x.$ref === p.y.$ref)
      return true;

    // COMPARE WITH FLATTENING
    const alpha: OpenApi.IJsonSchema[] = flatSchema({
      prefix: p.prefix,
      components: p.components,
      schema: p.x,
    });
    const beta: OpenApi.IJsonSchema[] = flatSchema({
      prefix: p.prefix,
      components: p.components,
      schema: p.y,
    });
    if (alpha.some((x) => isUnknown(x))) return true;
    else if (beta.some((x) => isUnknown(x))) return false;
    return beta.every((b) =>
      alpha.some((a) =>
        coverEscapedSchema({
          prefix: p.prefix,
          components: p.components,
          visited: p.visited,
          x: a,
          y: b,
        }),
      ),
    );
  };

  const coverEscapedSchema = (p: {
    prefix: string;
    components: OpenApi.IComponents;
    visited: Map<OpenApi.IJsonSchema, Map<OpenApi.IJsonSchema, boolean>>;
    x: OpenApi.IJsonSchema;
    y: OpenApi.IJsonSchema;
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
          prefix: p.prefix,
          components: p.components,
          visited: p.visited,
          x: p.x,
          y: p.y,
        })
      );
    else if (isObject(p.x))
      return (
        isObject(p.y) &&
        coverObject({
          prefix: p.prefix,
          components: p.components,
          visited: p.visited,
          x: p.x,
          y: p.y,
        })
      );
    else if (isReference(p.x)) return isReference(p.y) && p.x.$ref === p.y.$ref;
    return false;
  };

  const coverArray = (p: {
    prefix: string;
    components: OpenApi.IComponents;
    visited: Map<OpenApi.IJsonSchema, Map<OpenApi.IJsonSchema, boolean>>;
    x: OpenApi.IJsonSchema.IArray;
    y: OpenApi.IJsonSchema.IArray | OpenApi.IJsonSchema.ITuple;
  }): boolean => {
    if (isTuple(p.y))
      return (
        p.y.prefixItems.every((v) =>
          coverStation({
            prefix: p.prefix,
            components: p.components,
            visited: p.visited,
            x: p.x.items,
            y: v,
          }),
        ) &&
        (p.y.additionalItems === undefined ||
          (typeof p.y.additionalItems === "object" &&
            coverStation({
              prefix: p.prefix,
              components: p.components,
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
      prefix: p.prefix,
      components: p.components,
      visited: p.visited,
      x: p.x.items,
      y: p.y.items,
    });
  };

  const coverObject = (p: {
    prefix: string;
    components: OpenApi.IComponents;
    visited: Map<OpenApi.IJsonSchema, Map<OpenApi.IJsonSchema, boolean>>;
    x: OpenApi.IJsonSchema.IObject;
    y: OpenApi.IJsonSchema.IObject;
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
            prefix: p.prefix,
            components: p.components,
            visited: p.visited,
            x: p.x.additionalProperties,
            y: p.y.additionalProperties,
          })))
    )
      return false;
    return Object.entries(p.y.properties ?? {}).every(([key, b]) => {
      const a: OpenApi.IJsonSchema | undefined = p.x.properties?.[key];
      if (a === undefined) return false;
      else if (
        p.x.required?.includes(key) === true &&
        (p.y.required?.includes(key) ?? false) === false
      )
        return false;
      return coverStation({
        prefix: p.prefix,
        components: p.components,
        visited: p.visited,
        x: a,
        y: b,
      });
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

  const flatSchema = (props: {
    prefix: string;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
  }): OpenApi.IJsonSchema[] => {
    const schema = escapeReferenceOfFlatSchema(props);
    if (isOneOf(schema))
      return schema.oneOf
        .map((v) =>
          flatSchema({
            prefix: props.prefix,
            components: props.components,
            schema: v,
          }),
        )
        .flat();
    return [schema];
  };

  const escapeReferenceOfFlatSchema = (props: {
    prefix: string;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
  }): Exclude<OpenApi.IJsonSchema, OpenApi.IJsonSchema.IReference> => {
    if (isReference(props.schema) === false) return props.schema;
    const key = props.schema.$ref.replace(props.prefix, "");
    const found: OpenApi.IJsonSchema | undefined = escapeReferenceOfFlatSchema({
      prefix: props.prefix,
      components: props.components,
      schema: props.components.schemas?.[key] ?? {},
    });
    if (found === undefined)
      throw new Error(
        `Reference type not found: ${JSON.stringify(props.schema.$ref)}`,
      );
    return escapeReferenceOfFlatSchema({
      prefix: props.prefix,
      components: props.components,
      schema: found,
    });
  };
}
