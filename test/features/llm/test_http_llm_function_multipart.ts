import { TestValidator } from "@nestia/e2e";
import { HttpLlm, IHttpLlmApplication, OpenApi } from "@samchon/openapi";

import swagger from "../../swagger.json";

export const test_http_llm_function_multipart = (): void => {
  const document: OpenApi.IDocument = OpenApi.convert(swagger as any);
  const application: IHttpLlmApplication<"3.0"> = HttpLlm.application({
    model: "3.0",
    document,
  });
  TestValidator.equals("multipart not supported")(
    !!application.errors.find(
      (e) =>
        e.method === "post" &&
        e.path === "/{index}/{level}/{optimal}/multipart",
    ),
  )(true);
};
