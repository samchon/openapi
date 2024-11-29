import { TestValidator } from "@nestia/e2e";
import { ILlmSchema, OpenApi } from "@samchon/openapi";
import { LlmSchemaConverter } from "@samchon/openapi/lib/converters/LlmSchemaConverter";
import typia, { IJsonSchemaCollection } from "typia";

export const test_llm_v31_schema_parameters = (): void => {
  const errors: string[] = [];
  const collection: IJsonSchemaCollection = typia.json.schemas<
    [
      {
        first: [string, number];
        second: {
          input: {
            schema: [boolean, string];
          };
          output: [number, boolean];
        };
        third: Array<[number]>;
      },
    ]
  >();
  const parameters: ILlmSchema.IParameters<"3.1"> | null =
    LlmSchemaConverter.parameters("3.1")({
      errors,
      accessor: "$input",
      config: LlmSchemaConverter.defaultConfig("3.1"),
      components: collection.components,
      schema: typia.assert<
        OpenApi.IJsonSchema.IReference | OpenApi.IJsonSchema.IObject
      >(collection.schemas[0]),
    });
  TestValidator.equals("parameters")(parameters)(null);
  TestValidator.equals("errors")(errors.map((e) => e.split(":")[0]).sort())(
    [
      `$input.properties["first"]`,
      `$input.properties["second"].properties["input"].properties["schema"]`,
      `$input.properties["second"].properties["output"]`,
      `$input.properties["third"].items`,
    ].sort(),
  );
};
