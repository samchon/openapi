import { TestValidator } from "@nestia/e2e";
import {
  HttpMigrateRouteFetcher,
  IHttpMigrateApplication,
  IHttpMigrateRoute,
  OpenApi,
} from "@samchon/openapi";
import { IHttpConnection } from "@samchon/openapi/lib/structures/IHttpConnection";
import { IHttpResponse } from "@samchon/openapi/lib/structures/IHttpResponse";

import swagger from "../../swagger.json";

export const test_http_migrate_fetch_propagate = async (
  connection: IHttpConnection,
): Promise<void> => {
  const document: OpenApi.IDocument = OpenApi.convert(swagger as any);
  const app: IHttpMigrateApplication = OpenApi.migrate(document);
  const route: IHttpMigrateRoute | undefined = app.routes.find(
    (r) => r.path === "/{a}/{b}/{c}/parameters" && r.method === "get",
  );
  if (route === undefined) throw new Error("Route not found");

  const response: IHttpResponse = await HttpMigrateRouteFetcher.propagate({
    connection,
    route,
    parameters: ["three", "two", "one"],
  });
  TestValidator.equals("status")(response.status)(400);
};
