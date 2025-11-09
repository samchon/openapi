import { TestValidator } from "@nestia/e2e";
import { ILlmSchema } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaUnit, tags } from "typia";

export const test_chatgpt_schema_invert = () =>
  validate_llm_schema_invert("chatgpt");

export const test_claude_schema_invert = () =>
  validate_llm_schema_invert("claude");

export const test_gemini_schema_invert = () =>
  validate_llm_schema_invert("gemini");

export const test_llm_v30_schema_invert = () =>
  validate_llm_schema_invert("3.0");

export const test_llm_v31_schema_invert = () =>
  validate_llm_schema_invert("3.1");

const validate_llm_schema_invert = <Model extends ILlmSchema.Model>(
  model: Model,
) => {
  const assert = (title: string, unit: IJsonSchemaUnit): void => {
    const result = LlmSchemaComposer.schema(model)({
      config: LlmSchemaComposer.defaultConfig(model) as any,
      components: unit.components,
      schema: unit.schema,
      $defs: {},
    });
    if (result.success === false)
      throw new Error("Failed to compose LLM schema.");
    const inverted = LlmSchemaComposer.invert(model)({
      components: {},
      $defs: {},
      schema: result.value,
    } as any);
    TestValidator.equals(title, (key) => key === "description")(inverted)(
      unit.schema,
    );
  };

  assert(
    "string",
    typia.json.schema<
      string &
        tags.Format<"uri"> &
        tags.ContentMediaType<"image/*"> &
        tags.MinLength<0> &
        tags.MaxLength<128>
    >(),
  );
  assert(
    "integer",
    typia.json.schema<
      number &
        tags.Type<"int32"> &
        tags.ExclusiveMinimum<0> &
        tags.ExclusiveMaximum<100> &
        tags.MultipleOf<5> &
        tags.Default<5>
    >(),
  );
  assert(
    "number",
    typia.json.schema<
      number &
        tags.Type<"int32"> &
        tags.ExclusiveMinimum<0> &
        tags.ExclusiveMaximum<100> &
        tags.MultipleOf<5> &
        tags.Default<5>
    >(),
  );

  assert(
    "array",
    typia.json.schema<Array<string & tags.Pattern<"*">> & tags.UniqueItems>(),
  );
  assert(
    "object",
    typia.json.schema<{
      /**
       * List of items.
       *
       * List of items containing any string values.
       */
      array: Array<string & tags.Pattern<"*">>;
    }>(),
  );
};
