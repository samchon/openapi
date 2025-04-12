import { TestValidator } from "@nestia/e2e";
import { ILlmSchema } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection, tags } from "typia";

export const test_chatgpt_invert_string = (): void =>
  validate_llm_invert_string("chatgpt");

export const test_claude_invert_string = (): void =>
  validate_llm_invert_string("claude");

export const test_deepseek_invert_string = (): void =>
  validate_llm_invert_string("deepseek");

export const test_llama_invert_string = (): void =>
  validate_llm_invert_string("llama");

export const test_llm_v30_invert_string = (): void =>
  validate_llm_invert_string("3.0");

export const test_llm_v31_invert_string = (): void =>
  validate_llm_invert_string("3.1");

const validate_llm_invert_string = <Model extends ILlmSchema.Model>(
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
  validate(
    typia.json.schemas<[string & tags.MinLength<3> & tags.MaxLength<10>]>(),
  );
  validate(typia.json.schemas<[string & tags.Pattern<"^[a-z]+$">]>());
  validate(
    typia.json.schemas<
      [string & tags.Format<"uri"> & tags.ContentMediaType<"image/png">]
    >(),
  );
};
