import { TestValidator } from "@nestia/e2e";
import {
  HttpMigrateRouteFetcher,
  IHttpMigrateApplication,
  IHttpMigrateRoute,
} from "@samchon/openapi";
import { OpenApi } from "@samchon/openapi/lib/OpenApi";
import { IHttpConnection } from "@samchon/openapi/lib/structures/IHttpConnection";
import { IHttpResponse } from "@samchon/openapi/lib/structures/IHttpResponse";

import swagger from "../../swagger.json";

export const test_http_migrate_fetch_body = async (
  connection: IHttpConnection,
): Promise<void> => {
  const document: OpenApi.IDocument = OpenApi.convert(swagger as any);
  const app: IHttpMigrateApplication = OpenApi.migrate(document);
  const route: IHttpMigrateRoute | undefined = app.routes.find(
    (r) => r.path === "/{a}/{b}/{c}/body" && r.method === "post",
  );
  if (route === undefined) throw new Error("Route not found");

  const response: IHttpResponse = await HttpMigrateRouteFetcher.propagate({
    connection,
    route,
    parameters: {
      a: "string",
      b: 123,
      c: true,
    },
    body: {
      title: "some title",
      body: "some body",
      draft: false,
    },
  });
  TestValidator.equals("response.status")(response.status)(201);
};
