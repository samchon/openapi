import { TestValidator } from "@nestia/e2e";
import {
  HttpLlm,
  IHttpConnection,
  IHttpLlmApplication,
  IHttpLlmFunction,
  IHttpResponse,
  ILlmSchemaV3,
  LlmTypeCheckerV3,
  OpenApi,
} from "@samchon/openapi";

import swagger from "../../swagger.json";

export const test_http_llm_fetcher_query_and_body = async (
  connection: IHttpConnection,
): Promise<void> => {
  const document: OpenApi.IDocument = OpenApi.convert(swagger as any);
  const application: IHttpLlmApplication<"3.0"> = HttpLlm.application({
    model: "3.0",
    document,
    options: {
      separate: (schema) =>
        LlmTypeCheckerV3.isString(schema) && !!schema.contentMediaType,
    },
  });
  const func: IHttpLlmFunction<ILlmSchemaV3.IParameters> | undefined =
    application.functions.find(
      (f) =>
        f.path === "/{index}/{level}/{optimal}/query/body" &&
        f.method === "post",
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
        body: {
          title: "some title",
          body: "some body",
          draft: false,
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
  TestValidator.equals("response.status")(response.status)(201);
};