import {
  HttpMigration,
  IHttpConnection,
  IHttpMigrateApplication,
  IHttpMigrateRoute,
  OpenApi,
} from "@samchon/openapi";

import swagger from "../../swagger.json";

export const test_http_migrate_fetch_keyword_parameters = async (
  connection: IHttpConnection,
): Promise<void> => {
  const document: OpenApi.IDocument = OpenApi.convert(swagger as any);
  const app: IHttpMigrateApplication = HttpMigration.application(document);
  const route: IHttpMigrateRoute | undefined = app.routes.find(
    (r) =>
      r.path === "/{index}/{level}/{optimal}/parameters" && r.method === "get",
  );
  if (route === undefined) throw new Error("Route not found");

  await HttpMigration.request({
    connection,
    route,
    parameters: {
      index: "https://some.url/index.html",
      level: 2,
      optimal: true,
    },
  });
};
