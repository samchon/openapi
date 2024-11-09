import { TestValidator } from "@nestia/e2e";
import {
  HttpLlm,
  IHttpLlmApplication,
  IHttpMigrateRoute,
  ILlmSchemaV3,
  LlmTypeCheckerV3,
  OpenApi,
} from "@samchon/openapi";

import swagger from "../../swagger.json";

export const test_http_llm_application_keyword = (): void => {
  const document: OpenApi.IDocument = OpenApi.convert(swagger as any);
  const application: IHttpLlmApplication<"3.0"> = HttpLlm.application({
    model: "3.0",
    document,
    options: {
      keyword: true,
    },
  });
  for (const func of application.functions) {
    const route: IHttpMigrateRoute = func.route();
    TestValidator.equals("length")(1)(func.parameters.length);
    TestValidator.equals("properties")([
      ...route.parameters.map((p) => p.key),
      ...(route.query ? ["query"] : []),
      ...(route.body ? ["body"] : []),
    ])(
      (() => {
        const schema: ILlmSchemaV3 = func.parameters[0];
        if (!LlmTypeCheckerV3.isObject(schema)) return [];
        return Object.keys(schema.properties ?? {});
      })(),
    );
  }
};
