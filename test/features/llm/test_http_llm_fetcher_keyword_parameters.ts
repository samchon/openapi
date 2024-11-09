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

export const test_http_llm_fetcher_keyword_parameters = async (
  connection: IHttpConnection,
): Promise<void> => {
  const document: OpenApi.IDocument = OpenApi.convert(swagger as any);
  const application: IHttpLlmApplication<"3.0"> = HttpLlm.application({
    model: "3.0",
    document,
    options: {
      keyword: true,
      separate: (schema) =>
        LlmTypeCheckerV3.isString(schema) && !!schema.contentMediaType,
    },
  });
  const func: IHttpLlmFunction<ILlmSchemaV3> | undefined =
    application.functions.find(
      (f) =>
        f.path === "/{index}/{level}/{optimal}/parameters" &&
        f.method === "get",
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
        },
      ],
      human: [
        {
          index: "https://some.url/index.html",
        },
      ],
    }),
  });
  TestValidator.equals("response.status")(response.status)(200);
};
