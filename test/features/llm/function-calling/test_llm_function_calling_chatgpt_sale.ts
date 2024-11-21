import { ArrayUtil, TestValidator } from "@nestia/e2e";
import { IChatGptSchema, OpenApi } from "@samchon/openapi";
import { ChatGptConverter } from "@samchon/openapi/lib/converters/ChatGptConverter";
import fs from "fs";
import OpenAI from "openai";
import { ChatCompletion } from "openai/resources";
import typia, { IJsonSchemaCollection } from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { IShoppingSale } from "../../../structures/IShoppingSale";

export const test_llm_function_calling_chatgpt_sale =
  async (): Promise<void> => {
    if (TestGlobal.env.CHATGPT_API_KEY === undefined) return;

    const collection: IJsonSchemaCollection =
      typia.json.schemas<[{ input: IShoppingSale.ICreate }]>();
    const parameters: IChatGptSchema.IParameters | null =
      ChatGptConverter.parameters({
        components: collection.components,
        schema: typia.assert<OpenApi.IJsonSchema.IObject>(
          collection.schemas[0],
        ),
        options: {
          reference: process.argv.includes("--reference"),
          constraint: process.argv.includes("--constraint"),
        },
      });
    if (parameters === null)
      throw new Error(
        "Failed to convert the JSON schema to the ChatGPT schema.",
      );
    await fs.promises.writeFile(
      `${TestGlobal.ROOT}/examples/function-calling/schemas/chatgpt.sale.schema.json`,
      JSON.stringify(parameters, null, 2),
      "utf8",
    );

    const client: OpenAI = new OpenAI({
      apiKey: TestGlobal.env.CHATGPT_API_KEY,
    });
    const completion: ChatCompletion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "assistant",
          content: SYSTEM_MESSAGE,
        },
        {
          role: "user",
          content: await fs.promises.readFile(
            `${TestGlobal.ROOT}/examples/function-calling/prompts/microsoft-surface-pro-9.md`,
            "utf8",
          ),
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "createSale",
            description: "Create a sale and returns the detailed information.",
            parameters: parameters as any,
            strict: true,
          },
        },
      ],
    });
    await ArrayUtil.asyncForEach(
      completion.choices[0].message.tool_calls ?? [],
    )(async (call) => {
      TestValidator.equals("name")(call.function.name)("createSale");
      const { input } = typia.assert<{
        input: IShoppingSale.ICreate;
      }>(JSON.parse(call.function.arguments));
      await fs.promises.writeFile(
        `${TestGlobal.ROOT}/examples/function-calling/arguments/chatgpt.sale.input.json`,
        JSON.stringify(input, null, 2),
        "utf8",
      );
    });
  };

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";
