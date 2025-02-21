import { TestValidator } from "@nestia/e2e";
import { ILlmSchema } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection, tags } from "typia";

export const test_chatgpt_invert_number = (): void =>
  validate_llm_invert_number("chatgpt");

export const test_claude_invert_number = (): void =>
  validate_llm_invert_number("claude");

export const test_llama_invert_number = (): void =>
  validate_llm_invert_number("llama");

export const test_gemini_invert_number = (): void =>
  validate_llm_invert_number("gemini");

export const test_llm_v30_invert_number = (): void =>
  validate_llm_invert_number("3.0");

export const test_llm_v31_invert_number = (): void =>
  validate_llm_invert_number("3.1");

const validate_llm_invert_number = <Model extends ILlmSchema.Model>(
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
      schema: converted.value,
    } as any);
    TestValidator.equals(
      "inverted",
      (key) => key !== "description",
    )(collection.schemas[0])(inverted);
  };
  validate(typia.json.schemas<[number]>());
  validate(
    typia.json.schemas<
      [number & tags.Minimum<0> & tags.Maximum<100> & tags.MultipleOf<5>]
    >(),
  );
  validate(
    typia.json.schemas<
      [number & tags.ExclusiveMinimum<0> & tags.ExclusiveMaximum<100>]
    >(),
  );
};
