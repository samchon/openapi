import { TestValidator } from "@nestia/e2e";
import { ILlmSchema, OpenApi } from "@samchon/openapi";
import { LlmSchemaConverter } from "@samchon/openapi/lib/converters/LlmSchemaConverter";
import typia, { IJsonSchemaCollection } from "typia";

export const test_llm_v30_parameters_dynamic = (): void => {
  const errors: string[] = [];
  const collection: IJsonSchemaCollection =
    typia.json.schemas<[Record<string, number>]>();
  const parameters: ILlmSchema.IParameters<"3.0"> | null =
    LlmSchemaConverter.parameters("3.0")({
      errors,
      accessor: "$input",
      config: LlmSchemaConverter.defaultConfig("3.0"),
      components: collection.components,
      schema: typia.assert<
        OpenApi.IJsonSchema.IReference | OpenApi.IJsonSchema.IObject
      >(collection.schemas[0]),
    });
  TestValidator.equals("parameters")(parameters)(null);
  TestValidator.equals("errors")(errors.map((e) => e.split(":")[0]).sort())(
    ["$input.additionalProperties"].sort(),
  );
};
