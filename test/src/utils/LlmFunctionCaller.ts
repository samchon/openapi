import { TestValidator } from "@nestia/e2e";
import { ILlmFunction, ILlmSchema, IValidation } from "@samchon/openapi";
import OpenAI from "openai";

import { TestGlobal } from "../TestGlobal";
import { ILlmTextPrompt } from "../dto/ILlmTextPrompt";

export namespace LlmFunctionCaller {
  export interface IProps<Model extends ILlmSchema.Model> {
    vendor: string;
    model: Model;
    function: ILlmFunction<Model>;
    texts: ILlmTextPrompt[];
    handleCompletion: (input: any) => Promise<void>;
    handleParameters?: (
      parameters: ILlmSchema.ModelParameters[Model],
    ) => Promise<void>;
  }

  export const test = async <Model extends ILlmSchema.Model>(
    props: IProps<Model>,
  ) => {
    if (TestGlobal.env.OPENROUTER_API_KEY === undefined) return false;
    if (props.handleParameters)
      await props.handleParameters(props.function.parameters);

    let result: IValidation<any> | undefined = undefined;
    let trial: number = 0;
    for (trial; trial < 3; ++trial) {
      if (result && result.success === true) break;
      result = await step(props, TestGlobal.env.OPENROUTER_API_KEY, result);
    }
    await props.handleCompletion({
      trial,
      ...result,
    });
  };

  const step = async <Model extends ILlmSchema.Model>(
    props: IProps<Model>,
    apiKey: string,
    previous?: IValidation.IFailure,
  ): Promise<IValidation<any>> => {
    const client: OpenAI = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    });
    const completion: OpenAI.ChatCompletion =
      await client.chat.completions.create({
        model: props.vendor,
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
              name: props.function.name,
              description: props.function.description,
              parameters: props.function.parameters as Record<string, any>,
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
      throw new Error("Llama has not called any function.");

    const results: IValidation<any>[] = toolCalls.map((call) => {
      TestValidator.equals("name")(call.function.name)(props.function.name);
      return props.function.validate(JSON.parse(call.function.arguments));
    });
    return results.find((r) => r.success === true) ?? results[0];
  };
}
