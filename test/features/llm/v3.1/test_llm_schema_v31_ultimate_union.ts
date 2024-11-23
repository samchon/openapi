import { ILlmSchemaV3_1, OpenApi } from "@samchon/openapi";
import { LlmConverterV3_1 } from "@samchon/openapi/lib/converters/LlmConverterV3_1";
import typia from "typia";

export const test_llm_schema_v31_ultimate_union = (): void => {
  const collection: IJsonSchemaCollection =
    typia.json.schemas<[IJsonSchemaCollection]>();
  const schema: ILlmSchemaV3_1 | null = LlmConverterV3_1.schema({
    components: collection.components,
    schema: collection.schemas[0],
    $defs: {},
    config: {
      reference: true,
      constraint: true,
    },
  });
  typia.assert<ILlmSchemaV3_1>(schema);
};

interface IJsonSchemaCollection {
  version: "3.1";
  components: OpenApi.IComponents;
  schemas: OpenApi.IJsonSchema[];
}
