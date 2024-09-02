import { OpenApi } from "./OpenApi";
import { MigrateConverter } from "./converters/MigrateConverter";
import { HttpMigrateRouteFetcher } from "./http/HttpMigrateRouteFetcher";
import { IHttpConnection } from "./structures/IHttpConnection";
import { IHttpMigrateApplication } from "./structures/IHttpMigrateApplication";
import { IHttpMigrateRoute } from "./structures/IHttpMigrateRoute";
import { IHttpResponse } from "./structures/IHttpResponse";

export namespace HttpMigration {
  export const application = <
    Schema extends OpenApi.IJsonSchema = OpenApi.IJsonSchema,
    Operation extends OpenApi.IOperation<Schema> = OpenApi.IOperation<Schema>,
  >(
    document: OpenApi.IDocument<Schema, Operation>,
  ): IHttpMigrateApplication<Schema, Operation> =>
    MigrateConverter.convert(document);

  export interface IProps {
    connection: IHttpConnection;
    route: IHttpMigrateRoute;
    parameters:
      | Array<string | number | boolean | bigint | null>
      | Record<string, string | number | boolean | bigint | null>;
    query?: object | undefined;
    body?: object | undefined;
  }
  export const request = (props: IProps): Promise<unknown> =>
    HttpMigrateRouteFetcher.request(props);
  export const propagate = (props: IProps): Promise<IHttpResponse> =>
    HttpMigrateRouteFetcher.propagate(props);
}
