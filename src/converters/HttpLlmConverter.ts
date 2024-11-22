import { OpenApi } from "../OpenApi";
import { IChatGptSchema } from "../structures/IChatGptSchema";
import { IHttpLlmApplication } from "../structures/IHttpLlmApplication";
import { IHttpLlmFunction } from "../structures/IHttpLlmFunction";
import { IHttpMigrateApplication } from "../structures/IHttpMigrateApplication";
import { IHttpMigrateRoute } from "../structures/IHttpMigrateRoute";
import { ChatGptConverter } from "./ChatGptConverter";
import { GeminiConverter } from "./GeminiConverter";
import { LlmConverterV3 } from "./LlmConverterV3";
import { LlmConverterV3_1 } from "./LlmConverterV3_1";

export namespace HttpLlmConverter {
  export const compose = <
    Model extends IHttpLlmApplication.Model,
    Parameters extends
      IHttpLlmApplication.ModelParameters[Model] = IHttpLlmApplication.ModelParameters[Model],
    Operation extends OpenApi.IOperation = OpenApi.IOperation,
    Route extends IHttpMigrateRoute = IHttpMigrateRoute<
      OpenApi.IJsonSchema,
      Operation
    >,
  >(props: {
    model: Model;
    migrate: IHttpMigrateApplication<OpenApi.IJsonSchema, Operation>;
    options: IHttpLlmApplication.IOptions<
      Model,
      Parameters["properties"][string] extends IHttpLlmApplication.ModelSchema[Model]
        ? Parameters["properties"][string]
        : IHttpLlmApplication.ModelSchema[Model]
    >;
  }): IHttpLlmApplication<Model, Parameters, Operation, Route> => {
    // COMPOSE FUNCTIONS
    const errors: IHttpLlmApplication.IError<Operation, Route>[] =
      props.migrate.errors.map((e) => ({
        method: e.method,
        path: e.path,
        messages: e.messages,
        operation: () => e.operation(),
        route: () => undefined,
      }));
    const functions: IHttpLlmFunction<Parameters, Operation, Route>[] =
      props.migrate.routes
        .map((route) => {
          if (route.method === "head") {
            errors.push({
              method: route.method,
              path: route.path,
              messages: [
                "HEAD method is not supported in the LLM application.",
              ],
              operation: () => route.operation(),
              route: () => route as any as Route,
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
              route: () => route as any as Route,
            });
            return null;
          }
          const func: IHttpLlmFunction<Parameters> | null = composeFunction({
            model: props.model,
            options: props.options,
            components: props.migrate.document().components,
            route,
          });
          if (func === null)
            errors.push({
              method: route.method,
              path: route.path,
              messages: ["Failed to escape $ref"],
              operation: () => route.operation(),
              route: () => route as any as Route,
            });
          return func;
        })
        .filter(
          (v): v is IHttpLlmFunction<Parameters, Operation, Route> =>
            v !== null,
        );
    return {
      model: props.model,
      options: props.options,
      functions,
      errors,
    };
  };

  export const separateParameters = <
    Model extends IHttpLlmApplication.Model,
    Parameters extends
      IHttpLlmApplication.ModelParameters[Model] = IHttpLlmApplication.ModelParameters[Model],
  >(props: {
    model: Model;
    parameters: Parameters;
    predicate: (schema: Parameters["properties"][string]) => boolean;
  }): IHttpLlmFunction.ISeparated<Parameters> => {
    const separator: (props: {
      predicate: (schema: Parameters["properties"][string]) => boolean;
      schema: Parameters["properties"][string];
    }) => [
      Parameters["properties"][string] | null,
      Parameters["properties"][string] | null,
    ] = SEPARATORS[props.model] as any;
    const [llm, human] = separator({
      predicate: props.predicate,
      schema: props.parameters as Parameters["properties"][string],
    });
    return {
      llm: llm as Parameters | null,
      human: human as Parameters | null,
    };
  };

  const composeFunction = <
    Model extends IHttpLlmApplication.Model,
    Parameters extends
      IHttpLlmApplication.ModelParameters[Model] = IHttpLlmApplication.ModelParameters[Model],
    Operation extends OpenApi.IOperation = OpenApi.IOperation,
    Route extends IHttpMigrateRoute = IHttpMigrateRoute<
      OpenApi.IJsonSchema,
      Operation
    >,
  >(props: {
    model: Model;
    components: OpenApi.IComponents;
    route: IHttpMigrateRoute<OpenApi.IJsonSchema, Operation>;
    options: IHttpLlmApplication.IOptions<
      Model,
      Parameters["properties"][string] extends IHttpLlmApplication.ModelSchema[Model]
        ? Parameters["properties"][string]
        : IHttpLlmApplication.ModelSchema[Model]
    >;
  }): IHttpLlmFunction<Parameters, Operation, Route> | null => {
    const $defs: Record<string, IChatGptSchema> = {};
    const cast = (
      s: OpenApi.IJsonSchema,
    ): Parameters["properties"][string] | null =>
      CASTERS[props.model]({
        options: props.options as any,
        schema: s,
        components: props.components,
        $defs,
      }) as Parameters["properties"][string] | null;
    const output: Parameters["properties"][string] | null | undefined =
      props.route.success && props.route.success
        ? cast(props.route.success.schema)
        : undefined;
    if (output === null) return null;
    const properties: [string, Parameters["properties"][string] | null][] = [
      ...props.route.parameters.map((p) => ({
        key: p.key,
        schema: {
          ...p.schema,
          title: p.parameter().title ?? p.schema.title,
          description: p.parameter().description ?? p.schema.description,
        },
      })),
      ...(props.route.query
        ? [
            {
              key: props.route.query.key,
              schema: {
                ...props.route.query.schema,
                title:
                  props.route.query.title() ?? props.route.query.schema.title,
                description:
                  props.route.query.description() ??
                  props.route.query.schema.description,
              },
            },
          ]
        : []),
      ...(props.route.body
        ? [
            {
              key: props.route.body.key,
              schema: {
                ...props.route.body.schema,
                description:
                  props.route.body.description() ??
                  props.route.body.schema.description,
              },
            },
          ]
        : []),
    ].map((o) => [o.key, cast(o.schema)]);
    if (properties.some(([_k, v]) => v === null)) return null;

    // COMPOSE PARAMETERS
    const parameters: Parameters = {
      type: "object",
      properties: Object.fromEntries(
        properties as [string, Parameters["properties"][string]][],
      ),
      additionalProperties: false,
      required: properties.map(([k]) => k),
    } as any as Parameters;
    if (Object.keys($defs).length)
      (parameters as any as IChatGptSchema.IParameters).$defs = $defs;
    const operation: OpenApi.IOperation = props.route.operation();

    // FINALIZATION
    return {
      method: props.route.method as "get",
      path: props.route.path,
      name: props.route.accessor.join("_"),
      strict: true,
      parameters,
      separated: props.options.separate
        ? separateParameters({
            model: props.model,
            predicate: props.options.separate as any,
            parameters,
          })
        : undefined,
      output: output as any,
      description: (() => {
        if (!operation.summary?.length || !operation.description?.length)
          return operation.summary || operation.description;
        const summary: string = operation.summary.endsWith(".")
          ? operation.summary.slice(0, -1)
          : operation.summary;
        return operation.description.startsWith(summary)
          ? operation.description
          : summary + ".\n\n" + operation.description;
      })(),
      deprecated: operation.deprecated,
      tags: operation.tags,
      route: () => props.route as any,
      operation: () => props.route.operation(),
    };
  };
}

const CASTERS = {
  "3.0": (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    options: IHttpLlmApplication.IOptions<"3.0">;
  }) =>
    LlmConverterV3.schema({
      components: props.components,
      schema: props.schema,
      recursive: props.options.recursive,
    }),
  "3.1": (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    options: IHttpLlmApplication.IOptions<"3.1">;
  }) =>
    LlmConverterV3_1.schema({
      components: props.components,
      schema: props.schema,
      recursive: props.options.recursive,
    }),
  chatgpt: (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    $defs: Record<string, IChatGptSchema>;
    options: Omit<IHttpLlmApplication.IChatGptOptions, "separate">;
  }) =>
    ChatGptConverter.schema({
      components: props.components,
      schema: props.schema,
      $defs: props.$defs,
      options: props.options,
    }),
  gemini: (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    options: IHttpLlmApplication.IOptions<"gemini">;
  }) =>
    GeminiConverter.schema({
      components: props.components,
      schema: props.schema,
      recursive: props.options.recursive,
    }),
};

const SEPARATORS = {
  "3.0": LlmConverterV3.separate,
  "3.1": LlmConverterV3_1.separate,
  chatgpt: ChatGptConverter.separate,
  gemini: GeminiConverter.separate,
};
