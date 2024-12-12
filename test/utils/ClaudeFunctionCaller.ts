import Anthropic from "@anthropic-ai/sdk";
import { ArrayUtil, TestValidator } from "@nestia/e2e";
import {
  ILlmSchema,
  IOpenApiSchemaError,
  IResult,
  OpenApi,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection } from "typia";

import { TestGlobal } from "../TestGlobal";
import { ILlmTextPrompt } from "../structures/ILlmTextPrompt";

export namespace ClaudeFunctionCaller {
  export const test = async <
    Model extends "chatgpt" | "claude" | "gemini",
  >(props: {
    model: Model;
    config?: Partial<ILlmSchema.ModelConfig[Model]>;
    name: string;
    description: string;
    collection: IJsonSchemaCollection;
    texts: ILlmTextPrompt[];
    handleCompletion: (input: any) => Promise<void>;
    handleParameters?: (
      parameters: ILlmSchema.ModelParameters[Model],
    ) => Promise<void>;
  }): Promise<void> => {
    if (TestGlobal.env.CLAUDE_API_KEY === undefined) return;

    const parameters: IResult<
      ILlmSchema.ModelParameters[Model],
      IOpenApiSchemaError
    > = LlmSchemaComposer.parameters(props.model)({
      components: props.collection.components,
      schema: typia.assert<OpenApi.IJsonSchema.IObject>(
        props.collection.schemas[0],
      ),
      config: {
        ...LlmSchemaComposer.defaultConfig(props.model),
        ...(props.config ?? {}),
      } satisfies ILlmSchema.ModelConfig[Model] as any,
    }) as IResult<ILlmSchema.ModelParameters[Model], IOpenApiSchemaError>;
    if (parameters.success === false)
      throw new Error(
        "Failed to convert the JSON schema to the Claude schema.",
      );
    else if (props.handleParameters)
      await props.handleParameters(parameters.value);

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
          input_schema: parameters.value as any,
        },
      ],
      tool_choice: {
        type: "any",
        disable_parallel_tool_use: true,
      },
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
