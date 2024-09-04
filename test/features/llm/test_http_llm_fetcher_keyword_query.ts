import { TestValidator } from "@nestia/e2e";
import {
  HttpLlm,
  IHttpConnection,
  IHttpLlmApplication,
  IHttpLlmFunction,
  IHttpResponse,
  LlmTypeChecker,
  OpenApi,
} from "@samchon/openapi";

import swagger from "../../swagger.json";

export const test_http_llm_fetcher_keyword_query = async (
  connection: IHttpConnection,
): Promise<void> => {
  const document: OpenApi.IDocument = OpenApi.convert(swagger as any);
  const application: IHttpLlmApplication = HttpLlm.application(document, {
    keyword: true,
    separate: (schema) =>
      LlmTypeChecker.isString(schema) && !!schema.contentMediaType,
  });
  const func: IHttpLlmFunction | undefined = application.functions.find(
    (f) => f.path === "/{index}/{level}/{optimal}/query" && f.method === "get",
  );
  if (func === undefined) throw new Error("Function not found");

  const response: IHttpResponse = await HttpLlm.propagate({
    connection,
    application,
    function: func,
    arguments: HttpLlm.mergeParameters({
      function: func,
      llm: [
        {
          level: 123,
          optimal: true,
          query: {
            summary: "some summary",
          },
        },
      ],
      human: [
        {
          index: "https://some.url/index.html",
          query: {
            thumbnail: "https://some.url/file.jpg",
          },
        },
      ],
    }),
  });
  TestValidator.equals("response.status")(response.status)(200);
};
