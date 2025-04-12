import { TestValidator } from "@nestia/e2e";
import { HttpLlm, IHttpLlmApplication, OpenApi } from "@samchon/openapi";
import fs from "fs";

import { TestGlobal } from "../../../TestGlobal";

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

  const humanSwagger: OpenApi.IDocument = JSON.parse(JSON.stringify(document));
  (
    humanSwagger.paths!["/{index}/{level}/{optimal}/body"]
      .post as OpenApi.IOperation
  )["x-samchon-human"] = true;
  const humanDocument: OpenApi.IDocument = OpenApi.convert(humanSwagger as any);
  const humanApplication: IHttpLlmApplication<"3.0"> = HttpLlm.application({
    model: "3.0",
    document: humanDocument,
    options: {},
  });

  TestValidator.equals("length")(application.functions.length)(
    humanApplication.functions.length + 1,
  );
};
