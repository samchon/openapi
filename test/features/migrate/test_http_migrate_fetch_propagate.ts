import { TestValidator } from "@nestia/e2e";
import {
  HttpMigration,
  IHttpConnection,
  IHttpMigrateApplication,
  IHttpMigrateRoute,
  IHttpResponse,
  OpenApi,
} from "@samchon/openapi";

import swagger from "../../swagger.json";

export const test_http_migrate_fetch_propagate = async (
  connection: IHttpConnection,
): Promise<void> => {
  const document: OpenApi.IDocument = OpenApi.convert(swagger as any);
  const app: IHttpMigrateApplication = HttpMigration.application(document);
  const route: IHttpMigrateRoute | undefined = app.routes.find(
    (r) =>
      r.path === "/{index}/{level}/{optimal}/parameters" && r.method === "get",
  );
  if (route === undefined) throw new Error("Route not found");

  const response: IHttpResponse = await HttpMigration.propagate({
    connection,
    route,
    parameters: ["three", "two", "one"],
  });
  TestValidator.equals("status")(response.status)(400);
};
