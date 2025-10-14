import { TestValidator } from "@nestia/e2e";
import {
  HttpLlm,
  IHttpLlmApplication,
  IHttpLlmFunction,
  ILlmSchema,
  IValidation,
  OpenApi,
  OpenApiTypeChecker,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";

export const test_chatgpt_application_separateEquals = () =>
  validate_llm_application_separateEquals("chatgpt");

export const test_claude_application_separateEquals = () =>
  validate_llm_application_separateEquals("claude");

export const test_deepseek_application_separateEquals = () =>
  validate_llm_application_separateEquals("deepseek");

export const test_gemini_application_separateEquals = () =>
  validate_llm_application_separateEquals("gemini");

export const test_llama_application_separateEquals = () =>
  validate_llm_application_separateEquals("llama");

export const test_llm_v30_application_separateEquals = () =>
  validate_llm_application_separateEquals("3.0");

export const test_llm_v31_application_separateEquals = () =>
  validate_llm_application_separateEquals("3.1");

const validate_llm_application_separateEquals = <
  Model extends ILlmSchema.Model,
>(
  model: Model,
): void => {
  const application: IHttpLlmApplication<Model> = HttpLlm.application({
    model,
    document,
    options: {
      ...LlmSchemaComposer.defaultConfig(model),
      equals: true,
      separate: (schema: OpenApi.IJsonSchema) =>
        OpenApiTypeChecker.isNumber(schema),
    } as any,
  });
  const func: IHttpLlmFunction<Model> = application.functions[0];
  const result: IValidation<unknown> = func.separated!.validate!({
    body: {
      name: "John Doe",
      age: 30,
    },
  });
  TestValidator.predicate("result")(
    result.success === false &&
      result.errors.length === 1 &&
      result.errors[0].path === "$input.body.age" &&
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
                  name: {
                    type: "string",
                  },
                  age: {
                    type: "number",
                  },
                },
                required: ["name", "age"],
              },
            },
          },
          description: "Validate LLM application equals",
        },
      },
    },
  },
};
