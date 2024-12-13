import Anthropic from "@anthropic-ai/sdk";
import { TestValidator } from "@nestia/e2e";
import {
  ILlmSchema,
  IOpenApiSchemaError,
  IResult,
  OpenApi,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection, IValidation } from "typia";

import { TestGlobal } from "../TestGlobal";
import { ILlmTextPrompt } from "../structures/ILlmTextPrompt";

export namespace ClaudeFunctionCaller {
  export interface IProps<Model extends "chatgpt" | "claude" | "gemini"> {
    model: Model;
    config?: Partial<ILlmSchema.ModelConfig[Model]>;
    name: string;
    description: string;
    collection: IJsonSchemaCollection;
    texts: ILlmTextPrompt[];
    validate: (input: any) => IValidation<any>;
    handleCompletion: (input: any) => Promise<void>;
    handleParameters?: (
      parameters: ILlmSchema.ModelParameters[Model],
    ) => Promise<void>;
  }

  export const test = async <Model extends "chatgpt" | "claude" | "gemini">(
    props: IProps<Model>,
  ): Promise<void> => {
    if (TestGlobal.env.CLAUDE_API_KEY === undefined) return;

    let result: IValidation<any> | undefined = undefined;
    for (let i: number = 0; i < 3; ++i) {
      if (result && result.success === true) break;
      result = await step(props, TestGlobal.env.CLAUDE_API_KEY, result);
    }
    await props.handleCompletion(result?.data);
  };

  const step = async <Model extends "chatgpt" | "claude" | "gemini">(
    props: IProps<Model>,
    apiKey: string,
    previous?: IValidation.IFailure,
  ): Promise<IValidation<any>> => {
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
      apiKey,
    });
    const completion: Anthropic.Message = await client.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 8_192,
      messages: previous
        ? [
            ...props.texts.slice(0, -1),

            {
              role: "assistant",
              content: [
                "You A.I. assistant has composed wrong typed arguments.",
                "",
                "Here is the detailed list of type errors. Review and correct them at the next function calling.",
                "",
                "```json",
                JSON.stringify(previous.errors, null, 2),
                "```",
              ].join("\n"),
            } satisfies Anthropic.MessageParam,
            ...props.texts.slice(-1),
          ]
        : props.texts,
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

    const results: IValidation<any>[] = toolCalls.map((call) => {
      TestValidator.equals("name")(call.name)(props.name);
      const { input } = typia.assert<{ input: any }>(call.input);
      return props.validate(input);
    });
    return results.find((r) => r.success === true) ?? results[0];
  };
}
