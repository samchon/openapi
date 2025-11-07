import { TestValidator } from "@nestia/e2e";
import { ILlmSchema } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection, tags } from "typia";

export const test_chatgpt_invert_array = (): void =>
  validate_llm_invert_array("chatgpt");

export const test_claude_invert_array = (): void =>
  validate_llm_invert_array("claude");

export const test_gemini_invert_array = (): void =>
  validate_llm_invert_array("gemini");

export const test_llm_v30_invert_array = (): void =>
  validate_llm_invert_array("3.0");

export const test_llm_v31_invert_array = (): void =>
  validate_llm_invert_array("3.1");

const validate_llm_invert_array = <Model extends ILlmSchema.Model>(
  model: Model,
): void => {
  const collection: IJsonSchemaCollection =
    typia.json.schemas<
      [Array<string> & tags.MinItems<1> & tags.MaxItems<10> & tags.UniqueItems]
    >();
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
