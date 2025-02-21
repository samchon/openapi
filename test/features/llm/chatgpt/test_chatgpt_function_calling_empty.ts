import { TestValidator } from "@nestia/e2e";
import OpenAI from "openai";

import { TestGlobal } from "../../../TestGlobal";

export const test_chatgpt_function_calling_empty = async () => {
  if (TestGlobal.env.CHATGPT_API_KEY === undefined) return false;

  const client: OpenAI = new OpenAI({ apiKey: TestGlobal.env.CHATGPT_API_KEY });
  const completion: OpenAI.ChatCompletion =
    await client.chat.completions.create({
      model: "gpt-4o",
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
