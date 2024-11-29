import { TestValidator } from "@nestia/e2e";
import { ILlmSchema, OpenApi } from "@samchon/openapi";
import { LlmSchemaConverter } from "@samchon/openapi/lib/converters/LlmSchemaConverter";
import typia, { IJsonSchemaCollection } from "typia";

export const test_llm_gemini_schema_additionalProperties = (): void => {
  const collection: IJsonSchemaCollection = typia.json.schemas<
    [
      { [key: string]: string },
      {
        input: { [key: string]: string };
        output: { [key: string]: string };
      },
      Array<{
        nested: {
          x: {
            y: { [key: string]: string };
            z: number;
          };
          alpha: Array<number>;
        };
      }>,
    ]
  >();
  const v = validate(collection.components);
  v(collection.schemas[0])(["$input.additionalProperties"]);
  v(collection.schemas[1])([
    `$input.properties["input"].additionalProperties`,
    `$input.properties["output"].additionalProperties`,
  ]);
  v(collection.schemas[2])([
    `$input.items.properties["nested"].properties["x"].properties["y"].additionalProperties`,
  ]);
};

const validate =
  (components: OpenApi.IComponents) =>
  (schema: OpenApi.IJsonSchema) =>
  (expected: string[]): void => {
    const errors: string[] = [];
    const converted: ILlmSchema<"chatgpt"> | null = LlmSchemaConverter.schema(
      "chatgpt",
    )({
      config: LlmSchemaConverter.defaultConfig("chatgpt"),
      components,
      schema,
      errors,
      accessor: "$input",
      $defs: {},
    });
    TestValidator.equals("tuple")(converted)(null);
    TestValidator.equals("errors")(errors.map((e) => e.split(":")[0]).sort())(
      expected.sort(),
    );
  };
