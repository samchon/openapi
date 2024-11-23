import { ArrayUtil, TestValidator } from "@nestia/e2e";
import { IChatGptSchema, OpenApi } from "@samchon/openapi";
import { ChatGptConverter } from "@samchon/openapi/lib/converters/ChatGptConverter";
import fs from "fs";
import OpenAI from "openai";
import { ChatCompletion } from "openai/resources";
import typia, { IJsonSchemaCollection } from "typia";

import { TestGlobal } from "../TestGlobal";
import { IShoppingSale } from "../structures/IShoppingSale";

const main = async (): Promise<void> => {
  if (TestGlobal.env.CHATGPT_API_KEY === undefined) return;

  const collection: IJsonSchemaCollection =
    typia.json.schemas<[{ input: IShoppingSale.ICreate }, IShoppingSale]>();
  const parameters: IChatGptSchema.IParameters | null =
    ChatGptConverter.parameters({
      components: collection.components,
      schema: typia.assert<OpenApi.IJsonSchema.IObject>(collection.schemas[0]),
      config: {
        reference: process.argv.includes("--reference"),
        constraint: process.argv.includes("--constraint"),
      },
    });
  if (parameters === null)
    throw new Error("Failed to convert the JSON schema to the ChatGPT schema.");

  const client: OpenAI = new OpenAI({
    apiKey: TestGlobal.env.CHATGPT_API_KEY,
  });

  const directory: string[] = await fs.promises.readdir(
    `${TestGlobal.ROOT}/examples/function-calling/prompts`,
  );
  for (const file of directory) {
    if (file.endsWith(".md") === false) continue;

    const title: string = file.substring(0, file.length - 3);
    if (
      process.argv.includes("--include") &&
      process.argv.every((v) => title.includes(v) === false)
    )
      continue;
    console.log(title);

    const content: string = await fs.promises.readFile(
      `${TestGlobal.ROOT}/examples/function-calling/prompts/${file}`,
      "utf8",
    );
    try {
      const completion: ChatCompletion = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content,
          },
          {
            role: "assistant",
            content: [
              "Here is the list of categories belonged to the samchon channel",
              "",
              "```json",
              await fs.promises.readFile(
                `${TestGlobal.ROOT}/examples/function-calling/arguments/chatgpt.recursive.input.json`,
                "utf8",
              ),
              "```",
            ].join("\n"),
          },
          {
            role: "user",
            content: await fs.promises.readFile(
              `${TestGlobal.ROOT}/examples/function-calling/prompts/${file}`,
              "utf8",
            ),
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "createSale",
              description:
                "Create a sale and returns the detailed information.",
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
          `${TestGlobal.ROOT}/examples/function-calling/arguments/chatgpt.sale.input.${title}.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
      });
    } catch (error) {
      await fs.promises.writeFile(
        `${TestGlobal.ROOT}/examples/function-calling/arguments/chatgpt.sale.error.${title}.json`,
        JSON.stringify(typia.is<object>(error) ? { ...error } : error, null, 2),
        "utf8",
      );
    }
  }
};
main().catch((error) => {
  console.log(error);
  process.exit(-1);
});
