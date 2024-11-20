import { ArrayUtil, TestValidator } from "@nestia/e2e";
import { IChatGptSchema, OpenApi } from "@samchon/openapi";
import { ChatGptConverter } from "@samchon/openapi/lib/converters/ChatGptConverter";
import fs from "fs";
import OpenAI from "openai";
import { ChatCompletion } from "openai/resources";
import typia, { IJsonSchemaCollection, tags } from "typia";

import { TestGlobal } from "../../../TestGlobal";

export const test_llm_function_calling_chatgpt_tags =
  async (): Promise<void> => {
    if (TestGlobal.env.OPENAI_API_KEY === undefined) return;

    const collection: IJsonSchemaCollection =
      typia.json.schemas<[{ input: OpeningTime }]>();
    const parameters: IChatGptSchema.IParameters | null =
      ChatGptConverter.parameters({
        components: collection.components,
        schema: typia.assert<OpenApi.IJsonSchema.IObject>(
          collection.schemas[0],
        ),
        options: {
          reference: true,
          constraint: true,
        },
      });
    if (parameters === null)
      throw new Error(
        "Failed to convert the JSON schema to the ChatGPT schema.",
      );
    await fs.promises.writeFile(
      `${TestGlobal.ROOT}/examples/function-calling/schemas/chatgpt.tags.schema.json`,
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
            name: "reserve",
            description: "Reserve some opening time.",
            parameters: parameters as any,
          },
        },
      ],
    });
    await ArrayUtil.asyncMap(completion.choices[0].message.tool_calls ?? [])(
      async (call) => {
        TestValidator.equals("name")(call.function.name)("reserve");
        const { input } = typia.assert<{
          input: OpeningTime;
        }>(JSON.parse(call.function.arguments));
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/chatgpt.tags.input.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
      },
    );
  };

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";
const USER_MESSAGE = `
  Reserve current date-time permenantely as the reason of marketing sales.
`;

interface OpeningTime {
  reasons: Array<string> & tags.MinItems<1>;
  temporary: boolean;
  time: (string & tags.Format<"date-time">) | null;
}
