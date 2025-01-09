import { OpenApi } from "../OpenApi";
import { IChatGptSchema } from "../structures/IChatGptSchema";
import { IHttpLlmApplication } from "../structures/IHttpLlmApplication";
import { IHttpLlmFunction } from "../structures/IHttpLlmFunction";
import { IHttpMigrateApplication } from "../structures/IHttpMigrateApplication";
import { IHttpMigrateRoute } from "../structures/IHttpMigrateRoute";
import { ILlmFunction } from "../structures/ILlmFunction";
import { ILlmSchema } from "../structures/ILlmSchema";
import { LlmSchemaComposer } from "./LlmSchemaComposer";

export namespace HttpLlmComposer {
  export const application = <Model extends ILlmSchema.Model>(props: {
    model: Model;
    migrate: IHttpMigrateApplication;
    options: IHttpLlmApplication.IOptions<Model>;
  }): IHttpLlmApplication<Model> => {
    // COMPOSE FUNCTIONS
    const errors: IHttpLlmApplication.IError[] = props.migrate.errors
      .filter((e) => e.operation()["x-samchon-human"] !== true)
      .map((e) => ({
        method: e.method,
        path: e.path,
        messages: e.messages,
        operation: () => e.operation(),
        route: () => undefined,
      }));
    const functions: IHttpLlmFunction<Model>[] = props.migrate.routes
      .filter((e) => e.operation()["x-samchon-human"] !== true)
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

    const app: IHttpLlmApplication<Model> = {
      model: props.model,
      options: props.options,
      functions,
      errors,
    };
    shorten(app, props.options?.maxLength ?? 64);
    return app;
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
    ): ILlmSchema.ModelSchema[Model] | null => {
      const result = LlmSchemaComposer.schema(props.model)({
        config: props.options as any,
        schema: s,
        components: props.components,
        $defs,
        accessor,
        refAccessor: `$input.components.schemas`,
      });
      if (result.success === false) {
        props.errors.push(
          ...result.error.reasons.map((r) => `${r.accessor}: ${r.message}`),
        );
        return null;
      }
      return result.value as ILlmSchema.ModelSchema[Model];
    };

    // METADATA
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

    // FUNTION NAME
    const name: string = emend(props.route.accessor.join("_"));
    const isNameVariable: boolean = /^[a-zA-Z0-9_-]+$/.test(name);
    const isNameStartsWithNumber: boolean = /^[0-9]/.test(name[0] ?? "");
    if (isNameVariable === false)
      props.errors.push(
        `Elements of path (separated by '/') must be composed with alphabets, numbers, underscores, and hyphens`,
      );
    if (
      output === null ||
      properties.some(([_k, v]) => v === null) ||
      isNameVariable === false ||
      isNameStartsWithNumber === true
    )
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
    if (LlmSchemaComposer.isDefs(props.model))
      (parameters as any as IChatGptSchema.IParameters).$defs = $defs;
    const operation: OpenApi.IOperation = props.route.operation();

    // FINALIZATION
    return {
      method: props.route.method as "get",
      path: props.route.path,
      name,
      parameters,
      separated: props.options.separate
        ? (LlmSchemaComposer.separateParameters(props.model)({
            predicate: props.options.separate as any,
            parameters:
              parameters satisfies ILlmSchema.ModelParameters[Model] as any,
          }) as ILlmFunction.ISeparated<Model>)
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

  export const shorten = <Model extends ILlmSchema.Model>(
    app: IHttpLlmApplication<Model>,
    limit: number = 64,
  ): void => {
    const dictionary: Set<string> = new Set();
    const longFunctions: IHttpLlmFunction<Model>[] = [];
    for (const func of app.functions) {
      dictionary.add(func.name);
      if (func.name.length > limit) {
        longFunctions.push(func);
      }
    }
    if (longFunctions.length === 0) return;

    let index: number = 0;
    for (const func of longFunctions) {
      let success: boolean = false;
      let rename = (str: string) => {
        dictionary.delete(func.name);
        dictionary.add(str);
        func.name = str;
        success = true;
      };
      for (let i: number = 1; i < func.route().accessor.length; ++i) {
        const shortName: string = func.route().accessor.slice(i).join("_");
        if (shortName.length > limit - 8) continue;
        else if (dictionary.has(shortName) === false) rename(shortName);
        else {
          const newName: string = `_${index}_${shortName}`;
          if (dictionary.has(newName) === true) continue;
          rename(newName);
          ++index;
        }
        break;
      }
      if (success === false) rename(randomFormatUuid());
    }
  };
}

const randomFormatUuid = (): string =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const emend = (str: string): string => {
  for (const ch of FORBIDDEN) str = str.split(ch).join("_");
  return str;
};

const FORBIDDEN = ["$", "%", "."];
