import {
  HttpLlm,
  IHttpLlmApplication,
  IHttpLlmFunction,
  ILlmSchemaV3,
  OpenApi,
  OpenApiV3,
  OpenApiV3_1,
  SwaggerV2,
} from "@samchon/openapi";
import fs from "fs";
import typia from "typia";
import { v4 } from "uuid";

const main = async (): Promise<void> => {
  // read swagger document and validate it
  const swagger:
    | SwaggerV2.IDocument
    | OpenApiV3.IDocument
    | OpenApiV3_1.IDocument = JSON.parse(
    await fs.promises.readFile("swagger.json", "utf8"),
  );
  typia.assert(swagger); // recommended

  // convert to emended OpenAPI document,
  // and compose LLM function calling application
  const document: OpenApi.IDocument = OpenApi.convert(swagger);
  const application: IHttpLlmApplication<"3.0"> = HttpLlm.application({
    model: "3.0",
    document,
    options: {},
  });

  // Let's imagine that LLM has selected a function to call
  const func: IHttpLlmFunction<ILlmSchemaV3.IParameters> | undefined =
    application.functions.find(
      // (f) => f.name === "llm_selected_fuction_name"
      (f) => f.path === "/bbs/articles/{id}" && f.method === "put",
    );
  if (func === undefined) throw new Error("No matched function exists.");

  // actual execution is by yourself
  const article = await HttpLlm.execute({
    connection: {
      host: "http://localhost:3000",
    },
    application,
    function: func,
    input: [
      {
        section: "general",
        id: v4(),
        query: {
          language: "en-US",
          format: "markdown",
        },
        body: {
          title: "Hello, world!",
          body: "Let's imagine that this argument is composed by LLM.",
          thumbnail: null,
        },
      },
    ],
  });
  console.log("article", article);
};
main().catch(console.error);
