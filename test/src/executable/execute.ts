import {
  HttpLlm,
  IHttpLlmApplication,
  IHttpLlmFunction,
  OpenApi,
  OpenApiV3,
  OpenApiV3_1,
  SwaggerV2,
} from "@samchon/openapi";
import fs from "fs";
import typia from "typia";

const main = async (): Promise<void> => {
  // read swagger document and validate it
  const swagger:
    | SwaggerV2.IDocument
    | OpenApiV3.IDocument
    | OpenApiV3_1.IDocument = JSON.parse(
    await fs.promises.readFile("swagger.json", "utf8"),
  );
  typia.assert(swagger);

  // convert to emended OpenAPI document,
  // and compose LLM function calling application
  const document: OpenApi.IDocument = OpenApi.convert(swagger);
  const application: IHttpLlmApplication<"3.0"> = HttpLlm.application({
    model: "3.0",
    document,
  });

  // Let's imagine that LLM has selected a function to call
  const func: IHttpLlmFunction<"3.0"> | undefined = application.functions.find(
    (f) => f.path === "/bbs/articles" && f.method === "post",
  );
  typia.assertGuard<IHttpLlmFunction<"3.0">>(func);

  // actual execution is by yourself
  const article = await HttpLlm.execute({
    connection: {
      host: "http://localhost:4000",
    },
    application,
    function: func,
    input: {
      section: "general",
      body: {
        title: "Hello, world!",
        body: "Let's imagine that this argument is composed by LLM.",
      },
    },
  });
  console.log("article", article);
};
main().catch(console.error);
