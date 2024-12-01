import {
  FunctionCall,
  FunctionCallingMode,
  GenerateContentResult,
  GenerativeModel,
  GoogleGenerativeAI,
} from "@google/generative-ai";
import { ArrayUtil, TestValidator } from "@nestia/e2e";
import {
  IGeminiSchema,
  IOpenApiSchemaError,
  IResult,
  OpenApi,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection } from "typia";

import { TestGlobal } from "../TestGlobal";
import { ILlmTextPrompt } from "../structures/ILlmTextPrompt";

export namespace GeminiFunctionCaller {
  export const test = async (props: {
    name: string;
    description: string;
    collection: IJsonSchemaCollection;
    texts: ILlmTextPrompt[];
    handleCompletion: (input: any) => Promise<void>;
    handleParameters?: (parameters: IGeminiSchema.IParameters) => Promise<void>;
    config?: Partial<IGeminiSchema.IConfig>;
  }): Promise<void> => {
    if (TestGlobal.env.GEMINI_API_KEY === undefined) return;

    const parameters: IResult<IGeminiSchema.IParameters, IOpenApiSchemaError> =
      LlmSchemaComposer.parameters("gemini")({
        components: props.collection.components,
        schema: typia.assert<OpenApi.IJsonSchema.IObject>(
          props.collection.schemas[0],
        ),
        config: {
          recursive: props.config?.recursive ?? 3,
        },
      });
    if (parameters.success === false)
      throw new Error(
        "Failed to convert the JSON schema to the Gemini schema.",
      );
    if (props.handleParameters) await props.handleParameters(parameters.data);

    const model: GenerativeModel = new GoogleGenerativeAI(
      TestGlobal.env.GEMINI_API_KEY,
    ).getGenerativeModel({
      model: "gemini-1.5-pro",
    });
    const result: GenerateContentResult = await model.generateContent({
      contents: props.texts.map((p) => ({
        role: p.role === "assistant" ? "model" : p.role,
        parts: [
          {
            text: p.content,
          },
        ],
      })),
      tools: [
        {
          functionDeclarations: [
            {
              name: props.name,
              description: props.description,
              parameters: parameters.data as any,
            },
          ],
        },
      ],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingMode.ANY,
          allowedFunctionNames: [props.name],
        },
      },
    });

    const toolCalls: FunctionCall[] = result.response.functionCalls() ?? [];
    if (toolCalls.length === 0)
      throw new Error("Gemini has not called any function.");
    await ArrayUtil.asyncForEach(toolCalls)(async (call) => {
      TestValidator.equals("name")(call.name)(props.name);
      const { input } = typia.assert<{ input: any }>(call.args);
      await props.handleCompletion(input);
    });
  };
}
