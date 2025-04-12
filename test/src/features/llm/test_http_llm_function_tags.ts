import { TestValidator } from "@nestia/e2e";
import {
  HttpLlm,
  IHttpLlmApplication,
  IHttpLlmFunction,
  OpenApi,
} from "@samchon/openapi";
import fs from "fs";

import { TestGlobal } from "../../TestGlobal";

export const test_http_llm_function_deprecated = async (): Promise<void> => {
  const document: OpenApi.IDocument = OpenApi.convert(
    JSON.parse(
      await fs.promises.readFile(`${TestGlobal.ROOT}/swagger.json`, "utf8"),
    ),
  );
  const application: IHttpLlmApplication<"3.0"> = HttpLlm.application({
    model: "3.0",
    document,
  });
  const func: IHttpLlmFunction<"3.0"> | undefined = application.functions.find(
    (f) => f.method === "post" && f.path === "/{index}/{level}/{optimal}/body",
  );
  TestValidator.equals("tags")(func?.tags)(["body", "post"]);
};
