import { TestValidator } from "@nestia/e2e";
import {
  HttpLlm,
  IHttpLlmApplication,
  IHttpMigrateRoute,
  OpenApi,
} from "@samchon/openapi";
import fs from "fs";

import { TestGlobal } from "../../TestGlobal";

export const test_http_llm_application = async (): Promise<void> => {
  const document: OpenApi.IDocument = OpenApi.convert(
    JSON.parse(
      await fs.promises.readFile(`${TestGlobal.ROOT}/swagger.json`, "utf8"),
    ),
  );
  const application: IHttpLlmApplication<"3.0"> = HttpLlm.application({
    model: "3.0",
    document,
    options: {},
  });
  for (const func of application.functions) {
    const route: IHttpMigrateRoute = func.route();
    TestValidator.equals("type")({ type: "object" })(func.parameters);
    TestValidator.equals("properties")([
      ...route.parameters.map((p) => p.key),
      ...(route.query ? ["query"] : []),
      ...(route.body ? ["body"] : []),
    ])(Object.keys(func.parameters.properties ?? {}));
  }
};
