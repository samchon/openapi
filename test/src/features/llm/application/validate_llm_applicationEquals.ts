import { TestValidator } from "@nestia/e2e";
import {
  HttpLlm,
  IHttpLlmApplication,
  IHttpLlmFunction,
  ILlmSchema,
  IValidation,
  OpenApi,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";

export const test_chatgpt_applicationEquals = () =>
  validate_llm_applicationEquals("chatgpt");

export const test_claude_applicationEquals = () =>
  validate_llm_applicationEquals("claude");

export const test_deepseek_applicationEquals = () =>
  validate_llm_applicationEquals("deepseek");

export const test_gemini_applicationEquals = () =>
  validate_llm_applicationEquals("gemini");

export const test_llama_applicationEquals = () =>
  validate_llm_applicationEquals("llama");

export const test_llm_v30_applicationEquals = () =>
  validate_llm_applicationEquals("3.0");

export const test_llm_v31_applicationEquals = () =>
  validate_llm_applicationEquals("3.1");

const validate_llm_applicationEquals = <Model extends ILlmSchema.Model>(
  model: Model,
): void => {
  const application: IHttpLlmApplication<Model> = HttpLlm.application({
    model,
    document,
    options: {
      ...LlmSchemaComposer.defaultConfig(model),
      equals: true,
    } as any,
  });
  const func: IHttpLlmFunction<Model> = application.functions[0];
  const result: IValidation<unknown> = func.validate({
    body: {
      value: 1,
      superfluous: "property",
    },
  });
  TestValidator.predicate("result")(
    result.success === false &&
      result.errors.length === 1 &&
      result.errors[0].path === "$input.body.superfluous" &&
      result.errors[0].expected === "undefined",
  );
};

const document: OpenApi.IDocument = {
  openapi: "3.1.0",
  "x-samchon-emended-v4": true,
  components: {},
  paths: {
    "/validateEquals": {
      post: {
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  value: {
                    type: "number",
                  },
                },
                required: ["value"],
              },
            },
          },
          description: "Validate LLM application equals",
        },
      },
    },
  },
};
