import { TestValidator } from "@nestia/e2e";
import OpenAI from "openai";
import { ChatCompletion } from "openai/resources";
import typia from "typia";

import { TestGlobal } from "../../TestGlobal";

export const test_provider_chatgpt_function_calling_recursive =
  async (): Promise<void> => {
    if (TestGlobal.env.OPENAI_API_KEY === undefined) return;

    const client: OpenAI = new OpenAI({
      apiKey: TestGlobal.env.OPENAI_API_KEY,
    });
    const resultAsObject: ChatCompletion = await client.chat.completions.create(
      {
        messages: [
          {
            role: "system",
            content: SYSTEM_MESSAGE,
          },
          {
            role: "user",
            content: USER_MESSAGE,
          },
        ],
        model: "gpt-4o",
        tools: [
          {
            type: "function",
            function: {
              name: "composeCategories",
              description: "Compose categories from the input.",
              parameters: typia.llm.schema<
                {
                  input: IShoppingCategory[];
                },
                "chatgpt"
              >() as any,
              strict: true,
            },
          },
        ],
      },
    );
    (resultAsObject.choices[0].message.tool_calls ?? []).forEach((call) => {
      TestValidator.equals("name")(call.function.name)("composeCategories");
      typia.assert<{
        input: IShoppingCategory[];
      }>(JSON.parse(call.function.arguments));
    });
  };

interface IShoppingCategory {
  id: string;
  name: string;
  children: IShoppingCategory[];
}

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";
const USER_MESSAGE = [
  "I'll insert a shopping category tree here.",
  "",
  "- electronics",
  "  - desktops",
  "  - laptops",
  "    - ultrabooks",
  "    - macbooks",
  "    - desknotes",
  "    - 2 in 1 laptops",
  "  - tablets",
  "    - ipads",
  "    - android tablets",
  "    - windows tablets",
  "  - smartphones",
  "    - mini smartphones",
  "    - phablets",
  "    - gaming smartphones",
  "    - rugged smartphones",
  "    - foldable smartphones",
  "  - cameras",
  "  - televisions",
  "- furnitures",
  "- accessories",
  "  - jewelry",
  "  - clothing",
  "  - shoes",
].join("\n");
