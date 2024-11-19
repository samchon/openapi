import { OpenApi } from "@samchon/openapi";
import { LlmConverterV3_1 } from "@samchon/openapi/lib/converters/LlmConverterV3_1";
import typia from "typia";

export const test_llm_schema_v31_ultimate_union = (): void => {
  const collection = typia.json.schemas<[IJsonSchemaCollection[]]>();
  LlmConverterV3_1.schema({
    components: collection.components,
    schema: collection.schemas[0],
    recursive: 3,
  });
};

interface IJsonSchemaCollection {
  version: "3.1";
  components: OpenApi.IComponents;
  schemas: OpenApi.IJsonSchema[];
}
