import { OpenApi } from "../OpenApi";
import { IHttpLlmApplication } from "../structures/IHttpLlmApplication";
import { IHttpLlmFunction } from "../structures/IHttpLlmFunction";
import { IHttpMigrateApplication } from "../structures/IHttpMigrateApplication";
import { IHttpMigrateRoute } from "../structures/IHttpMigrateRoute";
import { ILlmSchema } from "../structures/ILlmSchema";
import { LlmSchemaSeparator } from "../utils/LlmSchemaSeparator";
import { LlmTypeChecker } from "../utils/LlmTypeChecker";
import { OpenApiTypeChecker } from "../utils/OpenApiTypeChecker";
import { OpenApiV3Downgrader } from "./OpenApiV3Downgrader";

export namespace HttpLlmConverter {
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
        if (route.method === "head") {
          errors.push({
            method: route.method,
            path: route.path,
            messages: ["HEAD method is not supported in the LLM application."],
            operation: () => route.operation(),
            route: () => route,
          });
          return null;
        } else if (
          route.body?.type === "multipart/form-data" ||
          route.success?.type === "multipart/form-data"
        ) {
          errors.push({
            method: route.method,
            path: route.path,
            messages: [
              `The "multipart/form-data" content type is not supported in the LLM application.`,
            ],
            operation: () => route.operation(),
            route: () => route,
          });
          return null;
        }
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

  export const schema = (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    recursive: false | number;
  }): ILlmSchema | null => {
    const resolved: OpenApi.IJsonSchema | null = OpenApiTypeChecker.escape({
      components: props.components,
      schema: props.schema,
      recursive: props.recursive,
    });
    if (resolved === null) return null;
    const downgraded: ILlmSchema = OpenApiV3Downgrader.downgradeSchema({
      original: {},
      downgraded: {},
    })(resolved) as ILlmSchema;
    LlmTypeChecker.visit(downgraded, (schema) => {
      if (
        LlmTypeChecker.isOneOf(schema) &&
        (schema as any).discriminator !== undefined
      )
        delete (schema as any).discriminator;
    });
    return downgraded;
  };
}

const composeFunction =
  (options: IHttpLlmApplication.IOptions) =>
  (components: OpenApi.IComponents) =>
  (route: IHttpMigrateRoute): IHttpLlmFunction | null => {
    // CAST SCHEMA TYPES
    const cast = (s: OpenApi.IJsonSchema) =>
      HttpLlmConverter.schema({
        components,
        schema: s,
        recursive: options.recursive,
      });
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
          })(output as any) as ILlmSchema)
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
      deprecated: operation.deprecated,
      tags: operation.tags,
      route: () => route,
      operation: () => operation,
    };
  };
