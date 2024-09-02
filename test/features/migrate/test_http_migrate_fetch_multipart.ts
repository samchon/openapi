import {
  HttpMigrateRouteFetcher,
  IHttpMigrateApplication,
  IHttpMigrateRoute,
  OpenApi,
} from "@samchon/openapi";
import { IHttpConnection } from "@samchon/openapi/lib/structures/IHttpConnection";

import swagger from "../../swagger.json";

export const test_http_migrate_fetch_multipart = async (
  connection: IHttpConnection,
): Promise<void> => {
  const document: OpenApi.IDocument = OpenApi.convert(swagger as any);
  const app: IHttpMigrateApplication = OpenApi.migrate(document);
  const route: IHttpMigrateRoute | undefined = app.routes.find(
    (r) => r.path === "/{a}/{b}/{c}/multipart" && r.method === "post",
  );
  if (route === undefined) throw new Error("Route not found");

  await HttpMigrateRouteFetcher.request({
    connection,
    route,
    parameters: {
      a: "three",
      b: 2,
      c: true,
    },
    query: {
      summary: "some summary",
      thumbnail: "https://some.url",
    },
    body: {
      title: "some title",
      body: "some body",
      draft: false,
      file: new File([new Uint8Array(999).fill(1)], "file.txt"),
    },
  });
};
