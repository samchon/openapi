import { OpenApi } from "../OpenApi";
import { IChatGptSchema } from "../structures/IChatGptSchema";
import { IHttpLlmApplication } from "../structures/IHttpLlmApplication";
import { IHttpLlmFunction } from "../structures/IHttpLlmFunction";
import { IHttpMigrateApplication } from "../structures/IHttpMigrateApplication";
import { IHttpMigrateRoute } from "../structures/IHttpMigrateRoute";
import { ILlmSchema } from "../structures/ILlmSchema";
import { ChatGptConverter } from "./ChatGptConverter";
import { ClaudeConverter } from "./ClaudeConverter";
import { GeminiConverter } from "./GeminiConverter";
import { LlamaConverter } from "./LlamaConverter";
import { LlmConverterV3 } from "./LlmConverterV3";
import { LlmConverterV3_1 } from "./LlmConverterV3_1";
import { LlmSchemaConverter } from "./LlmSchemaConverter";

export namespace HttpLlmConverter {
  export const application = <Model extends ILlmSchema.Model>(props: {
    model: Model;
    migrate: IHttpMigrateApplication;
    options: IHttpLlmApplication.IOptions<Model>;
  }): IHttpLlmApplication<Model> => {
    // COMPOSE FUNCTIONS
    const errors: IHttpLlmApplication.IError[] = props.migrate.errors.map(
      (e) => ({
        method: e.method,
        path: e.path,
        messages: e.messages,
        operation: () => e.operation(),
        route: () => undefined,
      }),
    );
    const functions: IHttpLlmFunction<Model>[] = props.migrate.routes
      .map((route, i) => {
        if (route.method === "head") {
          errors.push({
            method: route.method,
            path: route.path,
            messages: ["HEAD method is not supported in the LLM application."],
            operation: () => route.operation(),
            route: () => route as any as IHttpMigrateRoute,
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
            route: () => route as any as IHttpMigrateRoute,
          });
          return null;
        }
        const localErrors: string[] = [];
        const func: IHttpLlmFunction<Model> | null = composeFunction<Model>({
          model: props.model,
          options: props.options,
          components: props.migrate.document().components,
          route: route,
          errors: localErrors,
          index: i,
        });
        if (func === null)
          errors.push({
            method: route.method,
            path: route.path,
            messages: localErrors,
            operation: () => route.operation(),
            route: () => route as any as IHttpMigrateRoute,
          });
        return func;
      })
      .filter((v): v is IHttpLlmFunction<Model> => v !== null);
    return {
      model: props.model,
      options: props.options,
      functions,
      errors,
    };
  };

  export const separate = <Model extends ILlmSchema.Model>(props: {
    model: Model;
    parameters: ILlmSchema.ModelParameters[Model];
    predicate: (schema: ILlmSchema.ModelSchema[Model]) => boolean;
  }): IHttpLlmFunction.ISeparated<ILlmSchema.ModelParameters[Model]> => {
    const separator: (props: {
      predicate: (schema: ILlmSchema.ModelSchema[Model]) => boolean;
      schema: ILlmSchema.ModelSchema[Model];
    }) => [
      ILlmSchema.ModelParameters[Model] | null,
      ILlmSchema.ModelParameters[Model] | null,
    ] = SEPARATORS[props.model] as any;
    const [llm, human] = separator({
      predicate: props.predicate,
      schema: props.parameters,
    });
    return {
      llm,
      human,
    } satisfies IHttpLlmFunction.ISeparated<
      ILlmSchema.ModelParameters[Model]
    > as IHttpLlmFunction.ISeparated<ILlmSchema.ModelParameters[Model]>;
  };

  const composeFunction = <Model extends ILlmSchema.Model>(props: {
    model: Model;
    components: OpenApi.IComponents;
    route: IHttpMigrateRoute;
    options: IHttpLlmApplication.IOptions<Model>;
    errors: string[];
    index: number;
  }): IHttpLlmFunction<Model> | null => {
    const $defs: Record<string, IChatGptSchema> = {};
    const cast = (
      s: OpenApi.IJsonSchema,
      accessor: string,
    ): ILlmSchema.ModelSchema[Model] | null =>
      LlmSchemaConverter.schema(props.model)({
        config: props.options as any,
        schema: s,
        components: props.components,
        $defs,
        errors: props.errors,
        accessor,
        refAccessor: `$input.components.schemas`,
      }) as ILlmSchema.ModelSchema[Model] | null;

    const endpoint: string = `$input.paths[${JSON.stringify(props.route.path)}][${JSON.stringify(props.route.method)}]`;
    const output: ILlmSchema.ModelSchema[Model] | null | undefined = props.route
      .success
      ? cast(
          props.route.success.schema,
          `${endpoint}.responses[${JSON.stringify(props.route.success.status)}][${JSON.stringify(props.route.success.type)}].schema`,
        )
      : undefined;
    const properties: Array<
      readonly [string, ILlmSchema.ModelSchema[Model] | null]
    > = [
      ...props.route.parameters.map(
        (s) =>
          [
            s.key,
            cast(
              {
                ...s.schema,
                title: s.parameter().title ?? s.schema.title,
                description: s.parameter().description ?? s.schema.description,
              },
              `${endpoint}.parameters[${JSON.stringify(s.key)}].schema`,
            ),
          ] as const,
      ),
      ...(props.route.query
        ? [
            [
              props.route.query.key,
              cast(
                {
                  ...props.route.query.schema,
                  title:
                    props.route.query.title() ?? props.route.query.schema.title,
                  description:
                    props.route.query.description() ??
                    props.route.query.schema.description,
                },
                `${endpoint}.parameters[${JSON.stringify(props.route.query.key)}].schema`,
              ),
            ] as const,
          ]
        : []),
      ...(props.route.body
        ? [
            [
              props.route.body.key,
              cast(
                {
                  ...props.route.body.schema,
                  description:
                    props.route.body.description() ??
                    props.route.body.schema.description,
                },
                `${endpoint}.requestBody.content[${JSON.stringify(props.route.body.type)}].schema`,
              ),
            ] as const,
          ]
        : []),
    ];
    if (output === null || properties.some(([_k, v]) => v === null))
      return null;

    // COMPOSE PARAMETERS
    const parameters: ILlmSchema.ModelParameters[Model] = {
      type: "object",
      properties: Object.fromEntries(
        properties as [string, ILlmSchema.ModelSchema[Model]][],
      ),
      additionalProperties: false,
      required: properties.map(([k]) => k),
    } as any as ILlmSchema.ModelParameters[Model];
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
        ? separate({
            model: props.model,
            predicate: props.options.separate,
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

const SEPARATORS = {
  chatgpt: ChatGptConverter.separate,
  claude: ClaudeConverter.separate,
  gemini: GeminiConverter.separate,
  llama: LlamaConverter.separate,
  "3.0": LlmConverterV3.separate,
  "3.1": LlmConverterV3_1.separate,
};
