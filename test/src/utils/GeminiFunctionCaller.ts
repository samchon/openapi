import {
  FunctionCall,
  FunctionCallingMode,
  GenerateContentResult,
  GenerativeModel,
  GoogleGenerativeAI,
} from "@google/generative-ai";
import { TestValidator } from "@nestia/e2e";
import {
  IGeminiSchema,
  IOpenApiSchemaError,
  IResult,
  OpenApi,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection, IValidation } from "typia";

import { TestGlobal } from "../TestGlobal";
import { ILlmTextPrompt } from "../dto/ILlmTextPrompt";

export namespace GeminiFunctionCaller {
  export interface IProps {
    name: string;
    description: string;
    collection: IJsonSchemaCollection;
    texts: ILlmTextPrompt[];
    validate: (input: any) => IValidation<any>;
    handleCompletion: (input: any) => Promise<void>;
    handleParameters?: (parameters: IGeminiSchema.IParameters) => Promise<void>;
    config?: Partial<IGeminiSchema.IConfig>;
  }

  export const test = async (props: IProps) => {
    if (TestGlobal.env.GEMINI_API_KEY === undefined) return false;

    let result: IValidation<any> | undefined = undefined;
    for (let i: number = 0; i < 3; ++i) {
      if (result && result.success === true) break;
      result = await step(props, TestGlobal.env.GEMINI_API_KEY, result);
    }
    await props.handleCompletion(result?.data);
  };

  const step = async (
    props: IProps,
    apiKey: string,
    previous?: IValidation.IFailure,
  ): Promise<IValidation<any>> => {
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
    if (props.handleParameters) await props.handleParameters(parameters.value);

    const model: GenerativeModel = new GoogleGenerativeAI(
      apiKey,
    ).getGenerativeModel({
      model: "gemini-1.5-pro",
    });
    const completion: GenerateContentResult = await model.generateContent({
      contents: (previous
        ? [...props.texts.slice(0, -1), ...props.texts.slice(-1)]
        : props.texts
      ).map((p) => ({
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
              parameters: parameters.value as any,
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

    const toolCalls: FunctionCall[] = completion.response.functionCalls() ?? [];
    if (toolCalls.length === 0)
      throw new Error("Gemini has not called any function.");

    const results: IValidation<any>[] = toolCalls.map((call) => {
      TestValidator.equals("name")(call.name)(props.name);
      const { input } = typia.assert<{ input: any }>(call.args);
      return props.validate(input);
    });
    return results.find((r) => r.success === true) ?? results[0];
  };
}
