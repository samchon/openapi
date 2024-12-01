import { TestValidator } from "@nestia/e2e";
import {
  ILlmSchema,
  IOpenApiSchemaError,
  IResult,
  OpenApi,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
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
    const result: IResult<
      ILlmSchema<"gemini">,
      IOpenApiSchemaError
    > = LlmSchemaComposer.schema("gemini")({
      config: LlmSchemaComposer.defaultConfig("gemini"),
      components,
      schema,
      accessor: "$input",
    });
    TestValidator.equals("success")(result.success)(false);
    TestValidator.equals("errors")(
      result.success ? [] : result.error.reasons.map((r) => r.accessor).sort(),
    )(expected.sort());
  };
