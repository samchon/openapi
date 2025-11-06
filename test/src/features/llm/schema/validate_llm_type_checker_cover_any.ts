import { TestValidator } from "@nestia/e2e";
import { ILlmSchema, OpenApi } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection } from "typia";

export const test_chatgpt_type_checker_cover_any = (): void =>
  validate_llm_type_checker_cover_any("chatgpt");

export const test_claude_type_checker_cover_any = (): void =>
  validate_llm_type_checker_cover_any("claude");

export const test_gemini_type_checker_cover_any = (): void =>
  validate_llm_type_checker_cover_any("gemini");

export const test_llm_v30_type_checker_cover_any = (): void =>
  validate_llm_type_checker_cover_any("3.0");

export const test_llm_v31_type_checker_cover_any = (): void =>
  validate_llm_type_checker_cover_any("3.1");

const validate_llm_type_checker_cover_any = <Model extends ILlmSchema.Model>(
  model: Model,
) => {
  const collection: IJsonSchemaCollection = typia.json.schemas<[IBasic]>();
  const result = LlmSchemaComposer.parameters(model)({
    config: LlmSchemaComposer.defaultConfig(model) as any,
    components: collection.components,
    schema: collection.schemas[0] as OpenApi.IJsonSchema.IReference,
  });
  if (result.success === false)
    throw new Error(`Failed to compose ${model} parameters.`);

  const parameters = result.value;
  const check = (x: ILlmSchema<Model>, y: ILlmSchema<Model>): boolean =>
    model === "3.0" || model === "gemini"
      ? (LlmSchemaComposer.typeChecker(model).covers as any)(x, y)
      : (LlmSchemaComposer.typeChecker(model).covers as any)({
          x,
          y,
          $defs: (parameters as any).$defs,
        });
  TestValidator.equals("any covers (string | null)")(true)(
    check(
      parameters.properties.any as ILlmSchema<Model>,
      parameters.properties.string_or_null as ILlmSchema<Model>,
    ),
  );
  TestValidator.equals("any covers (string | undefined)")(true)(
    check(
      parameters.properties.any as ILlmSchema<Model>,
      parameters.properties.string_or_undefined as ILlmSchema<Model>,
    ),
  );
};

interface IBasic {
  any: any;
  string_or_null: null | string;
  string_or_undefined: string | undefined;
}
