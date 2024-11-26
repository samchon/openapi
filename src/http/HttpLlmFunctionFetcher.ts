import type { HttpLlm } from "../HttpLlm";
import type { HttpMigration } from "../HttpMigration";
import { IHttpMigrateRoute } from "../structures/IHttpMigrateRoute";
import { IHttpResponse } from "../structures/IHttpResponse";
import { ILlmSchema } from "../structures/ILlmSchema";
import { HttpMigrateRouteFetcher } from "./HttpMigrateRouteFetcher";

export namespace HttpLlmFunctionFetcher {
  export const execute = <Model extends ILlmSchema.Model>(
    props: HttpLlm.IFetchProps<Model>,
  ): Promise<unknown> =>
    HttpMigrateRouteFetcher.execute(getFetchArguments<Model>("execute", props));

  export const propagate = <Model extends ILlmSchema.Model>(
    props: HttpLlm.IFetchProps<Model>,
  ): Promise<IHttpResponse> =>
    HttpMigrateRouteFetcher.propagate(
      getFetchArguments<Model>("propagate", props),
    );

  const getFetchArguments = <Model extends ILlmSchema.Model>(
    from: string,
    props: HttpLlm.IFetchProps<Model>,
  ): HttpMigration.IFetchProps => {
    const route: IHttpMigrateRoute = props.function.route();
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
