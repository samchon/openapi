import { TestValidator } from "@nestia/e2e";
import {
  HttpLlm,
  IHttpLlmApplication,
  IHttpLlmFunction,
  OpenApi,
} from "@samchon/openapi";

import swagger from "../../swagger.json";

export const test_http_llm_function_deprecated = (): void => {
  const document: OpenApi.IDocument = OpenApi.convert(swagger as any);
  const application: IHttpLlmApplication = HttpLlm.application(document, {
    keyword: true,
  });
  const func: IHttpLlmFunction | undefined = application.functions.find(
    (f) =>
      f.method === "post" && f.path === "/{index}/{level}/{optimal}/multipart",
  );
  TestValidator.equals("deprecated")(func?.deprecated)(true);
};
