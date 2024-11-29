import { TestValidator } from "@nestia/e2e";
import { ILlmSchema, OpenApi } from "@samchon/openapi";
import { LlmSchemaConverter } from "@samchon/openapi/lib/converters/LlmSchemaConverter";
import typia, { IJsonSchemaCollection } from "typia";

export const test_llm_v31_schema_tuple = (): void => {
  const collection: IJsonSchemaCollection = typia.json.schemas<
    [
      [string, number],
      {
        input: [boolean, string];
        output: [number, boolean];
      },
      Array<{
        nested: {
          x: {
            y: [string, number];
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
    const converted: ILlmSchema<"3.1"> | null = LlmSchemaConverter.schema(
      "3.1",
    )({
      config: LlmSchemaConverter.defaultConfig("3.1"),
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
