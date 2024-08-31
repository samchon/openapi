import { IHttpConnection } from "../structures/IHttpConnection";
import { IHttpResponse } from "../structures/IHttpResponse";
import { ILlmHttpApplication } from "../structures/ILlmHttpApplication";
import { ILlmHttpFunction } from "../structures/ILlmHttpFunction";
import { IMigrateRoute } from "../structures/IMigrateRoute";
import { MigrateRouteFetcher } from "./MigrateRouteFetcher";

export namespace LlmFunctionFetcher {
  export interface IProps {
    /**
     * Document of the OpenAI function call schemas.
     */
    document: ILlmHttpApplication;

    /**
     * Procedure schema to call.
     */
    procedure: ILlmHttpFunction;

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
    MigrateRouteFetcher.request(getFetchArguments(props));

  export const propagate = async (props: IProps): Promise<IHttpResponse> =>
    MigrateRouteFetcher.propagate(getFetchArguments(props));

  const getFetchArguments = (props: IProps): MigrateRouteFetcher.IProps => {
    const route: IMigrateRoute = props.procedure.route();
    if (props.document.options.keyword === true) {
      const input: Pick<
        MigrateRouteFetcher.IProps,
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
