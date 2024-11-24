import Anthropic from "@anthropic-ai/sdk";
import { ArrayUtil, TestValidator } from "@nestia/e2e";
import { OpenApi } from "@samchon/openapi";
import { LlmSchemaConverter } from "@samchon/openapi/lib/converters/LlmSchemaConverter";
import { IClaudeSchema } from "@samchon/openapi/lib/structures/IClaudeSchema";
import fs from "fs";
import typia, { IJsonSchemaCollection } from "typia";

import { TestGlobal } from "../TestGlobal";
import { IShoppingSale } from "../structures/IShoppingSale";

const main = async (): Promise<void> => {
  if (TestGlobal.env.CHATGPT_API_KEY === undefined) return;

  const collection: IJsonSchemaCollection =
    typia.json.schemas<[{ input: IShoppingSale.ICreate }, IShoppingSale]>();
  const parameters: IClaudeSchema.IParameters | null =
    LlmSchemaConverter.parameters("claude")({
      components: collection.components,
      schema: typia.assert<OpenApi.IJsonSchema.IObject>(collection.schemas[0]),
      config: {
        reference: true,
      },
    });
  if (parameters === null)
    throw new Error("Failed to convert the JSON schema to the ChatGPT schema.");

  const client: Anthropic = new Anthropic({
    apiKey: TestGlobal.env.CLAUDE_API_KEY,
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
      const completion: Anthropic.Message = await client.messages.create({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 8_192,
        messages: [
          {
            role: "assistant",
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
            name: "createSale",
            description: "Create a sale and returns the detailed information.",
            input_schema: parameters as any,
          },
        ],
      });
      const toolCalls: Anthropic.ToolUseBlock[] = completion.content.filter(
        (c) => c.type === "tool_use",
      );
      if (toolCalls.length === 0)
        throw new Error("LLM has not called any function.");
      await ArrayUtil.asyncForEach(toolCalls)(async (call) => {
        TestValidator.equals("name")(call.name)("createSale");
        const { input } = typia.assert<{
          input: IShoppingSale.ICreate;
        }>(call.input);
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/claude.sale.input.${title}.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
      });
    } catch (error) {
      await fs.promises.writeFile(
        `${TestGlobal.ROOT}/examples/function-calling/arguments/claude.sale.error.${title}.json`,
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
