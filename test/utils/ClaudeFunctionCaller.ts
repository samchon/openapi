import Anthropic from "@anthropic-ai/sdk";
import { ArrayUtil, TestValidator } from "@nestia/e2e";
import { ILlmApplication, OpenApi } from "@samchon/openapi";
import { LlmSchemaConverter } from "@samchon/openapi/lib/converters/LlmSchemaConverter";
import typia, { IJsonSchemaCollection } from "typia";

import { TestGlobal } from "../TestGlobal";
import { ILlmTextPrompt } from "../structures/ILlmTextPrompt";

export namespace ClaudeFunctionCaller {
  export const test = async <
    Model extends "chatgpt" | "claude" | "gemini",
  >(props: {
    model: Model;
    config: Partial<ILlmApplication.ModelConfig[Model]>;
    name: string;
    description: string;
    collection: IJsonSchemaCollection;
    texts: ILlmTextPrompt[];
    handleCompletion: (input: any) => Promise<void>;
    handleParameters?: (
      parameters: ILlmApplication.ModelParameters[Model],
    ) => Promise<void>;
  }): Promise<void> => {
    if (TestGlobal.env.CLAUDE_API_KEY === undefined) return;

    const parameters: ILlmApplication.ModelParameters[Model] | null =
      LlmSchemaConverter.parameters(props.model)({
        components: props.collection.components,
        schema: typia.assert<OpenApi.IJsonSchema.IObject>(
          props.collection.schemas[0],
        ),
        config: {
          ...LlmSchemaConverter.defaultConfig(props.model),
          ...(props.config ?? {}),
        } satisfies ILlmApplication.ModelConfig[Model] as any,
      }) as ILlmApplication.ModelParameters[Model] | null;
    if (parameters === null)
      throw new Error(
        "Failed to convert the JSON schema to the Claude schema.",
      );
    else if (props.handleParameters) await props.handleParameters(parameters);

    const client: Anthropic = new Anthropic({
      apiKey: TestGlobal.env.CLAUDE_API_KEY,
    });
    const completion: Anthropic.Message = await client.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 8_192,
      messages: props.texts,
      tools: [
        {
          name: props.name,
          description: props.description,
          input_schema: parameters as any,
        },
      ],
    });

    const toolCalls: Anthropic.ToolUseBlock[] = completion.content.filter(
      (c) => c.type === "tool_use",
    );
    if (toolCalls.length === 0)
      throw new Error("Claude has not called any function.");
    await ArrayUtil.asyncForEach(toolCalls)(async (call) => {
      TestValidator.equals("name")(call.name)(props.name);
      const { input } = typia.assert<{ input: any }>(call.input);
      await props.handleCompletion(input);
    });
  };
}