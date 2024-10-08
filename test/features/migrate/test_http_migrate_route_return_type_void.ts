import { TestValidator } from "@nestia/e2e";
import {
  HttpMigration,
  IHttpMigrateApplication,
  IHttpMigrateRoute,
  OpenApi,
} from "@samchon/openapi";

import swagger from "../../swagger.json";

export const test_http_migrate_route_return_type_void = (): void => {
  const document: OpenApi.IDocument = OpenApi.convert(swagger as any);
  const app: IHttpMigrateApplication = HttpMigration.application(document);
  const route: IHttpMigrateRoute | undefined = app.routes.find(
    (r) => r.path === "/nothing" && r.method === "get",
  );
  TestValidator.equals("exists")(!!route)(true);
};
