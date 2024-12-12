import { ArrayUtil, TestValidator } from "@nestia/e2e";
import {
  ILlmSchema,
  IOpenApiSchemaError,
  IResult,
  OpenApi,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import OpenAI from "openai";
import typia, { IJsonSchemaCollection } from "typia";

// import { v4 } from "uuid";
import { TestGlobal } from "../TestGlobal";
import { ILlmTextPrompt } from "../structures/ILlmTextPrompt";

export namespace LlamaFunctionCaller {
  export const test = async <Model extends ILlmSchema.Model>(props: {
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
    if (TestGlobal.env.LLAMA_API_KEY === undefined) return;

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
      apiKey: TestGlobal.env.LLAMA_API_KEY,
      baseURL: "https://api.llama-api.com",
    });
    const completion: OpenAI.ChatCompletion =
      await client.chat.completions.create({
        model: "llama3.2-90b-vision",
        messages: props.texts,
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

    const toolCalls: OpenAI.ChatCompletionMessageToolCall[] = [
      ...(completion.choices[0].message.tool_calls ?? []),
      // ...completion.choices
      //   .map((c) => c.message.content)
      //   .filter((str) => str !== null)
      //   .filter((str) => str.startsWith(`<function=${props.name}>`))
      //   .map(
      //     (str) =>
      //       ({
      //         id: v4(),
      //         type: "function",
      //         function: {
      //           name: props.name,
      //           arguments: str.substring(`<function="${props.name}>`.length),
      //         },
      //       }) satisfies OpenAI.ChatCompletionMessageToolCall,
      //   ),
    ];
    if (toolCalls.length === 0)
      throw new Error("Llama has not called any function.");
    await ArrayUtil.asyncForEach(toolCalls)(async (call) => {
      TestValidator.equals("name")(call.function.name)(props.name);
      const { input } = typia.assert<{ input: any }>(
        JSON.parse(call.function.arguments),
      );
      await props.handleCompletion(input);
    });
  };
}
