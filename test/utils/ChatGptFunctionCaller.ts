import { TestValidator } from "@nestia/e2e";
import {
  IChatGptSchema,
  IOpenApiSchemaError,
  IResult,
  OpenApi,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import OpenAI from "openai";
import typia, { IJsonSchemaCollection, IValidation } from "typia";

import { TestGlobal } from "../TestGlobal";
import { ILlmTextPrompt } from "../structures/ILlmTextPrompt";

export namespace ChatGptFunctionCaller {
  export interface IProps {
    name: string;
    description: string;
    collection: IJsonSchemaCollection;
    validate: (input: any) => IValidation<any>;
    texts: ILlmTextPrompt[];
    handleCompletion: (input: any) => Promise<void>;
    handleParameters?: (
      parameters: IChatGptSchema.IParameters,
    ) => Promise<void>;
    config?: Partial<IChatGptSchema.IConfig>;
  }

  export const test = async (props: IProps): Promise<void> => {
    if (TestGlobal.env.CHATGPT_API_KEY === undefined) return;

    let result: IValidation<any> | undefined = undefined;
    for (let i: number = 0; i < 3; ++i) {
      if (result && result.success === true) break;
      result = await step(props, TestGlobal.env.CHATGPT_API_KEY, result);
    }
    await props.handleCompletion(result?.data);
  };

  const step = async (
    props: IProps,
    apiKey: string,
    previous?: IValidation.IFailure,
  ): Promise<IValidation<any>> => {
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
      await props.handleParameters(parameters.value);

    const client: OpenAI = new OpenAI({
      apiKey,
    });
    const completion: OpenAI.ChatCompletion =
      await client.chat.completions.create({
        model: "gpt-4o",
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
              } satisfies OpenAI.ChatCompletionMessageParam,
              ...props.texts.slice(-1),
            ]
          : props.texts,
        tools: [
          {
            type: "function",
            function: {
              name: props.name,
              description: props.description,
              parameters: parameters.value as Record<string, any>,
            },
          },
        ],
        tool_choice: "required",
        parallel_tool_calls: false,
      });

    const toolCalls: OpenAI.ChatCompletionMessageToolCall[] = completion.choices
      .map((c) => c.message.tool_calls ?? [])
      .flat();
    if (toolCalls.length === 0)
      throw new Error("ChatGPT has not called any function.");

    const results: IValidation<any>[] = toolCalls.map((call) => {
      TestValidator.equals("name")(call.function.name)(props.name);
      const { input } = typia.assert<{ input: any }>(
        JSON.parse(call.function.arguments),
      );
      return props.validate(input);
    });
    return results.find((r) => r.success === true) ?? results[0];
  };
}
