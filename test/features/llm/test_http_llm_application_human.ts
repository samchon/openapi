import { TestValidator } from "@nestia/e2e";
import { HttpLlm, IHttpLlmApplication, OpenApi } from "@samchon/openapi";

import swagger from "../../swagger.json";

export const test_http_llm_application = (): void => {
  const document: OpenApi.IDocument = OpenApi.convert(swagger as any);
  const application: IHttpLlmApplication<"3.0"> = HttpLlm.application({
    model: "3.0",
    document,
    options: {},
  });

  const humanSwagger: typeof swagger = JSON.parse(JSON.stringify(swagger));
  (
    humanSwagger.paths["/{index}/{level}/{optimal}/body"]
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
