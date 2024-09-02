import {
  HttpMigrateRouteFetcher,
  IHttpMigrateApplication,
  IHttpMigrateRoute,
} from "@samchon/openapi";
import { OpenApi } from "@samchon/openapi/lib/OpenApi";
import { IHttpConnection } from "@samchon/openapi/lib/structures/IHttpConnection";

import swagger from "../../swagger.json";

export const test_http_migrate_fetch_query = async (
  connection: IHttpConnection,
): Promise<void> => {
  const document: OpenApi.IDocument = OpenApi.convert(swagger as any);
  const app: IHttpMigrateApplication = OpenApi.migrate(document);
  const route: IHttpMigrateRoute | undefined = app.routes.find(
    (r) => r.path === "/{a}/{b}/{c}/query" && r.method === "get",
  );
  if (route === undefined) throw new Error("Route not found");

  await HttpMigrateRouteFetcher.request({
    connection,
    route,
    parameters: {
      a: "string",
      b: 123,
      c: true,
    },
    query: {
      summary: "some summary",
      thumbnail: "https://some.url",
    },
  });
};
