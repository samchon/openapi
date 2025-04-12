import { TestValidator } from "@nestia/e2e";
import { HttpLlm, IHttpLlmApplication, OpenApi } from "@samchon/openapi";
import fs from "fs";

import { TestGlobal } from "../../../TestGlobal";

export const test_http_llm_function_multipart = async (): Promise<void> => {
  const document: OpenApi.IDocument = OpenApi.convert(
    JSON.parse(
      await fs.promises.readFile(`${TestGlobal.ROOT}/swagger.json`, "utf8"),
    ),
  );
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
