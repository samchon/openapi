import Anthropic from "@anthropic-ai/sdk";
import { ArrayUtil, TestValidator } from "@nestia/e2e";
import { OpenApi } from "@samchon/openapi";
import { LlmSchemaConverter } from "@samchon/openapi/lib/converters/LlmSchemaConverter";
import { IClaudeSchema } from "@samchon/openapi/lib/structures/IClaudeSchema";
import fs from "fs";
import typia, { IJsonSchemaCollection } from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { IShoppingSale } from "../../../structures/IShoppingSale";

export const test_llm_function_calling_claude_sale =
  async (): Promise<void> => {
    if (TestGlobal.env.CLAUDE_API_KEY === undefined) return;

    const collection: IJsonSchemaCollection =
      typia.json.schemas<[{ input: IShoppingSale.ICreate }, IShoppingSale]>();
    const parameters: IClaudeSchema.IParameters | null =
      LlmSchemaConverter.parameters("claude")({
        components: collection.components,
        schema: typia.assert<OpenApi.IJsonSchema.IObject>(
          collection.schemas[0],
        ),
        config: {
          reference: true,
        },
      });
    if (parameters === null)
      throw new Error(
        "Failed to convert the JSON schema to the ChatGPT schema.",
      );
    await fs.promises.writeFile(
      `${TestGlobal.ROOT}/examples/function-calling/schemas/claude.sale.schema.json`,
      JSON.stringify(parameters, null, 2),
      "utf8",
    );

    const client: Anthropic = new Anthropic({
      apiKey: TestGlobal.env.CLAUDE_API_KEY,
    });
    const completion: Anthropic.Message = await client.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 8_192,
      messages: [
        {
          role: "assistant",
          content: SYSTEM_MESSAGE,
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
            `${TestGlobal.ROOT}/examples/function-calling/prompts/microsoft-surface-pro-9.md`,
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
        `${TestGlobal.ROOT}/examples/function-calling/arguments/claude.sale.input.json`,
        JSON.stringify(input, null, 2),
        "utf8",
      );
    });
  };

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";
