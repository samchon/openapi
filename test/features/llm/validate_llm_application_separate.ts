import { TestValidator } from "@nestia/e2e";
import {
  HttpLlm,
  IHttpLlmApplication,
  ILlmSchema,
  OpenApi,
  OpenApiV3,
  OpenApiV3_1,
  SwaggerV2,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import { Singleton } from "tstl";
import typia from "typia";

export const test_chatgpt_application_separate = async (): Promise<void> => {
  await validate_llm_application_separate("chatgpt", false);
  await validate_llm_application_separate("chatgpt", true);
};

export const test_claude_application_separate = async (): Promise<void> => {
  await validate_llm_application_separate("claude", false);
  await validate_llm_application_separate("claude", true);
};

export const test_gemini_application_separate = async (): Promise<void> => {
  await validate_llm_application_separate("gemini", false);
};

export const test_llama_application_separate = async (): Promise<void> => {
  await validate_llm_application_separate("llama", false);
  await validate_llm_application_separate("llama", true);
};

export const test_llm_v30_application_separate = async (): Promise<void> => {
  await validate_llm_application_separate("3.0", false);
  await validate_llm_application_separate("3.0", true);
};

export const test_llm_v31_application_separate = async (): Promise<void> => {
  await validate_llm_application_separate("3.1", false);
  await validate_llm_application_separate("3.1", true);
};

const validate_llm_application_separate = async <
  Model extends ILlmSchema.Model,
>(
  model: Model,
  constraint: boolean,
): Promise<void> => {
  const application: IHttpLlmApplication<Model> = HttpLlm.application({
    model,
    document: await document.get(),
    options: {
      separate: (schema: any) =>
        LlmSchemaComposer.typeChecker(model).isString(schema as any) &&
        (schema as any)["x-wrtn-secret-key"] !== undefined,
      constraint: constraint as any,
    } as any,
  });
  for (const func of application.functions)
    TestValidator.equals("separated")(!!func.separated)(true);
};

const document = new Singleton(async (): Promise<OpenApi.IDocument> => {
  const swagger:
    | SwaggerV2.IDocument
    | OpenApiV3.IDocument
    | OpenApiV3_1.IDocument = await fetch(
    "https://wrtnio.github.io/connectors/swagger/swagger.json",
  ).then((r) => r.json());
  return OpenApi.convert(typia.assert(swagger));
});
