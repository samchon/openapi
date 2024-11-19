import { ArrayUtil, TestValidator } from "@nestia/e2e";
import { IChatGptSchema, OpenApi } from "@samchon/openapi";
import { ChatGptConverter } from "@samchon/openapi/lib/converters/ChatGptConverter";
import fs from "fs";
import OpenAI from "openai";
import { ChatCompletion } from "openai/resources";
import typia, { IJsonSchemaCollection } from "typia";

import { TestGlobal } from "../../../TestGlobal";

export const test_provider_chatgpt_function_calling_recursive =
  async (): Promise<void> => {
    if (TestGlobal.env.OPENAI_API_KEY === undefined) return;

    const collection: IJsonSchemaCollection =
      typia.json.schemas<[{ input: IShoppingCategory[] }]>();
    const parameters: IChatGptSchema.IParameters | null =
      ChatGptConverter.parameters({
        components: collection.components,
        schema: typia.assert<OpenApi.IJsonSchema.IObject>(
          collection.schemas[0],
        ),
        escape: false,
      });
    if (parameters === null)
      throw new Error(
        "Failed to convert the JSON schema to the ChatGPT schema.",
      );
    await fs.promises.writeFile(
      `${TestGlobal.ROOT}/examples/function-calling/recursive.schema.json`,
      JSON.stringify(parameters, null, 2),
      "utf8",
    );

    const client: OpenAI = new OpenAI({
      apiKey: TestGlobal.env.OPENAI_API_KEY,
    });
    const completion: ChatCompletion = await client.chat.completions.create({
      model: "gpt-4o",
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
      tools: [
        {
          type: "function",
          function: {
            name: "composeCategories",
            description: "Compose categories from the input.",
            parameters: parameters as any,
            strict: true,
          },
        },
      ],
    });
    await ArrayUtil.asyncMap(completion.choices[0].message.tool_calls ?? [])(
      async (call) => {
        TestValidator.equals("name")(call.function.name)("composeCategories");
        const { input } = typia.assert<{
          input: IShoppingCategory[];
        }>(JSON.parse(call.function.arguments));
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/recursive.input.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
      },
    );
  };

interface IShoppingCategory {
  id: string;
  name: string;
  children: IShoppingCategory[];
}

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";
const USER_MESSAGE = `
  I'll insert a shopping category tree here.
  
  - electronics
    - desktops
    - laptops
      - ultrabooks
      - macbooks
      - desknotes
      - 2 in 1 laptops
    - tablets
      - ipads
      - android tablets
      - windows tablets
    - smartphones
      - mini smartphones
      - phablets
      - gaming smartphones
      - rugged smartphones
      - foldable smartphones
    - cameras
    - televisions
  - furnitures
  - accessories
    - jewelry
    - clothing
    - shoes
`;
