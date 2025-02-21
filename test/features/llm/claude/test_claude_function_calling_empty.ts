import Anthropic from "@anthropic-ai/sdk";
import { TestValidator } from "@nestia/e2e";

import { TestGlobal } from "../../../TestGlobal";

export const test_claude_function_calling_empty = async () => {
  if (TestGlobal.env.CLAUDE_API_KEY === undefined) return false;

  const client: Anthropic = new Anthropic({
    apiKey: TestGlobal.env.CLAUDE_API_KEY,
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
        content: "Call a print function please.",
      },
    ],
    tools: [
      {
        name: "print",
        description: "Print to the screen.",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    ],
    tool_choice: {
      type: "any",
      disable_parallel_tool_use: true,
    },
  });
  const call = completion.content.filter((c) => c.type === "tool_use")?.[0];
  TestValidator.equals("name")(call?.name)("print");
  TestValidator.equals("arguments")(call?.input)({});
};
