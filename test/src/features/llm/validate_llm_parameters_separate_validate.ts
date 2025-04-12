import { TestValidator } from "@nestia/e2e";
import {
  ILlmFunction,
  ILlmSchema,
  IOpenApiSchemaError,
  IResult,
  OpenApi,
  OpenApiTypeChecker,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia from "typia";

export const test_chatgpt_parameters_separate_validate = (): void =>
  validate_llm_parameters_separate_validate("chatgpt");

export const test_claude_parameters_separate_validate = (): void =>
  validate_llm_parameters_separate_validate("claude");

export const test_deepseek_parameters_separate_validate = (): void =>
  validate_llm_parameters_separate_validate("deepseek");

export const test_gemini_parameters_separate_validate = (): void =>
  validate_llm_parameters_separate_validate("gemini");

export const test_llama_parameters_separate_validate = (): void =>
  validate_llm_parameters_separate_validate("llama");

export const test_llm_v30_parameters_separate_validate = (): void =>
  validate_llm_parameters_separate_validate("3.0");

export const test_llm_v31_parameters_separate_validate = (): void =>
  validate_llm_parameters_separate_validate("3.1");

const validate_llm_parameters_separate_validate = <
  Model extends ILlmSchema.Model,
>(
  model: Model,
): void => {
  const collection = typia.json.schemas<[ISeparatable, IHumanOnly]>();
  const validate = (schema: OpenApi.IJsonSchema, exists: boolean) => {
    const result: IResult<
      ILlmSchema.IParameters<Model>,
      IOpenApiSchemaError
    > = LlmSchemaComposer.parameters(model)({
      $defs: {},
      components: collection.components,
      schema: schema as OpenApi.IJsonSchema.IReference,
      config: LlmSchemaComposer.defaultConfig(model),
    } as any) as IResult<ILlmSchema.IParameters<Model>, IOpenApiSchemaError>;
    if (result.success === false) throw new Error("Failed to convert");

    const separated: ILlmFunction.ISeparated<Model> =
      LlmSchemaComposer.separateParameters(model)({
        parameters: result.value as ILlmSchema.IParameters<Model>,
        predicate: (s: OpenApi.IJsonSchema) => OpenApiTypeChecker.isNumber(s),
      } as any) as ILlmFunction.ISeparated<Model>;
    TestValidator.equals(
      "validate",
      (key) => key !== "description",
    )(!!separated.validate)(exists);
  };
  validate(collection.schemas[0], true);
  validate(collection.schemas[1], false);
};

interface ISeparatable {
  title: string;
  value: number;
}
interface IHumanOnly {
  value: number;
}
