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

  export const schema = (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
  }): ILlmSchema | null => {
    const resolved: OpenApi.IJsonSchema | null = escape({
      components: props.components,
      visited: new Set(),
      input: props.schema,
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
      route: () => route,
      operation: () => operation,
    };
  };

const escape = (props: {
  components: OpenApi.IComponents;
  visited: Set<string>;
  input: OpenApi.IJsonSchema;
}): OpenApi.IJsonSchema | null => {
  if (OpenApiTypeChecker.isReference(props.input)) {
    // REFERENCE
    const name: string = props.input.$ref.split("#/components/schemas/")[1];
    const target: OpenApi.IJsonSchema | undefined =
      props.components.schemas?.[name];
    if (!target) return null;
    else if (props.visited.has(name)) return null;
    return escape({
      components: props.components,
      visited: new Set([...props.visited, name]),
      input: target,
    });
  } else if (OpenApiTypeChecker.isOneOf(props.input)) {
    // ONE-OF
    const oneOf: Array<OpenApi.IJsonSchema | null> = props.input.oneOf.map(
      (schema) =>
        escape({
          ...props,
          input: schema,
        })!,
    );
    if (oneOf.some((v) => v === null)) return null;
    return {
      ...props.input,
      oneOf: flat(oneOf as OpenApi.IJsonSchema[]),
    };
  } else if (OpenApiTypeChecker.isObject(props.input)) {
    // OBJECT
    const properties: Array<[string, OpenApi.IJsonSchema | null]> | undefined =
      props.input.properties
        ? Object.entries(props.input.properties).map(
            ([key, value]) =>
              [
                key,
                escape({
                  ...props,
                  input: value,
                }),
              ] as const,
          )
        : undefined;
    const additionalProperties:
      | OpenApi.IJsonSchema
      | null
      | boolean
      | undefined = props.input.additionalProperties
      ? typeof props.input.additionalProperties === "object" &&
        props.input.additionalProperties !== null
        ? escape({
            ...props,
            input: props.input.additionalProperties,
          })
        : props.input.additionalProperties
      : undefined;
    if (properties && properties.some(([_k, v]) => v === null)) return null;
    else if (additionalProperties === null) return null;
    return {
      ...props.input,
      properties: properties
        ? Object.fromEntries(
            properties.filter(([_k, v]) => !!v) as Array<
              [string, OpenApi.IJsonSchema]
            >,
          )
        : undefined,
      additionalProperties,
    };
  } else if (OpenApiTypeChecker.isTuple(props.input)) {
    // TUPLE
    const prefixItems: Array<OpenApi.IJsonSchema | null> =
      props.input.prefixItems.map((schema) =>
        escape({
          ...props,
          input: schema,
        }),
      );
    const additionalItems: OpenApi.IJsonSchema | null | boolean | undefined =
      typeof props.input.additionalItems === "object" &&
      props.input.additionalItems !== null
        ? escape({
            ...props,
            input: props.input.additionalItems,
          })
        : props.input.additionalItems;
    if (prefixItems.some((v) => v === null)) return null;
    else if (additionalItems === null) return null;
    return {
      ...props.input,
      prefixItems: prefixItems as OpenApi.IJsonSchema[],
      additionalItems,
    };
  } else if (OpenApiTypeChecker.isArray(props.input)) {
    // ARRAY
    const items: OpenApi.IJsonSchema | null = escape({
      ...props,
      input: props.input.items,
    });
    if (items === null) return null;
    return {
      ...props.input,
      items,
    };
  }
  return props.input;
};

const flat = (elements: OpenApi.IJsonSchema[]): OpenApi.IJsonSchema[] =>
  elements
    .map((elem) => (OpenApiTypeChecker.isOneOf(elem) ? flat(elem.oneOf) : elem))
    .flat();
