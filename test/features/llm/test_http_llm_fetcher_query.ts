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

import swagger from "../../swagger.json";

export const test_http_llm_fetcher_query = async (
  connection: IHttpConnection,
): Promise<void> => {
  const document: OpenApi.IDocument = OpenApi.convert(swagger as any);
  const application: IHttpLlmApplication<"3.0"> = HttpLlm.application({
    model: "3.0",
    document: document,
    options: {
      separate: (schema) =>
        LlmSchemaComposer.typeChecker("3.0").isString(schema) &&
        !!schema.contentMediaType,
    },
  });
  const func: IHttpLlmFunction<"3.0"> | undefined = application.functions.find(
    (f) => f.path === "/{index}/{level}/{optimal}/query" && f.method === "get",
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
        query: {
          summary: "some summary",
        },
      },
      human: {
        index: "https://some.url/index.html",
        query: {
          thumbnail: "https://some.url/file.jpg",
        },
      },
    }),
  });
  TestValidator.equals("response.status")(response.status)(200);
};
