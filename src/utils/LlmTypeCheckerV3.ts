import { ILlmSchemaV3 } from "../structures/ILlmSchemaV3";

/**
 * Type checker for LLM type schema.
 *
 * `LlmSchemaTypeChecker` is a type checker of {@link ILlmSchemaV3}.
 *
 * @author Samchon
 */
export namespace LlmTypeCheckerV3 {
  /* -----------------------------------------------------------
    OPERATORS
  ----------------------------------------------------------- */
  /**
   * Visit every nested schemas.
   *
   * Visit every nested schemas of the target, and apply the `props.closure` function.
   *
   * Here is the list of occurring nested visitings:
   *
   * - {@link ILlmSchemaV3.IOneOf.oneOf}
   * - {@link ILlmSchemaV3.IObject.additionalProperties}
   * - {@link ILlmSchemaV3.IArray.items}
   *
   * @param props Properties for visiting
   */
  export const visit = (props: {
    closure: (schema: ILlmSchemaV3, accessor: string) => void;
    schema: ILlmSchemaV3;
    accessor?: string;
  }): void => {
    const accessor: string = props.accessor ?? "$input.schema";
    props.closure(props.schema, accessor);
    if (isOneOf(props.schema))
      props.schema.oneOf.forEach((s, i) =>
        visit({
          closure: props.closure,
          schema: s,
          accessor: `${accessor}.oneOf[${i}]`,
        }),
      );
    else if (isObject(props.schema)) {
      for (const [k, s] of Object.entries(props.schema.properties))
        visit({
          closure: props.closure,
          schema: s,
          accessor: `${accessor}.properties[${JSON.stringify(k)}]`,
        });
      if (
        typeof props.schema.additionalProperties === "object" &&
        props.schema.additionalProperties !== null
      )
        visit({
          closure: props.closure,
          schema: props.schema.additionalProperties,
          accessor: `${accessor}.additionalProperties`,
        });
    } else if (isArray(props.schema))
      visit({
        closure: props.closure,
        schema: props.schema.items,
        accessor: `${accessor}.items`,
      });
  };

  export const covers = (x: ILlmSchemaV3, y: ILlmSchemaV3): boolean => {
    const alpha: ILlmSchemaV3[] = flatSchema(x);
    const beta: ILlmSchemaV3[] = flatSchema(y);
    if (alpha.some((x) => isUnknown(x))) return true;
    else if (beta.some((x) => isUnknown(x))) return false;
    return beta.every((b) =>
      alpha.some((a) => {
        // CHECK EQUALITY
        if (a === b) return true;
        else if (isUnknown(a)) return true;
        else if (isUnknown(b)) return false;
        else if (isNullOnly(a)) return isNullOnly(b);
        else if (isNullOnly(b)) return isNullable(a);
        else if (isNullable(a) && !isNullable(b)) return false;
        // ATOMIC CASE
        else if (isBoolean(a)) return isBoolean(b) && coverBoolean(a, b);
        else if (isInteger(a)) return isInteger(b) && coverInteger(a, b);
        else if (isNumber(a))
          return (isNumber(b) || isInteger(b)) && coverNumber(a, b);
        else if (isString(a)) return isString(b) && covertString(a, b);
        // INSTANCE CASE
        else if (isArray(a)) return isArray(b) && coverArray(a, b);
        else if (isObject(a)) return isObject(b) && coverObject(a, b);
        else if (isOneOf(a)) return false;
      }),
    );
  };

  /**
   * @internal
   */
  const coverBoolean = (
    x: ILlmSchemaV3.IBoolean,
    y: ILlmSchemaV3.IBoolean,
  ): boolean =>
    x.enum === undefined ||
    (y.enum !== undefined && x.enum.every((v) => y.enum!.includes(v)));

  /**
   * @internal
   */
  const coverInteger = (
    x: ILlmSchemaV3.IInteger,
    y: ILlmSchemaV3.IInteger,
  ): boolean => {
    if (x.enum !== undefined)
      return y.enum !== undefined && x.enum.every((v) => y.enum!.includes(v));
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

  /**
   * @internal
   */
  const coverNumber = (
    x: ILlmSchemaV3.INumber,
    y: ILlmSchemaV3.INumber | ILlmSchemaV3.IInteger,
  ): boolean => {
    if (x.enum !== undefined)
      return y.enum !== undefined && x.enum.every((v) => y.enum!.includes(v));
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

  /**
   * @internal
   */
  const covertString = (
    x: ILlmSchemaV3.IString,
    y: ILlmSchemaV3.IString,
  ): boolean => {
    if (x.enum !== undefined)
      return y.enum !== undefined && x.enum.every((v) => y.enum!.includes(v));
    return [
      x.type === y.type,
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
    x: Required<ILlmSchemaV3.IString>["format"],
    y: Required<ILlmSchemaV3.IString>["format"],
  ): boolean =>
    x === y ||
    (x === "idn-email" && y === "email") ||
    (x === "idn-hostname" && y === "hostname") ||
    (["uri", "iri"].includes(x) && y === "url") ||
    (x === "iri" && y === "uri") ||
    (x === "iri-reference" && y === "uri-reference");

  /**
   * @internal
   */
  const coverArray = (
    x: ILlmSchemaV3.IArray,
    y: ILlmSchemaV3.IArray,
  ): boolean => covers(x.items, y.items);

  const coverObject = (
    x: ILlmSchemaV3.IObject,
    y: ILlmSchemaV3.IObject,
  ): boolean => {
    if (!x.additionalProperties && !!y.additionalProperties) return false;
    else if (
      (!!x.additionalProperties &&
        !!y.additionalProperties &&
        typeof x.additionalProperties === "object" &&
        y.additionalProperties === true) ||
      (typeof x.additionalProperties === "object" &&
        typeof y.additionalProperties === "object" &&
        !covers(x.additionalProperties, y.additionalProperties))
    )
      return false;
    return Object.entries(y.properties ?? {}).every(([key, b]) => {
      const a: ILlmSchemaV3 | undefined = x.properties?.[key];
      if (a === undefined) return false;
      else if (
        (x.required?.includes(key) ?? false) === true &&
        (y.required?.includes(key) ?? false) === false
      )
        return false;
      return covers(a, b);
    });
  };

  const flatSchema = (schema: ILlmSchemaV3): ILlmSchemaV3[] =>
    isOneOf(schema) ? schema.oneOf.flatMap(flatSchema) : [schema];

  /* -----------------------------------------------------------
    TYPE CHECKERS
  ----------------------------------------------------------- */
  /**
   * Test whether the schema is an union type.
   *
   * @param schema Target schema
   * @returns Whether union type or not
   */
  export const isOneOf = (
    schema: ILlmSchemaV3,
  ): schema is ILlmSchemaV3.IOneOf =>
    (schema as ILlmSchemaV3.IOneOf).oneOf !== undefined;

  /**
   * Test whether the schema is an object type.
   *
   * @param schema Target schema
   * @returns Whether object type or not
   */
  export const isObject = (
    schema: ILlmSchemaV3,
  ): schema is ILlmSchemaV3.IObject =>
    (schema as ILlmSchemaV3.IObject).type === "object";

  /**
   * Test whether the schema is an array type.
   *
   * @param schema Target schema
   * @returns Whether array type or not
   */
  export const isArray = (
    schema: ILlmSchemaV3,
  ): schema is ILlmSchemaV3.IArray =>
    (schema as ILlmSchemaV3.IArray).type === "array";

  /**
   * Test whether the schema is a boolean type.
   *
   * @param schema Target schema
   * @returns Whether boolean type or not
   */
  export const isBoolean = (
    schema: ILlmSchemaV3,
  ): schema is ILlmSchemaV3.IBoolean =>
    (schema as ILlmSchemaV3.IBoolean).type === "boolean";

  /**
   * Test whether the schema is an integer type.
   *
   * @param schema Target schema
   * @returns Whether integer type or not
   */
  export const isInteger = (
    schema: ILlmSchemaV3,
  ): schema is ILlmSchemaV3.IInteger =>
    (schema as ILlmSchemaV3.IInteger).type === "integer";

  /**
   * Test whether the schema is a number type.
   *
   * @param schema Target schema
   * @returns Whether number type or not
   */
  export const isNumber = (
    schema: ILlmSchemaV3,
  ): schema is ILlmSchemaV3.INumber =>
    (schema as ILlmSchemaV3.INumber).type === "number";

  /**
   * Test whether the schema is a string type.
   *
   * @param schema Target schema
   * @returns Whether string type or not
   */
  export const isString = (
    schema: ILlmSchemaV3,
  ): schema is ILlmSchemaV3.IString =>
    (schema as ILlmSchemaV3.IString).type === "string";

  /**
   * Test whether the schema is a null type.
   *
   * @param schema Target schema
   * @returns Whether null type or not
   */
  export const isNullOnly = (
    schema: ILlmSchemaV3,
  ): schema is ILlmSchemaV3.INullOnly =>
    (schema as ILlmSchemaV3.INullOnly).type === "null";

  /**
   * Test whether the schema is a nullable type.
   *
   * @param schema Target schema
   * @returns Whether nullable type or not
   */
  export const isNullable = (schema: ILlmSchemaV3): boolean =>
    !isUnknown(schema) &&
    (isNullOnly(schema) ||
      (isOneOf(schema)
        ? schema.oneOf.some(isNullable)
        : schema.nullable === true));

  /**
   * Test whether the schema is an unknown type.
   *
   * @param schema Target schema
   * @returns Whether unknown type or not
   */
  export const isUnknown = (
    schema: ILlmSchemaV3,
  ): schema is ILlmSchemaV3.IUnknown =>
    !isOneOf(schema) && (schema as ILlmSchemaV3.IUnknown).type === undefined;
}
