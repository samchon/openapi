import Anthropic from "@anthropic-ai/sdk";
import {
  ClaudeTypeChecker,
  HttpLlm,
  IClaudeSchema,
  IHttpLlmApplication,
  IHttpLlmFunction,
  OpenApi,
  OpenApiV3,
  OpenApiV3_1,
  SwaggerV2,
} from "@samchon/openapi";
import typia from "typia";

const main = async (): Promise<void> => {
  // Read swagger document and validate it
  const swagger:
    | SwaggerV2.IDocument
    | OpenApiV3.IDocument
    | OpenApiV3_1.IDocument = JSON.parse(
    await fetch(
      "https://github.com/samchon/shopping-backend/blob/master/packages/api/swagger.json",
    ).then((r) => r.json()),
  );
  typia.assert(swagger); // recommended

  // convert to emended OpenAPI document,
  // and compose LLM function calling application
  const document: OpenApi.IDocument = OpenApi.convert(swagger);
  const application: IHttpLlmApplication<"claude"> = HttpLlm.application({
    model: "claude",
    document,
    options: {
      reference: true,
      separate: (schema) =>
        ClaudeTypeChecker.isString(schema) &&
        !!schema.contentMediaType?.startsWith("image"),
    },
  });

  // Let's imagine that LLM has selected a function to call
  const func: IHttpLlmFunction<IClaudeSchema.IParameters> | undefined =
    application.functions.find(
      // (f) => f.name === "llm_selected_fuction_name"
      (f) => f.path === "/shoppings/sellers/sale" && f.method === "post",
    );
  if (func === undefined) throw new Error("No matched function exists.");

  // Get arguments by ChatGPT function calling
  const client: Anthropic = new Anthropic({
    apiKey: "<YOUR_ANTHROPIC_API_KEY>",
  });
  const completion: Anthropic.Message = await client.messages.create({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 8_192,
    messages: [
      {
        role: "assistant",
        content:
          "You are a helpful customer support assistant. Use the supplied tools to assist the user.",
      },
      {
        role: "user",
        content: "<DESCRIPTION ABOUT THE SALE>",
        // https://github.com/samchon/openapi/blob/master/examples/function-calling/prompts/microsoft-surface-pro-9.md
      },
    ],
    tools: [
      {
        name: func.name,
        description: func.description,
        input_schema: func.separated!.llm as any,
      },
    ],
  });
  const toolCall: Anthropic.ToolUseBlock = completion.content.filter(
    (c) => c.type === "tool_use",
  )[0]!;

  // Actual execution by yourself
  const article = await HttpLlm.execute({
    connection: {
      host: "http://localhost:37001",
    },
    application,
    function: func,
    input: HttpLlm.mergeParameters({
      function: func,
      llm: toolCall.input as any,
      human: {
        // Human composed parameter values
        content: {
          files: [],
          thumbnails: [
            {
              name: "thumbnail",
              extension: "jpeg",
              url: "https://serpapi.com/searches/673d3a37e45f3316ecd8ab3e/images/1be25e6e2b1fb7509f1af89c326cb41749301b94375eb5680b9bddcdf88fabcb.jpeg",
            },
          ],
        },
      },
    }),
  });
  console.log("article", article);
};
main().catch(console.error);
