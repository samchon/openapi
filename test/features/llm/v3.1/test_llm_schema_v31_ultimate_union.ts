import { OpenApi } from "@samchon/openapi";
import { HttpLlmConverter } from "@samchon/openapi/lib/converters/HttpLlmConverter";
import typia from "typia";

export const test_llm_schema_v31_ultimate_union = (): void => {
  const collection = typia.json.application<[IJsonSchemaCollection[]]>();
  HttpLlmConverter.schema({
    model: "3.1",
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
