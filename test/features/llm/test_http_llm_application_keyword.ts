import { TestValidator } from "@nestia/e2e";
import {
  HttpLlm,
  IHttpLlmApplication,
  IHttpMigrateRoute,
  ILlmSchema,
  LlmTypeChecker,
  OpenApi,
} from "@samchon/openapi";

import swagger from "../../swagger.json";

export const test_http_llm_application_keyword = (): void => {
  const document: OpenApi.IDocument = OpenApi.convert(swagger as any);
  const application: IHttpLlmApplication = HttpLlm.application(document, {
    keyword: true,
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
        const schema: ILlmSchema = func.parameters[0];
        if (!LlmTypeChecker.isObject(schema)) return [];
        return Object.keys(schema.properties ?? {});
      })(),
    );
  }
};
