import { OpenApi } from "../OpenApi";
import { IHttpLlmApplication } from "../structures/IHttpLlmApplication";
import { IHttpLlmFunction } from "../structures/IHttpLlmFunction";
import { IHttpMigrateApplication } from "../structures/IHttpMigrateApplication";
import { IHttpMigrateRoute } from "../structures/IHttpMigrateRoute";
import { ILlmSchema } from "../structures/ILlmSchema";
import { LlmTypeChecker } from "../utils/LlmTypeChecker";
import { OpenApiTypeChecker } from "../utils/OpenApiTypeChecker";
import { LlmSchemaSeparator } from "./LlmSchemaSeparator";
import { OpenApiV3Downgrader } from "./OpenApiV3Downgrader";

export namespace LlmComposer {
  export const compose = (
    migrate: IHttpMigrateApplication,
    options: IHttpLlmApplication.IOptions,
  ): IHttpLlmApplication => {
    // COMPOSE FUNCTIONS
    const errors: IHttpLlmApplication.IError[] = migrate.errors.map((e) => ({
      method: e.method,
      path: e.path,
      messages: e.messages,
      operation: () => e.operation(),
      route: () => undefined,
    }));
    const functions: IHttpLlmFunction[] = migrate.routes
      .map((route) => {
        if (route.method === "head") return null;
        const func: IHttpLlmFunction | null = composeFunction(options)(
          migrate.document().components,
        )(route);
        if (func === null)
          errors.push({
            method: route.method,
            path: route.path,
            messages: ["Failed to escape $ref"],
            operation: () => route.operation(),
            route: () => route,
          });
        return func;
      })
      .filter((v): v is IHttpLlmFunction => v !== null);
    return {
      openapi: "3.0.3",
      functions,
      errors,
      options,
    };
  };

  export const schema = (
    components: OpenApi.IComponents,
    schema: OpenApi.IJsonSchema,
  ): ILlmSchema | null => {
    const escaped: OpenApi.IJsonSchema | null = escapeReference(components)(
      new Set(),
    )(schema);
    if (escaped === null) return null;
    const downgraded: ILlmSchema = OpenApiV3Downgrader.downgradeSchema({
      original: {},
      downgraded: {},
    })(escaped) as ILlmSchema;
    LlmTypeChecker.visit(downgraded, (schema) => {
      if (
        LlmTypeChecker.isOneOf(schema) &&
        (schema as any).discriminator !== undefined
      )
        delete (schema as any).discriminator;
    });
    return downgraded;
  };

  const composeFunction =
    (options: IHttpLlmApplication.IOptions) =>
    (components: OpenApi.IComponents) =>
    (route: IHttpMigrateRoute): IHttpLlmFunction | null => {
      // CAST SCHEMA TYPES
      const cast = (s: OpenApi.IJsonSchema) => schema(components, s);
      const output: ILlmSchema | null | undefined =
        route.success && route.success ? cast(route.success.schema) : undefined;
      if (output === null) return null;
      const properties: [string, ILlmSchema | null][] = [
        ...route.parameters.map((p) => ({
          key: p.key,
          schema: {
            ...p.schema,
            title: p.parameter().title ?? p.schema.title,
            description: p.parameter().description ?? p.schema.description,
          },
        })),
        ...(route.query
          ? [
              {
                key: route.query.key,
                schema: {
                  ...route.query.schema,
                  title: route.query.title() ?? route.query.schema.title,
                  description:
                    route.query.description() ?? route.query.schema.description,
                },
              },
            ]
          : []),
        ...(route.body
          ? [
              {
                key: route.body.key,
                schema: {
                  ...route.body.schema,
                  description:
                    route.body.description() ?? route.body.schema.description,
                },
              },
            ]
          : []),
      ].map((o) => [o.key, cast(o.schema)]);
      if (properties.some(([_k, v]) => v === null)) return null;

      // COMPOSE PARAMETERS
      const parameters: ILlmSchema[] = options.keyword
        ? [
            {
              type: "object",
              properties: Object.fromEntries(
                properties as [string, ILlmSchema][],
              ),
            },
          ]
        : properties.map(([_k, v]) => v!);
      const operation: OpenApi.IOperation = route.operation();

      // FINALIZATION
      return {
        method: route.method as "get",
        path: route.path,
        name: route.accessor.join("_"),
        strict: true,
        parameters,
        separated: options.separate
          ? LlmSchemaSeparator.parameters({
              parameters,
              predicator: options.separate,
            })
          : undefined,
        output: output
          ? (OpenApiV3Downgrader.downgradeSchema({
              original: {},
              downgraded: {},
            })(output) as ILlmSchema)
          : undefined,
        description: (() => {
          if (operation.summary && operation.description) {
            return operation.description.startsWith(operation.summary)
              ? operation.description
              : [
                  operation.summary,
                  operation.summary.endsWith(".") ? "" : ".",
                  "\n\n",
                  operation.description,
                ].join("");
          }
          return operation.description ?? operation.summary;
        })(),
        route: () => route,
        operation: () => operation,
      };
    };

  const escapeReference =
    (components: OpenApi.IComponents) =>
    (visited: Set<string>) =>
    (input: OpenApi.IJsonSchema): OpenApi.IJsonSchema | null => {
      if (OpenApiTypeChecker.isReference(input)) {
        // REFERENCE
        const name: string = input.$ref.split("#/components/schemas/")[1];
        const target: OpenApi.IJsonSchema | undefined =
          components.schemas?.[name];
        if (!target) return null;
        else if (visited.has(name)) return null;
        return escapeReference(components)(new Set([...visited, name]))(target);
      } else if (OpenApiTypeChecker.isOneOf(input)) {
        // ONE-OF
        const oneOf: Array<OpenApi.IJsonSchema | null> = input.oneOf.map(
          (schema) => escapeReference(components)(visited)(schema)!,
        );
        if (oneOf.some((v) => v === null)) return null;
        return {
          ...input,
          oneOf: oneOf as OpenApi.IJsonSchema[],
        };
      } else if (OpenApiTypeChecker.isObject(input)) {
        // OBJECT
        const properties:
          | Array<[string, OpenApi.IJsonSchema | null]>
          | undefined = input.properties
          ? Object.entries(input.properties).map(
              ([key, value]) =>
                [key, escapeReference(components)(visited)(value)] as const,
            )
          : undefined;
        const additionalProperties:
          | OpenApi.IJsonSchema
          | null
          | boolean
          | undefined = input.additionalProperties
          ? typeof input.additionalProperties === "object" &&
            input.additionalProperties !== null
            ? escapeReference(components)(visited)(input.additionalProperties)
            : input.additionalProperties
          : undefined;
        if (properties && properties.some(([_k, v]) => v === null)) return null;
        else if (additionalProperties === null) return null;
        return {
          ...input,
          properties: properties
            ? Object.fromEntries(
                properties.filter(([_k, v]) => !!v) as Array<
                  [string, OpenApi.IJsonSchema]
                >,
              )
            : undefined,
          additionalProperties,
        };
      } else if (OpenApiTypeChecker.isTuple(input)) {
        // TUPLE
        const prefixItems: Array<OpenApi.IJsonSchema | null> =
          input.prefixItems.map((schema) =>
            escapeReference(components)(visited)(schema),
          );
        const additionalItems:
          | OpenApi.IJsonSchema
          | null
          | boolean
          | undefined =
          typeof input.additionalItems === "object" &&
          input.additionalItems !== null
            ? escapeReference(components)(visited)(input.additionalItems)
            : input.additionalItems;
        if (prefixItems.some((v) => v === null)) return null;
        else if (additionalItems === null) return null;
        return {
          ...input,
          prefixItems: prefixItems as OpenApi.IJsonSchema[],
          additionalItems,
        };
      } else if (OpenApiTypeChecker.isArray(input)) {
        // ARRAY
        const items: OpenApi.IJsonSchema | null = escapeReference(components)(
          visited,
        )(input.items);
        if (items === null) return null;
        return {
          ...input,
          items,
        };
      }
      return input;
    };
}
