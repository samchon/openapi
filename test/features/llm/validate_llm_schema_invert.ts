import { TestValidator } from "@nestia/e2e";
import { ILlmSchema } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { tags } from "typia";

export const test_chatgpt_schema_invert = () =>
  validate_llm_schema_invert("chatgpt");

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
  )({
    type: "string",
    format: "uri",
    contentMediaType: "image/*",
    minLength: 0,
    maxLength: 128,
  });

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
  )({
    type: "integer",
    minimum: 0,
    maximum: 100,
    multipleOf: 5,
    exclusiveMinimum: true,
    exclusiveMaximum: true,
  });

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
  )({
    type: "number",
    minimum: 0,
    maximum: 100,
    multipleOf: 5,
    exclusiveMinimum: true,
    exclusiveMaximum: true,
  });

  TestValidator.equals("array")(
    LlmSchemaComposer.invert(model)({
      components: {},
      $defs: {},
      schema: typia.llm.schema<Array<string & tags.Pattern<"*">>, "chatgpt">(
        {},
      ),
    } as any),
  )({
    type: "array",
    items: {
      type: "string",
      pattern: "*",
    },
    minItems: 1,
    maxItems: 5,
    uniqueItems: true,
  });

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
  )({
    type: "number",
    minimum: 0,
    maximum: 100,
    multipleOf: 5,
    exclusiveMinimum: true,
    exclusiveMaximum: true,
  });

  TestValidator.equals("object")(
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
  )({
    type: "object",
    properties: {
      array: {
        type: "array",
        items: {
          type: "string",
          pattern: "*",
        },
        minItems: 1,
        maxItems: 5,
        uniqueItems: true,
        title: "List of items",
        description:
          "List of items.\n\nList of items containing any string values.",
      },
    },
    required: ["array"],
  });
};
