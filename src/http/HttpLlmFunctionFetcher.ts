import { IHttpConnection } from "../structures/IHttpConnection";
import { IHttpLlmApplication } from "../structures/IHttpLlmApplication";
import { IHttpLlmFunction } from "../structures/IHttpLlmFunction";
import { IHttpMigrateRoute } from "../structures/IHttpMigrateRoute";
import { IHttpResponse } from "../structures/IHttpResponse";
import { HttpMigrateRouteFetcher } from "./HttpMigrateRouteFetcher";

export namespace HttpLlmFunctionFetcher {
  export interface IProps {
    /**
     * Document of the OpenAI function call schemas.
     */
    document: IHttpLlmApplication;

    /**
     * Procedure schema to call.
     */
    procedure: IHttpLlmFunction;

    /**
     * Connection info to the server.
     */
    connection: IHttpConnection;

    /**
     * Arguments for the function call.
     */
    arguments: any[];
  }

  export const execute = async (props: IProps): Promise<unknown> =>
    HttpMigrateRouteFetcher.request(getFetchArguments(props));

  export const propagate = async (props: IProps): Promise<IHttpResponse> =>
    HttpMigrateRouteFetcher.propagate(getFetchArguments(props));

  const getFetchArguments = (props: IProps): HttpMigrateRouteFetcher.IProps => {
    const route: IHttpMigrateRoute = props.procedure.route();
    if (props.document.options.keyword === true) {
      const input: Pick<
        HttpMigrateRouteFetcher.IProps,
        "parameters" | "query" | "body"
      > = props.arguments[0];
      return {
        connection: props.connection,
        route,
        parameters: input.parameters,
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
