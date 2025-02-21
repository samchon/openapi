import { TestValidator } from "@nestia/e2e";
import { ILlmSchema } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection } from "typia";

export const test_chatgpt_invert_enum = (): void =>
  validate_llm_invert_enum("chatgpt");

export const test_claude_invert_enum = (): void =>
  validate_llm_invert_enum("claude");

export const test_llama_invert_enum = (): void =>
  validate_llm_invert_enum("llama");

export const test_gemini_invert_enum = (): void =>
  validate_llm_invert_enum("gemini");

export const test_llm_v30_invert_enum = (): void =>
  validate_llm_invert_enum("3.0");

export const test_llm_v31_invert_enum = (): void =>
  validate_llm_invert_enum("3.1");

const validate_llm_invert_enum = <Model extends ILlmSchema.Model>(
  model: Model,
): void => {
  const validate = (collection: IJsonSchemaCollection) => {
    const $defs: Record<string, ILlmSchema<Model>> = {};
    const converted = LlmSchemaComposer.schema(model)({
      components: collection.components,
      schema: collection.schemas[0],
      config: LlmSchemaComposer.defaultConfig(model) as any,
      $defs: $defs as any,
    });
    if (converted.success === false) throw new Error(converted.error.message);
    const inverted = LlmSchemaComposer.invert(model)({
      $defs,
      components: collection.components,
      schema: collection.schemas[0],
    } as any);
    TestValidator.equals(
      "inverted",
      (key) => key !== "description",
    )(collection.schemas[0])(inverted);
  };
  validate(typia.json.schemas<[false]>());
  validate(typia.json.schemas<[1 | 2 | 3]>());
  validate(typia.json.schemas<["a" | "b" | "c"]>());
};
