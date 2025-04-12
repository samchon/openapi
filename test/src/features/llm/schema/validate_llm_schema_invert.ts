import { TestValidator } from "@nestia/e2e";
import { ILlmSchema } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { tags } from "typia";

export const test_chatgpt_schema_invert = () =>
  validate_llm_schema_invert("chatgpt");

export const test_claude_schema_invert = () =>
  validate_llm_schema_invert("claude");

export const test_deepseek_schema_invert = () =>
  validate_llm_schema_invert("deepseek");

export const test_gemini_schema_invert = () =>
  validate_llm_schema_invert("gemini");

export const test_llama_schema_invert = () =>
  validate_llm_schema_invert("llama");

export const test_llm_v30_schema_invert = () =>
  validate_llm_schema_invert("3.0");

export const test_llm_v31_schema_invert = () =>
  validate_llm_schema_invert("3.1");

const validate_llm_schema_invert = <Model extends ILlmSchema.Model>(
  model: Model,
) => {
  TestValidator.equals("string")(
    LlmSchemaComposer.invert(model)({
      components: {},
      $defs: {},
      schema: typia.llm.schema<
        string &
          tags.Format<"uri"> &
          tags.ContentMediaType<"image/*"> &
          tags.MinLength<0> &
          tags.MaxLength<128>,
        "chatgpt"
      >({}),
    } as any),
  )(
    typia.json.schema<
      string &
        tags.Format<"uri"> &
        tags.ContentMediaType<"image/*"> &
        tags.MinLength<0> &
        tags.MaxLength<128>
    >().schema,
  );

  TestValidator.equals("integer")(
    LlmSchemaComposer.invert(model)({
      components: {},
      $defs: {},
      schema: typia.llm.schema<
        number &
          tags.Type<"int32"> &
          tags.ExclusiveMinimum<0> &
          tags.ExclusiveMaximum<100> &
          tags.MultipleOf<5> &
          tags.Default<5>,
        "chatgpt"
      >({}),
    } as any),
  )(
    typia.json.schema<
      number &
        tags.Type<"int32"> &
        tags.ExclusiveMinimum<0> &
        tags.ExclusiveMaximum<100> &
        tags.MultipleOf<5> &
        tags.Default<5>
    >().schema,
  );

  TestValidator.equals("number")(
    LlmSchemaComposer.invert(model)({
      components: {},
      $defs: {},
      schema: typia.llm.schema<
        number &
          tags.ExclusiveMinimum<0> &
          tags.ExclusiveMaximum<100> &
          tags.MultipleOf<5>,
        "chatgpt"
      >({}),
    } as any),
  )(
    typia.json.schema<
      number &
        tags.ExclusiveMinimum<0> &
        tags.ExclusiveMaximum<100> &
        tags.MultipleOf<5>
    >().schema,
  );

  TestValidator.equals("array")(
    LlmSchemaComposer.invert(model)({
      components: {},
      $defs: {},
      schema: typia.llm.schema<
        Array<string & tags.Pattern<"*">> & tags.UniqueItems,
        "chatgpt"
      >({}),
    } as any),
  )(
    typia.json.schema<Array<string & tags.Pattern<"*">> & tags.UniqueItems>()
      .schema,
  );

  TestValidator.equals("number")(
    LlmSchemaComposer.invert(model)({
      components: {},
      $defs: {},
      schema: typia.llm.schema<
        number &
          tags.ExclusiveMinimum<0> &
          tags.ExclusiveMaximum<100> &
          tags.MultipleOf<5>,
        "chatgpt"
      >({}),
    } as any),
  )(
    typia.json.schema<
      number &
        tags.ExclusiveMinimum<0> &
        tags.ExclusiveMaximum<100> &
        tags.MultipleOf<5>
    >().schema,
  );

  TestValidator.equals(
    "object",
    (key) => key === "description",
  )(
    LlmSchemaComposer.invert(model)({
      components: {},
      $defs: {},
      schema: typia.llm.schema<
        {
          /**
           * List of items.
           *
           * List of items containing any string values.
           */
          array: Array<string & tags.Pattern<"*">>;
        },
        "chatgpt"
      >({}),
    } as any),
  )(
    typia.json.schema<{
      /**
       * List of items.
       *
       * List of items containing any string values.
       */
      array: Array<string & tags.Pattern<"*">>;
    }>().schema,
  );
};
