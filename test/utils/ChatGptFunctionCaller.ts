import { ArrayUtil, TestValidator } from "@nestia/e2e";
import {
  IChatGptSchema,
  IOpenApiSchemaError,
  IResult,
  OpenApi,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import OpenAI from "openai";
import typia, { IJsonSchemaCollection } from "typia";

import { TestGlobal } from "../TestGlobal";
import { ILlmTextPrompt } from "../structures/ILlmTextPrompt";

export namespace ChatGptFunctionCaller {
  export const test = async (props: {
    name: string;
    description: string;
    collection: IJsonSchemaCollection;
    texts: ILlmTextPrompt[];
    handleCompletion: (input: any) => Promise<void>;
    handleParameters?: (
      parameters: IChatGptSchema.IParameters,
    ) => Promise<void>;
    config?: Partial<IChatGptSchema.IConfig>;
  }): Promise<void> => {
    if (TestGlobal.env.CHATGPT_API_KEY === undefined) return;

    const parameters: IResult<IChatGptSchema.IParameters, IOpenApiSchemaError> =
      LlmSchemaComposer.parameters("chatgpt")({
        components: props.collection.components,
        schema: typia.assert<
          OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference
        >(props.collection.schemas[0]),
        config: {
          ...LlmSchemaComposer.defaultConfig("chatgpt"),
          ...(props.config ?? {}),
        },
      });
    if (parameters.success === false)
      throw new Error(
        "Failed to convert the JSON schema to the ChatGPT schema.",
      );
    else if (props.handleParameters)
      await props.handleParameters(parameters.data);

    const client: OpenAI = new OpenAI({
      apiKey: TestGlobal.env.CHATGPT_API_KEY,
    });
    const completion: OpenAI.ChatCompletion =
      await client.chat.completions.create({
        model: "gpt-4o",
        messages: props.texts,
        tools: [
          {
            type: "function",
            function: {
              name: props.name,
              description: props.description,
              parameters: parameters.data as Record<string, any>,
              strict: true,
            },
          },
        ],
      });

    const toolCalls: OpenAI.ChatCompletionMessageToolCall[] =
      completion.choices[0].message.tool_calls ?? [];
    if (toolCalls.length === 0)
      throw new Error("ChatGPT has not called any function.");
    await ArrayUtil.asyncForEach(toolCalls)(async (call) => {
      TestValidator.equals("name")(call.function.name)(props.name);
      const { input } = typia.assert<{ input: any }>(
        JSON.parse(call.function.arguments),
      );
      await props.handleCompletion(input);
    });
  };
}
