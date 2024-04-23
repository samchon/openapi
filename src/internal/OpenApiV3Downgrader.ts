import { OpenApi } from "../OpenApi";
import { OpenApiV3 } from "../OpenApiV3";
import { OpenApiTypeChecker } from "./OpenApiTypeChecker";

export namespace OpenApiV3Downgrader {
  export interface IComponentsCollection {
    original: OpenApi.IComponents;
    downgraded: OpenApiV3.IComponents;
  }

  export const downgrade = (input: OpenApi.IDocument): OpenApiV3.IDocument => {
    const collection: IComponentsCollection = downgradeComponents(
      input.components,
    );
    return {
      openapi: "3.0.0",
      servers: input.servers,
      info: input.info,
      components: collection.downgraded,
      paths: input.paths
        ? Object.fromEntries(
            Object.entries(input.paths)
              .filter(([_, v]) => v !== undefined)
              .map(
                ([key, value]) =>
                  [key, downgradePathItem(collection)(value)] as const,
              ),
          )
        : undefined,
      security: input.security,
      tags: input.tags,
    };
  };

  /* -----------------------------------------------------------
    OPERATORS
  ----------------------------------------------------------- */
  const downgradePathItem =
    (collection: IComponentsCollection) =>
    (pathItem: OpenApi.IPath): OpenApiV3.IPath => ({
      ...(pathItem as any),
      ...(pathItem.get
        ? { get: downgradeOperation(collection)(pathItem.get) }
        : undefined),
      ...(pathItem.put
        ? { put: downgradeOperation(collection)(pathItem.put) }
        : undefined),
      ...(pathItem.post
        ? { post: downgradeOperation(collection)(pathItem.post) }
        : undefined),
      ...(pathItem.delete
        ? { delete: downgradeOperation(collection)(pathItem.delete) }
        : undefined),
      ...(pathItem.options
        ? { options: downgradeOperation(collection)(pathItem.options) }
        : undefined),
      ...(pathItem.head
        ? { head: downgradeOperation(collection)(pathItem.head) }
        : undefined),
      ...(pathItem.patch
        ? { patch: downgradeOperation(collection)(pathItem.patch) }
        : undefined),
      ...(pathItem.trace
        ? { trace: downgradeOperation(collection)(pathItem.trace) }
        : undefined),
    });

  const downgradeOperation =
    (collection: IComponentsCollection) =>
    (input: OpenApi.IOperation): OpenApiV3.IOperation => ({
      ...input,
      parameters: input.parameters
        ? input.parameters.map(downgradeParameter(collection))
        : undefined,
      requestBody: input.requestBody
        ? downgradeRequestBody(collection)(input.requestBody)
        : undefined,
      responses: input.responses
        ? Object.fromEntries(
            Object.entries(input.responses)
              .filter(([_, v]) => v !== undefined)
              .map(([key, value]) => [
                key,
                downgradeResponse(collection)(value),
              ]),
          )
        : undefined,
    });

  const downgradeParameter =
    (collection: IComponentsCollection) =>
    (
      input: OpenApi.IOperation.IParameter,
    ): OpenApiV3.IOperation.IParameter => ({
      ...input,
      schema: downgradeSchema(collection)(input.schema),
    });

  const downgradeRequestBody =
    (collection: IComponentsCollection) =>
    (
      input: OpenApi.IOperation.IRequestBody,
    ): OpenApiV3.IOperation.IRequestBody => ({
      ...input,
      content: input.content
        ? downgradeContent(collection)(input.content)
        : undefined,
    });

  const downgradeResponse =
    (collection: IComponentsCollection) =>
    (input: OpenApi.IOperation.IResponse): OpenApiV3.IOperation.IResponse => ({
      ...input,
      content: input.content
        ? downgradeContent(collection)(input.content)
        : undefined,
      headers: input.headers
        ? Object.fromEntries(
            Object.entries(input.headers)
              .filter(([_, v]) => v !== undefined)
              .map(([key, value]) => [
                key,
                {
                  ...value,
                  schema: downgradeSchema(collection)(value.schema),
                },
              ]),
          )
        : undefined,
    });

  const downgradeContent =
    (collection: IComponentsCollection) =>
    (
      record: OpenApi.IOperation.IContent,
    ): Record<string, OpenApiV3.IOperation.IMediaType> =>
      Object.fromEntries(
        Object.entries(record)
          .filter(([_, v]) => v !== undefined)
          .map(
            ([key, value]) =>
              [
                key,
                {
                  ...value,
                  schema: value?.schema
                    ? downgradeSchema(collection)(value.schema)
                    : undefined,
                },
              ] as const,
          ),
      );

  /* -----------------------------------------------------------
    DEFINITIONS
  ----------------------------------------------------------- */
  export const downgradeComponents = (
    input: OpenApi.IComponents,
  ): IComponentsCollection => {
    const collection: IComponentsCollection = {
      original: input,
      downgraded: {
        securitySchemes: input.securitySchemes,
      },
    };
    if (input.schemas) {
      collection.downgraded.schemas = {};
      for (const [key, value] of Object.entries(input.schemas))
        if (value !== undefined)
          collection.downgraded.schemas[key] =
            downgradeSchema(collection)(value);
    }
    return collection;
  };

  export const downgradeSchema =
    (collection: IComponentsCollection) =>
    (input: OpenApi.IJsonSchema): OpenApiV3.IJsonSchema => {
      const nullable: boolean =
        OpenApiTypeChecker.isNull(input) ||
        (OpenApiTypeChecker.isOneOf(input) &&
          input.oneOf.some(OpenApiTypeChecker.isNull));
      const union: OpenApiV3.IJsonSchema[] = [];
      const attribute: OpenApiV3.IJsonSchema.__IAttribute = {
        title: input.title,
        description: input.description,
        ...Object.fromEntries(
          Object.entries(input).filter(
            ([key, value]) => key.startsWith("x-") && value !== undefined,
          ),
        ),
      };
      const visit = (schema: OpenApi.IJsonSchema): void => {
        if (OpenApiTypeChecker.isBoolean(schema))
          union.push({ type: "boolean" });
        else if (
          OpenApiTypeChecker.isBoolean(schema) ||
          OpenApiTypeChecker.isInteger(schema) ||
          OpenApiTypeChecker.isNumber(schema) ||
          OpenApiTypeChecker.isString(schema) ||
          OpenApiTypeChecker.isReference(schema)
        )
          union.push({ ...schema });
        else if (OpenApiTypeChecker.isArray(schema))
          union.push({
            ...schema,
            items: downgradeSchema(collection)(schema.items),
          });
        else if (OpenApiTypeChecker.isTuple(schema))
          union.push({
            ...schema,
            items: ((): OpenApiV3.IJsonSchema => {
              if (schema.additionalItems === true) return {};
              const elements = [
                ...schema.prefixItems,
                ...(typeof schema.additionalItems === "object"
                  ? [downgradeSchema(collection)(schema.additionalItems)]
                  : []),
              ];
              if (elements.length === 0) return {};
              return {
                oneOf: elements.map(downgradeSchema(collection)),
              };
            })(),
            minItems: schema.prefixItems.length,
            maxItems:
              !!schema.additionalItems === true
                ? undefined
                : schema.prefixItems.length,
            ...{
              prefixItems: undefined,
              additionalItems: undefined,
            },
          });
        else if (OpenApiTypeChecker.isObject(schema))
          union.push({
            ...schema,
            properties: schema.properties
              ? Object.fromEntries(
                  Object.entries(schema.properties)
                    .filter(([_, v]) => v !== undefined)
                    .map(([key, value]) => [
                      key,
                      downgradeSchema(collection)(value),
                    ]),
                )
              : undefined,
            additionalProperties:
              typeof schema.additionalProperties === "object"
                ? downgradeSchema(collection)(schema.additionalProperties)
                : schema.additionalProperties,
            required: schema.required,
          });
        else if (OpenApiTypeChecker.isOneOf(schema))
          schema.oneOf.forEach(visit);
      };
      const visitConstant = (schema: OpenApi.IJsonSchema): void => {
        const insert = (value: any): void => {
          const matched: OpenApiV3.IJsonSchema.INumber | undefined = union.find(
            (u) =>
              (u as OpenApiV3.IJsonSchema.__ISignificant<any>).type ===
              typeof value,
          ) as OpenApiV3.IJsonSchema.INumber | undefined;
          if (matched !== undefined) {
            matched.enum ??= [];
            matched.enum.push(value);
          } else union.push({ type: typeof value as "number", enum: [value] });
        };
        if (OpenApiTypeChecker.isConstant(schema)) insert(schema.const);
        else if (OpenApiTypeChecker.isOneOf(schema))
          for (const u of schema.oneOf)
            if (OpenApiTypeChecker.isConstant(u)) insert(u.const);
      };

      visit(input);
      visitConstant(input);
      if (nullable === true)
        for (const u of union)
          if (OpenApiTypeChecker.isReference(u))
            downgradeNullableReference(collection)(u);
          else (u as OpenApiV3.IJsonSchema.IArray).nullable = true;
      if (nullable === true && union.length === 0)
        return { type: "null", ...attribute };
      return {
        ...(union.length === 0
          ? { type: undefined }
          : union.length === 1
            ? { ...union[0] }
            : { oneOf: union.map((u) => ({ ...u, nullable: undefined })) }),
        ...attribute,
      };
    };

  const downgradeNullableReference =
    (collection: IComponentsCollection) =>
    (schema: OpenApiV3.IJsonSchema.IReference): void => {
      const key: string = schema.$ref.split("/").pop()!;
      if (key.endsWith(".Nullable")) return;

      const found: OpenApi.IJsonSchema | undefined =
        collection.original.schemas?.[key];
      if (found === undefined) return;
      else if (
        collection.downgraded.schemas![`${key}.Nullable`] === undefined
      ) {
        collection.downgraded.schemas![`${key}.Nullable`] = {};
        collection.downgraded.schemas![`${key}.Nullable`] =
          downgradeSchema(collection)(found);
      }
      schema.$ref += ".Nullable";
    };
}
