import { TestValidator } from "@nestia/e2e";
import {
  HttpLlm,
  IHttpConnection,
  IHttpLlmApplication,
  IHttpLlmFunction,
  IHttpResponse,
  OpenApi,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import fs from "fs";

import { TestGlobal } from "../../../TestGlobal";

export const test_http_llm_fetcher_parameters = async (
  connection: IHttpConnection,
): Promise<void> => {
  const document: OpenApi.IDocument = OpenApi.convert(
    JSON.parse(
      await fs.promises.readFile(`${TestGlobal.ROOT}/swagger.json`, "utf8"),
    ),
  );
  const application: IHttpLlmApplication<"3.0"> = HttpLlm.application({
    model: "3.0",
    document,
    options: {
      separate: (schema) =>
        LlmSchemaComposer.typeChecker("3.0").isString(schema) &&
        !!schema.contentMediaType,
    },
  });
  const func: IHttpLlmFunction<"3.0"> | undefined = application.functions.find(
    (f) =>
      f.path === "/{index}/{level}/{optimal}/parameters" && f.method === "get",
  );
  if (func === undefined) throw new Error("Function not found");

  const response: IHttpResponse = await HttpLlm.propagate({
    connection,
    application,
    function: func,
    input: HttpLlm.mergeParameters({
      function: func,
      llm: {
        level: 123,
        optimal: true,
      },
      human: {
        index: "https://some.url/index.html",
      },
    }),
  });
  TestValidator.equals("response.status")(response.status)(200);
};
