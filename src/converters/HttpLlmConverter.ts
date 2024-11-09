import { OpenApi } from "../OpenApi";
import { IChatGptSchema } from "../structures/IChatGptSchema";
import { IGeminiSchema } from "../structures/IGeminiSchema";
import { IHttpLlmApplication } from "../structures/IHttpLlmApplication";
import { IHttpLlmFunction } from "../structures/IHttpLlmFunction";
import { IHttpMigrateApplication } from "../structures/IHttpMigrateApplication";
import { IHttpMigrateRoute } from "../structures/IHttpMigrateRoute";
import { ILlmSchemaV3 } from "../structures/ILlmSchemaV3";
import { ILlmSchemaV3_1 } from "../structures/ILlmSchemaV3_1";
import { ChatGptConverter } from "./ChatGptConverter";
import { GeminiConverter } from "./GeminiConverter";
import { LlmConverterV3 } from "./LlmConverterV3";
import { LlmConverterV3_1 } from "./LlmConverterV3_1";

export namespace HttpLlmConverter {
  export const compose = <
    Model extends IHttpLlmApplication.Model,
    Schema extends
      | ILlmSchemaV3
      | ILlmSchemaV3_1
      | IChatGptSchema
      | IGeminiSchema = IHttpLlmApplication.ModelSchema[Model],
    Operation extends OpenApi.IOperation = OpenApi.IOperation,
    Route extends IHttpMigrateRoute = IHttpMigrateRoute<
      OpenApi.IJsonSchema,
      Operation
    >,
  >(props: {
    model: Model;
    migrate: IHttpMigrateApplication<OpenApi.IJsonSchema, Operation>;
    options: IHttpLlmApplication.IOptions<Model, Schema>;
  }): IHttpLlmApplication<Model, Schema, Operation, Route> => {
    // COMPOSE FUNCTIONS
    const errors: IHttpLlmApplication.IError<Operation, Route>[] =
      props.migrate.errors.map((e) => ({
        method: e.method,
        path: e.path,
        messages: e.messages,
        operation: () => e.operation(),
        route: () => undefined,
      }));
    const functions: IHttpLlmFunction<Schema, Operation, Route>[] =
      props.migrate.routes
        .map((route) => {
          if (route.method === "head") return null;
          const func: IHttpLlmFunction<Schema> | null = composeFunction({
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
          (v): v is IHttpLlmFunction<Schema, Operation, Route> => v !== null,
        );
    return {
      model: props.model,
      options: props.options,
      functions,
      errors,
    };
  };

  export const schema = <
    Model extends IHttpLlmApplication.Model,
    Schema extends
      | ILlmSchemaV3
      | ILlmSchemaV3_1
      | IChatGptSchema
      | IGeminiSchema = IHttpLlmApplication.ModelSchema[Model],
  >(props: {
    model: Model;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    recursive: false | number;
  }): Schema | null => {
    return CASTERS[props.model]({
      components: props.components,
      recursive: props.recursive,
      schema: props.schema,
    }) as Schema | null;
  };
}

const composeFunction = <
  Model extends IHttpLlmApplication.Model,
  Schema extends
    | ILlmSchemaV3
    | ILlmSchemaV3_1
    | IChatGptSchema
    | IGeminiSchema = IHttpLlmApplication.ModelSchema[Model],
  Operation extends OpenApi.IOperation = OpenApi.IOperation,
  Route extends IHttpMigrateRoute = IHttpMigrateRoute<
    OpenApi.IJsonSchema,
    Operation
  >,
>(props: {
  model: Model;
  components: OpenApi.IComponents;
  route: IHttpMigrateRoute<OpenApi.IJsonSchema, Operation>;
  options: IHttpLlmApplication.IOptions<Model, Schema>;
}): IHttpLlmFunction<Schema, Operation, Route> | null => {
  const cast = (s: OpenApi.IJsonSchema): Schema | null =>
    CASTERS[props.model]({
      components: props.components,
      recursive: props.options.recursive,
      schema: s,
    }) as Schema | null;
  const output: Schema | null | undefined =
    props.route.success && props.route.success
      ? cast(props.route.success.schema)
      : undefined;
  if (output === null) return null;
  const properties: [string, Schema | null][] = [
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
  const parameters: Schema[] = props.options.keyword
    ? [
        {
          type: "object",
          properties: Object.fromEntries(properties as [string, Schema][]),
          additionalProperties: false,
        } as any as Schema,
      ]
    : properties.map(([_k, v]) => v!);
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
          predicate: props.options.separate,
          parameters,
        })
      : undefined,
    output,
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
    route: () => props.route as any,
    operation: () => props.route.operation(),
  };
};

const separateParameters = <
  Model extends IHttpLlmApplication.Model,
  Schema extends ILlmSchemaV3 | ILlmSchemaV3_1 | IChatGptSchema | IGeminiSchema,
>(props: {
  model: Model;
  parameters: Schema[];
  predicate: (schema: Schema) => boolean;
}): IHttpLlmFunction.ISeparated<Schema> => {
  const separator: (props: {
    predicate: (schema: Schema) => boolean;
    schema: Schema;
  }) => [Schema | null, Schema | null] = SEPARATORS[props.model] as any;
  const indexes: Array<[Schema | null, Schema | null]> = props.parameters.map(
    (schema) =>
      separator({
        predicate: props.predicate,
        schema,
      }),
  );
  return {
    llm: indexes
      .map(([llm], index) => ({
        index,
        schema: llm!,
      }))
      .filter(({ schema }) => schema !== null),
    human: indexes
      .map(([, human], index) => ({
        index,
        schema: human!,
      }))
      .filter(({ schema }) => schema !== null),
  };
};

const CASTERS = {
  "3.0": (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    recursive: false | number;
  }) => LlmConverterV3.schema(props),
  "3.1": (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    recursive: false | number;
  }) => LlmConverterV3_1.schema(props),
  chatgpt: (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    recursive: false | number;
  }) => ChatGptConverter.schema(props),
  gemini: (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    recursive: false | number;
  }) => GeminiConverter.schema(props),
};

const SEPARATORS = {
  "3.0": LlmConverterV3.separate,
  "3.1": LlmConverterV3_1.separate,
  chatgpt: ChatGptConverter.separate,
  gemini: GeminiConverter.separate,
};
