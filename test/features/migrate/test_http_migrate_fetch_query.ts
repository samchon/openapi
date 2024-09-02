import {
  HttpMigration,
  IHttpConnection,
  IHttpMigrateApplication,
  IHttpMigrateRoute,
  OpenApi,
} from "@samchon/openapi";

import swagger from "../../swagger.json";

export const test_http_migrate_fetch_query = async (
  connection: IHttpConnection,
): Promise<void> => {
  const document: OpenApi.IDocument = OpenApi.convert(swagger as any);
  const app: IHttpMigrateApplication = HttpMigration.application(document);
  const route: IHttpMigrateRoute | undefined = app.routes.find(
    (r) => r.path === "/{index}/{level}/{optimal}/query" && r.method === "get",
  );
  if (route === undefined) throw new Error("Route not found");

  await HttpMigration.request({
    connection,
    route,
    parameters: {
      index: "string",
      level: 123,
      optimal: true,
    },
    query: {
      summary: "some summary",
      thumbnail: "https://some.url",
    },
  });
};
