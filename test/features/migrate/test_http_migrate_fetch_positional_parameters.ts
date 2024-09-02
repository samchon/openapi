import {
  HttpMigrateRouteFetcher,
  IHttpMigrateApplication,
  IHttpMigrateRoute,
  OpenApi,
} from "@samchon/openapi";
import { IHttpConnection } from "@samchon/openapi/lib/structures/IHttpConnection";

import swagger from "../../swagger.json";

export const test_http_migrate_fetch_positional_parameters = async (
  connection: IHttpConnection,
): Promise<void> => {
  const document: OpenApi.IDocument = OpenApi.convert(swagger as any);
  const app: IHttpMigrateApplication = OpenApi.migrate(document);
  const route: IHttpMigrateRoute | undefined = app.routes.find(
    (r) => r.path === "/{a}/{b}/{c}/parameters" && r.method === "get",
  );
  if (route === undefined) throw new Error("Route not found");

  await HttpMigrateRouteFetcher.request({
    connection,
    route,
    parameters: ["three", 2, true],
  });
};
