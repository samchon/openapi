import { TestValidator } from "@nestia/e2e";
import { ILlmSchema, OpenApi } from "@samchon/openapi";
import { LlmSchemaConverter } from "@samchon/openapi/lib/converters/LlmSchemaConverter";
import typia, { IJsonSchemaCollection } from "typia";

export const test_llm_gemini_schema_oneof = (): void => {
  const collection: IJsonSchemaCollection = typia.json.schemas<
    [
      number | string,
      {
        input: number | string;
        output: number | string;
      },
      Array<{
        nested: {
          x: {
            y: number | string;
            z: number;
          };
          alpha: Array<number>;
        };
      }>,
    ]
  >();
  const v = validate(collection.components);
  v(collection.schemas[0])(["$input"]);
  v(collection.schemas[1])([
    `$input.properties["input"]`,
    `$input.properties["output"]`,
  ]);
  v(collection.schemas[2])([
    `$input.items.properties["nested"].properties["x"].properties["y"]`,
  ]);
};

const validate =
  (components: OpenApi.IComponents) =>
  (schema: OpenApi.IJsonSchema) =>
  (expected: string[]): void => {
    const errors: string[] = [];
    const converted: ILlmSchema<"gemini"> | null = LlmSchemaConverter.schema(
      "gemini",
    )({
      config: LlmSchemaConverter.defaultConfig("gemini"),
      components,
      schema,
      errors,
      accessor: "$input",
    });
    TestValidator.equals("tuple")(converted)(null);
    TestValidator.equals("errors")(errors.map((e) => e.split(":")[0]).sort())(
      expected.sort(),
    );
  };
