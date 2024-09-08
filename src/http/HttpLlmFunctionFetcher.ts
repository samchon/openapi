import type { HttpLlm } from "../HttpLlm";
import type { HttpMigration } from "../HttpMigration";
import { IHttpMigrateRoute } from "../structures/IHttpMigrateRoute";
import { IHttpResponse } from "../structures/IHttpResponse";
import { HttpMigrateRouteFetcher } from "./HttpMigrateRouteFetcher";

export namespace HttpLlmFunctionFetcher {
  export const execute = async (props: HttpLlm.IFetchProps): Promise<unknown> =>
    HttpMigrateRouteFetcher.execute(getFetchArguments("execute", props));

  export const propagate = async (
    props: HttpLlm.IFetchProps,
  ): Promise<IHttpResponse> =>
    HttpMigrateRouteFetcher.propagate(getFetchArguments("propagate", props));

  const getFetchArguments = (
    from: string,
    props: HttpLlm.IFetchProps,
  ): HttpMigration.IFetchProps => {
    const route: IHttpMigrateRoute = props.function.route();
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
    };
  };
}
