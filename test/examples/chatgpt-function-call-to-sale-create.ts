import {
  HttpLlm,
  IHttpLlmApplication,
  IHttpLlmFunction,
  OpenApi,
  OpenApiV3,
  OpenApiV3_1,
  SwaggerV2,
} from "@samchon/openapi";
import OpenAI from "openai";
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
  const application: IHttpLlmApplication<"chatgpt"> = HttpLlm.application({
    model: "chatgpt",
    document,
  });

  // Let's imagine that LLM has selected a function to call
  const func: IHttpLlmFunction<"chatgpt"> | undefined =
    application.functions.find(
      // (f) => f.name === "llm_selected_fuction_name"
      (f) => f.path === "/shoppings/sellers/sale" && f.method === "post",
    );
  if (func === undefined) throw new Error("No matched function exists.");

  // Get arguments by ChatGPT function calling
  const client: OpenAI = new OpenAI({
    apiKey: "<YOUR_OPENAI_API_KEY>",
  });
  const completion: OpenAI.ChatCompletion =
    await client.chat.completions.create({
      model: "gpt-4o",
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
          type: "function",
          function: {
            name: func.name,
            description: func.description,
            parameters: func.parameters as Record<string, any>,
            strict: true,
          },
        },
      ],
    });
  const toolCall: OpenAI.ChatCompletionMessageToolCall =
    completion.choices[0].message.tool_calls![0];

  // Actual execution by yourself
  const article = await HttpLlm.execute({
    connection: {
      host: "http://localhost:37001",
    },
    application,
    function: func,
    input: JSON.parse(toolCall.function.arguments),
  });
  console.log("article", article);
};
main().catch(console.error);
