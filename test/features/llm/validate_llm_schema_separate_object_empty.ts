import { TestValidator } from "@nestia/e2e";
import {
  ILlmSchema,
  IOpenApiSchemaError,
  IResult,
  OpenApi,
  OpenApiTypeChecker,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection } from "typia";

export const test_chatgpt_schema_separate_object_empty = (): void =>
  validate_llm_schema_separate_object_empty("chatgpt");

export const test_claude_schema_separate_object_empty = (): void =>
  validate_llm_schema_separate_object_empty("claude");

export const test_gemini_schema_separate_object_empty = (): void =>
  validate_llm_schema_separate_object_empty("gemini");

export const test_llama_schema_separate_object_empty = (): void =>
  validate_llm_schema_separate_object_empty("llama");

export const test_llm_v30_schema_separate_object_empty = (): void =>
  validate_llm_schema_separate_object_empty("3.0");

export const test_llm_v31_schema_separate_object_empty = (): void =>
  validate_llm_schema_separate_object_empty("3.1");

const validate_llm_schema_separate_object_empty = <
  Model extends ILlmSchema.Model,
>(
  model: Model,
): void => {
  TestValidator.equals("separated")(
    LlmSchemaComposer.separateParameters(model)({
      predicate: ((schema: OpenApi.IJsonSchema) =>
        OpenApiTypeChecker.isInteger(schema)) as any,
      parameters: schema(model)(typia.json.schemas<[{}]>()) as any,
    }),
  )({
    llm: schema(model)(typia.json.schemas<[{}]>()) as any,
    human: null,
  });
};

const schema =
  <Model extends ILlmSchema.Model>(model: Model) =>
  (collection: IJsonSchemaCollection): ILlmSchema.IParameters<Model> => {
    const result: IResult<
      ILlmSchema.IParameters<Model>,
      IOpenApiSchemaError
    > = LlmSchemaComposer.parameters(model)({
      components: collection.components,
      schema: typia.assert<
        OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference
      >(collection.schemas[0]),
      config: LlmSchemaComposer.defaultConfig(
        model,
      ) satisfies ILlmSchema.IConfig<Model> as any,
    }) as IResult<ILlmSchema.IParameters<Model>, IOpenApiSchemaError>;
    if (result.success === false) throw new Error("Invalid schema");
    return result.value;
  };
