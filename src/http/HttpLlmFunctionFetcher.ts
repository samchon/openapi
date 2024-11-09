import type { HttpLlm } from "../HttpLlm";
import type { HttpMigration } from "../HttpMigration";
import { OpenApi } from "../OpenApi";
import { IChatGptSchema } from "../structures/IChatGptSchema";
import { IGeminiSchema } from "../structures/IGeminiSchema";
import { IHttpLlmApplication } from "../structures/IHttpLlmApplication";
import { IHttpMigrateRoute } from "../structures/IHttpMigrateRoute";
import { IHttpResponse } from "../structures/IHttpResponse";
import { ILlmSchemaV3 } from "../structures/ILlmSchemaV3";
import { ILlmSchemaV3_1 } from "../structures/ILlmSchemaV3_1";
import { HttpMigrateRouteFetcher } from "./HttpMigrateRouteFetcher";

export namespace HttpLlmFunctionFetcher {
  export const execute = async <
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
  >(
    props: HttpLlm.IFetchProps<Model, Schema, Operation, Route>,
  ): Promise<unknown> =>
    HttpMigrateRouteFetcher.execute(getFetchArguments("execute", props));

  export const propagate = async <
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
  >(
    props: HttpLlm.IFetchProps<Model, Schema, Operation, Route>,
  ): Promise<IHttpResponse> =>
    HttpMigrateRouteFetcher.propagate(getFetchArguments("propagate", props));

  const getFetchArguments = <
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
  >(
    from: string,
    props: HttpLlm.IFetchProps<Model, Schema, Operation, Route>,
  ): HttpMigration.IFetchProps => {
    const route: Route = props.function.route();
    if (props.application.options.keyword === true) {
      const input: Record<string, any> = props.arguments[0];
      const valid: boolean =
        props.arguments.length === 1 &&
        typeof input === "object" &&
        input !== null;
      if (valid === false)
        throw new Error(
          `Error on HttpLlmFunctionFetcher.${from}(): keyworded arguments must be an object`,
        );
      return {
        connection: props.connection,
        route,
        parameters: Object.fromEntries(
          route.parameters.map((p) => [p.key, input[p.key]] as const),
        ),
        query: input.query,
        body: input.body,
      };
    }
    const parameters: Array<string | number | boolean | bigint | null> =
      props.arguments.slice(0, route.parameters.length);
    const query: object | undefined = route.query
      ? props.arguments[route.parameters.length]
      : undefined;
    const body: object | undefined = route.body
      ? props.arguments[route.parameters.length + (route.query ? 1 : 0)]
      : undefined;
    return {
      connection: props.connection,
      route,
      parameters,
      query,
      body,
    } satisfies HttpMigration.IFetchProps;
  };
}
