import {
  HttpLlm,
  IHttpLlmApplication,
  OpenApi,
  OpenApiV3,
  OpenApiV3_1,
  SwaggerV2,
} from "@samchon/openapi";
import typia from "typia";

const main = async (): Promise<void> => {
  // TYPE VALIDATION
  const result = typia.validate<
    OpenApiV3_1.IDocument | OpenApiV3.IDocument | SwaggerV2.IDocument
  >(
    await fetch(
      "https://raw.githubusercontent.com/samchon/shopping-backend/refs/heads/master/packages/api/customer.swagger.json",
    ).then((res) => res.json()),
  );
  if (result.success === false) {
    console.error(result.errors);
    return;
  }

  // CONVERT TO EMENDED
  const document: OpenApi.IDocument = OpenApi.convert(result.data);

  // MAKE LLM FUNCTION CALLING SCHEMA
  const app: IHttpLlmApplication<"chatgpt"> = HttpLlm.application({
    model: "chatgpt",
    document,
    options: {},
  });
  console.log(app);
};
main().catch(console.error);
