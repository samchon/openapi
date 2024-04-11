import { OpenApi } from "../OpenApi";
import { OpenApiV3 } from "../OpenApiV3";

export namespace OpenApiV3Converter {
  export const convert = (input: OpenApiV3.IDocument): OpenApi.IDocument => ({
    ...input,
    components: convertComponents(input.components ?? {}),
    paths: input.paths
      ? Object.fromEntries(
          Object.entries(input.paths)
            .filter(([_, v]) => v !== undefined)
            .map(
              ([key, value]) => [key, convertPathItem(input)(value)] as const,
            ),
        )
      : undefined,
    openapi: "3.1.0",
  });

  /* -----------------------------------------------------------
    OPERATORS
  ----------------------------------------------------------- */
  const convertPathItem =
    (doc: OpenApiV3.IDocument) =>
    (pathItem: OpenApiV3.IPathItem): OpenApi.IPathItem => ({
      ...(pathItem as any),
      ...(pathItem.get
        ? { get: convertOperation(doc)(pathItem)(pathItem.get) }
        : undefined),
      ...(pathItem.put
        ? { put: convertOperation(doc)(pathItem)(pathItem.put) }
        : undefined),
      ...(pathItem.post
        ? { post: convertOperation(doc)(pathItem)(pathItem.post) }
        : undefined),
      ...(pathItem.delete
        ? { delete: convertOperation(doc)(pathItem)(pathItem.delete) }
        : undefined),
      ...(pathItem.options
        ? { options: convertOperation(doc)(pathItem)(pathItem.options) }
        : undefined),
      ...(pathItem.head
        ? { head: convertOperation(doc)(pathItem)(pathItem.head) }
        : undefined),
      ...(pathItem.patch
        ? { patch: convertOperation(doc)(pathItem)(pathItem.patch) }
        : undefined),
      ...(pathItem.trace
        ? { trace: convertOperation(doc)(pathItem)(pathItem.trace) }
        : undefined),
    });
  const convertOperation =
    (doc: OpenApiV3.IDocument) =>
    (pathItem: OpenApiV3.IPathItem) =>
    (input: OpenApiV3.IOperation): OpenApi.IOperation => ({
      ...input,
      parameters: [...(pathItem.parameters ?? []), ...(input.parameters ?? [])]
        .map((p) => {
          if (!TypeChecker.isReference(p)) return convertParameter(p);
          const found: Omit<OpenApiV3.IOperation.IParameter, "in"> | undefined =
            p.$ref.startsWith("#/components/headers/")
              ? doc.components?.headers?.[p.$ref.split("/").pop() ?? ""]
              : doc.components?.parameters?.[p.$ref.split("/").pop() ?? ""];
          return found !== undefined
            ? convertParameter({
                ...found,
                in: "header",
              })
            : undefined!;
        })
        .filter((_, v) => v !== undefined),
      requestBody: input.requestBody
        ? convertRequestBody(doc)(input.requestBody)
        : undefined,
      responses: input.responses
        ? Object.fromEntries(
            Object.entries(input.responses)
              .filter(([_, v]) => v !== undefined)
              .map(
                ([key, value]) => [key, convertResponse(doc)(value)!] as const,
              )
              .filter(([_, v]) => v !== undefined),
          )
        : undefined,
    });
  const convertParameter = (
    input: OpenApiV3.IOperation.IParameter,
  ): OpenApi.IOperation.IParameter => ({
    ...input,
    schema: convertSchema(input.schema),
  });
  const convertRequestBody =
    (doc: OpenApiV3.IDocument) =>
    (
      input:
        | OpenApiV3.IOperation.IRequestBody
        | OpenApiV3.IJsonSchema.IReference<`#/components/requestBodies/${string}`>,
    ): OpenApi.IOperation.IRequestBody | undefined => {
      if (TypeChecker.isReference(input)) {
        const found: OpenApiV3.IOperation.IRequestBody | undefined =
          doc.components?.requestBodies?.[input.$ref.split("/").pop() ?? ""];
        if (found === undefined) return undefined;
        input = found;
      }
      return {
        ...input,
        content: input.content ? convertContent(input.content) : undefined,
      };
    };
  const convertResponse =
    (doc: OpenApiV3.IDocument) =>
    (
      input:
        | OpenApiV3.IOperation.IResponse
        | OpenApiV3.IJsonSchema.IReference<`#/components/responses/${string}`>,
    ): OpenApi.IOperation.IResponse | undefined => {
      if (TypeChecker.isReference(input)) {
        const found: OpenApiV3.IOperation.IResponse | undefined =
          doc.components?.responses?.[input.$ref.split("/").pop() ?? ""];
        if (found === undefined) return undefined;
        input = found;
      }
      return {
        ...input,
        content: input.content ? convertContent(input.content) : undefined,
        headers: input.headers
          ? Object.fromEntries(
              Object.entries(input.headers)
                .filter(([_, v]) => v !== undefined)
                .map(
                  ([key, value]) =>
                    [
                      key,
                      (() => {
                        if (TypeChecker.isReference(value) === false)
                          return convertParameter({
                            ...value,
                            in: "header",
                          });
                        const found:
                          | Omit<OpenApiV3.IOperation.IParameter, "in">
                          | undefined = value.$ref.startsWith(
                          "#/components/headers/",
                        )
                          ? doc.components?.headers?.[
                              value.$ref.split("/").pop() ?? ""
                            ]
                          : undefined;
                        return found !== undefined
                          ? convertParameter({
                              ...found,
                              in: "header",
                            })
                          : undefined!;
                      })(),
                    ] as const,
                )
                .filter(([_, v]) => v !== undefined),
            )
          : undefined,
      };
    };
  const convertContent = (
    record: Record<string, OpenApiV3.IOperation.IMediaType>,
  ): Record<string, OpenApi.IOperation.IMediaType> =>
    Object.fromEntries(
      Object.entries(record)
        .filter(([_, v]) => v !== undefined)
        .map(
          ([key, value]) =>
            [
              key,
              {
                ...value,
                schema: value.schema ? convertSchema(value.schema) : undefined,
              },
            ] as const,
        ),
    );

  /* -----------------------------------------------------------
    DEFINITIONS
  ----------------------------------------------------------- */
  const convertComponents = (
    input: OpenApiV3.IComponents,
  ): OpenApi.IComponents => ({
    schemas: Object.fromEntries(
      Object.entries(input.schemas ?? {})
        .filter(([_, v]) => v !== undefined)
        .map(([key, value]) => [key, convertSchema(value)]),
    ),
    securitySchemes: input.securitySchemes,
  });
  const convertSchema = (input: OpenApiV3.IJsonSchema): OpenApi.IJsonSchema => {
    const nullable: { value: boolean } = { value: false };
    const union: OpenApi.IJsonSchema[] = [];
    const attribute: OpenApi.IJsonSchema.__IAttribute = {
      title: input.title,
      description: input.description,
      ...Object.fromEntries(
        Object.entries(input).filter(
          ([key, value]) => key.startsWith("x-") && value !== undefined,
        ),
      ),
    };
    const visit = (schema: OpenApiV3.IJsonSchema): void => {
      if (
        (schema as OpenApiV3.IJsonSchema.__ISignificant<any>).nullable === true
      )
        nullable.value ||= true;
      // UNION TYPE CASE
      if (TypeChecker.isAnyOf(schema)) schema.anyOf.forEach(visit);
      else if (TypeChecker.isOneOf(schema)) schema.oneOf.forEach(visit);
      // ATOMIC TYPE CASE (CONSIDER ENUM VALUES)
      else if (
        TypeChecker.isBoolean(schema) ||
        TypeChecker.isInteger(schema) ||
        TypeChecker.isNumber(schema) ||
        TypeChecker.isString(schema)
      )
        if (schema.enum?.length)
          union.push(...schema.enum.map((value) => ({ const: value })));
        else
          union.push({
            ...schema,
            ...{ enum: undefined },
          });
      // INSTANCE TYPE CASE
      else if (TypeChecker.isArray(schema))
        union.push({
          ...schema,
          items: convertSchema(schema.items),
        });
      else if (TypeChecker.isObject(schema))
        union.push({
          ...schema,
          ...{
            properites: schema.properties
              ? Object.fromEntries(
                  Object.entries(schema.properties)
                    .filter(([_, v]) => v !== undefined)
                    .map(([key, value]) => [key, convertSchema(value)]),
                )
              : undefined,
            additionalProperties: schema.additionalProperties
              ? typeof schema.additionalProperties === "object" &&
                schema.additionalProperties !== null
                ? convertSchema(schema.additionalProperties)
                : schema.additionalProperties
              : undefined,
          },
        });
      else if (TypeChecker.isReference(schema)) union.push(schema);
      else union.push(schema);
    };

    visit(input);
    if (
      nullable.value === true &&
      !union.some((e) => (e as OpenApi.IJsonSchema.INull).type === "null")
    )
      union.push({ type: "null" });
    return {
      ...(union.length === 0
        ? { type: undefined }
        : union.length === 1
          ? { ...union[0] }
          : { oneOf: union }),
      ...attribute,
    };
  };

  namespace TypeChecker {
    export const isBoolean = (
      schema: OpenApiV3.IJsonSchema,
    ): schema is OpenApiV3.IJsonSchema.IBoolean =>
      (schema as OpenApiV3.IJsonSchema.IBoolean).type === "boolean";
    export const isInteger = (
      schema: OpenApiV3.IJsonSchema,
    ): schema is OpenApiV3.IJsonSchema.IInteger =>
      (schema as OpenApiV3.IJsonSchema.IInteger).type === "integer";
    export const isNumber = (
      schema: OpenApiV3.IJsonSchema,
    ): schema is OpenApiV3.IJsonSchema.INumber =>
      (schema as OpenApiV3.IJsonSchema.INumber).type === "number";
    export const isString = (
      schema: OpenApiV3.IJsonSchema,
    ): schema is OpenApiV3.IJsonSchema.IString =>
      (schema as OpenApiV3.IJsonSchema.IString).type === "string";
    export const isArray = (
      schema: OpenApiV3.IJsonSchema,
    ): schema is OpenApiV3.IJsonSchema.IArray =>
      (schema as OpenApiV3.IJsonSchema.IArray).type === "array";
    export const isObject = (
      schema: OpenApiV3.IJsonSchema,
    ): schema is OpenApiV3.IJsonSchema.IObject =>
      (schema as OpenApiV3.IJsonSchema.IObject).type === "object";
    export const isReference = (
      schema: OpenApiV3.IJsonSchema,
    ): schema is OpenApiV3.IJsonSchema.IReference =>
      (schema as OpenApiV3.IJsonSchema.IReference).$ref !== undefined;
    export const isOneOf = (
      schema: OpenApiV3.IJsonSchema,
    ): schema is OpenApiV3.IJsonSchema.IOneOf =>
      (schema as OpenApiV3.IJsonSchema.IOneOf).oneOf !== undefined;
    export const isAnyOf = (
      schema: OpenApiV3.IJsonSchema,
    ): schema is OpenApiV3.IJsonSchema.IAnyOf =>
      (schema as OpenApiV3.IJsonSchema.IAnyOf).anyOf !== undefined;
    export const isNullOnly = (
      schema: OpenApiV3.IJsonSchema,
    ): schema is OpenApiV3.IJsonSchema.INullOnly =>
      (schema as OpenApiV3.IJsonSchema.INullOnly).type === "null";
  }
}
