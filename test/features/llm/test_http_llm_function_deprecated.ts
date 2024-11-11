import { TestValidator } from "@nestia/e2e";
import {
  HttpLlm,
  IHttpLlmApplication,
  IHttpLlmFunction,
  ILlmSchemaV3,
  OpenApi,
} from "@samchon/openapi";

import swagger from "../../swagger.json";

export const test_http_llm_function_deprecated = (): void => {
  const document: OpenApi.IDocument = OpenApi.convert(swagger as any);
  const application: IHttpLlmApplication<"3.0"> = HttpLlm.application({
    model: "3.0",
    document,
    options: {
      keyword: true,
    },
  });
  const func: IHttpLlmFunction<ILlmSchemaV3> | undefined =
    application.functions.find(
      (f) => f.method === "get" && f.path === "/nothing",
    );
  TestValidator.equals("deprecated")(func?.deprecated)(true);
};
