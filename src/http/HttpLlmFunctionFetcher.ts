import type { HttpLlm } from "../HttpLlm";
import type { HttpMigration } from "../HttpMigration";
import { OpenApi } from "../OpenApi";
import { IHttpLlmApplication } from "../structures/IHttpLlmApplication";
import { IHttpMigrateRoute } from "../structures/IHttpMigrateRoute";
import { IHttpResponse } from "../structures/IHttpResponse";
import { HttpMigrateRouteFetcher } from "./HttpMigrateRouteFetcher";

export namespace HttpLlmFunctionFetcher {
  export const execute = async <
    Model extends IHttpLlmApplication.Model,
    Parameters extends
      IHttpLlmApplication.ModelParameters[Model] = IHttpLlmApplication.ModelParameters[Model],
    Operation extends OpenApi.IOperation = OpenApi.IOperation,
    Route extends IHttpMigrateRoute = IHttpMigrateRoute<
      OpenApi.IJsonSchema,
      Operation
    >,
  >(
    props: HttpLlm.IFetchProps<Model, Parameters, Operation, Route>,
  ): Promise<unknown> =>
    HttpMigrateRouteFetcher.execute(getFetchArguments("execute", props));

  export const propagate = async <
    Model extends IHttpLlmApplication.Model,
    Parameters extends
      IHttpLlmApplication.ModelParameters[Model] = IHttpLlmApplication.ModelParameters[Model],
    Operation extends OpenApi.IOperation = OpenApi.IOperation,
    Route extends IHttpMigrateRoute = IHttpMigrateRoute<
      OpenApi.IJsonSchema,
      Operation
    >,
  >(
    props: HttpLlm.IFetchProps<Model, Parameters, Operation, Route>,
  ): Promise<IHttpResponse> =>
    HttpMigrateRouteFetcher.propagate(getFetchArguments("propagate", props));

  const getFetchArguments = <
    Model extends IHttpLlmApplication.Model,
    Parameters extends
      IHttpLlmApplication.ModelParameters[Model] = IHttpLlmApplication.ModelParameters[Model],
    Operation extends OpenApi.IOperation = OpenApi.IOperation,
    Route extends IHttpMigrateRoute = IHttpMigrateRoute<
      OpenApi.IJsonSchema,
      Operation
    >,
  >(
    from: string,
    props: HttpLlm.IFetchProps<Model, Parameters, Operation, Route>,
  ): HttpMigration.IFetchProps => {
    const route: Route = props.function.route();
    const input: Record<string, any> = props.input;
    const valid: boolean = typeof input === "object" && input !== null;
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
  };
}
