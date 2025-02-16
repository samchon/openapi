import { TestValidator } from "@nestia/e2e";
import OpenAI from "openai";

import { TestGlobal } from "../../../TestGlobal";

export const test_deepseek_function_calling_empty = async (): Promise<void> => {
  if (TestGlobal.env.LLAMA_API_KEY === undefined) return;

  const client: OpenAI = new OpenAI({
    apiKey: TestGlobal.env.LLAMA_API_KEY,
    baseURL: "https://api.deepseek-api.com",
  });
  const completion: OpenAI.ChatCompletion =
    await client.chat.completions.create({
      model: "deepseek-v3",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful customer support assistant. Use the supplied tools to assist the user.",
        },
        {
          role: "user",
          content: "Call a print function please.",
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "print",
            description: "Print to the screen.",
            parameters: {
              type: "object",
              properties: {},
              required: [],
            },
          },
        },
      ],
      tool_choice: "required",
      parallel_tool_calls: false,
    });
  const call = completion.choices[0].message.tool_calls?.[0];
  TestValidator.equals("name")(call?.function.name)("print");
  TestValidator.equals("arguments")(call?.function.arguments)("{}");
};
