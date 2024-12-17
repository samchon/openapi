import { TestValidator } from "@nestia/e2e";
import {
  ILlmSchema,
  IOpenApiSchemaError,
  IResult,
  OpenApi,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import OpenAI from "openai";
import typia, { IJsonSchemaCollection, IValidation } from "typia";

// import { v4 } from "uuid";
import { TestGlobal } from "../TestGlobal";
import { ILlmTextPrompt } from "../structures/ILlmTextPrompt";

export namespace LlamaFunctionCaller {
  export interface IProps<Model extends ILlmSchema.Model> {
    model: Model;
    config?: Partial<ILlmSchema.ModelConfig[Model]>;
    name: string;
    description: string;
    validate: (input: any) => IValidation<any>;
    collection: IJsonSchemaCollection;
    texts: ILlmTextPrompt[];
    handleCompletion: (input: any) => Promise<void>;
    handleParameters?: (
      parameters: ILlmSchema.ModelParameters[Model],
    ) => Promise<void>;
  }

  export const test = async <Model extends ILlmSchema.Model>(
    props: IProps<Model>,
  ): Promise<void> => {
    if (TestGlobal.env.LLAMA_API_KEY === undefined) return;

    let result: IValidation<any> | undefined = undefined;
    for (let i: number = 0; i < 3; ++i) {
      if (result && result.success === true) break;
      result = await step(props, TestGlobal.env.LLAMA_API_KEY, result);
    }
    await props.handleCompletion(result?.data);
  };

  const step = async <Model extends ILlmSchema.Model>(
    props: IProps<Model>,
    apiKey: string,
    previous?: IValidation.IFailure,
  ): Promise<IValidation<any>> => {
    const parameters: IResult<
      ILlmSchema.IParameters<Model>,
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
    }) as IResult<ILlmSchema.IParameters<Model>, IOpenApiSchemaError>;
    if (parameters.success === false)
      throw new Error(
        "Failed to convert the JSON schema to the Claude schema.",
      );
    else if (props.handleParameters)
      await props.handleParameters(parameters.value);

    const client: OpenAI = new OpenAI({
      apiKey,
      baseURL: "https://api.llama-api.com",
    });
    const completion: OpenAI.ChatCompletion =
      await client.chat.completions.create({
        model: "llama3.3-70b",
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
              parameters: parameters.value as any,
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
      TestValidator.equals("name")(call.function.name)(props.name);
      const { input } = typia.assert<{ input: any }>(
        JSON.parse(call.function.arguments),
      );
      return props.validate(input);
    });
    return results.find((r) => r.success === true) ?? results[0];
  };
}
